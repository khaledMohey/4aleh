from django.contrib import admin
from apps.owners.models import Owner, OwnerRentalContract


@admin.register(Owner)
class OwnerAdmin(admin.ModelAdmin):
    list_display = ['name', 'phone', 'email']
    search_fields = ['name', 'phone']


@admin.register(OwnerRentalContract)
class OwnerRentalContractAdmin(admin.ModelAdmin):
    list_display = ['owner', 'chalet', 'start_date', 'end_date', 'total_cost', 'payment_status']
    list_filter = ['payment_status', 'payment_method']
