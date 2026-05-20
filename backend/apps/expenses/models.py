from django.db import models


class Expense(models.Model):
    class ExpenseType(models.TextChoices):
        MAINTENANCE = 'maintenance', 'صيانة'
        ELECTRICITY = 'electricity', 'كهرباء'
        WATER = 'water', 'مياه'
        CLEANING = 'cleaning', 'تنظيف'
        INTERNET = 'internet', 'إنترنت'
        SALARIES = 'salaries', 'مرتبات'
        OTHER = 'other', 'أخرى'

    chalet = models.ForeignKey(
        'chalets.Chalet', on_delete=models.CASCADE, related_name='expenses'
    )
    expense_type = models.CharField(
        max_length=20, choices=ExpenseType.choices, db_index=True
    )
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    date = models.DateField(db_index=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'expenses'
        ordering = ['-date']
        indexes = [
            models.Index(fields=['chalet', 'date']),
            models.Index(fields=['expense_type', 'date']),
        ]
        verbose_name = 'مصروف'
        verbose_name_plural = 'المصروفات'

    def __str__(self):
        return f'{self.get_expense_type_display()} - {self.chalet.name}'
