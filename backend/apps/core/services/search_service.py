from django.db.models import Q

from apps.chalets.models import Chalet
from apps.bookings.models import Booking, Customer
from apps.owners.models import Owner, OwnerRentalContract
from apps.expenses.models import Expense


class SearchService:
    @staticmethod
    def global_search(query):
        if not query or len(query) < 2:
            return {'chalets': [], 'bookings': [], 'customers': [], 'owners': [], 'expenses': []}

        chalets = Chalet.objects.filter(
            Q(name__icontains=query) | Q(code__icontains=query) | Q(city__icontains=query)
        )[:10]

        customers = Customer.objects.filter(
            Q(name__icontains=query) | Q(phone__icontains=query)
        )[:10]

        bookings = Booking.objects.filter(
            Q(customer__name__icontains=query) | Q(customer__phone__icontains=query) |
            Q(chalet__name__icontains=query)
        ).select_related('chalet', 'customer')[:10]

        owners = Owner.objects.filter(
            Q(name__icontains=query) | Q(phone__icontains=query)
        )[:10]

        expenses = Expense.objects.filter(
            Q(notes__icontains=query) | Q(chalet__name__icontains=query)
        ).select_related('chalet')[:10]

        return {
            'chalets': list(chalets.values('id', 'name', 'code', 'city', 'status')),
            'customers': list(customers.values('id', 'name', 'phone')),
            'bookings': [
                {
                    'id': b.id,
                    'customer': b.customer.name,
                    'chalet': b.chalet.name,
                    'check_in': str(b.check_in),
                    'check_out': str(b.check_out),
                }
                for b in bookings
            ],
            'owners': list(owners.values('id', 'name', 'phone')),
            'expenses': [
                {
                    'id': e.id,
                    'chalet': e.chalet.name,
                    'amount': float(e.amount),
                    'expense_type': e.expense_type,
                }
                for e in expenses
            ],
        }
