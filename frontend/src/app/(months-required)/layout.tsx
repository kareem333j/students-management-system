"use client";

import { Container } from "@/components/container";
import Title from "@/components/title";
import { MonthContext } from "@/context/monthContext";
import api from "@/lib/api";
import Image from "next/image";
import { useContext, useEffect, useState } from "react";
import noDataImage from '../../../public/not-data.svg';
import { usePathname } from "next/navigation";

export default function Layout({ children }: { children: React.ReactNode }) {
    const monthContext = useContext(MonthContext);
    if (!monthContext) throw new Error("Navbar لازم يكون جوا GradeProvider");
    const [loading, setLoading] = useState(false);
    const { months, setMonths } = monthContext;
    const pathname = usePathname();
    useEffect(() => {
        getMonths();
    }, [pathname]);

    const getMonths = async () => {
        setLoading(true);
        try {
            const res = await api.get('/months/');
            if (res.status === 200) {
                setMonths(res.data);
            }
        } catch (err) {
            console.error("Error fetching months:", err);
        } finally {
            setLoading(false);
        }
    }

    if (loading) return <Container className='min-h-[70vh] flex justify-center items-center'>
        <div className="w-[100%] flex justify-center items-center my-30 flex-col gap-5">
            <div className="animate-spin rounded-full h-15 w-15 border-b-2 border-gray-900"></div>
            <p className='text-2xl' dir='rtl'>جاري التحميل</p>
        </div>
    </Container>
    if (months.length === 0) return <Container className='min-h-[70vh] flex justify-center items-center flex-col gap-1'>
        <Image src={noDataImage} alt="not-data" width={300} height={300} />
        <Title>
            لا يوجد اي شهر حتي الأن
        </Title>
        <p>يجب ان يكون لديك شهر واحد على الاقل</p>
    </Container>
    return <>{children}</>;
}