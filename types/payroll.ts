export interface Employee {
  id: string
  firstName: string
  lastName: string
  phone: string
  role: string // Staff role as plain text
  baseSalary: number
  attendance: Record<number, number> // day -> hours (0, 0.25, 0.5, 1)
  bonusDays: number // positive adjustments
  penaltyDays: number // negative adjustments
  month: number // Added for attendance calculation context
  year: number // Added for attendance calculation context
  startDate: string // New: YYYY-MM-DD format
  branchIds: string[] // New: Array of branch IDs the employee belongs to
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
