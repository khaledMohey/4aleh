from django.db import models


class Notification(models.Model):
    class NotificationType(models.TextChoices):
        OWNER_CONTRACT_EXPIRY = 'owner_contract_expiry', 'انتهاء عقد المالك'
        PAYMENT_REMAINING = 'payment_remaining', 'دفعة متبقية'
        UPCOMING_BOOKING = 'upcoming_booking', 'حجز قادم'
        CHECKOUT_REMINDER = 'checkout_reminder', 'انتهاء إقامة'

    class Priority(models.TextChoices):
        LOW = 'low', 'منخفض'
        MEDIUM = 'medium', 'متوسط'
        HIGH = 'high', 'عالي'

    title = models.CharField(max_length=200)
    message = models.TextField()
    notification_type = models.CharField(
        max_length=30, choices=NotificationType.choices, db_index=True
    )
    priority = models.CharField(
        max_length=10, choices=Priority.choices, default=Priority.MEDIUM
    )
    is_read = models.BooleanField(default=False, db_index=True)
    related_chalet = models.ForeignKey(
        'chalets.Chalet', on_delete=models.SET_NULL, null=True, blank=True
    )
    related_booking = models.ForeignKey(
        'bookings.Booking', on_delete=models.SET_NULL, null=True, blank=True
    )
    related_contract = models.ForeignKey(
        'owners.OwnerRentalContract', on_delete=models.SET_NULL, null=True, blank=True
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'notifications'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['is_read', 'created_at']),
        ]
        verbose_name = 'إشعار'
        verbose_name_plural = 'الإشعارات'

    def __str__(self):
        return self.title
