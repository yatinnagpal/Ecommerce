"""
Account models for user authentication, billing, and payment management.

This module contains models for:
- StripeModel: Stores payment card information
- BillingAddress: User billing addresses
- OrderModel: Order tracking and management
"""

from django.db import models
from django.contrib.auth.models import User
from django.core.validators import RegexValidator
from django.utils import timezone


class StripeModel(models.Model):
    """
    Model to store Stripe payment card information.
    
    This model stores encrypted card details and Stripe customer information
    for secure payment processing.
    """
    
    # User and customer information
    user = models.ForeignKey(
        User, 
        related_name="stripe_cards", 
        on_delete=models.CASCADE,
        help_text="User who owns this payment card"
    )
    email = models.EmailField(
        help_text="Email associated with the Stripe customer"
    )
    customer_id = models.CharField(
        max_length=200, 
        default="0000-0000-0000-0000",
        help_text="Stripe customer ID"
    )
    
    # Card information
    name_on_card = models.CharField(
        max_length=200, 
        help_text="Name as it appears on the card"
    )
    card_number = models.CharField(
        max_length=16, 
        unique=True,
        validators=[RegexValidator(r'^\d{16}$', 'Card number must be 16 digits')],
        help_text="Last 4 digits of card number (for display purposes)"
    )
    exp_month = models.CharField(
        max_length=2, 
        validators=[RegexValidator(r'^(0[1-9]|1[0-2])$', 'Month must be 01-12')],
        help_text="Card expiration month (MM format)"
    )
    exp_year = models.CharField(
        max_length=4, 
        validators=[RegexValidator(r'^\d{4}$', 'Year must be 4 digits')],
        help_text="Card expiration year (YYYY format)"
    )
    card_id = models.CharField(
        max_length=100,
        help_text="Stripe card ID"
    )
    
    # Billing address information
    address_city = models.CharField(
        max_length=120, 
        help_text="City for billing address"
    )
    address_country = models.CharField(
        max_length=120, 
        help_text="Country for billing address"
    )
    address_state = models.CharField(
        max_length=120, 
        help_text="State for billing address"
    )
    address_zip = models.CharField(
        max_length=6, 
        validators=[RegexValidator(r'^\d{5,6}$', 'ZIP code must be 5-6 digits')],
        help_text="ZIP/postal code for billing address"
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Stripe Payment Card"
        verbose_name_plural = "Stripe Payment Cards"
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name_on_card} - {self.card_number[-4:]}"


class BillingAddress(models.Model):
    """
    Model to store user billing addresses.
    
    This model stores complete address information for order delivery
    and billing purposes.
    """
    
    # User relationship
    user = models.ForeignKey(
        User, 
        related_name="billing_addresses", 
        on_delete=models.CASCADE,
        help_text="User who owns this billing address"
    )
    
    # Contact information
    name = models.CharField(
        max_length=200,
        help_text="Full name for delivery"
    )
    phone_number = models.CharField(
        max_length=15, 
        validators=[RegexValidator(r'^\+?1?\d{9,15}$', 'Enter a valid phone number')],
        help_text="Contact phone number"
    )
    
    # Address details
    house_no = models.CharField(
        max_length=300,
        help_text="House/building number and street address"
    )
    landmark = models.CharField(
        max_length=120,
        help_text="Nearby landmark for easy identification"
    )
    city = models.CharField(
        max_length=120,
        help_text="City name"
    )
    state = models.CharField(
        max_length=120,
        help_text="State or province"
    )
    pin_code = models.CharField(
        max_length=6, 
        validators=[RegexValidator(r'^\d{6}$', 'PIN code must be 6 digits')],
        help_text="PIN/postal code"
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Billing Address"
        verbose_name_plural = "Billing Addresses"
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} - {self.city}, {self.state}"

    @property
    def full_address(self):
        """Return formatted full address string."""
        return f"{self.house_no}, {self.landmark}, {self.city}, {self.state} - {self.pin_code}"


class OrderModel(models.Model):
    """
    Model to track customer orders and their status.
    
    This model stores order information including payment status,
    delivery tracking, and order details.
    """
    
    # Order status choices
    ORDER_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('paid', 'Paid'),
        ('processing', 'Processing'),
        ('shipped', 'Shipped'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
    ]
    
    # User relationship
    user = models.ForeignKey(
        User, 
        on_delete=models.CASCADE,
        help_text="User who placed this order"
    )
    
    # Order details
    name = models.CharField(
        max_length=120,
        help_text="Customer name for this order"
    )
    ordered_item = models.CharField(
        max_length=200, 
        default="Not Set",
        help_text="Description of ordered items"
    )
    
    # Payment information
    card_number = models.CharField(
        max_length=16, 
        blank=True,
        help_text="Last 4 digits of payment card"
    )
    total_price = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        help_text="Total order amount"
    )
    paid_status = models.BooleanField(
        default=False,
        help_text="Whether the order has been paid"
    )
    paid_at = models.DateTimeField(
        null=True, 
        blank=True,
        help_text="Timestamp when payment was completed"
    )
    
    # Delivery information
    address = models.CharField(
        max_length=500,
        help_text="Delivery address for this order"
    )
    is_delivered = models.BooleanField(
        default=False,
        help_text="Whether the order has been delivered"
    )
    delivered_at = models.DateTimeField(
        null=True, 
        blank=True,
        help_text="Timestamp when order was delivered"
    )
    
    # Order status
    status = models.CharField(
        max_length=20,
        choices=ORDER_STATUS_CHOICES,
        default='pending',
        help_text="Current status of the order"
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Order"
        verbose_name_plural = "Orders"
        ordering = ['-created_at']

    def __str__(self):
        return f"Order #{self.id} - {self.name} ({self.status})"

    def mark_as_paid(self):
        """Mark order as paid and set payment timestamp."""
        from django.utils import timezone
        self.paid_status = True
        self.paid_at = timezone.now()
        self.status = 'paid'
        self.save()

    def mark_as_delivered(self):
        """Mark order as delivered and set delivery timestamp."""
        from django.utils import timezone
        self.is_delivered = True
        self.delivered_at = timezone.now()
        self.status = 'delivered'
        self.save() 