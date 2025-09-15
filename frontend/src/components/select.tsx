import * as React from "react"

import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

type item = {
    value: string
    key: string | number
    name: string
}

export function SelectField({ data, placeholder, onSelect }: { data: item[], placeholder: string, onSelect: (value: string) => void }) {
    return (
        <div className="bg-white rounded-md">
            <Select
                dir="rtl"
                onValueChange={(value) => {
                    onSelect(value);
                }}
            >
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent dir="ltr">
                    <SelectGroup>
                        <SelectLabel>{placeholder}</SelectLabel>
                        {
                            data?.map((item) => (
                                <SelectItem key={item.key} value={item.value}>{item.name}</SelectItem>
                            ))
                        }
                    </SelectGroup>
                </SelectContent>
            </Select>
        </div>
    )
}
