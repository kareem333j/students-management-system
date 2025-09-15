import { RowData } from "@tanstack/react-table"

export interface Items {
  id?: string,
  title: string,
  icon?: React.ReactNode,
  link?: string,
  action?: () => void
}

export interface Student {
  id?: string,
  name: string,
  contact_phone: string,
  additional_phone?: string,
  grade?: null | string | Grade,
  initial_level?: string,
  notes?: string
}

export interface Payment {
  id: number;
  month_id: number;
  is_paid: boolean;
}

export interface Quiz {
  id: number;
  student_id: number; 
  student: string;  
  month_id: number;
  month_name: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface StudentPayments extends Student {
  payments: Payment[];
}

export interface StudentQuizzes extends Student {
  quizzes: Quiz[];
}

export interface StudentFollowUp {
  id: string;
  name: string;
  is_absent: boolean;
  degree: number | null;
  notes: string | null;
}

export interface Grade {
  id: string,
  level: string,
  description?: string,
}

export interface Month {
  id: number,
  name: string,
  order: string
}

declare module "@tanstack/react-table" {
  interface ColumnMeta<TData extends RowData, TValue> {
    title?: string
  }
}

export type ValidationErrors = Record<string, string[]>;