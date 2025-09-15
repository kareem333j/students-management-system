"use client";

import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

const Search = ({ className, style }: { className?: string, style?: React.CSSProperties }) => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [value, setValue] = useState(searchParams.get("search") || "");
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setValue(value);

        const params = new URLSearchParams(searchParams.toString())
        if (value) {
            params.set("search", value)
        } else {
            params.delete("search")
        }

        router.push(`/?${params.toString()}`)
    }
    return (
        <Input onChange={handleSearchChange} value={value} style={style} className={cn("w-full", className)} placeholder="ابحث عن طالب..." />
    )
}

export default Search