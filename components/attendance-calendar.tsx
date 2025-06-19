"use client"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/contexts/language-context"

interface AttendanceCalendarProps {
  month: number
  year: number
  attendance: Record<number, number>
  onChange: (day: number, value: number) => void
  startDate: string // New prop
}

export function AttendanceCalendar({ month, year, attendance, onChange, startDate }: AttendanceCalendarProps) {
  const { t } = useLanguage()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const employeeStartDate = new Date(startDate)

  const getDayClasses = (value: number, isWeekend: boolean, isBeforeStartDate: boolean) => {
    let baseClasses = ""
    let hoverClasses = ""
    let borderClasses = ""

    if (isBeforeStartDate) {
      baseClasses = "bg-gray-200 text-gray-400 cursor-not-allowed"
      hoverClasses = ""
      borderClasses = "border-gray-300"
    } else if (value === 1) {
      // Present (checked)
      baseClasses = "bg-green-100 text-green-800"
      hoverClasses = "hover:bg-green-200"
      borderClasses = "border-green-200"
    } else {
      // Absent (unchecked)
      baseClasses = "bg-gray-100 text-gray-800"
      hoverClasses = "hover:bg-gray-200"
      borderClasses = "border-gray-200"
      if (isWeekend) {
        // Apply specific weekend background only if absent
        baseClasses = "bg-gray-50 dark:bg-gray-800 text-gray-800" // Lighter gray for absent weekends
      }
    }
    return `${baseClasses} ${hoverClasses} ${borderClasses}`
  }

  const getAttendanceSymbol = (value: number) => {
    switch (value) {
      case 1:
        return "✓"
      default: // 0 for absent
        return "✗"
    }
  }

  const isWeekend = (day: number) => {
    const date = new Date(year, month, day)
    return date.getDay() === 5 || date.getDay() === 6 // Friday and Saturday
  }

  const handleDayClick = (day: number, isBeforeStartDate: boolean) => {
    if (isBeforeStartDate) return // Do nothing if before start date

    const currentValue = attendance[day] || 0
    const newValue = currentValue === 1 ? 0 : 1 // Toggle between 1 (present) and 0 (absent)
    onChange(day, newValue)
  }

  return (
    <div className="space-y-4">
      {/* Month/Year header */}
      <div className="text-center">
        <h3 className="text-lg font-semibold">
          {new Date(year, month).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </h3>
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-2 p-4 border rounded-lg bg-background">
        {/* Days header */}
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, index) => (
          <div key={index} className="text-sm font-medium text-center p-2 text-muted-foreground">
            {day}
          </div>
        ))}

        {/* Empty cells for days before month starts */}
        {Array.from({ length: new Date(year, month, 1).getDay() }, (_, i) => (
          <div key={`empty-${i}`} className="h-12" />
        ))}

        {/* Calendar days */}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1
          const value = attendance[day] || 0
          const weekend = isWeekend(day)
          const currentDate = new Date(year, month, day)
          const isBeforeStartDate = currentDate < employeeStartDate

          return (
            <Button
              key={day}
              variant="outline"
              size="sm"
              className={`h-12 w-full p-1 text-sm ${getDayClasses(value, weekend, isBeforeStartDate)} hover:scale-105 transition-transform`}
              onClick={() => handleDayClick(day, isBeforeStartDate)}
              disabled={isBeforeStartDate} // Disable button
            >
              <div className="flex flex-col items-center justify-center h-full">
                <span className="text-xs font-medium pt-1">{day}</span>
                <span className="text-lg">{getAttendanceSymbol(value)}</span>
              </div>
            </Button>
          )
        })}
      </div>
    </div>
  )
}
