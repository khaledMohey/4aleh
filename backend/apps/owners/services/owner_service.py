from apps.owners.models import Owner, OwnerRentalContract
from apps.notifications.services.notification_service import NotificationService


class OwnerService:
    @staticmethod
    def create_contract(data):
        contract = OwnerRentalContract.objects.create(**data)
        contract.chalet.status = 'rented'
        contract.chalet.save(update_fields=['status'])
        NotificationService.check_owner_contract_expiry(contract)
        return contract

    @staticmethod
    def update_contract(instance, data):
        for key, value in data.items():
            setattr(instance, key, value)
        instance.save()
        NotificationService.check_owner_contract_expiry(instance)
        return instance
