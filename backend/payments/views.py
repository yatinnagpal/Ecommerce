"""
Payment processing views using Stripe API.

This module handles:
- Payment card creation and management
- Payment processing and charging
- Card updates and deletion
- Token validation
"""

import stripe
import logging
from datetime import datetime
from django.conf import settings
from django.utils import timezone
from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response

from account.models import StripeModel, OrderModel

# Configure logging
logger = logging.getLogger(__name__)

# Initialize Stripe with secret key
stripe.api_key = getattr(settings, "STRIPE_TEST_SECRET_KEY", "")


def save_card_in_db(card_data, email, card_id, customer_id, user):
    """
    Save payment card information to database.
    
    Args:
        card_data (dict): Card information from Stripe
        email (str): Customer email
        card_id (str): Stripe card ID
        customer_id (str): Stripe customer ID
        user (User): Django user instance
        
    Returns:
        StripeModel: Created card instance
    """
    try:
        card = StripeModel.objects.create(
            email=email,
            customer_id=customer_id,
            card_number=card_data["number"],
            exp_month=card_data["exp_month"],
            exp_year=card_data["exp_year"],
            card_id=card_id,
            user=user,
        )
        logger.info(f"Card saved successfully for user {user.id}")
        return card
    except Exception as e:
        logger.error(f"Error saving card to database: {str(e)}")
        raise


class TestStripeImplementation(APIView):
    """
    Test view for Stripe payment processing.
    
    This view is for development/testing purposes only.
    Should be removed or restricted in production.
    """
    
    def post(self, request):
        """
        Create a test payment intent.
        
        Returns:
            Response with test payment intent data
        """
        try:
            test_payment_process = stripe.PaymentIntent.create(
                amount=120,
                currency='inr',
                payment_method_types=['card'],
                payment_method='pm_card_visa',
                receipt_email='test@example.com'
            )
            
            logger.info("Test payment intent created successfully")
            return Response(
                data=test_payment_process, 
                status=status.HTTP_200_OK
            )
        except stripe.error.StripeError as e:
            logger.error(f"Stripe error in test payment: {str(e)}")
            return Response(
                {"detail": f"Payment processing error: {str(e)}"}, 
                status=status.HTTP_400_BAD_REQUEST
            )


class CheckTokenValidation(APIView):
    """
    API view to validate JWT token.
    
    Returns token validity status for authenticated users.
    """
    
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        """
        Check if the current token is valid.
        
        Returns:
            Response confirming token validity
        """
        return Response(
            {"detail": "Token is valid", "user_id": request.user.id}, 
            status=status.HTTP_200_OK
        )


