from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CartViewSet, CartItemDeleteView

router = DefaultRouter()
router.register(r'', CartViewSet, basename='cart')

urlpatterns = [
    path('', include(router.urls)),
    path('remove_item/<int:pk>/', CartItemDeleteView.as_view(), name='remove-cart-item'),
]