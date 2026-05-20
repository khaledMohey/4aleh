from apps.chalets.models import Chalet, ChaletImage


class ChaletRepository:
    @staticmethod
    def get_all(active_only=True):
        qs = Chalet.objects.prefetch_related('images')
        if active_only:
            qs = qs.filter(is_active=True)
        return qs

    @staticmethod
    def get_by_id(pk):
        return Chalet.objects.prefetch_related('images').get(pk=pk)

    @staticmethod
    def create(**kwargs):
        return Chalet.objects.create(**kwargs)

    @staticmethod
    def update(instance, **kwargs):
        for key, value in kwargs.items():
            setattr(instance, key, value)
        instance.save()
        return instance

    @staticmethod
    def delete(instance):
        instance.is_active = False
        instance.save()

    @staticmethod
    def add_image(chalet, image, is_primary=False, caption=''):
        if is_primary:
            ChaletImage.objects.filter(chalet=chalet, is_primary=True).update(is_primary=False)
        return ChaletImage.objects.create(
            chalet=chalet, image=image, is_primary=is_primary, caption=caption
        )
