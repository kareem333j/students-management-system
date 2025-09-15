"use client"

import {
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import { Items } from "@/lib/types"
import { Trash2 } from "lucide-react"
import Link from "next/link"
import ConfirmDialog from "./confirmDialog"
import { useState } from "react"

const MenuButton = ({ title, items, className, deleteAction }: { title: string; items: Items[], className?: string, deleteAction?: (id: string) => void }) => {
    const [openDialog, setOpenDialog] = useState(false)
    const [selectedItem, setSelectedItem] = useState<Items | null>(null)

    const handleDeleteClick = (item: Items) => {
        setSelectedItem(item)
        setOpenDialog(true)
    }
    return (
        <>
            <NavigationMenuItem className={className}>
                <NavigationMenuTrigger>{title}</NavigationMenuTrigger>
                <NavigationMenuContent dir="rtl" className="min-w-[200px] rounded-md bg-white shadow-md p-2">
                    <ul className="grid">
                        <li>
                            {items.map((item, index) => (
                                <NavigationMenuLink key={index} asChild className="p-0">
                                    {item?.link ? (
                                        <div className="flex w-[100%] p-0 m-0 flex-row items-center justify-between hover:bg-transparent">
                                            <Link
                                                href={item?.link}
                                                className="flex flex-row flex-1 items-center gap-2 rounded-md p-2 hover:bg-accent hover:text-accent-foreground"
                                            >
                                                {item?.icon}
                                                {item?.title}

                                            </Link>
                                            {deleteAction && (
                                                <Trash2
                                                    className="w-4 h-4 hover:text-destructive hover:cursor-pointer"
                                                    onClick={() => handleDeleteClick(item)}
                                                />
                                            )}
                                        </div>
                                    ) : (
                                        <button
                                            onClick={item?.action}
                                            className="flex w-[100%] flex-row items-center gap-2 rounded-md p-2 hover:bg-accent hover:text-accent-foreground"
                                        >
                                            {item?.icon}
                                            {item?.title}
                                        </button>
                                    )}
                                </NavigationMenuLink>
                            ))}
                        </li>
                    </ul>
                </NavigationMenuContent>
            </NavigationMenuItem>
            <ConfirmDialog
                dir="rtl"
                open={openDialog}
                onOpenChange={setOpenDialog}
                title="تأكيد الحذف"
                description={`هل أنت متأكد من حذف الصف ${selectedItem?.title}؟`}
                confirmText="حذف"
                cancelText="إلغاء"
                onConfirm={() => {
                    if (selectedItem && deleteAction) {
                        deleteAction(selectedItem.id as string)
                    }
                }}
            />
        </>

    )
}

export default MenuButton
