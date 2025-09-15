"use client";

import { useContext, useEffect, useState } from 'react'
import { Calendar22 } from './calender'
import { SelectField } from './select';
import { GradesContext } from '@/context/gradeContext';
import api from '@/lib/api';
import { StudentFollowUp } from '@/lib/types';
import { DailyFollowUpTable } from './dailyFollowUpTable';
import { Badge } from './ui/badge';

const DailyFollowUpContent = ({ isToday }: { isToday?: boolean }) => {
    const [grade, setGrade] = useState<string | null>(null);
    const [students, setStudents] = useState<StudentFollowUp[]>([]);
    const [loading, setLoading] = useState(false);
    const gradeContext = useContext(GradesContext);
    if (!gradeContext) throw new Error("Navbar لازم يكون جوا GradeProvider");
    const { grades } = gradeContext;
    const gradesFormatter = grades.map((grade) => ({ name: grade.level, value: grade.id, key: grade.id }));
    const [date, setDate] = useState<Date | undefined>(undefined);
    const today = new Date()

    useEffect(() => {
        if (isToday) {
            setDate(today);
        }
    }, [isToday]);


    // 
    const getFollowUps = (gradeId?: string | null, selectedDate?: Date) => {
        if (!gradeId || !selectedDate) return;
        setLoading(true);

        api.get("/daily-followups/", {
            params: {
                grade: gradeId,
                date: selectedDate.toLocaleDateString("en-CA"),
            },
        })
            .then((res) => {
                setStudents(res.data);
            })
            .catch((err) => {
                console.error("Error fetching followups:", err);
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const handleSelect = (selectedDate: Date | undefined) => {
        setDate(selectedDate);
        if (selectedDate && grade) {
            getFollowUps(grade, selectedDate);
        }
    };

    const handleSelectGrade = (selectedGrade: string): void => {
        setGrade(selectedGrade);
        if (selectedGrade && date) {
            getFollowUps(selectedGrade, date);
        }
    };

    useEffect(() => {
        if (grade && date) {
            getFollowUps(grade, date);
        }
    }, [grade, date]);




    return (
        <>
            <div className='w-[100%] flex gap-1 mb-1 justify-between items-center' dir='rtl'>
                <div className='flex gap-1 mb-1'>
                    <SelectField
                        onSelect={handleSelectGrade}
                        data={gradesFormatter}
                        placeholder="اختر الصف الدراسي"
                    />
                    <Calendar22
                        date={date}
                        onSelect={handleSelect}
                    />
                </div>
                {
                    students?.length ? (
                        <Badge
                            className="h-7 min-w-7 rounded-full px-1 font-bold tabular-nums text-sm"
                            variant="destructive"
                        >
                            {students?.length}
                        </Badge>
                    ) : ''
                }
            </div>
            <div className='flex justify-center items-center w-[100%] bg-white border border-dark rounded-md px-4 py-4'>

                {
                    !loading ? <DailyFollowUpTable
                        students={students}
                        checkbox={false}
                        isEditable={true}
                    />
                        :
                        <div className="w-[100%] flex justify-center items-center my-10">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
                        </div>
                }
            </div>
        </>
    )
}

export default DailyFollowUpContent;