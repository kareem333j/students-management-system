from django.shortcuts import render, get_object_or_404
from .models import *
from .serializers import *
from rest_framework.permissions import AllowAny
from rest_framework import generics
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Q
from django.utils.dateparse import parse_date
from datetime import date as date_cls
from rest_framework.views import APIView
import json

class GradeListCreateView(generics.ListCreateAPIView):
    queryset = Grade.objects.all()
    serializer_class = GradeSerializer
    permission_classes = [AllowAny]
    
class GradeRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Grade.objects.all()
    serializer_class = GradeSerializer
    permission_classes = [AllowAny]
    
class StudentListCreateView(generics.ListCreateAPIView):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer
    permission_classes = [AllowAny]
    
class StudentRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer
    permission_classes = [AllowAny]
    
class StudentBulkDeleteView(APIView):
    permission_classes = [AllowAny]

    def delete(self, request, *args, **kwargs):
        ids = request.data.get("ids", [])
        if not ids:
            return Response({"detail": "No IDs provided."}, status=status.HTTP_400_BAD_REQUEST)

        deleted_count, _ = Student.objects.filter(id__in=ids).delete()

        return Response(
            {"detail": f"Deleted {deleted_count} students."},
            status=status.HTTP_200_OK,
        )
    
class StudentSearchView(generics.ListAPIView):
    serializer_class = StudentSerializer
    permission_classes = [AllowAny]
    queryset = Student.objects.all()
    
    def get(self, _request, *args, **kwargs):
        value = kwargs['value']
        value = value.strip()
        queryset = self.queryset.filter(
            Q(name__icontains=value)
            | Q(contact_phone__icontains=value)
        )
        serializer = self.serializer_class(queryset, many=True)
        return Response(serializer.data)
    
class StudentByGradeView(generics.ListAPIView):
    serializer_class = StudentSerializer
    permission_classes = [AllowAny]
    queryset = Student.objects.all()
    
    def get(self, _request, *args, **kwargs):
        grade = kwargs['id']
        grade = get_object_or_404(Grade, id=grade)
        queryset = self.queryset.filter(grade=grade)
        serializer = self.serializer_class(queryset, many=True)
        
        return Response({"students": {
            "grade": grade.level,
            "data": serializer.data
        }}) 
    
class DailyFollowUpListCreateView(generics.GenericAPIView):
    serializer_class = DailyFollowUpSerializer
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        date_str = request.query_params.get("date")
        grade_id = request.query_params.get("grade")

        if not date_str or not grade_id:
            return Response({"detail": "date and grade are required"}, status=status.HTTP_400_BAD_REQUEST)

        date = parse_date(date_str)
        if not date:
            return Response({"detail": "Invalid date format"}, status=status.HTTP_400_BAD_REQUEST)
        today = date_cls.today()

        students = Student.objects.filter(grade_id=grade_id)

        followups = []
        if date == today:
            for student in students:
                followup, created = DailyFollowUp.objects.get_or_create(
                    student=student,
                    date=date,
                    defaults={"is_absent": False, "degree": None, "notes": ""}
                )
                followups.append(followup)
        else:
            followups = DailyFollowUp.objects.filter(student__grade_id=grade_id, date=date)

        serializer = self.get_serializer(followups, many=True)
        return Response(serializer.data)

    def patch(self, request, *args, **kwargs):
        data = request.data
        if not isinstance(data, list):
            return Response({"detail": "Expected a list of followups"}, status=status.HTTP_400_BAD_REQUEST)

        updated = []
        for item in data:
            try:
                followup = DailyFollowUp.objects.get(id=item["id"])
                serializer = self.get_serializer(followup, data=item, partial=True)
                serializer.is_valid(raise_exception=True)
                serializer.save()
                updated.append(serializer.data)
            except DailyFollowUp.DoesNotExist:
                continue

        return Response(updated, status=status.HTTP_200_OK)
    
    
