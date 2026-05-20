from rest_framework import serializers
from apps.notifications.models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    notification_type_display = serializers.CharField(
        source='get_notification_type_display', read_only=True
    )

    class Meta:
        model = Notification
        fields = [
            'id', 'title', 'message', 'notification_type',
            'notification_type_display', 'priority', 'is_read',
            'related_chalet', 'related_booking', 'related_contract',
            'created_at',
        ]
        read_only_fields = ['created_at']
