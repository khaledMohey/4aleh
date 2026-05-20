from rest_framework import serializers
from apps.bookings.models import Customer, Booking, Payment
from apps.bookings.services.booking_service import BookingService


class CustomerSerializer(serializers.ModelSerializer):
    bookings_count = serializers.SerializerMethodField()

    class Meta:
        model = Customer
        fields = [
            'id', 'name', 'phone', 'email', 'notes',
            'bookings_count', 'created_at', 'updated_at',
        ]
        read_only_fields = ['created_at', 'updated_at']

    def get_bookings_count(self, obj):
        return obj.bookings.exclude(status=Booking.Status.CANCELLED).count()


class BookingSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.name', read_only=True)
    customer_phone = serializers.CharField(source='customer.phone', read_only=True)
    chalet_name = serializers.CharField(source='chalet.name', read_only=True)
    chalet_code = serializers.CharField(source='chalet.code', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    payment_status_display = serializers.CharField(
        source='get_payment_status_display', read_only=True
    )

    class Meta:
        model = Booking
        fields = [
            'id', 'chalet', 'chalet_name', 'chalet_code',
            'customer', 'customer_name', 'customer_phone',
            'guests_count', 'check_in', 'check_out', 'days_count',
            'nightly_price', 'discount', 'total_amount', 'final_amount',
            'deposit', 'remaining_amount', 'payment_status', 'payment_status_display',
            'status', 'status_display', 'profit', 'notes',
            'created_at', 'updated_at',
        ]
        read_only_fields = [
            'days_count', 'total_amount', 'final_amount',
            'remaining_amount', 'profit', 'created_at', 'updated_at',
        ]

    def validate(self, data):
        check_in = data.get('check_in', getattr(self.instance, 'check_in', None))
        check_out = data.get('check_out', getattr(self.instance, 'check_out', None))
        chalet = data.get('chalet', getattr(self.instance, 'chalet', None))

        if check_in and check_out and check_out <= check_in:
            raise serializers.ValidationError({'check_out': 'تاريخ الخروج يجب أن يكون بعد الدخول'})

        if chalet and check_in and check_out:
            exclude_id = self.instance.pk if self.instance else None
            if BookingService.check_overlap(chalet.id, check_in, check_out, exclude_id):
                raise serializers.ValidationError(
                    'يوجد حجز متداخل لهذا الشاليه في الفترة المحددة'
                )
        return data


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = [
            'id', 'booking', 'owner_contract', 'amount',
            'payment_date', 'payment_method', 'notes', 'created_at',
        ]
        read_only_fields = ['created_at']
