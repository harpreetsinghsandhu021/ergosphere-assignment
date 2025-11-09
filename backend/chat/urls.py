from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# This file maps our URLs to our Views.

# DRF's Router automatically creates the URLs for our ConversationViewSet
# (e.g., /conversations and /conversations/<id>)

router = DefaultRouter()
router.register(r'conversations', views.ConversationViewSet, basename='conversation')

urlpatterns = [
    path('', include(router.urls)),
    path('chat/', views.ChatView.as_view(), name='chat'),
    path('search/', views.SemanticSearchView.as_view(), name='search'),
    path('conversations/<int:id>/analyze/', views.AnalyzeConversationView.as_view(), name='conversation-analyze')
    ]