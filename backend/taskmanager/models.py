from django.db import models
from django.utils import timezone

class User(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    phone_no = models.CharField(max_length=15, blank=True, null=True)

    def __str__(self):
        return self.name


class Team(models.Model):
    name = models.CharField(max_length=100, primary_key=True)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name


class Task(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
    ]

    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending', db_index=True)
    due_date = models.DateTimeField(blank=True, null=True, db_index=True)
    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, blank=True, null=True, related_name='tasks')
    oncall_team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name='tasks', to_field='name')
    completion_time = models.DateTimeField(blank=True, null=True)
    creation_time = models.DateTimeField(auto_now_add=True, blank=True, null=True)

    def __str__(self):
        return self.title

