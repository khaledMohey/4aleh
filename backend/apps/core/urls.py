from django.urls import path
from .views import DashboardView, GlobalSearchView, ReportsView

urlpatterns = [
    path('dashboard/', DashboardView.as_view(), name='dashboard'),
    path('search/', GlobalSearchView.as_view(), name='global-search'),
    path('reports/', ReportsView.as_view(), name='reports'),
]