class CreateCardTokenView(APIView):
    """
    API view to create and attach payment cards to Stripe customers.
    
    Handles payment method creation, customer management, and optional
    card storage in the database.
    """
    
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        """
        Create and attach a payment method to a Stripe customer.
        
        Args:
            request: HTTP request containing:
                - email: Customer email
                - payment_method_id: Stripe payment method ID
                - save_card: Boolean to save card in database
                
        Returns:
            Response with customer and payment method information
        """
        try:
            data = request.data
            email = data.get("email")
            payment_method_id = data.get("payment_method_id")
            save_card = data.get("save_card", False)

            # Validate required fields
            if not email or not payment_method_id:
                return Response(
                    {"detail": "Email and payment_method_id are required"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Get or create Stripe customer
            customers = stripe.Customer.list(email=email).data
            if customers:
                customer = customers[0]
                logger.info(f"Using existing customer: {customer['id']}")
            else:
                customer = stripe.Customer.create(
                    email=email, 
                    description=f"Customer for {request.user.username}"
                )
                logger.info(f"Created new customer: {customer['id']}")

            # Attach payment method to customer
            stripe.PaymentMethod.attach(
                payment_method_id,
                customer=customer["id"],
            )
            
            # Set as default payment method
            stripe.Customer.modify(
                customer["id"],
                invoice_settings={"default_payment_method": payment_method_id},
            )

            # Optionally save card in database
            if save_card:
                try:
                    payment_method = stripe.PaymentMethod.retrieve(payment_method_id)
                    card_data = payment_method.card
                    
                    save_card_in_db(
                        card_data=card_data,
                        email=email,
                        card_id=card_data.id,
                        customer_id=customer["id"],
                        user=request.user
                    )
                    logger.info(f"Card saved to database for user {request.user.id}")
                except Exception as e:
                    logger.error(f"Error saving card to database: {str(e)}")
                    # Don't fail the entire request if card saving fails

            return Response({
                "customer_id": customer["id"],
                "payment_method_id": payment_method_id,
                "message": "Card added successfully"
            }, status=status.HTTP_200_OK)

        except stripe.error.StripeError as e:
            logger.error(f"Stripe error in card creation: {str(e)}")
            return Response(
                {"detail": f"Payment processing error: {str(e)}"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.error(f"Unexpected error in card creation: {str(e)}")
            return Response(
                {"detail": "An unexpected error occurred"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class ChargeCustomerView(APIView):
    """
    API view to process payments using Stripe PaymentIntent.
    
    Handles payment processing, order creation, and database updates.
    """
    
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        """
        Process payment and create order.
        
        Args:
            request: HTTP request containing:
                - email: Customer email
                - amount: Payment amount
                - payment_method: Stripe payment method ID
                - name: Customer name
                - address: Delivery address
                - ordered_item: Item description
                - total_price: Order total
                
        Returns:
            Response with payment confirmation and order details
        """
        try:
            data = request.data
            
            # Validate required fields
            required_fields = ["email", "amount", "payment_method", "name", "address", "total_price"]
            for field in required_fields:
                if not data.get(field):
                    return Response(
                        {"detail": f"{field} is required"}, 
                        status=status.HTTP_400_BAD_REQUEST
                    )

            email = data["email"]
            amount = float(data["amount"])
            
            # Validate amount
            if amount <= 0:
                return Response(
                    {"detail": "Amount must be greater than 0"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Get customer from Stripe
            customer_data = stripe.Customer.list(email=email).data
            if not customer_data:
                return Response(
                    {"detail": "Customer not found"}, 
                    status=status.HTTP_404_NOT_FOUND
                )
            customer = customer_data[0]

            # Create PaymentIntent
            payment_intent = stripe.PaymentIntent.create(
                amount=int(amount * 100),  # Convert to cents
                currency="inr",
                customer=customer["id"],
                payment_method=data["payment_method"],
                off_session=True,
                confirm=True,
                description=f'Order for {data["name"]}',
                metadata={
                    'user_id': str(request.user.id),
                    'order_item': data.get("ordered_item", "Not specified")
                }
            )

            # Create order in database
            new_order = OrderModel.objects.create(
                name=data["name"],
                card_number=data.get("card_number", ""),
                address=data["address"],
                ordered_item=data.get("ordered_item", "Not specified"),
                paid_status=True,  # Payment was successful
                paid_at=timezone.now(),
                total_price=amount,
                is_delivered=False,
                delivered_at=None,
                user=request.user,
                status='paid'
            )

            logger.info(f"Order {new_order.id} created successfully for user {request.user.id}")

            return Response({
                "data": {
                    "order_id": new_order.id,
                    "customer_id": customer["id"],
                    "payment_intent_id": payment_intent.id,
                    "amount": amount,
                    "message": "Payment successful"
                }
            }, status=status.HTTP_200_OK)

        except stripe.error.CardError as e:
            logger.error(f"Card error: {str(e)}")
            return Response(
                {"detail": f"Card error: {str(e)}"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        except stripe.error.RateLimitError as e:
            logger.error(f"Rate limit error: {str(e)}")
            return Response(
                {"detail": "Too many requests. Please try again later."}, 
                status=status.HTTP_429_TOO_MANY_REQUESTS
            )
        except stripe.error.InvalidRequestError as e:
            logger.error(f"Invalid request error: {str(e)}")
            return Response(
                {"detail": f"Invalid request: {str(e)}"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        except stripe.error.APIConnectionError as e:
            logger.error(f"API connection error: {str(e)}")
            return Response(
                {"detail": "Network error. Please try again later."}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        except stripe.error.StripeError as e:
            logger.error(f"Stripe error: {str(e)}")
            return Response(
                {"detail": f"Payment processing error: {str(e)}"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.error(f"Unexpected error in payment processing: {str(e)}")
            return Response(
                {"detail": "An unexpected error occurred"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class RetrieveCardView(APIView):
    """
    API view to retrieve card details from Stripe.
    
    Fetches card information using customer ID and card ID from headers.
    """
    
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        """
        Retrieve card details from Stripe.
        
        Args:
            request: HTTP request with Customer-Id and Card-Id headers
            
        Returns:
            Response with card details
        """
        try:
            customer_id = request.headers.get("Customer-Id")
            card_id = request.headers.get("Card-Id")
            
            if not customer_id or not card_id:
                return Response(
                    {"detail": "Customer-Id and Card-Id headers are required"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            card_details = stripe.Customer.retrieve_source(customer_id, card_id)
            return Response(card_details, status=status.HTTP_200_OK)
            
        except stripe.error.StripeError as e:
            logger.error(f"Stripe error retrieving card: {str(e)}")
            return Response(
                {"detail": f"Error retrieving card: {str(e)}"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.error(f"Unexpected error retrieving card: {str(e)}")
            return Response(
                {"detail": "An unexpected error occurred"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class CardUpdateView(APIView):
    """
    API view to update card information in both Stripe and database.
    
    Handles card updates including expiration dates, billing address, and name.
    """
    
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        """
        Update card information.
        
        Args:
            request: HTTP request containing card update data
            
        Returns:
            Response with updated card information
        """
        try:
            data = request.data
            
            # Validate required fields
            if not data.get("customer_id") or not data.get("card_id"):
                return Response(
                    {"detail": "customer_id and card_id are required"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Update card in Stripe
            update_params = {}
            if data.get("exp_month"):
                update_params["exp_month"] = data["exp_month"]
            if data.get("exp_year"):
                update_params["exp_year"] = data["exp_year"]
            if data.get("name_on_card"):
                update_params["name"] = data["name_on_card"]
            if data.get("address_city"):
                update_params["address_city"] = data["address_city"]
            if data.get("address_country"):
                update_params["address_country"] = data["address_country"]
            if data.get("address_state"):
                update_params["address_state"] = data["address_state"]
            if data.get("address_zip"):
                update_params["address_zip"] = data["address_zip"]

            if update_params:
                updated_card = stripe.Customer.modify_source(
                    data["customer_id"],
                    data["card_id"],
                    **update_params
                )
            else:
                return Response(
                    {"detail": "No valid update fields provided"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Update card in database
            if data.get("card_number"):
                try:
                    db_card = StripeModel.objects.get(
                        card_number=data["card_number"],
                        user=request.user
                    )
                    
                    # Update fields if provided
                    if data.get("name_on_card"):
                        db_card.name_on_card = data["name_on_card"]
                    if data.get("exp_month"):
                        db_card.exp_month = data["exp_month"]
                    if data.get("exp_year"):
                        db_card.exp_year = data["exp_year"]
                    if data.get("address_city"):
                        db_card.address_city = data["address_city"]
                    if data.get("address_country"):
                        db_card.address_country = data["address_country"]
                    if data.get("address_state"):
                        db_card.address_state = data["address_state"]
                    if data.get("address_zip"):
                        db_card.address_zip = data["address_zip"]
                    
                    db_card.save()
                    logger.info(f"Card updated in database for user {request.user.id}")
                    
                except StripeModel.DoesNotExist:
                    logger.warning(f"Card not found in database for user {request.user.id}")

            return Response({
                "detail": "Card updated successfully",
                "data": {"updated_card": updated_card}
            }, status=status.HTTP_200_OK)

        except stripe.error.StripeError as e:
            logger.error(f"Stripe error updating card: {str(e)}")
            return Response(
                {"detail": f"Error updating card: {str(e)}"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.error(f"Unexpected error updating card: {str(e)}")
            return Response(
                {"detail": "An unexpected error occurred"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class DeleteCardView(APIView):
    """
    API view to delete payment cards from both Stripe and database.
    
    Handles secure card deletion including customer cleanup.
    """
    
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        """
        Delete payment card.
        
        Args:
            request: HTTP request containing card_number
            
        Returns:
            Response confirming card deletion
        """
        try:
            data = request.data
            card_number = data.get("card_number")
            
            if not card_number:
                return Response(
                    {"detail": "card_number is required"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Get card from database
            try:
                db_card = StripeModel.objects.get(
                    card_number=card_number,
                    user=request.user
                )
            except StripeModel.DoesNotExist:
                return Response(
                    {"detail": "Card not found"}, 
                    status=status.HTTP_404_NOT_FOUND
                )

            customer_id = db_card.customer_id
            card_id = db_card.card_id

            # Delete card from Stripe
            try:
                stripe.Customer.delete_source(customer_id, card_id)
                logger.info(f"Card deleted from Stripe: {card_id}")
            except stripe.error.StripeError as e:
                logger.error(f"Error deleting card from Stripe: {str(e)}")
                # Continue with database deletion even if Stripe deletion fails

            # Delete card from database
            db_card.delete()
            logger.info(f"Card deleted from database for user {request.user.id}")

            # Delete customer from Stripe (optional - for cleanup)
            try:
                stripe.Customer.delete(customer_id)
                logger.info(f"Customer deleted from Stripe: {customer_id}")
            except stripe.error.StripeError as e:
                logger.warning(f"Could not delete customer from Stripe: {str(e)}")
                # This is not critical, so we don't fail the request

            return Response(
                {"detail": "Card deleted successfully"}, 
                status=status.HTTP_200_OK
            )

        except Exception as e:
            logger.error(f"Unexpected error deleting card: {str(e)}")
            return Response(
                {"detail": "An unexpected error occurred"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )