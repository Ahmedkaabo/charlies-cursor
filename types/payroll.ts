export interface Employee {
  id: string
  first_name: string
  last_name: string
  phone: string
  role: string // Staff role as plain text
  base_salary: number
  attendance: Record<string, Record<number, number>>
  bonus_days: number // positive adjustments
  penalty_days: number // negative adjustments
  allowed_absent_days: number; // New: For salary calculation
  month: number // Added for attendance calculation context
  year: number // Added for attendance calculation context
  start_date: string // New: YYYY-MM-DD format
  branch_ids: string[] // New: Array of branch IDs the employee belongs to
  status: "pending" | "approved" // New: For admin approval workflow
  email?: string // New: Optional email for login
  password?: string // New: Optional password for login (for demo purposes, in real app this would be hashed)
}

export interface Branch {
  id: string
  name: string
  // Removed nameAr property
}

export interface PayrollData {
  employees: Employee[]
  month: number
  year: number
  branch: string
}
