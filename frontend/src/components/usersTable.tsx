"use client";

import { useState } from 'react';
import { DataTableDemo } from './table'
import { Student } from '@/lib/types'
import api from '@/lib/api';
import { toast } from 'sonner';
import { LoadingLinear } from './progress';

const UsersTable = ({ students = [], }: { students: Student[], }) => {
    const [loading, setLoading] = useState(false);
    const deleteUser = async (id: string | number) => {
        setLoading(true);
        try {
            const response = await api.delete(`/students/${id}/`);
            if(response.status === 204 || response.status === 200 || response.status === 201){ {
                toast.success("تم حذف الطالب بنجاح !");
                window.location.reload();
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
                window.location.reload();
            }
        }
        } catch {
            toast.error("لقد حدث خطاء");
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <LoadingLinear loading={loading} />
            <DataTableDemo
                students={students}
                deleteOne={deleteUser}
                deleteMore={deleteUsersGroup}
            />
        </>
    )
}

export default UsersTable