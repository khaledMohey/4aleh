from rest_framework import viewsets, status
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from apps.owners.models import Owner, OwnerRentalContract
from apps.owners.serializers import OwnerSerializer, OwnerRentalContractSerializer
from apps.owners.services.owner_service import OwnerService


class OwnerViewSet(viewsets.ModelViewSet):
    queryset = Owner.objects.all()
    serializer_class = OwnerSerializer
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['name', 'phone']
    ordering = ['name']


class OwnerRentalContractViewSet(viewsets.ModelViewSet):
    queryset = OwnerRentalContract.objects.select_related('owner', 'chalet')
    serializer_class = OwnerRentalContractSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['chalet', 'owner', 'payment_status']
    search_fields = ['owner__name', 'chalet__name']
    ordering_fields = ['start_date', 'end_date', 'total_cost']
    ordering = ['-start_date']

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        contract = OwnerService.create_contract(serializer.validated_data)
        return Response(
            OwnerRentalContractSerializer(contract).data,
            status=status.HTTP_201_CREATED,
        )

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        contract = OwnerService.update_contract(instance, serializer.validated_data)
        return Response(OwnerRentalContractSerializer(contract).data)
