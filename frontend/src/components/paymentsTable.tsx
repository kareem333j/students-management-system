"use client";

import * as React from "react";
import {
    ColumnDef,
    ColumnFiltersState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    SortingState,
    useReactTable,
    VisibilityState,
} from "@tanstack/react-table";
import {
    ArrowUpDown,
    ChevronDown,
    Edit,
    Save,
    X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import api from "@/lib/api";
import { Month, StudentPayments } from "@/lib/types";
import { LoadingLinear } from "./progress";
import { toast } from "sonner";
import Link from "next/link";

interface PaymentsTableProps {
    students: StudentPayments[];
    months?: Month[];
    isEditable?: boolean;
}

export function PaymentsTable({
    students = [],
    months = [],
    isEditable = false,
}: PaymentsTableProps) {
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = React.useState({});
    const [editMode, setEditMode] = React.useState(false);
    const [data, setData] = React.useState<StudentPayments[]>(students);
    const [originalData, setOriginalData] = React.useState<StudentPayments[]>(students);
    const [loadingSave, setLoadingSave] = React.useState(false);

    React.useEffect(() => {
        setData(students);
        setOriginalData(students);
    }, [students]);

    const isChanged = JSON.stringify(data) !== JSON.stringify(originalData);

    const handleSave = async () => {
        setLoadingSave(true);
        try {
            const res = await api.patch(`/payments/`, data);
            if (res.status === 200) {
                toast.success("تم حفظ التغييرات بنجاح !");
                setOriginalData(data);
                setEditMode(false);
            } else {
                toast.error("لقد حدث خطأ !");
            }
        } catch (err) {
            console.error("Save error:", err);
            toast.error("لقد حدث خطأ !");
        } finally {
            setLoadingSave(false);
        }
    };

    const columns = React.useMemo<ColumnDef<StudentPayments>[]>(() => [
        {
            accessorKey: "name",
            meta: { title: "اسم الطالب" },
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    إسم الطالب
                    <ArrowUpDown />
                </Button>
            ),
            cell: ({ row }) => (
                <Tooltip>
                    <TooltipTrigger asChild>
                        {row.getValue("name") ? <Link className="w-[250px] truncate pe-3 inline-flex hover:text-blue-600" href={`/profile/${row.original.id}`}>{row.getValue("name")}</Link>: "لا يوجد"}
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>{row.original.name ?? "لا يوجد"}</p>
                    </TooltipContent>
                </Tooltip>
            ),
        },
        ...months.map((month) => ({
            accessorKey: `month_${month.id}`,
            id: `month_${month.id}`,
            meta: { title: month.name },
            header: month.name,
            cell: ({ row }) => {
                const student = row.original;
                const payment = student.payments.find((p) => p.month_id === month.id);

                return (
                    <Checkbox
                        checked={payment?.is_paid ?? false}
                        disabled={!editMode}
                        onCheckedChange={(value) => {
                            setData((prev) =>
                                prev.map((s) =>
                                    s.id === student.id
                                        ? {
                                            ...s,
                                            payments: s.payments.map((p) =>
                                                p.month_id === month.id
                                                    ? { ...p, is_paid: !!value }
                                                    : p
                                            ),
                                        }
                                        : s
                                )
                            );
                        }}
                    />
                );
            },
        })) as ColumnDef<StudentPayments>[],
    ], [editMode, data]);

    const [pagination, setPagination] = React.useState({
        pageIndex: 0,
        pageSize: 100,
    });

    const table = useReactTable({
        data,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
            pagination,
        },
        onPaginationChange: setPagination,
    });

    const currentPage = table.getState().pagination.pageIndex + 1;
    const totalPages = table.getPageCount();

    return (
        <>
            <LoadingLinear loading={loadingSave} />
            <div className="w-full">
                <div className="flex items-center py-4 gap-2">
                    <Input
                        placeholder="ابحث عن طالب..."
                        value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
                        onChange={(event) =>
                            table.getColumn("name")?.setFilterValue(event.target.value)
                        }
                        className="max-w-sm"
                    />
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="ml-auto">
                                الأعمدة <ChevronDown />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                            {table
                                .getAllColumns()
                                .filter((column) => column.getCanHide())
                                .map((column) => (
                                    <DropdownMenuCheckboxItem
                                        key={column.id}
                                        className="capitalize"
                                        checked={column.getIsVisible()}
                                        onCheckedChange={(value) => column.toggleVisibility(!!value)}
                                    >
                                        {column.columnDef.meta?.title as string}
                                    </DropdownMenuCheckboxItem>
                                ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                    {isEditable && !editMode && data.length > 0 && (
                        <Button onClick={() => setEditMode(true)}>
                            <Edit className="w-4 h-4" /> تعديل
                        </Button>
                    )}
                    {editMode && (
                        <>
                            <Button
                                onClick={handleSave}
                                disabled={!isChanged}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                <Save className="w-4 h-4" /> حفظ
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={() => {
                                    setData(originalData);
                                    setEditMode(false);
                                }}
                            >
                                <X className="w-4 h-4" /> إلغاء
                            </Button>
                        </>
                    )}
                </div>
                <div className="overflow-hidden rounded-md border">
                    <Table dir="rtl">
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <TableHead key={header.id} className="text-start">
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {table.getRowModel().rows.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow
                                        key={row.id}
                                        data-state={row.getIsSelected() && "selected"}
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id}>
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="h-24 text-center">
                                        لايوجد نتائج.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
                <div className="flex items-center justify-end space-x-2 py-4 gap-2">
                    <div dir="ltr" className="text-muted-foreground flex-1 text-sm">
                        صفحة {currentPage} من {totalPages}
                    </div>
                    <div className="space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                        >
                            السابق
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                        >
                            التالي
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
}
