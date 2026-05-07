"""
URL configuration for task_manager project.
"""
from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse

def api_root(request):
    return JsonResponse({
        "message": "Team Task Manager API is running!",
        "endpoints": {
            "admin": "/admin/",
            "auth_register": "/api/auth/register/",
            "auth_login": "/api/auth/login/",
            "auth_me": "/api/auth/me/",
            "projects": "/api/projects/",
            "tasks": "/api/tasks/",
            "dashboard": "/api/tasks/dashboard/",
        }
    })

urlpatterns = [
    path('', api_root),
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
]
