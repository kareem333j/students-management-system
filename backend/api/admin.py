from django.contrib import admin
from .models import *

admin.site.register(Grade)
admin.site.register(Student)
admin.site.register(DailyFollowUp)  
admin.site.register(PaymentMonth)
admin.site.register(MonthlyPayment)
admin.site.register(Quiz)