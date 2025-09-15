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
  Row,
  SortingState,
  useReactTable,
  VisibilityState,
  HeaderContext,
  CellContext
} from "@tanstack/react-table";
import { ArrowUpDown, ChevronDown, Edit, MoreHorizontal, Save, Trash2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { Student } from "@/lib/types";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import ConfirmDialog from "./confirmDialog";
import Link from "next/link";
import EditUser from "./editUser";

export function DataTableDemo({
  students = [],
  grade = false,
  checkbox = true,
  isEditable = false,
  deleteOne,
  deleteMore
}: {
  students: Student[],
  grade?: boolean,
  checkbox?: boolean,
  isEditable?: boolean,
  deleteOne?: (id: string | number) => void,
  deleteMore?: (ids: string[] | number[]) => void
}) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [editMode, setEditMode] = React.useState(false);

  const columns: ColumnDef<Student>[] = [
    ...(checkbox
      ? [
        {
          id: "select",
          header: ({ table }: HeaderContext<Student, unknown>) => (
            <Checkbox
              checked={
                table.getIsAllPageRowsSelected() ||
                (table.getIsSomePageRowsSelected() && "indeterminate")
              }
              onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
              aria-label="Select all"
              className="me-5"
            />
          ),
          cell: ({ row }: CellContext<Student, unknown>) => (
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={(value) => row.toggleSelected(!!value)}
              aria-label="Select row"
              className="me-5"
            />
          ),
          enableSorting: false,
          enableHiding: false,
        },
      ]
      : []),
    {
      accessorKey: "name",
      meta: { title: "إسم الطالب" },
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
            {row.getValue("name") ? <Link className="w-[250px] truncate pe-3 inline-flex hover:text-blue-600" href={`/profile/${row.original.id}`}>{row.getValue("name")}</Link> : "لا يوجد"}
          </TooltipTrigger>
          <TooltipContent>
            <p>{row.getValue("name") ?? "لا يوجد"}</p>
          </TooltipContent>
        </Tooltip>
      ),
    },
    ...(grade
      ? [
        {
          accessorFn: (row: Student) =>
            typeof row.grade === "object" && row.grade !== null
              ? row.grade.level
              : "لا يوجد",
          id: "grade_level",
          meta: { title: "الصف الدراسي" },
          header: "الصف الدراسي",
          cell: ({ row }: { row: Row<Student> }) => <div className="capitalize">{row.getValue('grade_level') as string}</div>,
        },
      ]
      : []),
    {
      accessorKey: "contact_phone",
      meta: { title: "رقم هاتف للمتابعة" },
      header: "رقم هاتف للمتابعة",
      cell: ({ row }) => <div className="capitalize">{row.getValue("contact_phone") ?? "لا يوجد"}</div>,
    },
    {
      accessorKey: "additional_phone",
      meta: { title: "رقم هاتف إضافي" },
      header: "رقم هاتف إضافي",
      cell: ({ row }) => <div className="capitalize">{row.getValue("additional_phone")?.toString().trim() || "لا يوجد"}</div>,
    },
    {
      accessorKey: "initial_level",
      meta: { title: "مستوي إبتدائي" },
      header: "مستوي إبتدائي",
      cell: ({ row }) => (
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="capitalize w-[200px] truncate">{row.getValue("initial_level")?.toString().trim() || "لا يوجد"}</div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{row.getValue("initial_level")?.toString().trim() || "لا يوجد"}</p>
          </TooltipContent>
        </Tooltip>
      )
    },
    {
      accessorKey: "notes",
      meta: { title: "ملاحظات" },
      header: "ملاحظات",
      cell: ({ row }) => (
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="capitalize w-[200px] truncate">{row.getValue("notes")?.toString().trim() || "لا يوجد"}</div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{row.getValue("notes")?.toString().trim() || "لا يوجد"}</p>
          </TooltipContent>
        </Tooltip>
      ),
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const student = row.original;
        return (
          <DropdownMenu dir="rtl">
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => deleteOne ? handleDeleteOneClick(student.id as string) : null}
                className="cursor-pointer"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                حذف
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                setOpenEditUser(true);
                setStudentId(student.id as string);
              }} className="cursor-pointer">
                <Edit className="mr-2 h-4 w-4" />
                تعديل
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 100,
  });

  const [studentsList, setStudentsList] = React.useState<Student[]>(students);

  const table = useReactTable({
    data: studentsList,
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

  const [openDialog, setOpenDialog] = React.useState(false);
  const [selectedItem, setSelectedItem] = React.useState('');
  const [selectedItems, setSelectedItems] = React.useState<string[]>([]);
  const [deleteOneActive, setDeleteOneActive] = React.useState(false);
  const [deleteMoreActive, setDeleteMoreActive] = React.useState(false);

  const handleDeleteOneClick = (id: string) => {
    setDeleteOneActive(true);
    setDeleteMoreActive(false);
    setSelectedItem(id);
    setOpenDialog(true)
  }

  const handleDeleteMoreClick = (ids: string[]) => {
    setDeleteOneActive(false);
    setDeleteMoreActive(true);
    setSelectedItems(ids);
    setOpenDialog(true)
  }

  // edit user
  const [openEditUser, setOpenEditUser] = React.useState(false);
  const [studentId, setStudentId] = React.useState("");

  return (
    <>
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
                    {column.columnDef.meta?.title ?? column.id}
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
                const ids = selectedRows.map((row) => row.original.id as string);
                handleDeleteMoreClick(ids);
              }}
            >
              <Trash2 className="w-4 h-4" />
              حذف المحدد
            </Button>
          )}

          {isEditable && (
            <Button
              variant="default"
              className="flex items-center gap-2"
              dir="rtl"
              onClick={() => {
                const ids = selectedRows.map((row) => row.original.id);
                console.log("edit selected:", ids);
                setEditMode(true);
              }}
            >
              <Edit className="w-4 h-4" />
              تعديل
            </Button>
          )}
          {editMode && (
            <Button
              variant="default"
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-600/90"
              dir="rtl"
              onClick={() => {
                const ids = selectedRows.map((row) => row.original.id);
                console.log("edit selected:", ids);
                setEditMode(false);
              }}
            >
              <Save className="w-4 h-4" />
              حفظ
            </Button>
          )}
          {editMode && (
            <Button
              variant="destructive"
              className="flex items-center gap-2"
              dir="rtl"
              onClick={() => {
                const ids = selectedRows.map((row) => row.original.id);
                console.log("edit selected:", ids);
                setEditMode(false);
              }}
            >
              <X className="w-4 h-4" />
              إلغاء
            </Button>
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
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
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
          <div dir="rtl" className="text-muted-foreground flex-1 text-sm text-end">
            {selectedRows.length} من {table.getFilteredRowModel().rows.length} صف محدد
          </div>
          {
            <div dir="ltr" className="text-muted-foreground flex-1 text-sm">
              صفحة {currentPage} من {totalPages}
            </div>
          }
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
      <ConfirmDialog
        dir="rtl"
        open={openDialog}
        onOpenChange={setOpenDialog}
        title="تأكيد الحذف"
        description={deleteOneActive ? `هل أنت متأكد من حذف هذا المستخدم ؟` : deleteMoreActive ? `هل أنت متأكد من حذف جميع المستخدمين المحددين ؟` : ''}
        confirmText="حذف"
        cancelText="إلغاء"
        onConfirm={() => {
          if (deleteOneActive && deleteOne && selectedItem) {
            deleteOne(selectedItem as string)
          }
          if (deleteMoreActive && deleteMore && selectedItems) {
            deleteMore(selectedItems as string[])
          }
        }}
      />

      <EditUser
        open={openEditUser}
        onOpenChange={setOpenEditUser}
        studentId={studentId}
        setStudentsList={setStudentsList}
      />
    </>
  );
}