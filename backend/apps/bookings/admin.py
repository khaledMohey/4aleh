from django.contrib import admin
from apps.bookings.models import Customer, Booking, Payment


@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ['name', 'phone']
    search_fields = ['name', 'phone']


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = [
        'customer', 'chalet', 'check_in', 'check_out',
        'final_amount', 'payment_status', 'status',
    ]
    list_filter = ['status', 'payment_status']


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ['amount', 'payment_date', 'payment_method']
