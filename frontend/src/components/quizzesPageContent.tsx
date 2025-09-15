"use client";

import { useContext, useState } from "react";
import { SelectField } from "./select";
import { Badge } from "./ui/badge";
import { QuizzesTable } from "./quizzesTable";
import api from "@/lib/api";
import { toast } from "sonner";
import { GradesContext } from "@/context/gradeContext";
import { MonthContext } from "@/context/monthContext";
import { Quiz, StudentQuizzes } from "@/lib/types";

const QuizzesPageContent = () => {
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState<StudentQuizzes[]>([]);
  const [grade, setGrade] = useState<string | null>(null);

  const gradeContext = useContext(GradesContext);
  if (!gradeContext) throw new Error("Navbar لازم يكون جوا GradeProvider");
  const { grades } = gradeContext;

  const monthContext = useContext(MonthContext);
  if (!monthContext) throw new Error("Navbar لازم يكون جوا MonthProvider");
  const { months } = monthContext;

  const gradesFormatter = grades.map((grade) => ({
    name: grade.level,
    value: grade.id,
    key: grade.id,
  }));

  const getQuizzes = (gradeId: string) => {
    setLoading(true);
    api
      .get("/quizzes/", {
        params: {
          grade: gradeId,
        },
      })
      .then((res) => {
        const quizzes: Quiz[] = res.data;

        const grouped: Record<number, StudentQuizzes> = {};
        quizzes.forEach((quiz) => {
          if (!grouped[quiz.student_id]) {
            grouped[quiz.student_id] = {
              id: String(quiz.student_id),
              name: quiz.student,
              contact_phone: "",
              grade: gradeId,
              quizzes: [],
            } as StudentQuizzes;
          }
          grouped[quiz.student_id].quizzes.push(quiz);
        });

        setStudents(Object.values(grouped));
      })
      .catch(() => {
        toast.error("حصل خطأ أثناء تحميل الامتحانات");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleSelectGrade = (selectedGrade: string): void => {
    setGrade(selectedGrade);
    if (selectedGrade) {
      getQuizzes(selectedGrade);
    }
  };

  return (
    <>
      <div
        className="w-[100%] flex gap-2 mb-1 justify-between items-center"
        dir="rtl"
      >
        <div className="flex gap-2 mb-1">
          <SelectField
            onSelect={handleSelectGrade}
            data={gradesFormatter}
            placeholder="اختر الصف الدراسي"
          />
        </div>
        {students?.length ? (
          <Badge
            className="h-7 min-w-7 rounded-full px-1 font-bold tabular-nums text-sm"
            variant="destructive"
          >
            {students?.length}
          </Badge>
        ) : (
          ""
        )}
      </div>
      <div className="flex justify-center items-center w-[100%] bg-white border border-dark rounded-md px-4 py-4">
        {!grade ? (
          <p className="text-gray-500 text-sm">اختر صف لعرض بيانات الأمتحانات</p>
        ) : loading ? (
          <div className="w-[100%] flex justify-center items-center my-10">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <QuizzesTable students={students} months={months} isEditable={true} />
        )}
      </div>
    </>
  );
};

export default QuizzesPageContent;