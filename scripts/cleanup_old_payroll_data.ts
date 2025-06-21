import dotenv from 'dotenv'
import { supabase } from '../lib/supabase'
import { Employee } from '../types/payroll'

dotenv.config({ path: '.env.local' })
dotenv.config() // fallback to .env if .env.local is missing

console.log('Loaded environment variables:', Object.keys(process.env).filter(k => k.includes('SUPABASE') || k.includes('NEXT_PUBLIC')).reduce((acc: Record<string, string | undefined>, k) => { acc[k] = process.env[k]; return acc }, {} as Record<string, string | undefined>))

const CUTOFF_YEAR = 2025
const CUTOFF_MONTH = 6 // June

async function main() {
  console.log('Starting cleanup: Removing all employee data before June 2025...')

  // Fetch all employees
  const { data: employees, error } = await supabase
    .from('employees')
    .select('*')

  if (error) {
    console.error('Error fetching employees:', error)
    process.exit(1)
  }

  if (!employees) {
    console.log('No employees found.')
    process.exit(0)
  }

  let updatedCount = 0

  for (const emp of employees as Employee[]) {
    let changed = false
    // Clean attendance
    if (emp.attendance) {
      for (const branchId of Object.keys(emp.attendance)) {
        for (const monthKey of Object.keys(emp.attendance[branchId])) {
          const [year, month] = monthKey.split('-').map(Number)
          if (year < CUTOFF_YEAR || (year === CUTOFF_YEAR && month < CUTOFF_MONTH)) {
            delete emp.attendance[branchId][monthKey]
            changed = true
          }
        }
      }
    }
    // Clean bonus_days
    if (emp.bonus_days) {
      for (const branchId of Object.keys(emp.bonus_days)) {
        for (const monthKey of Object.keys(emp.bonus_days[branchId])) {
          const [year, month] = monthKey.split('-').map(Number)
          if (year < CUTOFF_YEAR || (year === CUTOFF_YEAR && month < CUTOFF_MONTH)) {
            delete emp.bonus_days[branchId][monthKey]
            changed = true
          }
        }
      }
    }
    // Clean penalty_days
    if (emp.penalty_days) {
      for (const branchId of Object.keys(emp.penalty_days)) {
        for (const monthKey of Object.keys(emp.penalty_days[branchId])) {
          const [year, month] = monthKey.split('-').map(Number)
          if (year < CUTOFF_YEAR || (year === CUTOFF_YEAR && month < CUTOFF_MONTH)) {
            delete emp.penalty_days[branchId][monthKey]
            changed = true
          }
        }
      }
    }
    if (changed) {
      // Update employee
      const { error: updateError } = await supabase
        .from('employees')
        .update({
          attendance: emp.attendance,
          bonus_days: emp.bonus_days,
          penalty_days: emp.penalty_days,
        })
        .eq('id', emp.id)
      if (updateError) {
        console.error(`Failed to update employee ${emp.id}:`, updateError)
      } else {
        updatedCount++
        console.log(`Cleaned data for employee ${emp.id}`)
      }
    }
  }

  console.log(`Cleanup complete. Updated ${updatedCount} employees.`)
  process.exit(0)
}

main() 