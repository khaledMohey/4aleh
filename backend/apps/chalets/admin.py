from django.contrib import admin
from apps.chalets.models import Chalet, ChaletImage


class ChaletImageInline(admin.TabularInline):
    model = ChaletImage
    extra = 1


@admin.register(Chalet)
class ChaletAdmin(admin.ModelAdmin):
    list_display = ['name', 'code', 'city', 'status', 'nightly_price', 'is_active']
    list_filter = ['status', 'city', 'is_active']
    search_fields = ['name', 'code', 'city']
    inlines = [ChaletImageInline]
