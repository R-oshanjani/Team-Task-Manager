from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, Project, ProjectMember, Task

admin.site.register(CustomUser, UserAdmin)
admin.site.register(Project)
admin.site.register(ProjectMember)
admin.site.register(Task)
