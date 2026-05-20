from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend

from apps.notifications.models import Notification
from apps.notifications.serializers import NotificationSerializer
from apps.notifications.services.notification_service import NotificationService


class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['is_read', 'notification_type', 'priority']
    http_method_names = ['get', 'patch', 'delete', 'head', 'options']

    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        notification = self.get_object()
        notification.is_read = True
        notification.save(update_fields=['is_read'])
        return Response(NotificationSerializer(notification).data)

    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        Notification.objects.filter(is_read=False).update(is_read=True)
        return Response({'message': 'تم تحديد جميع الإشعارات كمقروءة'})

    @action(detail=False, methods=['post'])
    def generate(self, request):
        NotificationService.generate_all_notifications()
        return Response({'message': 'تم توليد الإشعارات'})

    @action(detail=False, methods=['get'])
    def unread_count(self, request):
        count = Notification.objects.filter(is_read=False).count()
        return Response({'count': count})
