from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from apps.chalets.models import Chalet, ChaletImage
from apps.chalets.serializers import ChaletSerializer, ChaletImageSerializer, ChaletImageUploadSerializer
from apps.chalets.services.chalet_service import ChaletService
from apps.core.services.profit_service import ProfitService


class ChaletViewSet(viewsets.ModelViewSet):
    queryset = Chalet.objects.filter(is_active=True).prefetch_related('images')
    serializer_class = ChaletSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'city']
    search_fields = ['name', 'code', 'location', 'city']
    ordering_fields = ['name', 'created_at', 'nightly_price']
    ordering = ['-created_at']

    def perform_destroy(self, instance):
        ChaletService.delete_chalet(instance)

    @action(detail=True, methods=['post'])
    def upload_image(self, request, pk=None):
        chalet = self.get_object()
        serializer = ChaletImageUploadSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        image = ChaletService.add_image(
            chalet,
            serializer.validated_data['image'],
            serializer.validated_data.get('is_primary', False),
            serializer.validated_data.get('caption', ''),
        )
        return Response(ChaletImageSerializer(image).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['get'])
    def profit(self, request, pk=None):
        data = ProfitService.calculate_chalet_profit(pk)
        return Response(data)

    @action(detail=False, methods=['get'])
    def features_list(self, request):
        return Response([
            {'id': 'pool', 'label': 'حمام سباحة'},
            {'id': 'wifi', 'label': 'واي فاي'},
            {'id': 'ac', 'label': 'تكييف'},
            {'id': 'kitchen', 'label': 'مطبخ'},
            {'id': 'sea_view', 'label': 'إطلالة بحر'},
            {'id': 'parking', 'label': 'موقف سيارات'},
            {'id': 'bbq', 'label': 'شواية'},
            {'id': 'garden', 'label': 'حديقة'},
        ])
