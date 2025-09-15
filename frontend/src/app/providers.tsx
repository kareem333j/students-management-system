// app/ClientProviders.tsx
"use client";

import GradeProvider from "@/context/gradeContext";
import MonthProvider from "@/context/monthContext";

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <GradeProvider>
            <MonthProvider>
                {children}
            </MonthProvider>
        </GradeProvider>
    );
}
