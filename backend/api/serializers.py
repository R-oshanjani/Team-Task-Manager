from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Project, ProjectMember, Task

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name')

class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password')

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password']
        )
        return user

class ProjectMemberSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    user_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), source='user', write_only=True
    )

    class Meta:
        model = ProjectMember
        fields = ('id', 'user', 'user_id', 'role', 'joined_at')

class ProjectSerializer(serializers.ModelSerializer):
    members = ProjectMemberSerializer(many=True, read_only=True)
    created_by = UserSerializer(read_only=True)

    class Meta:
        model = Project
        fields = ('id', 'name', 'description', 'created_at', 'created_by', 'members')
        read_only_fields = ('created_at', 'created_by')

class TaskSerializer(serializers.ModelSerializer):
    assignee_details = UserSerializer(source='assignee', read_only=True)

    class Meta:
        model = Task
        fields = ('id', 'title', 'description', 'project', 'assignee', 'assignee_details', 'status', 'due_date', 'created_at', 'updated_at')
        read_only_fields = ('created_at', 'updated_at')
