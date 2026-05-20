from decimal import Decimal
from django.db import models
from django.core.exceptions import ValidationError


class Customer(models.Model):
    name = models.CharField(max_length=200, verbose_name='اسم العميل')
    phone = models.CharField(max_length=20, db_index=True, verbose_name='رقم التليفون')
    email = models.EmailField(blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'customers'
        ordering = ['name']
        verbose_name = 'عميل'
        verbose_name_plural = 'العملاء'

    def __str__(self):
        return self.name


class Booking(models.Model):
    class Status(models.TextChoices):
        PENDING = 'pending', 'قيد الانتظار'
        CONFIRMED = 'confirmed', 'مؤكد'
        CHECKED_IN = 'checked_in', 'تم الدخول'
        CHECKED_OUT = 'checked_out', 'تم الخروج'
        CANCELLED = 'cancelled', 'ملغي'

    class PaymentStatus(models.TextChoices):
        PAID = 'paid', 'مدفوع'
        UNPAID = 'unpaid', 'غير مدفوع'
        PARTIAL = 'partial', 'دفعة جزئية'

    chalet = models.ForeignKey(
        'chalets.Chalet', on_delete=models.PROTECT, related_name='bookings'
    )
    customer = models.ForeignKey(
        Customer, on_delete=models.PROTECT, related_name='bookings'
    )
    guests_count = models.PositiveIntegerField(default=1, verbose_name='عدد الأفراد')
    check_in = models.DateField(db_index=True, verbose_name='تاريخ الدخول')
    check_out = models.DateField(db_index=True, verbose_name='تاريخ الخروج')
    days_count = models.PositiveIntegerField(default=0, verbose_name='عدد الأيام')
    nightly_price = models.DecimalField(max_digits=12, decimal_places=2, verbose_name='سعر الليلة')
    discount = models.DecimalField(max_digits=12, decimal_places=2, default=0, verbose_name='الخصم')
    total_amount = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    final_amount = models.DecimalField(max_digits=14, decimal_places=2, default=0, verbose_name='المبلغ النهائي')
    deposit = models.DecimalField(max_digits=14, decimal_places=2, default=0, verbose_name='عربون')
    remaining_amount = models.DecimalField(max_digits=14, decimal_places=2, default=0, verbose_name='المتبقي')
    payment_status = models.CharField(
        max_length=20,
        choices=PaymentStatus.choices,
        default=PaymentStatus.UNPAID,
        db_index=True,
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.CONFIRMED,
        db_index=True,
    )
    profit = models.DecimalField(max_digits=14, decimal_places=2, default=0, verbose_name='الربح')
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'bookings'
        ordering = ['-check_in']
        indexes = [
            models.Index(fields=['check_in', 'check_out']),
            models.Index(fields=['chalet', 'check_in', 'check_out']),
            models.Index(fields=['payment_status', 'status']),
        ]
        verbose_name = 'حجز'
        verbose_name_plural = 'الحجوزات'

    def __str__(self):
        return f'{self.customer.name} - {self.chalet.name}'

    def calculate_amounts(self):
        if self.check_in and self.check_out:
            delta = (self.check_out - self.check_in).days
            self.days_count = max(delta, 1)
            self.total_amount = Decimal(str(self.nightly_price)) * self.days_count
            self.final_amount = self.total_amount - Decimal(str(self.discount))
            self.remaining_amount = self.final_amount - Decimal(str(self.deposit))
            owner_daily = self._get_owner_daily_cost()
            self.profit = self.final_amount - (owner_daily * self.days_count)

    def _get_owner_daily_cost(self):
        from apps.owners.models import OwnerRentalContract
        contract = OwnerRentalContract.objects.filter(
            chalet=self.chalet,
            start_date__lte=self.check_in,
            end_date__gte=self.check_out,
        ).first()
        if contract and contract.days_count > 0:
            return contract.total_cost / contract.days_count
        return Decimal('0')

    def save(self, *args, **kwargs):
        self.calculate_amounts()
        super().save(*args, **kwargs)

    def clean(self):
        if self.check_out and self.check_in and self.check_out <= self.check_in:
            raise ValidationError('تاريخ الخروج يجب أن يكون بعد تاريخ الدخول')


class Payment(models.Model):
    booking = models.ForeignKey(
        Booking, on_delete=models.CASCADE, related_name='payments', null=True, blank=True
    )
    owner_contract = models.ForeignKey(
        'owners.OwnerRentalContract',
        on_delete=models.CASCADE,
        related_name='payments',
        null=True,
        blank=True,
    )
    amount = models.DecimalField(max_digits=14, decimal_places=2)
    payment_date = models.DateField()
    payment_method = models.CharField(max_length=20, default='cash')
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'payments'
        ordering = ['-payment_date']
        verbose_name = 'دفعة'
        verbose_name_plural = 'الدفعات'
