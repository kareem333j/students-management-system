from django.db import models
from datetime import date

class Grade(models.Model):
    level = models.CharField(max_length=100)
    description = models.TextField(null=True, blank=True)

    def __str__(self):
        return self.level

class Student(models.Model):
    name = models.CharField(max_length=200)
    grade = models.ForeignKey(Grade, on_delete=models.CASCADE, related_name='students')
    contact_phone = models.CharField(max_length=11)
    additional_phone = models.CharField(max_length=11, blank=True, null=True)
    initial_level = models.TextField(null=True, blank=True)
    notes = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class DailyFollowUp(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name="followups")
    date = models.DateField(default=date.today) 
    is_absent = models.BooleanField(default=False)
    degree = models.DecimalField(max_digits=6, decimal_places=2, blank=True, null=True)
    notes = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("student", "date")

    def __str__(self):
        return f"{self.student.name} - {self.date}"
    

class PaymentMonth(models.Model):
    name = models.CharField(max_length=50)
    order = models.PositiveIntegerField()

    class Meta:
        ordering = ["order"]

    def __str__(self):
        return self.name
    
class MonthlyPayment(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name="payments")
    month = models.ForeignKey(PaymentMonth, on_delete=models.CASCADE, related_name="payments_month")
    is_paid = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("student", "month")

    def __str__(self):
        return f"{self.student.name} - {self.month.name} - {'Paid' if self.is_paid else 'Not Paid'}"

class Quiz(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name="quizzes")
    month = models.ForeignKey(PaymentMonth, on_delete=models.CASCADE, related_name="quizzes_month")
    notes = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.student.name} - {self.month}"