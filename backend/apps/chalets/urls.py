from rest_framework.routers import DefaultRouter
from apps.chalets.views import ChaletViewSet

router = DefaultRouter()
router.register('', ChaletViewSet, basename='chalets')

urlpatterns = router.urls
