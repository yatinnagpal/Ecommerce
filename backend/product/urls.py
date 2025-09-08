from django.urls import path
from product import views


urlpatterns = [
    path('', views.ProductView.as_view(), name="products-list"),
    path('<str:pk>/', views.ProductDetailView.as_view(), name="product-details"),
    path('product-create/', views.ProductCreateView.as_view(), name="product-create"),
    path('product-update/<str:pk>/', views.ProductEditView.as_view(), name="product-update"),
    path('product-delete/<str:pk>/', views.ProductDeleteView.as_view(), name="product-delete"),
]