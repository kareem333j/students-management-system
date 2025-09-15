from rest_framework import serializers
from .models import *
from django.contrib.auth.models import User

class GradeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Grade
        fields = ['id', 'level', 'description']
        extra_kwargs = {
            'level': {
                'required': True,
                'error_messages': {
                    'required': 'لازم تكتب اسم الصف',
                    'blank': 'مينفعش تسيب اسم الصف فاضي',
                },
            },
        }
        
class StudentSerializer(serializers.ModelSerializer):
    # to show all data about grade in read only mode(**NOTE: you must use to represent function with it) and in create mode you can create with id only
    grade = serializers.PrimaryKeyRelatedField(
        queryset=Grade.objects.all(),
        error_messages={
            "required": "لازم تختار الصف الدراسي للطالب",
            "does_not_exist": "الصف الدراسي مش موجود",
            "incorrect_type": "لازم تختار الصف الدراسي برقم (ID) صحيح",
            "null": "لازم تختار الصف الدراسي للطالب",
            'blank': 'مينفعش تسيب الصف الدراسي للطالب فاضي'
        }
    )
    class Meta:
        model = Student
        fields = ['id', 'name', 'grade', 'contact_phone', 'additional_phone', 'initial_level', 'notes', 'created_at']
        extra_kwargs = {
            'name': {
                'required': True,
                'error_messages': {
                    'required': 'لازم تكتب اسم الطالب',
                    'blank': 'مينفعش تسيب اسم الطالب فاضي',
                },
            },
            'grade': {
                'required': True,
                'error_messages': {
                    'required': 'لازم تختار الصف الدراسي للطالب',
                    'blank': 'مينفعش تسيب الصف الدراسي للطالب فاضي',
                    'does_not_exist': 'الصف الدراسي مش موجود',
                    'incorrect_type': 'لازم تختار الصف الدراسي للطالب',
                    'invalid': 'لازم تختار الصف الدراسي للطالب',
                    'null': 'لازم تختار الصف الدراسي للطالب',
                },
            },
            'contact_phone': {
                'required': True,
                'error_messages': {
                    'required': 'لازم تكتب رقم هاتف للتواصل',
                    'blank': 'مينفعش تسيب رقم هاتف للتواصل فاضي',
                    'invalid': 'لازم تكتب رقم هاتف للتواصل صحيح',
                    "max_length": "رقم الهاتف لازم يكون 11 رقم بالظبط",
                    "min_length": "رقم الهاتف لازم يكون 11 رقم بالظبط",
                },
            }
        }
        
    def validate_contact_phone(self, value):
        if not value.isdigit() or len(value) != 11:
            raise serializers.ValidationError("رقم الهاتف لازم يكون مكون من 11 رقم")
        return value
    
    def validate_name(self, value):
        qs = Student.objects.filter(name=value)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError("فيه طالب بنفس الاسم مسجل قبل كده")
        return value
    
    def validate_grade(self, value):
        if not value.id:
            raise serializers.ValidationError("لازم تختار الصف الدراسي")
        return value
    
    def to_representation(self, instance):
        rep = super().to_representation(instance)
        rep['grade'] = GradeSerializer(instance.grade).data
        return rep
        
class DailyFollowUpSerializer(serializers.ModelSerializer):
    name = serializers.ReadOnlyField(source='student.name')
    class Meta:
        model = DailyFollowUp
        fields = ['id', 'name', 'date', 'is_absent', 'degree', 'notes', 'created_at', 'updated_at']
        

class PaymentMonthSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentMonth
        fields = ['id', 'name', 'order']
        extra_kwargs = {
            'name': {
                'required': True,
                'error_messages': {
                    'required': 'لازم تكتب اسم الشهر',
                    'blank': 'مينفعش تسيب اسم الشهر فاضي',
                },
            },
            'order': {
                'required': True,
                'error_messages': {
                    'required': 'لازم تكتب ترتيب الشهر في الجدول',
                    'blank': 'مينفعش تسيب ترتيب الشهر في الجدول فاضي فاضي',
                    'invalid': 'لازم تكتب رقم صحيح للترتيب'
                },
            },
        }
    
    def validate_order(self, value):
        if value <= 0:
            raise serializers.ValidationError("الترتيب لازم يكون رقم موجب أكبر من الصفر")
        return value
        
class MonthlyPaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = MonthlyPayment
        fields = ['id', 'student', 'month', 'is_paid', 'created_at', 'updated_at']
        

class QuizSerializer(serializers.ModelSerializer):
    student_id = serializers.ReadOnlyField(source='student.id')
    student = serializers.ReadOnlyField(source='student.name')
    month_id = serializers.ReadOnlyField(source='month.id')
    month_name = serializers.ReadOnlyField(source='month.name')

    class Meta:
        model = Quiz
        fields = ['id', 'student_id', 'student', 'month_id', 'month_name', 'notes', 'created_at', 'updated_at']
        
class CustomDailyFollowUpSerializer(DailyFollowUpSerializer):
    class Meta(DailyFollowUpSerializer.Meta):
        fields = ['id', 'date', 'is_absent', 'degree', 'notes', 'created_at', 'updated_at']
        
class CustomMonthlyPaymentSerializer(MonthlyPaymentSerializer):
    month = serializers.ReadOnlyField(source='month.name')
    class Meta(MonthlyPaymentSerializer.Meta):
        fields = ['id', 'month', 'is_paid', 'created_at', 'updated_at']
        
class CustomQuizSerializer(QuizSerializer):
    class Meta(QuizSerializer.Meta):
        fields = ['id', 'month_name', 'notes', 'created_at', 'updated_at']
        
class StudentFullSerializer(serializers.ModelSerializer):
    grade = GradeSerializer()
    followups = serializers.SerializerMethodField()
    payments = CustomMonthlyPaymentSerializer(many=True, read_only=True)
    quizzes = CustomQuizSerializer(many=True, read_only=True)
    class Meta:
        model = Student
        fields = "__all__"
        
    def get_followups(self, obj):
        qs = DailyFollowUp.objects.filter(student=obj, is_absent=True)
        return CustomDailyFollowUpSerializer(qs, many=True).data