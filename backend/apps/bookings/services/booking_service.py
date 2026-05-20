from django.db.models import Q

from apps.bookings.models import Booking
from apps.chalets.models import Chalet
from apps.notifications.services.notification_service import NotificationService


class BookingService:
    @staticmethod
    def check_overlap(chalet_id, check_in, check_out, exclude_id=None):
        qs = Booking.objects.filter(
            chalet_id=chalet_id,
            status__in=[
                Booking.Status.PENDING,
                Booking.Status.CONFIRMED,
                Booking.Status.CHECKED_IN,
            ],
        ).filter(
            Q(check_in__lt=check_out) & Q(check_out__gt=check_in)
        )
        if exclude_id:
            qs = qs.exclude(pk=exclude_id)
        return qs.exists()

    @staticmethod
    def create_booking(data):
        if BookingService.check_overlap(
            data['chalet'].id, data['check_in'], data['check_out']
        ):
            raise ValueError('يوجد حجز متداخل في هذه الفترة')

        booking = Booking.objects.create(**data)
        chalet = data['chalet']
        chalet.status = Chalet.Status.RENTED
        chalet.save(update_fields=['status'])
        NotificationService.check_upcoming_booking(booking)
        return booking

    @staticmethod
    def update_booking(instance, data):
        check_in = data.get('check_in', instance.check_in)
        check_out = data.get('check_out', instance.check_out)
        chalet = data.get('chalet', instance.chalet)

        if BookingService.check_overlap(chalet.id, check_in, check_out, instance.pk):
            raise ValueError('يوجد حجز متداخل في هذه الفترة')

        for key, value in data.items():
            setattr(instance, key, value)
        instance.save()
        NotificationService.check_upcoming_booking(instance)
        return instance

    @staticmethod
    def get_calendar_events(start_date=None, end_date=None):
        from apps.owners.models import OwnerRentalContract

        bookings_qs = Booking.objects.select_related('chalet', 'customer').exclude(
            status=Booking.Status.CANCELLED
        )
        contracts_qs = OwnerRentalContract.objects.select_related('chalet', 'owner')

        if start_date:
            bookings_qs = bookings_qs.filter(check_out__gte=start_date)
            contracts_qs = contracts_qs.filter(end_date__gte=start_date)
        if end_date:
            bookings_qs = bookings_qs.filter(check_in__lte=end_date)
            contracts_qs = contracts_qs.filter(start_date__lte=end_date)

        events = []
        for b in bookings_qs:
            events.append({
                'id': f'booking-{b.id}',
                'type': 'booking',
                'title': f'{b.customer.name} - {b.chalet.name}',
                'start': str(b.check_in),
                'end': str(b.check_out),
                'chalet_id': b.chalet_id,
                'chalet_name': b.chalet.name,
                'status': b.status,
                'color': '#3b82f6',
            })
        for c in contracts_qs:
            events.append({
                'id': f'contract-{c.id}',
                'type': 'owner_contract',
                'title': f'عقد مالك: {c.owner.name} - {c.chalet.name}',
                'start': str(c.start_date),
                'end': str(c.end_date),
                'chalet_id': c.chalet_id,
                'chalet_name': c.chalet.name,
                'status': c.payment_status,
                'color': '#f59e0b',
            })
        return events
