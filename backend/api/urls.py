from django.urls import path
from .import views

urlpatterns = [
    path('grades/',views.GradeListCreateView.as_view() ,name='grade-list-create'), 
    path('grades/<int:pk>/',views.GradeRetrieveUpdateDestroyView.as_view() ,name='grade-edit-delete'),
    path('students/',views.StudentListCreateView.as_view() ,name='student-list-create'),
    path('students/all/delete/',views.StudentBulkDeleteView.as_view() ,name='student-delete-all'),
    path('students/<int:pk>/',views.StudentRetrieveUpdateDestroyView.as_view() ,name='student-edit-delete'),
    path('students/<int:pk>/all/',views.StudentListAllData.as_view() ,name='student-all-data'),
    path('students/search/<str:value>',views.StudentSearchView.as_view() ,name='search-student'),
    path('students/grades/<str:id>',views.StudentByGradeView.as_view() ,name='search-student'),
    path('daily-followups/',views.DailyFollowUpListCreateView.as_view() ,name='followup-list-create'),
    path('months/',views.PaymentMonthListCreateView.as_view() ,name='month-list-create'),
    path('payments/',views.MonthlyPaymentListCreateView.as_view() ,name='payment-list-create'),
    path('quizzes/',views.QuizListCreateView.as_view() ,name='quiz-list-create'),
    path("delete-all/", views.DeleteAllDataExceptGradesAndStudentsView.as_view(), name="delete-all"),
]