from rest_framework.routers import DefaultRouter
from apps.owners.views import OwnerViewSet, OwnerRentalContractViewSet

router = DefaultRouter()
router.register('owners', OwnerViewSet, basename='owners')
router.register('contracts', OwnerRentalContractViewSet, basename='owner-contracts')

urlpatterns = router.urls
