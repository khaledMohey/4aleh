from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from apps.bookings.models import Customer, Booking, Payment
from apps.bookings.serializers import CustomerSerializer, BookingSerializer, PaymentSerializer
from apps.bookings.services.booking_service import BookingService


class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['name', 'phone']
    ordering = ['name']


class BookingViewSet(viewsets.ModelViewSet):
    queryset = Booking.objects.select_related('chalet', 'customer')
    serializer_class = BookingSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['chalet', 'customer', 'payment_status', 'status']
    search_fields = ['customer__name', 'customer__phone', 'chalet__name']
    ordering_fields = ['check_in', 'check_out', 'final_amount', 'created_at']
    ordering = ['-check_in']

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            booking = BookingService.create_booking(serializer.validated_data)
        except ValueError as e:
            from rest_framework.exceptions import ValidationError
            raise ValidationError(str(e))
        return Response(
            BookingSerializer(booking).data,
            status=status.HTTP_201_CREATED,
        )

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        try:
            booking = BookingService.update_booking(instance, serializer.validated_data)
        except ValueError as e:
            from rest_framework.exceptions import ValidationError
            raise ValidationError(str(e))
        return Response(BookingSerializer(booking).data)


class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.select_related('booking', 'owner_contract')
    serializer_class = PaymentSerializer
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['booking', 'owner_contract']
    ordering = ['-payment_date']


class CalendarView(APIView):
    def get(self, request):
        start_date = request.query_params.get('start')
        end_date = request.query_params.get('end')
        events = BookingService.get_calendar_events(start_date, end_date)
        return Response(events)
