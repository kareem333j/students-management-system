"use client"
import { Grade } from "@/lib/types";
import { createContext, useState } from "react"

type MainContextType = {
  grades: Grade[];
  setGrades: React.Dispatch<React.SetStateAction<Grade[]>>;
};

export const GradesContext = createContext<MainContextType | undefined>(undefined);

const GradeProvider = ({ children }: { children: React.ReactNode }) => {
    const [grades, setGrades] = useState<Grade[]>([]);
    return (
        <GradesContext.Provider value={{ grades, setGrades }}>
            {children}
        </GradesContext.Provider>
    )
}

export default GradeProvider