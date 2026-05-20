from rest_framework import serializers
from apps.chalets.models import Chalet, ChaletImage


class ChaletImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChaletImage
        fields = ['id', 'image', 'is_primary', 'caption', 'created_at']
        read_only_fields = ['created_at']


class ChaletSerializer(serializers.ModelSerializer):
    images = ChaletImageSerializer(many=True, read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = Chalet
        fields = [
            'id', 'name', 'code', 'location', 'city', 'description',
            'rooms_count', 'bathrooms_count', 'capacity', 'status',
            'status_display', 'features', 'notes', 'nightly_price',
            'images', 'is_active', 'created_at', 'updated_at',
        ]
        read_only_fields = ['created_at', 'updated_at']

    def validate_code(self, value):
        instance = getattr(self, 'instance', None)
        qs = Chalet.objects.filter(code=value)
        if instance:
            qs = qs.exclude(pk=instance.pk)
        if qs.exists():
            raise serializers.ValidationError('كود الشاليه مستخدم بالفعل')
        return value


class ChaletImageUploadSerializer(serializers.Serializer):
    image = serializers.ImageField()
    is_primary = serializers.BooleanField(default=False)
    caption = serializers.CharField(required=False, allow_blank=True)
