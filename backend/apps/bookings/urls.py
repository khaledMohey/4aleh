from django.urls import path
from rest_framework.routers import DefaultRouter
from apps.bookings.views import CustomerViewSet, BookingViewSet, PaymentViewSet, CalendarView

router = DefaultRouter()
router.register('customers', CustomerViewSet, basename='customers')
router.register('payments', PaymentViewSet, basename='payments')
router.register('', BookingViewSet, basename='bookings')

urlpatterns = [
    path('calendar/', CalendarView.as_view(), name='calendar'),
] + router.urls
