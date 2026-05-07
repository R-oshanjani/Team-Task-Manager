from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from django.db.models import Q
from .models import Project, ProjectMember, Task
from .serializers import (
    UserSerializer, UserCreateSerializer, 
    ProjectSerializer, ProjectMemberSerializer, TaskSerializer
)

User = get_user_model()

class IsProjectAdminOrMemberReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        # Allow read permissions for any member
        if request.method in permissions.SAFE_METHODS:
            return ProjectMember.objects.filter(project=obj, user=request.user).exists()
        
        # Only admins can edit or delete projects
        return ProjectMember.objects.filter(project=obj, user=request.user, role='ADMIN').exists()

class RegisterView(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        serializer = UserCreateSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserProfileView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

class UserListView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        users = User.objects.all()
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)

class ProjectViewSet(viewsets.ModelViewSet):
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated, IsProjectAdminOrMemberReadOnly]

    def get_queryset(self):
        # User can only see projects they are members of
        return Project.objects.filter(members__user=self.request.user).distinct()

    def perform_create(self, serializer):
        project = serializer.save(created_by=self.request.user)
        # Add creator as an admin member automatically
        ProjectMember.objects.create(project=project, user=self.request.user, role='ADMIN')

    @action(detail=True, methods=['post', 'delete'])
    def members(self, request, pk=None):
        project = self.get_object()
        
        # Must be admin to manage members
        if not ProjectMember.objects.filter(project=project, user=request.user, role='ADMIN').exists():
            return Response({"detail": "Only project admins can manage members."}, status=status.HTTP_403_FORBIDDEN)

        if request.method == 'POST':
            # Add a member
            user_id = request.data.get('user_id')
            role = request.data.get('role', 'MEMBER')
            
            try:
                user = User.objects.get(id=user_id)
            except User.DoesNotExist:
                return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)
                
            if ProjectMember.objects.filter(project=project, user=user).exists():
                return Response({"detail": "User is already a member."}, status=status.HTTP_400_BAD_REQUEST)
                
            member = ProjectMember.objects.create(project=project, user=user, role=role)
            return Response(ProjectMemberSerializer(member).data, status=status.HTTP_201_CREATED)

        elif request.method == 'DELETE':
            # Remove a member
            user_id = request.data.get('user_id')
            if int(user_id) == request.user.id:
                return Response({"detail": "Cannot remove yourself from the project."}, status=status.HTTP_400_BAD_REQUEST)
                
            member = ProjectMember.objects.filter(project=project, user_id=user_id).first()
            if not member:
                return Response({"detail": "Member not found."}, status=status.HTTP_404_NOT_FOUND)
                
            member.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)

class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # User can see tasks from projects they are members of
        return Task.objects.filter(project__members__user=self.request.user).distinct()

    def perform_create(self, serializer):
        project = serializer.validated_data.get('project')
        # Check if user is a member of the project
        if not ProjectMember.objects.filter(project=project, user=self.request.user).exists():
            raise permissions.PermissionDenied("You must be a member of the project to create tasks.")
        serializer.save()

    def perform_destroy(self, instance):
        if not ProjectMember.objects.filter(project=instance.project, user=self.request.user, role='ADMIN').exists():
            raise permissions.PermissionDenied("Only project admins can delete tasks.")
        instance.delete()

    @action(detail=False, methods=['get'])
    def dashboard(self, request):
        tasks = self.get_queryset()
        
        todo = tasks.filter(status='TODO').count()
        in_progress = tasks.filter(status='IN_PROGRESS').count()
        done = tasks.filter(status='DONE').count()
        
        my_tasks = tasks.filter(assignee=request.user)
        
        data = {
            'summary': {
                'total': tasks.count(),
                'todo': todo,
                'in_progress': in_progress,
                'done': done,
            },
            'my_tasks': TaskSerializer(my_tasks, many=True).data
        }
        return Response(data)
