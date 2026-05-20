from rest_framework import serializers
from apps.owners.models import Owner, OwnerRentalContract


class OwnerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Owner
        fields = ['id', 'name', 'phone', 'email', 'notes', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']


class OwnerRentalContractSerializer(serializers.ModelSerializer):
    owner_name = serializers.CharField(source='owner.name', read_only=True)
    chalet_name = serializers.CharField(source='chalet.name', read_only=True)
    payment_status_display = serializers.CharField(
        source='get_payment_status_display', read_only=True
    )
    payment_method_display = serializers.CharField(
        source='get_payment_method_display', read_only=True
    )
    remaining_amount = serializers.SerializerMethodField()

    class Meta:
        model = OwnerRentalContract
        fields = [
            'id', 'chalet', 'chalet_name', 'owner', 'owner_name',
            'daily_rate', 'start_date', 'end_date', 'days_count', 'total_cost',
            'payment_method', 'payment_method_display',
            'payment_status', 'payment_status_display',
            'paid_amount', 'remaining_amount', 'notes',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['days_count', 'total_cost', 'created_at', 'updated_at']

    def get_remaining_amount(self, obj):
        return float(obj.total_cost - obj.paid_amount)

    def validate(self, data):
        start = data.get('start_date', getattr(self.instance, 'start_date', None))
        end = data.get('end_date', getattr(self.instance, 'end_date', None))
        if start and end and end < start:
            raise serializers.ValidationError({'end_date': 'تاريخ النهاية يجب أن يكون بعد البداية'})
        return data
