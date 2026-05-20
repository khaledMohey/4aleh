from django.db import models


class Chalet(models.Model):
    class Status(models.TextChoices):
        AVAILABLE = 'available', 'متاح'
        RENTED = 'rented', 'مؤجر'
        MAINTENANCE = 'maintenance', 'صيانة'

    name = models.CharField(max_length=200, verbose_name='اسم الشاليه')
    code = models.CharField(max_length=50, unique=True, db_index=True, verbose_name='كود الشاليه')
    location = models.CharField(max_length=300, verbose_name='الموقع')
    city = models.CharField(max_length=100, db_index=True, verbose_name='المدينة')
    description = models.TextField(blank=True, verbose_name='الوصف')
    rooms_count = models.PositiveIntegerField(default=1, verbose_name='عدد الغرف')
    bathrooms_count = models.PositiveIntegerField(default=1, verbose_name='عدد الحمامات')
    capacity = models.PositiveIntegerField(default=4, verbose_name='عدد الأفراد')
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.AVAILABLE,
        db_index=True,
    )
    features = models.JSONField(default=list, blank=True, verbose_name='المميزات')
    notes = models.TextField(blank=True, verbose_name='ملاحظات')
    nightly_price = models.DecimalField(
        max_digits=12, decimal_places=2, default=0, verbose_name='سعر الليلة'
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'chalets'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status', 'city']),
            models.Index(fields=['code']),
        ]
        verbose_name = 'شاليه'
        verbose_name_plural = 'الشاليهات'

    def __str__(self):
        return f'{self.name} ({self.code})'


class ChaletImage(models.Model):
    chalet = models.ForeignKey(
        Chalet, on_delete=models.CASCADE, related_name='images'
    )
    image = models.ImageField(upload_to='chalets/%Y/%m/', verbose_name='الصورة')
    is_primary = models.BooleanField(default=False)
    caption = models.CharField(max_length=200, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'chalet_images'
        ordering = ['-is_primary', '-created_at']
        verbose_name = 'صورة شاليه'
        verbose_name_plural = 'صور الشاليهات'

    def __str__(self):
        return f'Image for {self.chalet.name}'
