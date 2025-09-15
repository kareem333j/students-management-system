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
import { Month, StudentQuizzes } from "@/lib/types";
import { LoadingLinear } from "./progress";
import { toast } from "sonner";
import { Textarea } from "./ui/textarea";
import Link from "next/link";

const NotesCell = React.memo(
    ({
        studentIndex,
        monthId,
        initialValue,
        disabled,
        onNotesChange,
    }: {
        studentIndex: number;
        monthId: number;
        initialValue: string | null;
        disabled: boolean;
        onNotesChange: (studentIndex: number, monthId: number, value: string | null) => void;
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
            onNotesChange(studentIndex, monthId, newValue);
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

interface QuizzesTableProps {
    students: StudentQuizzes[];
    months?: Month[];
    isEditable?: boolean;
}

export function QuizzesTable({
    students = [],
    months = [],
    isEditable = false,
}: QuizzesTableProps) {
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = React.useState({});
    const [editMode, setEditMode] = React.useState(false);
    const [data, setData] = React.useState<StudentQuizzes[]>(students);
    const [originalData, setOriginalData] = React.useState<StudentQuizzes[]>(students);
    const [loadingSave, setLoadingSave] = React.useState(false);

    React.useEffect(() => {
        const deepClonedStudents = JSON.parse(JSON.stringify(students));
        setData(deepClonedStudents);
        setOriginalData(deepClonedStudents);
    }, [students]);

    const isChanged = JSON.stringify(data) !== JSON.stringify(originalData);

    const handleSave = async () => {
        setLoadingSave(true);
        try {
            const allQuizzes = data.flatMap((s) =>
                s.quizzes.map((q) => ({
                    id: q.id,
                    notes: q.notes,
                }))
            );
            const res = await api.patch(`/quizzes/`, allQuizzes);
            if (res.status === 200) {
                toast.success("تم حفظ التغييرات بنجاح !");
                setOriginalData(JSON.parse(JSON.stringify(data)));
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

    const handleNotesChange = (studentIndex: number, monthId: number, value: string | null) => {
        setData((prev) =>
            prev.map((student, idx) =>
                idx === studentIndex
                    ? {
                          ...student,
                          quizzes: student.quizzes.map((q) =>
                              q.month_id === monthId ? { ...q, notes: value } : q
                          ),
                      }
                    : student
            )
        );
    };

    const columns = React.useMemo<ColumnDef<StudentQuizzes>[]>(() => [
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
                const quiz = row.original.quizzes.find((q) => q.month_id === month.id);
                return (
                    <NotesCell
                        studentIndex={row.index}
                        monthId={month.id}
                        initialValue={quiz?.notes ?? null}
                        disabled={!editMode}
                        onNotesChange={handleNotesChange}
                    />
                );
            },
        })) as ColumnDef<StudentQuizzes>[],
    ], [editMode, months]);

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
                                    setData(JSON.parse(JSON.stringify(originalData)));
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