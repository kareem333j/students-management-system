"use client"

import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useContext, useEffect, useState } from "react"
import { Student, ValidationErrors } from "@/lib/types"
import api from "@/lib/api"
import { LoadingLinear } from "./progress"
import { AxiosError } from "axios"
import { toast } from "sonner"
import { GradesContext } from "@/context/gradeContext"

interface EditUserProps {
    open: boolean
    onOpenChange: (open: boolean) => void,
    studentId: string,
    setStudentsList: React.Dispatch<React.SetStateAction<Student[]>>
}

const EditUser: React.FC<EditUserProps> = ({ open, onOpenChange, studentId, setStudentsList }) => {
    const [loading, setLoading] = useState(false);
    const gradeContext = useContext(GradesContext);
    if (!gradeContext) throw new Error("Navbar لازم يكون جوا GradeProvider");
    const { grades } = gradeContext;
    const [currentData, setCurrentData] = useState<Student>({
        name: '',
        contact_phone: '',
        additional_phone: '',
        grade: '',
        initial_level: '',
        notes: ''
    });
    const [data, setData] = useState<Student>({
        name: '',
        contact_phone: '',
        additional_phone: '',
        grade: '',
        initial_level: '',
        notes: ''
    });

    const [errors, setErrors] = useState<Student>({
        name: '',
        contact_phone: '',
        additional_phone: '',
        grade: '',
        initial_level: '',
        notes: ''
    });

    useEffect(() => {
        resetInputs();
        resetErrors();
        getStudent();
    }, [studentId])

    const getStudent = async () => {
        try {
            const response = await api.get(`/students/${studentId}`);
            if (response.status === 200) {
                setData({
                    name: response.data.name || '',
                    contact_phone: response.data.contact_phone || '',
                    additional_phone: response.data.additional_phone || '',
                    grade: response.data.grade?.id?.toString() || '',
                    initial_level: response.data.initial_level || '',
                    notes: response.data.notes || ''
                });
                setCurrentData({
                    name: response.data.name || '',
                    contact_phone: response.data.contact_phone || '',
                    additional_phone: response.data.additional_phone || '',
                    grade: response.data.grade?.id?.toString() || '',
                    initial_level: response.data.initial_level || '',
                    notes: response.data.notes || ''
                });
            }
        } catch (err) {
            console.error(err);
        }
    };


    const handleFormChange = (name: keyof Student, value: string) => {
        setData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        sendData();
    };

    const resetErrors = () => {
        setErrors({
            name: '',
            contact_phone: '',
            additional_phone: '',
            grade: '',
            initial_level: '',
            notes: ''
        });
    }

    const resetInputs = () => {
        setData({
            name: '',
            contact_phone: '',
            additional_phone: '',
            grade: '',
            initial_level: '',
            notes: ''
        });
    }

    const sendData = async () => {
        setLoading(true);
        try {
            const response = await api.put(`/students/${studentId}/`, data);
            if (response.status === 201 || response.status === 200) {
                setStudentsList((prevStudents: Student[]) =>
                    prevStudents.map((student) =>
                        `${student.id}` === `${studentId}`
                            ? { ...student, ...response.data } // تحديث بيانات الطالب المحدد
                            : student
                    )
                );
                onOpenChange(false);
                toast.success("تم تحديث بيانات الطالب بنجاح !");
                resetErrors();
            }
        } catch (err: unknown) {
            const error = err as AxiosError<ValidationErrors>;
            resetErrors();
            if ((error.response?.status === 400 || error.status === 400) && error.response?.data) {
                if (error.response?.data && Object.keys(error.response.data).length) {
                    for (const [key, value] of Object.entries(error.response.data)) {
                        setErrors((prev) => ({
                            ...prev,
                            [key]: value[0],
                        }));
                    }
                }
                toast.error("لم يتم تحديث بيانات الطالب بسبب خطاء في البيانات المدخلة !");
            } else {
                toast.error("حدث خطأ أثناء تحديث بيانات الطالب!");
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <LoadingLinear loading={loading} />
            <Sheet open={open} onOpenChange={onOpenChange}>
                <SheetContent dir="rtl" side="right" className="w-[400px] z-150 overflow-y-scroll">
                    <SheetHeader dir="ltr">
                        <SheetTitle>تعديل بيانات طالب</SheetTitle>
                        <SheetDescription>
                            قم بتعديل بيانات الطاب {currentData.name}
                        </SheetDescription>
                    </SheetHeader>
                    <form onSubmit={handleSubmit} className="h-[100%] flex flex-col">
                        <div className="grid auto-rows-min gap-6 px-4">
                            <div className="grid gap-3">
                                <Label htmlFor="sheet-demo-name">الإسم</Label>
                                <Input
                                    id="sheet-demo-name"
                                    className={`pb-0 ${errors.name ? 'border border-red-500' : ''}`}
                                    required
                                    name="name"
                                    value={data.name}
                                    onChange={(e) => handleFormChange(e.target.name as keyof Student, e.target.value)}
                                />
                                {errors.name && <p className="p-0 text-xs text-red-500">{errors.name}</p>}
                            </div>
                            <div className="grid gap-3">
                                <Label htmlFor="sheet-demo-phone">رقم هاتف للمتابعة</Label>
                                <Input
                                    id="sheet-demo-phone"
                                    className={`pb-0 ${errors.contact_phone ? 'border border-red-500' : ''}`}
                                    required
                                    name="contact_phone"
                                    value={data.contact_phone}
                                    onChange={(e) => handleFormChange(e.target.name as keyof Student, e.target.value)}
                                />
                                {errors.contact_phone && <p className="p-0 text-xs text-red-500">{errors.contact_phone}</p>}
                            </div>
                            <div className="grid gap-3">
                                <Label htmlFor="sheet-demo-additional-phone">رقم هاتف إضافي</Label>
                                <Input
                                    id="sheet-demo-additional-phone"
                                    className={`pb-0 ${errors.additional_phone ? 'border border-red-500' : ''}`}
                                    name="additional_phone"
                                    value={data.additional_phone}
                                    onChange={(e) => handleFormChange(e.target.name as keyof Student, e.target.value)}
                                />
                                {errors.additional_phone && <p className="p-0 text-xs text-red-500">{errors.additional_phone}</p>}
                            </div>
                            <div className="grid gap-3">
                                <Label htmlFor="sheet-demo-gride">إختر الصف الدراسي</Label>
                                <Select
                                    dir="rtl"
                                    value={data.grade as string}
                                    onValueChange={(value) => handleFormChange("grade", value)}
                                >
                                    <SelectTrigger
                                        id="sheet-demo-gride"
                                        className={`pb-0 w-full max-w-full ${errors.grade ? 'border border-red-500' : ''}`}
                                    >
                                        <SelectValue placeholder="اختر الصف" />
                                    </SelectTrigger>
                                    <SelectContent className="z-[200]">
                                        {grades.map((grade) => (
                                            <SelectItem key={grade.id} value={grade.id.toString()}>
                                                {grade.level}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.grade && <p className="p-0 text-xs text-red-500">{errors.grade as string}</p>}

                            </div>
                            <div className="grid gap-3">
                                <Label htmlFor="sheet-demo-initial-level">مستوي مبدئي</Label>
                                <Textarea
                                    id="sheet-demo-initial-level"
                                    className={`pb-0 ${errors.initial_level ? 'border border-red-500' : ''}`}
                                    rows={4}
                                    placeholder="مستوي الطالب المبدئي"
                                    name="initial_level"
                                    value={data.initial_level}
                                    onChange={(e) => handleFormChange(e.target.name as keyof Student, e.target.value)}
                                />
                                {errors.initial_level && <p className="p-0 text-xs text-red-500">{errors.initial_level}</p>}
                            </div>
                            <div className="grid gap-3">
                                <Label htmlFor="sheet-demo-notes">ملاحظات</Label>
                                <Textarea
                                    id="sheet-demo-notes"
                                    className={`pb-0 ${errors.notes ? 'border border-red-500' : ''}`}
                                    rows={4}
                                    placeholder="ملاحظات عن الطالب"
                                    name="notes"
                                    value={data.notes}
                                    onChange={(e) => handleFormChange(e.target.name as keyof Student, e.target.value)}
                                />
                                {errors.notes && <p className="p-0 text-xs text-red-500">{errors.notes}</p>}
                            </div>
                        </div>
                        <SheetFooter>
                            <Button type="submit">حفظ</Button>
                            <SheetClose asChild>
                                <Button variant="outline">إلغاء</Button>
                            </SheetClose>
                        </SheetFooter>
                    </form>
                </SheetContent>
            </Sheet>
        </>
    )
}

export default EditUser
