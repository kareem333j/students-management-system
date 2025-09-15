import { Month } from "@/lib/types";
import { createContext, useState } from "react";

type MainContextType = {
    months: Month[];
    setMonths: React.Dispatch<React.SetStateAction<Month[]>>;
};

export const MonthContext = createContext<MainContextType | undefined>(undefined);

const MonthProvider = ({ children }: { children: React.ReactNode }) => {
    const [months, setMonths] = useState<Month[]>([]);
    return (
        <MonthContext.Provider value={{ months, setMonths }}>
            {children}
        </MonthContext.Provider>
    )
}

export default MonthProvider