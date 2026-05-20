from decimal import Decimal

from django.db.models import Sum

from apps.chalets.models import Chalet
from apps.bookings.models import Booking
from apps.expenses.models import Expense
from apps.owners.models import OwnerRentalContract


class ProfitService:
    @staticmethod
    def calculate_chalet_profit(chalet_id):
        chalet = Chalet.objects.get(pk=chalet_id)
        revenue = Booking.objects.filter(
            chalet=chalet
        ).exclude(
            status=Booking.Status.CANCELLED
        ).aggregate(total=Sum('final_amount'))['total'] or Decimal('0')

        owner_cost = OwnerRentalContract.objects.filter(
            chalet=chalet
        ).aggregate(total=Sum('total_cost'))['total'] or Decimal('0')

        expenses = Expense.objects.filter(
            chalet=chalet
        ).aggregate(total=Sum('amount'))['total'] or Decimal('0')

        net_profit = revenue - owner_cost - expenses
        return {
            'chalet_id': chalet_id,
            'chalet_name': chalet.name,
            'total_revenue': float(revenue),
            'owner_cost': float(owner_cost),
            'total_expenses': float(expenses),
            'net_profit': float(net_profit),
        }

    @staticmethod
    def calculate_system_profit():
        chalets = Chalet.objects.filter(is_active=True)
        results = []
        total_revenue = Decimal('0')
        total_expenses = Decimal('0')
        total_owner_cost = Decimal('0')

        for chalet in chalets:
            data = ProfitService.calculate_chalet_profit(chalet.id)
            results.append(data)
            total_revenue += Decimal(str(data['total_revenue']))
            total_expenses += Decimal(str(data['total_expenses']))
            total_owner_cost += Decimal(str(data['owner_cost']))

        best_chalet = max(results, key=lambda x: x['net_profit'], default=None)
        total_chalets = chalets.count()
        rented = chalets.filter(status=Chalet.Status.RENTED).count()
        occupancy_rate = (rented / total_chalets * 100) if total_chalets > 0 else 0

        return {
            'chalets': results,
            'total_revenue': float(total_revenue),
            'total_expenses': float(total_expenses),
            'total_owner_costs': float(total_owner_cost),
            'net_profit': float(total_revenue - total_expenses - total_owner_cost),
            'best_chalet': best_chalet,
            'occupancy_rate': round(occupancy_rate, 2),
        }
