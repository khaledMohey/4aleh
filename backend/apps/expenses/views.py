from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.db.models import Sum

from apps.expenses.models import Expense
from apps.expenses.serializers import ExpenseSerializer


class ExpenseViewSet(viewsets.ModelViewSet):
    queryset = Expense.objects.select_related('chalet')
    serializer_class = ExpenseSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['chalet', 'expense_type']
    search_fields = ['notes', 'chalet__name']
    ordering_fields = ['date', 'amount']
    ordering = ['-date']

    @action(detail=False, methods=['get'])
    def types(self, request):
        return Response([
            {'value': c[0], 'label': c[1]}
            for c in Expense.ExpenseType.choices
        ])

    @action(detail=False, methods=['get'])
    def summary(self, request):
        qs = self.filter_queryset(self.get_queryset())
        by_type = qs.values('expense_type').annotate(total=Sum('amount'))
        return Response({
            'total': float(qs.aggregate(t=Sum('amount'))['t'] or 0),
            'count': qs.count(),
            'by_type': [
                {'type': item['expense_type'], 'total': float(item['total'])}
                for item in by_type
            ],
        })
