from decimal import Decimal
from django.db import models
from django.core.exceptions import ValidationError


class Owner(models.Model):
    name = models.CharField(max_length=200, verbose_name='اسم المالك')
    phone = models.CharField(max_length=20, db_index=True, verbose_name='رقم التليفون')
    email = models.EmailField(blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'owners'
        ordering = ['name']
        verbose_name = 'مالك'
        verbose_name_plural = 'الملاك'

    def __str__(self):
        return self.name


class OwnerRentalContract(models.Model):
    class PaymentStatus(models.TextChoices):
        PAID = 'paid', 'مدفوع'
        UNPAID = 'unpaid', 'غير مدفوع'
        PARTIAL = 'partial', 'دفعة جزئية'

    class PaymentMethod(models.TextChoices):
        CASH = 'cash', 'نقدي'
        TRANSFER = 'transfer', 'تحويل بنكي'
        CHECK = 'check', 'شيك'

    chalet = models.ForeignKey(
        'chalets.Chalet', on_delete=models.CASCADE, related_name='owner_contracts'
    )
    owner = models.ForeignKey(Owner, on_delete=models.PROTECT, related_name='contracts')
    daily_rate = models.DecimalField(max_digits=12, decimal_places=2, verbose_name='سعر اليوم')
    start_date = models.DateField(db_index=True, verbose_name='تاريخ البداية')
    end_date = models.DateField(db_index=True, verbose_name='تاريخ النهاية')
    days_count = models.PositiveIntegerField(default=0, verbose_name='عدد الأيام')
    total_cost = models.DecimalField(
        max_digits=14, decimal_places=2, default=0, verbose_name='إجمالي التكلفة'
    )
    payment_method = models.CharField(
        max_length=20, choices=PaymentMethod.choices, default=PaymentMethod.CASH
    )
    payment_status = models.CharField(
        max_length=20,
        choices=PaymentStatus.choices,
        default=PaymentStatus.UNPAID,
        db_index=True,
    )
    paid_amount = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'owner_rental_contracts'
        ordering = ['-start_date']
        indexes = [
            models.Index(fields=['start_date', 'end_date']),
            models.Index(fields=['payment_status']),
        ]
        verbose_name = 'عقد إيجار من المالك'
        verbose_name_plural = 'عقود الإيجار من الملاك'

    def __str__(self):
        return f'{self.owner.name} - {self.chalet.name}'

    def calculate_days_and_cost(self):
        if self.start_date and self.end_date:
            delta = (self.end_date - self.start_date).days
            self.days_count = max(delta, 1)
            self.total_cost = Decimal(str(self.daily_rate)) * self.days_count

    def save(self, *args, **kwargs):
        self.calculate_days_and_cost()
        super().save(*args, **kwargs)

    def clean(self):
        if self.end_date and self.start_date and self.end_date < self.start_date:
            raise ValidationError('تاريخ النهاية يجب أن يكون بعد تاريخ البداية')
