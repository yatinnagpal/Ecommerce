import stripe
from rest_framework import status
from rest_framework import permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from account.models import StripeModel, OrderModel
from rest_framework.decorators import permission_classes
from datetime import datetime


# stripe secret test key
from django.conf import settings
stripe.api_key = getattr(settings, "STRIPE_TEST_SECRET_KEY", "")


def save_card_in_db(cardData, email, cardId, customer_id, user):

    # save card in django stripe model
    StripeModel.objects.create(
        email = email,
        customer_id = customer_id,
        card_number=cardData["number"],
        exp_month = cardData["exp_month"],
        exp_year = cardData["exp_year"],
        card_id = cardId,
        user = user,
    )


# Just for testing
class TestStripeImplementation(APIView):

    def post(self, request):
        test_payment_process = stripe.PaymentIntent.create(
            amount=120,
            currency='inr',
            payment_method_types=['card'],
            payment_method='pm_card_visa',
            receipt_email='yash@gmail.com'
        )

        return Response(data=test_payment_process, status=status.HTTP_200_OK)

# check token expired or not
class CheckTokenValidation(APIView):

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response("Token is Valid", status=status.HTTP_200_OK)


# to create card token (to validate your card)
class CreateCardTokenView(APIView):

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        data = request.data
        email = data["email"]
        payment_method_id = data["payment_method_id"]
        save_card = data.get("save_card", False)

        # Get or create customer
        customers = stripe.Customer.list(email=email).data
        if customers:
            customer = customers[0]
        else:
            customer = stripe.Customer.create(email=email, description="My new customer")

        # Attach payment method to customer
        try:
            stripe.PaymentMethod.attach(
                payment_method_id,
                customer=customer["id"],
            )
            # Set as default payment method
            stripe.Customer.modify(
                customer["id"],
                invoice_settings={"default_payment_method": payment_method_id},
            )
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        # Optionally save card in your DB
        if save_card:
            payment_method = stripe.PaymentMethod.retrieve(payment_method_id)
            # Save relevant details in your DB as needed
            # Example: StripeModel.objects.create(...)

        return Response({
            "customer_id": customer["id"],
            "payment_method_id": payment_method_id,
            "message": "Card added successfully"
        }, status=status.HTTP_200_OK)

# Charge the customer card
class ChargeCustomerView(APIView):

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            data = request.data
            email = request.data["email"]
            customer_data = stripe.Customer.list(email=email).data
            customer = customer_data[0]

            # Create a PaymentIntent instead of a Charge
            payment_intent = stripe.PaymentIntent.create(
                amount=int(float(request.data["amount"]) * 100),
                currency="inr",
                customer=customer["id"],
                payment_method=request.data["payment_method"],
                off_session=True,
                confirm=True,
                description='Software development services',
            )

            # saving order in django database
            new_order = OrderModel.objects.create(
                name = data["name"],
                card_number = data["card_number"],
                address = data["address"],
                ordered_item = data["ordered_item"],
                paid_status = data["paid_status"],
                paid_at = datetime.now(),
                total_price = data["total_price"],
                is_delivered = data["is_delivered"],
                delivered_at = data["delivered_at"],
                user = request.user
            )

            return Response(
                data = {
                    "data": {
                        "customer_id": customer["id"],
                        "payment_intent_id": payment_intent.id,
                        "message": "Payment Successfull",
                    }
                }, status=status.HTTP_200_OK)

        except stripe.error.APIConnectionError:
            return Response({
                "detail": "Network error, Failed to establish a new connection."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# retrieve card (to get user card details)
class RetrieveCardView(APIView):

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request): 
        card_details = stripe.Customer.retrieve_source(
            request.headers["Customer-Id"],
            request.headers["Card-Id"]
        )
        return Response(card_details, status=status.HTTP_200_OK)
        

# update a card
class CardUpdateView(APIView):

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        data = request.data
        update_card = stripe.Customer.modify_source(
            data["customer_id"],
            data["card_id"],
            exp_month = data["exp_month"] if data["exp_month"] else None,
            exp_year = data["exp_year"] if data["exp_year"] else None,
            name = data["name_on_card"] if data["name_on_card"] else None,
            address_city = data["address_city"] if data["address_city"] else None,
            address_country = data["address_country"] if data["address_country"] else None,
            address_state = data["address_state"] if data["address_state"] else None,
            address_zip = data["address_zip"] if data["address_zip"] else None,

        )

        # locating stripe object in django database
        obj = StripeModel.objects.get(card_number=request.data["card_number"])
        
        # updating stripe object in django database
        if obj:
            obj.name_on_card = data["name_on_card"] if data["name_on_card"] else obj.name_on_card
            obj.exp_month = data["exp_month"] if data["exp_month"] else obj.exp_month
            obj.exp_year = data["exp_year"] if data["exp_year"] else obj.exp_year
            obj.address_city = data["address_city"] if data["address_city"] else obj.address_city
            obj.address_country = data["address_country"] if data["address_country"] else obj.address_country
            obj.address_state = data["address_state"] if data["address_state"] else obj.address_state
            obj.address_zip = data["address_zip"] if data["address_zip"] else obj.address_zip
            obj.save()
        else:
            pass

        return Response(
            {
                "detail": "card updated successfully",
                "data": { "Updated Card": update_card },

            }, status=status.HTTP_200_OK)
        

# delete card
class DeleteCardView(APIView):

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        data = request.data
        obj_card = StripeModel.objects.get(card_number=request.data["card_number"])

        customerId = obj_card.customer_id
        cardId = obj_card.card_id

        # deleting card from stripe
        stripe.Customer.delete_source(
            customerId,
            cardId
        )

        # deleting card from django database
        obj_card.delete()

        # delete the customer
        # as deleting the card will not change the default card number on stripe therefore
        # we need to delete the customer (with a new card request customer will be recreated)
        stripe.Customer.delete(customerId)
        
        return Response("Card deleted successfully.", status=status.HTTP_200_OK)