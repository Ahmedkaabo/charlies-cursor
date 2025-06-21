export type MonthKey = string // e.g., '2024-06'

export interface Employee {
  id: string
  first_name: string
  last_name: string
  phone: string
  role: string // Staff role as plain text
  base_salary: number
  attendance: Record<string, Record<MonthKey, Record<number, number>>> // branchId -> monthKey -> {day: value}
  bonus_days: Record<string, Record<MonthKey, number>> // branchId -> monthKey -> bonus
  penalty_days: Record<string, Record<MonthKey, number>> // branchId -> monthKey -> penalty
  allowed_absent_days: number; // For salary calculation
  start_date: string // YYYY-MM-DD format
  branch_ids: string[] // Array of branch IDs the employee belongs to
  status: "pending" | "approved"
  is_active?: boolean
  payroll_end_month?: number
  payroll_end_year?: number
  email?: string
  password?: string
}

export interface Branch {
  id: string
  name: string
  staffRoles?: Record<string, number> // e.g., { barista: 2, waiter: 3 }
  shifts?: Array<{ name: string; start: string; end: string }>
}

export interface PayrollData {
  employees: Employee[]
  month: number
  year: number
  branch: string
}
