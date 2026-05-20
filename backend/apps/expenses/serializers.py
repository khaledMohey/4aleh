from rest_framework import serializers
from apps.expenses.models import Expense


class ExpenseSerializer(serializers.ModelSerializer):
    chalet_name = serializers.CharField(source='chalet.name', read_only=True)
    expense_type_display = serializers.CharField(
        source='get_expense_type_display', read_only=True
    )

    class Meta:
        model = Expense
        fields = [
            'id', 'chalet', 'chalet_name', 'expense_type', 'expense_type_display',
            'amount', 'date', 'notes', 'created_at', 'updated_at',
        ]
        read_only_fields = ['created_at', 'updated_at']
