from rest_framework import viewsets, status, generics
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from .models import Cart, CartItem
from product.models import Product # Import Product model
from .serializers import CartSerializer, CartItemSerializer

class CartViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def list(self, request):
        cart, created = Cart.objects.get_or_create(user=request.user)
        serializer = CartSerializer(cart)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def add_item(self, request):
        cart, created = Cart.objects.get_or_create(user=request.user)
        serializer = CartItemSerializer(data=request.data)
        if serializer.is_valid():
            product_id = serializer.validated_data['product_id']
            product = Product.objects.get(id=product_id)
            quantity = serializer.validated_data.get('quantity', 1)

            cart_item, created = CartItem.objects.get_or_create(
                cart=cart, product=product, defaults={'quantity': quantity}
            )

            if not created:
                cart_item.quantity += quantity
                cart_item.save()
            
            # Re-fetch the cart to ensure related items are fresh
            cart = Cart.objects.get(id=cart.id)
            
            cart_serializer = CartSerializer(cart)
            return Response(cart_serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CartItemDeleteView(generics.DestroyAPIView):
    permission_classes = [IsAuthenticated]
    queryset = CartItem.objects.all()

    def get_queryset(self):
        return self.queryset.filter(cart__user=self.request.user)

    def destroy(self, request, *args, **kwargs):
        super().destroy(request, *args, **kwargs)
        cart, created = Cart.objects.get_or_create(user=request.user)
        serializer = CartSerializer(cart)
        return Response(serializer.data, status=status.HTTP_200_OK)