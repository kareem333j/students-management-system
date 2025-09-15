"use client";

import { useEffect, useState } from "react";
import { Container } from "./container"
import { DataTableDemo } from "./table";
import Title from "./title";
import { Student } from "@/lib/types";
import api from "@/lib/api";
import { Badge } from "./ui/badge";
import { toast } from "sonner";

const SearchResult = ({ searchParams }: { searchParams?: string }) => {
    const searchValue = searchParams;
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!searchParams) return;
        getStudents();
    }, [searchParams]);

    const getStudents = async () => {
        setLoading(true);
        try {
            const response = await api.get(`http://127.0.0.1:8000/api/students/search/${searchParams}`);
            const data = await response.data;
            setStudents(data);
        } catch (err) {
            console.error("Error fetching students:", err);
        } finally {
            setLoading(false);
        }
    };

    const deleteUser = async (id: string | number) => {
        setLoading(true);
        try {
            const response = await api.delete(`/students/${id}/`);
            if(response.status === 204 || response.status === 200 || response.status === 201){ {
                toast.success("تم حذف الطالب بنجاح !");
                getStudents();
            }
        }
        } catch {
            toast.error("لقد حدث خطاء");
        } finally {
            setLoading(false);
        }
    }
    const deleteUsersGroup = async (ids: string[] | number[]) => {
        setLoading(true);
        try {
            const response = await api.delete(`/students/all/delete/`, { data: { ids } });
            if(response.status === 204 || response.status === 200 || response.status === 201){ {
                toast.success("تم حذف الطلاب المحددة بنجاح !");
                getStudents();
            }
        }
        } catch {
            toast.error("لقد حدث خطاء");
        } finally {
            setLoading(false);
        }
    }

    return (
        <Container className="p-0">
            <Title dir="rtl" className="w-[100%] mb-4 flex justify-between items-center">
                <div className="flex justify-center items-center">
                    نتيجة البحث عن
                    <span className="text-blue-700">{'"'}{searchValue}{'"'}</span>
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
            </Title>

            <div className='flex justify-center items-center w-[100%] bg-white border border-dark rounded-md px-4 py-4'>
                {
                    loading ?
                        <div className="w-[100%] flex justify-center items-center my-10">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
                        </div>
                        :
                        <DataTableDemo
                            students={students}
                            grade={true}
                            deleteOne={deleteUser}
                            deleteMore={deleteUsersGroup}
                        />
                }
            </div>

        </Container>
    )
}

export default SearchResult