from datetime import date, timedelta

from apps.notifications.models import Notification


class NotificationService:
    @staticmethod
    def create_notification(title, message, notification_type, priority='medium', **relations):
        return Notification.objects.create(
            title=title,
            message=message,
            notification_type=notification_type,
            priority=priority,
            related_chalet=relations.get('chalet'),
            related_booking=relations.get('booking'),
            related_contract=relations.get('contract'),
        )

    @staticmethod
    def check_owner_contract_expiry(contract):
        today = date.today()
        days_left = (contract.end_date - today).days
        if days_left <= 7:
            NotificationService.create_notification(
                title='اقتراب انتهاء عقد إيجار من المالك',
                message=f'عقد {contract.owner.name} للشاليه {contract.chalet.name} ينتهي خلال {days_left} يوم',
                notification_type=Notification.NotificationType.OWNER_CONTRACT_EXPIRY,
                priority='high' if days_left <= 3 else 'medium',
                chalet=contract.chalet,
                contract=contract,
            )

    @staticmethod
    def check_upcoming_booking(booking):
        today = date.today()
        days_until = (booking.check_in - today).days
        if 0 <= days_until <= 3:
            NotificationService.create_notification(
                title='حجز قادم',
                message=f'حجز {booking.customer.name} للشاليه {booking.chalet.name} يبدأ خلال {days_until} يوم',
                notification_type=Notification.NotificationType.UPCOMING_BOOKING,
                priority='medium',
                chalet=booking.chalet,
                booking=booking,
            )
        days_until_checkout = (booking.check_out - today).days
        if 0 <= days_until_checkout <= 1:
            NotificationService.create_notification(
                title='انتهاء إقامة عميل',
                message=f'إقامة {booking.customer.name} في {booking.chalet.name} تنتهي قريباً',
                notification_type=Notification.NotificationType.CHECKOUT_REMINDER,
                priority='high',
                chalet=booking.chalet,
                booking=booking,
            )

    @staticmethod
    def check_remaining_payments():
        from apps.bookings.models import Booking
        from apps.owners.models import OwnerRentalContract

        for booking in Booking.objects.filter(
            payment_status__in=['unpaid', 'partial'],
            remaining_amount__gt=0,
        ).exclude(status='cancelled'):
            NotificationService.create_notification(
                title='دفعة متبقية من عميل',
                message=f'المتبقي {booking.remaining_amount} من {booking.customer.name}',
                notification_type=Notification.NotificationType.PAYMENT_REMAINING,
                priority='high',
                chalet=booking.chalet,
                booking=booking,
            )

        for contract in OwnerRentalContract.objects.filter(
            payment_status__in=['unpaid', 'partial'],
        ):
            remaining = contract.total_cost - contract.paid_amount
            if remaining > 0:
                NotificationService.create_notification(
                    title='دفعة متبقية للمالك',
                    message=f'المتبقي {remaining} لعقد {contract.owner.name}',
                    notification_type=Notification.NotificationType.PAYMENT_REMAINING,
                    priority='medium',
                    chalet=contract.chalet,
                    contract=contract,
                )

    @staticmethod
    def generate_all_notifications():
        from apps.bookings.models import Booking
        from apps.owners.models import OwnerRentalContract

        for contract in OwnerRentalContract.objects.select_related('owner', 'chalet'):
            NotificationService.check_owner_contract_expiry(contract)

        for booking in Booking.objects.select_related('customer', 'chalet').exclude(
            status='cancelled'
        ):
            NotificationService.check_upcoming_booking(booking)

        NotificationService.check_remaining_payments()
