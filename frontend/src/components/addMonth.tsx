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
import { MonthContext } from "@/context/monthContext"

interface AddUserProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

const AddMonth: React.FC<AddUserProps> = ({ open, onOpenChange }) => {
    const [name, setName] = React.useState("");
    const [order, setOrder] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const [errors, setErrors] = React.useState({
        name: '',
        order: ''
    });
    const monthContext = React.useContext(MonthContext);
    if (!monthContext) throw new Error("Navbar لازم يكون جوا MonthProvider");
    const { setMonths } = monthContext;

    React.useEffect(() => {
        setName('');
        setOrder('');
        setErrors({
            name: '',
            order: ''
        });
    }, [])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        sendData();
    }

    const sendData = async () => {
        setLoading(true);
        try {
            const response = await api.post(`/months/`, { name: name, order: order });
            if (response.status === 201) {
                onOpenChange(false);
                toast.success("تم اضافة الشهر الدراسي بنجاح !");
                setMonths(response.data);
                setName('');
                setOrder('');
                setErrors({
                    name: '',
                    order: ''
                });
            }
        } catch (err: unknown) {
            const error = err as AxiosError<ValidationErrors>;
            setErrors({
                name: '',
                order: ''
            });
            if ((error.response?.status === 400 || error.status === 400) && error.response?.data) {
                if (error.response?.data && Object.keys(error.response.data).length) {
                    for (const [key, value] of Object.entries(error.response.data)) {
                        setErrors((prev) => ({
                            ...prev,
                            [key]: value[0],
                        }));
                    }
                }
                toast.error("لم يتم اضافة الشهر الدراسي بسبب خطاء في البيانات المدخلة !");
            } else {
                toast.error("حدث خطأ أثناء إضافة الصف الدراسي!");
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <LoadingLinear loading={loading} />
            <Sheet open={open} onOpenChange={onOpenChange}>
                <SheetContent dir="rtl" side="right" className="w-[400px] z-150">
                    <SheetHeader dir="ltr">
                        <SheetTitle>إضافة شهر دراسي</SheetTitle>
                        <SheetDescription>
                            ادخل بيانات الشهر الدراسي الجديد
                        </SheetDescription>
                    </SheetHeader>
                    <form onSubmit={handleSubmit} className="h-[100%] flex flex-col">
                        <div className="grid flex-1 auto-rows-min gap-6 px-4">
                            <div className="grid gap-3">
                                <Label htmlFor="sheet-demo-name">إسم الشهر</Label>
                                <Input
                                    id="sheet-demo-name"
                                    value={name}
                                    name="name"
                                    className={`pb-0 ${errors.name ? 'border border-red-500' : ''}`}
                                    required
                                    onChange={(e) => setName(e.target.value)}
                                />
                                {errors.name && <p className="p-0 text-xs text-red-500">{errors.name}</p>}
                            </div>
                            <div className="grid gap-3">
                                <Label htmlFor="sheet-demo-name">ترتيب الشهر</Label>
                                <Input
                                    id="sheet-demo-name"
                                    type="number"
                                    min={1}
                                    value={order}
                                    name="order"
                                    className={`pb-0 ${errors.order ? 'border border-red-500' : ''}`}
                                    required
                                    onChange={(e) => setOrder(e.target.value)}
                                />
                                {errors.order && <p className="p-0 text-xs text-red-500">{errors.order}</p>}
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

export default AddMonth
