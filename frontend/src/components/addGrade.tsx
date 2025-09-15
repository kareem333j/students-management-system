"use client"

import * as React from "react"
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
import { toast } from "sonner"
import { AxiosError } from "axios"
import { ValidationErrors } from "@/lib/types"
import api from "@/lib/api"
import { LoadingLinear } from "./progress"
import { GradesContext } from "@/context/gradeContext"

interface AddUserProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

const AddGrade: React.FC<AddUserProps> = ({ open, onOpenChange }) => {
    const [name, setName] = React.useState("");
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState("");
    const gradeContext = React.useContext(GradesContext);
    if (!gradeContext) throw new Error("Navbar لازم يكون جوا GradeProvider");
    const { setGrades } = gradeContext;

    React.useEffect(() => {
        setName('');
        setError('');
    }, [])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        sendData();
    }

    const sendData = async () => {
        setLoading(true);
        try {
            const response = await api.post(`/grades/`, { level: name });
            if (response.status === 201) {
                onOpenChange(false);
                toast.success("تم اضافة الصف الدراسي بنجاح !");
                getGrades();
                setName('');
                setError('');
            }
        } catch (err: unknown) {
            const error = err as AxiosError<ValidationErrors>;
            setError('');
            if ((error.response?.status === 400 || error.status === 400) && error.response?.data) {
                if (error.response?.data && Object.keys(error.response.data).length) {
                    setError(error.response.data.level[0]);
                    console.log(error.response.data.level[0]);
                }
                toast.error("لم يتم اضافة الصف الدراسي بسبب خطاء في البيانات المدخلة !");
            } else {
                toast.error("حدث خطأ أثناء إضافة الصف الدراسي!");
            }
        } finally {
            setLoading(false);
        }
    }

    const getGrades = async () => {
        try {
            const response = await api.get("/grades/");
            setGrades(response.data);
        } catch (err) {
            console.error("Error fetching grades:", err);
        }
    };

    return (
        <>
            <LoadingLinear loading={loading} />
            <Sheet open={open} onOpenChange={onOpenChange}>
                <SheetContent dir="rtl" side="right" className="w-[400px] z-150">
                    <SheetHeader dir="ltr">
                        <SheetTitle>إضافة صف دراسي</SheetTitle>
                        <SheetDescription>
                            ادخل بيانات الصف الدراسي الجديد
                        </SheetDescription>
                    </SheetHeader>
                    <form onSubmit={handleSubmit} className="h-[100%] flex flex-col">
                        <div className="grid flex-1 auto-rows-min gap-6 px-4">
                            <div className="grid gap-3">
                                <Label htmlFor="sheet-demo-name">إسم الصف</Label>
                                <Input
                                    id="sheet-demo-name"
                                    value={name}
                                    name="name"
                                    className={`pb-0 ${error ? 'border border-red-500' : ''}`}
                                    required
                                    onChange={(e) => setName(e.target.value)}
                                />
                                {error && <p className="p-0 text-xs text-red-500">{error}</p>}
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

export default AddGrade
