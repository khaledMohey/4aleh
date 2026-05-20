from apps.chalets.repositories.chalet_repository import ChaletRepository


class ChaletService:
    @staticmethod
    def list_chalets(filters=None):
        qs = ChaletRepository.get_all()
        if filters:
            status = filters.get('status')
            city = filters.get('city')
            search = filters.get('search')
            if status:
                qs = qs.filter(status=status)
            if city:
                qs = qs.filter(city__icontains=city)
            if search:
                qs = qs.filter(name__icontains=search) | qs.filter(code__icontains=search)
        return qs

    @staticmethod
    def get_chalet(pk):
        return ChaletRepository.get_by_id(pk)

    @staticmethod
    def create_chalet(data):
        return ChaletRepository.create(**data)

    @staticmethod
    def update_chalet(instance, data):
        return ChaletRepository.update(instance, **data)

    @staticmethod
    def delete_chalet(instance):
        return ChaletRepository.delete(instance)

    @staticmethod
    def add_image(chalet, image, is_primary=False, caption=''):
        return ChaletRepository.add_image(chalet, image, is_primary, caption)