class PaymentMonthListCreateView(generics.ListCreateAPIView):
    queryset = PaymentMonth.objects.all()
    serializer_class = PaymentMonthSerializer
    permission_classes = [AllowAny]
    
class PaymentMonthRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = PaymentMonth.objects.all()
    serializer_class = PaymentMonthSerializer
    permission_classes = [AllowAny]
    
class MonthlyPaymentListCreateView(generics.GenericAPIView):
    serializer_class = MonthlyPaymentSerializer
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        grade_id = request.query_params.get("grade")
        if not grade_id:
            return Response({"error": "grade_id مطلوب"}, status=status.HTTP_400_BAD_REQUEST)

        students = Student.objects.filter(grade_id=grade_id)
        months = PaymentMonth.objects.all()

        results = []
        for student in students:
            student_payments = []
            for month in months:
                payment, created = MonthlyPayment.objects.get_or_create(
                    student=student, month=month,
                    defaults={"is_paid": False}
                )
                student_payments.append({
                    "month_id": month.id,
                    "month_name": month.name,
                    "is_paid": payment.is_paid,
                    "payment_id": payment.id,
                })

            results.append({
                "id": student.id,
                "name": student.name,
                "payments": student_payments
            })

        return Response(results)

    def patch(self, request, *args, **kwargs):
        data = request.data
        for student in data:
            for payment in student.get("payments", []):
                try:
                    p = MonthlyPayment.objects.get(id=payment["payment_id"])
                    p.is_paid = payment["is_paid"]
                    p.save()
                except MonthlyPayment.DoesNotExist:
                    continue

        return Response({"detail": "تم تحديث الدفعات"}, status=status.HTTP_200_OK)
    
class MonthlyPaymentRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = MonthlyPayment.objects.all()
    serializer_class = MonthlyPaymentSerializer
    permission_classes = [AllowAny]
    
    
class QuizListCreateView(generics.GenericAPIView):
    serializer_class = QuizSerializer
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        grade_id = request.query_params.get("grade")

        if not grade_id:
            return Response({"detail": "grade مطلوب"}, status=status.HTTP_400_BAD_REQUEST)

        students = Student.objects.filter(grade_id=grade_id)
        months = PaymentMonth.objects.all()

        quizzes = []
        for student in students:
            for month in months:
                quiz, created = Quiz.objects.get_or_create(
                    student=student,
                    month=month,
                    defaults={"notes": None}
                )
                quizzes.append(quiz)

        serializer = self.get_serializer(quizzes, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request, *args, **kwargs):
        """
        يستقبل ليست فيها تعديلات على الكويزات ويعدلها
        """
        if not isinstance(request.data, list):
            return Response({"detail": "لازم تبعت ليست من الكويزات"}, status=status.HTTP_400_BAD_REQUEST)

        updated_quizzes = []
        for quiz_data in request.data:
            quiz_id = quiz_data.get("id")
            if not quiz_id:
                continue

            try:
                quiz = Quiz.objects.get(id=quiz_id)
            except Quiz.DoesNotExist:
                continue

            serializer = self.get_serializer(quiz, data=quiz_data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            updated_quizzes.append(serializer.data)

        return Response(updated_quizzes, status=status.HTTP_200_OK)
    
class QuizRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Quiz.objects.all()
    serializer_class = QuizSerializer
    permission_classes = [AllowAny]
    
class StudentListAllData(generics.RetrieveAPIView):
    permission_classes = [AllowAny]
    queryset = Student.objects.all()
    serializer_class = StudentFullSerializer
    
    
class DeleteAllDataExceptGradesAndStudentsView(APIView):
    permission_classes = [AllowAny]
    def delete(self, request, *args, **kwargs):
        DailyFollowUp.objects.all().delete()
        MonthlyPayment.objects.all().delete()
        Quiz.objects.all().delete()
        PaymentMonth.objects.all().delete()

        return Response(
            {"detail": "All data deleted except Grades and Students."},
            status=status.HTTP_200_OK
        )