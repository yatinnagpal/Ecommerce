from rest_framework import serializers
from .models import Cart, CartItem
from product.serializers import ProductSerializer
from product.models import Product

class CartItemSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)
    product = serializers.SerializerMethodField() # Change to SerializerMethodField
    product_id = serializers.IntegerField(write_only=True) # For input

    class Meta:
        model = CartItem
        fields = ['id', 'product', 'product_id', 'quantity']

    def get_product(self, obj):
        if obj.product: # Check if product exists
            return {
                'id': obj.product.id,
                'name': obj.product.name,
                'description': obj.product.description,
                'price': obj.product.price,
                'stock': obj.product.stock,
                'image': obj.product.image.url if obj.product.image else None,
            }
        return None # Return None if product is missing

    def create(self, validated_data):
        product_id = validated_data.pop('product_id')
        product_instance = Product.objects.get(id=product_id)
        cart_item = CartItem.objects.create(product=product_instance, **validated_data)
        return cart_item

    def update(self, instance, validated_data):
        if 'product_id' in validated_data:
            product_id = validated_data.pop('product_id')
            instance.product = Product.objects.get(id=product_id)
        return super().update(instance, validated_data)

class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total_price = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = ['id', 'user', 'items', 'created_at', 'updated_at', 'total_price']
        read_only_fields = ['user', 'created_at', 'updated_at', 'total_price']

    def get_total_price(self, obj):
        return sum(item.product.price * item.quantity for item in obj.items.all())
