"""
Seed data script for Chalet Management System.
Run: python manage.py shell < scripts/seed_data.py
Or: python scripts/seed_data.py (from backend directory with Django setup)
"""
import os
import sys
from datetime import date, timedelta
from decimal import Decimal

# Setup Django
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

import django
django.setup()

from apps.chalets.models import Chalet
from apps.owners.models import Owner, OwnerRentalContract
from apps.bookings.models import Customer, Booking
from apps.expenses.models import Expense


def seed():
    print('Seeding database...')

    chalets_data = [
        {
            'name': 'شاليه البحر الذهبي',
            'code': 'CH-001',
            'location': 'كورنيش العين السخنة',
            'city': 'العين السخنة',
            'description': 'شاليه فاخر بإطلالة بحرية مباشرة',
            'rooms_count': 3,
            'bathrooms_count': 2,
            'capacity': 8,
            'status': 'available',
            'features': ['pool', 'wifi', 'ac', 'kitchen', 'sea_view'],
            'nightly_price': Decimal('2500'),
        },
        {
            'name': 'شاليه الواحة',
            'code': 'CH-002',
            'location': 'طريق الزعفرانة',
            'city': 'الزعفرانة',
            'description': 'شاليه هادئ وسط الطبيعة',
            'rooms_count': 2,
            'bathrooms_count': 1,
            'capacity': 6,
            'status': 'rented',
            'features': ['wifi', 'ac', 'kitchen', 'garden', 'bbq'],
            'nightly_price': Decimal('1800'),
        },
        {
            'name': 'شاليه النخيل',
            'code': 'CH-003',
            'location': 'مارينا العين السخنة',
            'city': 'العين السخنة',
            'description': 'شاليه عائلي مميز',
            'rooms_count': 4,
            'bathrooms_count': 3,
            'capacity': 12,
            'status': 'available',
            'features': ['pool', 'wifi', 'ac', 'kitchen', 'parking'],
            'nightly_price': Decimal('3500'),
        },
        {
            'name': 'شاليه القمر',
            'code': 'CH-004',
            'location': 'رأس سدر',
            'city': 'رأس سدر',
            'description': 'شاليه للعائلات الكبيرة',
            'rooms_count': 3,
            'bathrooms_count': 2,
            'capacity': 10,
            'status': 'maintenance',
            'features': ['wifi', 'ac', 'sea_view'],
            'nightly_price': Decimal('2000'),
        },
    ]

    chalets = []
    for data in chalets_data:
        chalet, created = Chalet.objects.get_or_create(code=data['code'], defaults=data)
        chalets.append(chalet)
        status_text = 'created' if created else 'exists'
        print(f'  Chalet: {chalet.code} ({status_text})')

    owners_data = [
        {'name': 'أحمد محمد', 'phone': '01012345678'},
        {'name': 'محمود علي', 'phone': '01098765432'},
        {'name': 'سارة حسن', 'phone': '01123456789'},
    ]
    owners = []
    for data in owners_data:
        owner, created = Owner.objects.get_or_create(phone=data['phone'], defaults=data)
        owners.append(owner)

    today = date.today()
    contracts_data = [
        {
            'chalet': chalets[1],
            'owner': owners[0],
            'daily_rate': Decimal('500'),
            'start_date': today - timedelta(days=30),
            'end_date': today + timedelta(days=60),
            'payment_method': 'transfer',
            'payment_status': 'partial',
            'paid_amount': Decimal('20000'),
        },
        {
            'chalet': chalets[0],
            'owner': owners[1],
            'daily_rate': Decimal('600'),
            'start_date': today - timedelta(days=10),
            'end_date': today + timedelta(days=20),
            'payment_method': 'cash',
            'payment_status': 'paid',
            'paid_amount': Decimal('18000'),
        },
    ]
    for data in contracts_data:
        contract, created = OwnerRentalContract.objects.get_or_create(
            chalet=data['chalet'],
            owner=data['owner'],
            start_date=data['start_date'],
            defaults=data,
        )
        if created:
            print(f'  Contract id: {contract.id}')

    customers_data = [
        {'name': 'خالد إبراهيم', 'phone': '01234567890'},
        {'name': 'نورا أحمد', 'phone': '01298765432'},
        {'name': 'يوسف محمود', 'phone': '01156789012'},
        {'name': 'فاطمة علي', 'phone': '01087654321'},
    ]
    customers = []
    for data in customers_data:
        customer, created = Customer.objects.get_or_create(phone=data['phone'], defaults=data)
        customers.append(customer)

    bookings_data = [
        {
            'chalet': chalets[0],
            'customer': customers[0],
            'guests_count': 6,
            'check_in': today + timedelta(days=5),
            'check_out': today + timedelta(days=8),
            'nightly_price': Decimal('2500'),
            'discount': Decimal('500'),
            'deposit': Decimal('5000'),
            'payment_status': 'partial',
            'status': 'confirmed',
        },
        {
            'chalet': chalets[1],
            'customer': customers[1],
            'guests_count': 4,
            'check_in': today - timedelta(days=2),
            'check_out': today + timedelta(days=3),
            'nightly_price': Decimal('1800'),
            'discount': Decimal('0'),
            'deposit': Decimal('9000'),
            'payment_status': 'paid',
            'status': 'checked_in',
        },
        {
            'chalet': chalets[2],
            'customer': customers[2],
            'guests_count': 8,
            'check_in': today + timedelta(days=15),
            'check_out': today + timedelta(days=20),
            'nightly_price': Decimal('3500'),
            'discount': Decimal('1000'),
            'deposit': Decimal('10000'),
            'payment_status': 'partial',
            'status': 'confirmed',
        },
    ]
    for data in bookings_data:
        existing = Booking.objects.filter(
            chalet=data['chalet'],
            check_in=data['check_in'],
        ).exists()
        if not existing:
            booking = Booking.objects.create(**data)
            print(f'  Booking id: {booking.id}')

    expenses_data = [
        {'chalet': chalets[0], 'expense_type': 'maintenance', 'amount': Decimal('1500'), 'date': today - timedelta(days=5)},
        {'chalet': chalets[0], 'expense_type': 'electricity', 'amount': Decimal('800'), 'date': today - timedelta(days=10)},
        {'chalet': chalets[1], 'expense_type': 'cleaning', 'amount': Decimal('500'), 'date': today - timedelta(days=3)},
        {'chalet': chalets[2], 'expense_type': 'internet', 'amount': Decimal('300'), 'date': today - timedelta(days=7)},
        {'chalet': chalets[2], 'expense_type': 'water', 'amount': Decimal('400'), 'date': today - timedelta(days=15)},
        {'chalet': chalets[0], 'expense_type': 'salaries', 'amount': Decimal('3000'), 'date': today - timedelta(days=1)},
    ]
    for data in expenses_data:
        Expense.objects.get_or_create(
            chalet=data['chalet'],
            expense_type=data['expense_type'],
            date=data['date'],
            defaults={'amount': data['amount'], 'notes': 'بيانات تجريبية'},
        )

    from apps.notifications.services.notification_service import NotificationService
    NotificationService.generate_all_notifications()

    print('Seed completed successfully!')


if __name__ == '__main__':
    seed()
