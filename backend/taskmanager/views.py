from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Task, User, Team
from .serializers import TaskSerializer, UserSerializer, TeamSerializer
from django.db import connection
from django.utils.timezone import now
from django.utils.dateparse import parse_datetime


class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer

    @action(detail=False, methods=['get'], url_path='completed')
    def completed_tasks(self, request):
        tasks = self.queryset.filter(status='completed')
        serializer = self.get_serializer(tasks, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['get'], url_path='completed/stats')
    def completed_stats(self, request):
        response = {}
        query = """
            SELECT assigned_to_id
            FROM (
                SELECT COUNT(*) AS task_cnt, assigned_to_id
                FROM taskmanager_task
                GROUP BY assigned_to_id
                ORDER BY task_cnt DESC
                LIMIT 1
            );
        """
        with connection.cursor() as cursor:
            cursor.execute(query)
            result = cursor.fetchone()
        try:
            name = User.objects.get(id=result[0]).name
            response["most_completed_person"] = name
        except:
            response["most_completed_person"] = ""
        query = """
            SELECT oncall_team_id
            FROM (
                SELECT COUNT(*) AS task_cnt, oncall_team_id
                FROM taskmanager_task
                GROUP BY oncall_team_id
                ORDER BY task_cnt DESC
                LIMIT 1
            );
        """
        with connection.cursor() as cursor:
            cursor.execute(query)
            result = cursor.fetchone()
        response["most_completed_team"] = result[0] if result[0] else ""
        query = """
            SELECT COUNT(*) as cnt
            FROM taskmanager_task
            WHERE status = 'completed';
        """
        
        with connection.cursor() as cursor:
            cursor.execute(query)
            result = cursor.fetchone()
        response["task_count"] = result[0] if len(result) != 0 else 0
        return Response(response)


    @action(detail=False, methods=['get'], url_path='pending')
    def pending_tasks(self, request):
        tasks = self.queryset.filter(status='pending')
        serializer = self.get_serializer(tasks, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['get'], url_path='pending/stats')
    def pending_stats(self, request):
        # Raw SQL query to calculate the average time difference
        query = """
            SELECT AVG(strftime('%s', 'now') - strftime('%s', creation_time)) AS average_seconds
            FROM taskmanager_task
            WHERE status = 'pending' AND due_date IS NOT NULL;
        """
        
        with connection.cursor() as cursor:
            cursor.execute(query)
            result = cursor.fetchone()
        
        average_days = result[0] // 86400
        average_hours = (result[0] % 86400)//3600
        response = {}
        response["average_time_since_creation"] = f"{int(average_days)} days, {int(average_hours)} hours"
        query = """
            SELECT COUNT(*) as cnt
            FROM taskmanager_task
            WHERE status = 'pending';
        """
        
        with connection.cursor() as cursor:
            cursor.execute(query)
            result = cursor.fetchone()
        response["task_count"] = result[0] if len(result) != 0 else 0
        return Response(response)

    @action(detail=False, methods=['get'], url_path='in_progress')
    def in_progress_tasks(self, request):
        tasks = self.queryset.filter(status='in_progress')
        serializer = self.get_serializer(tasks, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['get'], url_path='in_progress/stats')
    def in_progress_stats(self, request):
        # Raw SQL query to calculate the average time difference
        query = """
            SELECT AVG(strftime('%s', due_date) - strftime('%s', 'now')) AS average_seconds
            FROM taskmanager_task
            WHERE status = 'in_progress' AND due_date IS NOT NULL;
        """
        
        with connection.cursor() as cursor:
            cursor.execute(query)
            result = cursor.fetchone()
        
        average_days = result[0] // 86400
        average_hours = (result[0] % 86400)//3600
        response = {}
        response["average_time_till_due"] = f"{int(average_days)} days, {int(average_hours)} hours"
        query = """
            SELECT COUNT(*) as cnt
            FROM taskmanager_task
            WHERE status = 'in_progress';
        """
        
        with connection.cursor() as cursor:
            cursor.execute(query)
            result = cursor.fetchone()
        response["task_count"] = result[0] if len(result) != 0 else 0
        return Response(response)

    @action(detail=False, methods=['get'], url_path='overdue')
    def overdue_tasks(self, request):
        tasks = Task.objects.filter(due_date__lt=now(), status__in=['pending', 'in_progress'])
        serializer = self.get_serializer(tasks, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['get'], url_path='overdue/stats')
    def overdue_stats(self, request):
        response = {}
        # Raw SQL query to calculate the average time difference
        query = """
            SELECT AVG(strftime('%s', 'now') - strftime('%s', due_date)) AS average_seconds
            FROM taskmanager_task
            WHERE due_date < DATETIME('now') AND status != 'completed';
        """
        
        with connection.cursor() as cursor:
            cursor.execute(query)
            result = cursor.fetchone()
        if result[0]:
            average_days = result[0] // 86400
            average_hours = (result[0] % 86400)//3600
            response["average_time_past_due"] = f"{int(average_days)} days, {int(average_hours)} hours"
        else:
            response["average_time_past_due"] = ""
        query = """
            SELECT COUNT(*) as cnt
            FROM taskmanager_task
            WHERE due_date < DATETIME('now') AND status != 'completed';
        """
        
        with connection.cursor() as cursor:
            cursor.execute(query)
            result = cursor.fetchone()
        response["task_count"] = result[0]
        return Response(response)
    
    @action(detail=False, methods=['get'], url_path='before-date')
    def tasks_before_date(self, request):
        # Get the query parameter from the request
        query_date = request.query_params.get('date', None)
        if not query_date:
            return Response({"error": "Missing 'date' query parameter"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Parse the date string into a datetime object
        if query_date[-1] == "/":
            query_date = query_date[:-1]
        parsed_date = parse_datetime(query_date)
        if not parsed_date:
            return Response({"error": "Invalid 'date' format. Expected ISO 8601 format."}, status=status.HTTP_400_BAD_REQUEST)
        
        # Filter tasks with due_date before the parsed date
        tasks = Task.objects.filter(due_date__lt=parsed_date, status__in=['pending', 'in_progress'])
        
        # Serialize the tasks
        serializer = TaskSerializer(tasks, many=True)
        
        return Response(serializer.data, status=status.HTTP_200_OK)

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

class TeamViewSet(viewsets.ModelViewSet):
    queryset = Team.objects.all()
    serializer_class = TeamSerializer

class DistinctUserTeamViewSet(APIView):
    def get(self, request):
        # Get distinct users
        distinct_users = User.objects.all().distinct()
        user_serializer = UserSerializer(distinct_users, many=True)

        # Get distinct teams
        distinct_teams = Team.objects.all().distinct()
        team_serializer = TeamSerializer(distinct_teams, many=True)

        # Return the data as a response
        return Response({
            'users': user_serializer.data,
            'teams': team_serializer.data,
        }, status=status.HTTP_200_OK)
    