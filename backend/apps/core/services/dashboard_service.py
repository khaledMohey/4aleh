from datetime import date
from decimal import Decimal

from django.db.models import Sum, Count, Q
from django.db.models.functions import TruncMonth

from apps.chalets.models import Chalet
from apps.bookings.models import Booking
from apps.expenses.models import Expense
from apps.owners.models import OwnerRentalContract


class DashboardService:
    @staticmethod
    def get_stats():
        today = date.today()
        chalets = Chalet.objects.filter(is_active=True)
        total_chalets = chalets.count()
        rented_chalets = chalets.filter(status=Chalet.Status.RENTED).count()

        bookings = Booking.objects.exclude(status=Booking.Status.CANCELLED)
        total_bookings = bookings.count()

        total_revenue = bookings.aggregate(
            total=Sum('final_amount')
        )['total'] or Decimal('0')

        total_expenses = Expense.objects.aggregate(
            total=Sum('amount')
        )['total'] or Decimal('0')

        owner_costs = OwnerRentalContract.objects.aggregate(
            total=Sum('total_cost')
        )['total'] or Decimal('0')

        net_profit = total_revenue - total_expenses - owner_costs

        monthly_stats = (
            bookings.filter(check_in__year=today.year)
            .annotate(month=TruncMonth('check_in'))
            .values('month')
            .annotate(
                revenue=Sum('final_amount'),
                count=Count('id'),
            )
            .order_by('month')
        )

        latest_bookings = bookings.select_related('chalet', 'customer').order_by('-created_at')[:5]

        top_chalets = (
            bookings.values('chalet__id', 'chalet__name', 'chalet__code')
            .annotate(revenue=Sum('final_amount'), booking_count=Count('id'))
            .order_by('-revenue')[:5]
        )

        return {
            'total_chalets': total_chalets,
            'rented_chalets': rented_chalets,
            'available_chalets': total_chalets - rented_chalets,
            'total_revenue': float(total_revenue),
            'total_expenses': float(total_expenses),
            'owner_rental_costs': float(owner_costs),
            'net_profit': float(net_profit),
            'total_bookings': total_bookings,
            'monthly_stats': list(monthly_stats),
            'latest_bookings': latest_bookings,
            'top_chalets': list(top_chalets),
        }
