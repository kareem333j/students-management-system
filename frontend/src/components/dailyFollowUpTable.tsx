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
    Trash2,
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
import { Textarea } from "./ui/textarea";
import api from "@/lib/api";
import { StudentFollowUp } from "@/lib/types";
import { LoadingLinear } from "./progress";
import { toast } from "sonner";
import Link from "next/link";

const DegreeCell = React.memo(
    ({
        rowId,
        initialValue,
        disabled,
        onChange,
    }: {
        rowId: string;
        initialValue: number | null;
        disabled: boolean;
        onChange: (rowId: string, value: number | null) => void;
    }) => {
        const [value, setValue] = React.useState<string | number | null>(
            initialValue ?? ""
        );

        React.useEffect(() => {
            setValue(initialValue ?? "");
        }, [initialValue]);

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const newValue = e.target.value ? Number(e.target.value) : null;
            setValue(e.target.value);
            onChange(rowId, newValue);
        };

        return (
            <Tooltip>
                <TooltipTrigger asChild>
                    <Input
                        type="number"
                        value={value ?? ""}
                        disabled={disabled}
                        className="w-[100px]"
                        onChange={handleChange}
                    />
                </TooltipTrigger>
                <TooltipContent>
                    <p>{value ? value : 0}</p>
                </TooltipContent>
            </Tooltip>
        );
    }
);
DegreeCell.displayName = "DegreeCell";

const NotesCell = React.memo(
    ({
        rowId,
        initialValue,
        disabled,
        onChange,
    }: {
        rowId: string;
        initialValue: string | null;
        disabled: boolean;
        onChange: (rowId: string, value: string | null) => void;
    }) => {
        const [value, setValue] = React.useState<string | null>(
            initialValue ?? ""
        );

        React.useEffect(() => {
            setValue(initialValue ?? "");
        }, [initialValue]);

        const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
            const newValue = e.target.value || null;
            setValue(e.target.value);
            onChange(rowId, newValue);
        };

        return (
            <Tooltip>
                <TooltipTrigger asChild>
                    <Textarea
                        rows={3}
                        value={value ?? ""}
                        disabled={disabled}
                        onChange={handleChange}
                    />
                </TooltipTrigger>
                <TooltipContent>
                    <p>{value?.length ? value : "لا يوجد"}</p>
                </TooltipContent>
            </Tooltip>
        );
    }
);
NotesCell.displayName = "NotesCell";

interface DailyFollowUpTableProps {
    students: StudentFollowUp[];
    checkbox?: boolean;
    isEditable?: boolean;
}

export function DailyFollowUpTable({
    students = [],
    isEditable = false,
}: DailyFollowUpTableProps) {
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = React.useState({});
    const [editMode, setEditMode] = React.useState(false);
    const [data, setData] = React.useState<StudentFollowUp[]>(students);
    const [originalData, setOriginalData] = React.useState<StudentFollowUp[]>(students);
    const [loadingSave, setLoadingSave] = React.useState(false);

    React.useEffect(() => {
        setData(students);
        setOriginalData(students);
    }, [students]);

    const isChanged = JSON.stringify(data) !== JSON.stringify(originalData);

    const handleChange = React.useCallback(
        <K extends keyof StudentFollowUp>(rowId: string, field: K, value: StudentFollowUp[K]) => {
            setData((prev) =>
                prev.map((row) =>
                    row.id === rowId ? { ...row, [field]: value } : row
                )
            );
        },
        []
    );

    const handleSave = async () => {
        setLoadingSave(true);
        try {
            const changedRows = data.filter(
                (row, i) => JSON.stringify(row) !== JSON.stringify(originalData[i])
            );
            if (changedRows.length === 0) return;

            const res =await api.patch(`/daily-followups/`, changedRows);
            setOriginalData(data);
            setEditMode(false);
            if (res.status === 200 || res.status === 201) {
                toast.success("تم حفظ التغييرات بنجاح !");
            } else{
                toast.error("لقد حدث خطأ لم يتم حفظ التعديلات !");
            }
        } catch (err) {
            console.error("Save error:", err);
            toast.error("لقد حدث خطأ لم يتم حفظ التعديلات !");
        } finally {
            setLoadingSave(false);
        }
    };

    const columns = React.useMemo<ColumnDef<StudentFollowUp>[]>(
        () => [
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
            {
                accessorKey: "is_absent",
                meta: { title: "الغياب" },
                header: "الغياب",
                cell: ({ row }) => (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Checkbox
                                checked={!!row.original.is_absent}
                                disabled={!editMode}
                                onCheckedChange={(val) =>
                                    handleChange(row.original.id, "is_absent", val as boolean)
                                }
                            />
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{row.original.is_absent ? "حضر" : "غاب"}</p>
                        </TooltipContent>
                    </Tooltip>
                ),
            },
            {
                accessorKey: "degree",
                meta: { title: "الدرجة" },
                header: "الدرجة",
                cell: ({ row }) => (
                    <DegreeCell
                        rowId={row.original.id}
                        initialValue={row.original.degree}
                        disabled={!editMode}
                        onChange={(rowId, value) => handleChange(rowId, "degree", value)}
                    />
                ),
            },
            {
                accessorKey: "notes",
                meta: { title: "ملاحظات" },
                header: "ملاحظات",
                cell: ({ row }) => (
                    <NotesCell
                        rowId={row.original.id}
                        initialValue={row.original.notes}
                        disabled={!editMode}
                        onChange={(rowId, value) => handleChange(rowId, "notes", value)}
                    />
                ),
            },
        ],
        [editMode, handleChange]
    );

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

    const selectedRows = table.getFilteredSelectedRowModel().rows;
    const hasSelected = selectedRows.length > 0;
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
                    {hasSelected && (
                        <Button
                            variant="destructive"
                            className="flex items-center gap-2"
                            dir="rtl"
                            onClick={() => {
                                const ids = selectedRows.map((row) => row.original.id);
                                console.log("Delete selected:", ids);
                                // ضيف API call هنا
                            }}
                        >
                            <Trash2 className="w-4 h-4" />
                            حذف المحدد
                        </Button>
                    )}
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