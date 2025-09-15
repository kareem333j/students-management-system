"use client";

import { useCallback, useEffect, useState } from "react";
import { DynamicTable } from "./studentTable";
import { ColumnDef } from "@tanstack/react-table";
import { Grade } from "@/lib/types";
import api from "@/lib/api";
import "dayjs/locale/ar";
import { formatDate } from "@/lib/utils";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Button } from "./ui/button";
import Image from "next/image";
import Logo from "../../public/logo.png";
dayjs.extend(relativeTime);
dayjs.locale("ar");


interface FollowupProfile {
  id: number;
  date: string;
  is_absent: boolean;
  degree: string | null;
  notes: string | null;
}

interface PaymentProfile {
  id: number;
  month: number;
  is_paid: boolean;
  created_at: string;
  updated_at: string;
}

interface QuizProfile {
  id: number;
  month_name: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface StudentProfile {
  id: number;
  name: string;
  contact_phone: string;
  additional_phone?: string;
  initial_level?: string;
  notes?: string;
  grade: Grade;
  followups: FollowupProfile[];
  payments: PaymentProfile[];
  quizzes: QuizProfile[];
  created_at: string;
}

const studentColumns: ColumnDef<StudentProfile>[] = [
  { accessorKey: "name", header: "الاسم" },
  {
    accessorKey: "grade",
    header: "الصف",
    cell: ({ row }) => row.original.grade?.level,
  },
  { accessorKey: "contact_phone", header: "الهاتف", cell: ({ row }) => row.original.contact_phone || "لا يوجد" },
  { accessorKey: "additional_phone", header: "هاتف إضافي", cell: ({ row }) => row.original.additional_phone || "لا يوجد" },
  { accessorKey: "initial_level", header: "المستوى المبدئي", cell: ({ row }) => row.original.initial_level || "لا يوجد" },
  { accessorKey: "notes", header: "ملاحظات", cell: ({ row }) => row.original.notes || "لا يوجد" },
];

const followupColumns: ColumnDef<FollowupProfile>[] = [
  { accessorKey: "date", header: "التاريخ" },
  { accessorKey: "degree", header: "الدرجة", cell: ({ row }) => row.original.degree || "0" },
  { accessorKey: "notes", header: "ملاحظات", cell: ({ row }) => row.original.notes || "لا يوجد" },
];

const paymentColumns: ColumnDef<PaymentProfile>[] = [
  { accessorKey: "month", header: "الشهر" },
  {
    accessorKey: "is_paid",
    header: "تم الدفع؟",
    cell: ({ row }) => (row.original.is_paid ? "✅" : "❌"),
  },
  { accessorKey: "updated_at", header: "تاريخ الدفع", cell: ({ row }) => row.original.is_paid ? formatDate(row.original.updated_at) : "لم يدفع" },
];

const quizColumns: ColumnDef<QuizProfile>[] = [
  { accessorKey: "month_name", header: "الشهر" },
  { accessorKey: "notes", header: "ملاحظات", cell: ({ row }) => row.original.notes || "لا يوجد" },
];

const Profile = ({ id }: { id: string }) => {
  const [loading, setLoading] = useState(false);
  const [student, setStudent] = useState<StudentProfile | null>(null);

  const getStudentAllData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/students/${id}/all/`);
      if (res.status === 200 || res.status === 201) {
        setStudent(res.data);
      }
    } catch (err) {
      console.error("Error fetching student data:", err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    getStudentAllData();
  }, [getStudentAllData]);

  if (loading) return <div>جاري التحميل...</div>;
  if (!student) return <div>لا يوجد بيانات.</div>;

  return (
    <div id="print-area" className="mt-10 space-y-5">
      <div id="print-logo" className="print-only-logo w-full text-center flex justify-center items-center mb-5">
        <Image src={Logo} width={200} height={200} alt="logo" priority unoptimized />
      </div>
      <div dir="rtl" className="sec">
        <h2 className="text-lg font-bold mb-2">بيانات الطالب</h2>
        <DynamicTable<StudentProfile> data={[student]} columns={studentColumns} />
      </div>

      <div dir="rtl" className="sec">
        <h2 className="text-lg font-bold mb-2">المتابعة اليومية</h2>
        <DynamicTable<FollowupProfile>
          data={[...student.followups,
            
          ]}
          columns={followupColumns}
        />
      </div>

      <div dir="rtl" className="sec">
        <h2 className="text-lg font-bold mb-2">الإمتحانات</h2>
        <DynamicTable<QuizProfile>
          data={student.quizzes || []}
          columns={quizColumns}
        />
      </div>

      <div dir="rtl" className="sec">
        <h2 className="text-lg font-bold mb-2">المدفوعات</h2>
        <DynamicTable<PaymentProfile>
          data={student.payments || []}
          columns={paymentColumns}
        />
      </div>

      <div id="signatures" dir="rtl" className="mt-2 space-y-6 print-only hidden">
        <p className="text-lg font-bold mb-3">توقيع الطالب : .................................................................................................</p>
        <p className="text-lg font-bold">توقيع ولي الأمر: ................................................................................................</p>
      </div>

      <Button onClick={() => window.print()} variant="default" className="w-full mb-15 no-print">طباعة</Button>
    </div>
  );
};

export default Profile;
