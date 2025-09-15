"use client";

import { useContext, useState } from "react";
import { SelectField } from "./select";
import { GradesContext } from "@/context/gradeContext";
import { Badge } from "./ui/badge";
import { StudentPayments } from "@/lib/types";
import { PaymentsTable } from "./paymentsTable";
import { MonthContext } from "@/context/monthContext";
import api from "@/lib/api";
import { toast } from "sonner";

const PaymentsPageContent = () => {
    const [loading, setLoading] = useState(false);
    const [payments, setPayments] = useState<StudentPayments[]>([]);
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


    const getPayments = (gradeId: string) => {
        setLoading(true);
        api.get("/payments/", {
            params: {
                grade: gradeId,
            },
        })
            .then((res) => {
                setPayments(res.data);
                console.log(res.data);
            })
            .catch(() => {
                toast.error("حصل خطأ أثناء تحميل الدفعات");
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const handleSelectGrade = (selectedGrade: string): void => {
        setGrade(selectedGrade);
        if (selectedGrade) {
            getPayments(selectedGrade);
        }
    };

    return (
        <>
            <div
                className="w-[100%] flex gap-1 mb-1 justify-between items-center"
                dir="rtl"
            >
                <div className="flex gap-1 mb-1">
                    <SelectField
                        onSelect={handleSelectGrade}
                        data={gradesFormatter}
                        placeholder="اختر الصف الدراسي"
                    />
                </div>
                {payments?.length ? (
                    <Badge
                        className="h-7 min-w-7 rounded-full px-1 font-bold tabular-nums text-sm"
                        variant="destructive"
                    >
                        {payments?.length}
                    </Badge>
                ) : (
                    ""
                )}
            </div>

            <div className="flex justify-center items-center w-[100%] bg-white border border-dark rounded-md px-4 py-4">
                {!loading ? (
                    payments?.length ? (
                        <PaymentsTable students={payments} isEditable={true} months={months} />
                    ) : (
                        <p className="text-gray-500 text-sm">اختر صف لعرض بيانات الدفع</p>
                    )
                ) : (
                    <div className="w-[100%] flex justify-center items-center my-10">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
                    </div>
                )}
            </div>
        </>
    );
};

export default PaymentsPageContent;
