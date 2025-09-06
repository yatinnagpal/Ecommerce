"""
Serializers for account-related models.

This module contains serializers for:
- User authentication and registration
- Payment card information
- Billing addresses
- Order management
"""

from .models import StripeModel, BillingAddress, OrderModel
from rest_framework import serializers
from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import RefreshToken


class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for User model with admin status.
    
    Provides user information including admin privileges.
    """
    admin = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = User
        fields = ["id", "username", "email", "admin"]
        read_only_fields = ["id", "admin"]

    def get_admin(self, obj):
        """Return whether the user has admin privileges."""
        return obj.is_staff


class UserRegisterTokenSerializer(UserSerializer):
    """
    Serializer for user registration with JWT token generation.
    
    Extends UserSerializer to include JWT access token for immediate
    authentication after registration.
    """
    token = serializers.SerializerMethodField(read_only=True)
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ["id", "username", "email", "admin", "token", "password"]
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def create(self, validated_data):
        """Create user and generate JWT token."""
        password = validated_data.pop('password')
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()
        return user

    def get_token(self, obj):
        """Generate JWT access token for the user."""
        token = RefreshToken.for_user(obj)
        return str(token.access_token)


class StripeCardSerializer(serializers.ModelSerializer):
    """
    Serializer for Stripe payment card information.
    
    Handles secure card data serialization with proper validation.
    """
    
    class Meta:
        model = StripeModel
        fields = [
            'id', 'name_on_card', 'card_number', 'exp_month', 
            'exp_year', 'address_city', 'address_country', 
            'address_state', 'address_zip', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']

    def validate_card_number(self, value):
        """Validate card number format."""
        if not value.isdigit() or len(value) != 16:
            raise serializers.ValidationError("Card number must be 16 digits")
        return value

    def validate_exp_month(self, value):
        """Validate expiration month."""
        if not (1 <= int(value) <= 12):
            raise serializers.ValidationError("Month must be between 01 and 12")
        return value.zfill(2)


class BillingAddressSerializer(serializers.ModelSerializer):
    """
    Serializer for billing address information.
    
    Handles address data with proper validation and formatting.
    """
    
    class Meta:
        model = BillingAddress
        fields = [
            'id', 'name', 'phone_number', 'house_no', 'landmark',
            'city', 'state', 'pin_code', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_phone_number(self, value):
        """Validate phone number format."""
        if not value.replace('+', '').isdigit():
            raise serializers.ValidationError("Phone number must contain only digits and optional +")
        return value

    def validate_pin_code(self, value):
        """Validate PIN code format."""
        if not value.isdigit() or len(value) != 6:
            raise serializers.ValidationError("PIN code must be 6 digits")
        return value


class OrderSerializer(serializers.ModelSerializer):
    """
    Serializer for order information.
    
    Handles order data with status tracking and validation.
    """
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = OrderModel
        fields = [
            'id', 'name', 'ordered_item', 'total_price', 'paid_status',
            'paid_at', 'address', 'is_delivered', 'delivered_at',
            'status', 'status_display', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'paid_at', 'delivered_at', 'created_at', 'updated_at'
        ]

    def validate_total_price(self, value):
        """Validate total price is positive."""
        if value <= 0:
            raise serializers.ValidationError("Total price must be greater than 0")
        return value


# Legacy serializers for backward compatibility
CardsListSerializer = StripeCardSerializer
AllOrdersListSerializer = OrderSerializer