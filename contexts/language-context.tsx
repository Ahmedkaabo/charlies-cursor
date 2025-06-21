"use client"

import type React from "react"
import { createContext, useContext, useState } from "react"

type Language = "en" | "ar"

type LanguageContextType = {
  language: Language
  setLanguage: (language: Language) => void
  t: (key: string) => string
}

const translations = {
  en: {
    dashboard: "Dashboard",
    payroll: "Payroll",
    resources: "Resources",
    staff: "Staff",
    selectBranch: "Select Branch",
    selectMonth: "Select Month",
    resourceName: "Resource Name",
    employeeName: "Employee Name",
    role: "Role",
    attendance: "Attendance",
    totalDays: "Total Days",
    bonusPenalty: "Bonus/Penalty",
    finalSalary: "Final Salary",
    addResource: "Add Resource",
    addEmployee: "Add Employee",
    addManager: "Add Manager", // New translation
    firstName: "First Name",
    lastName: "Last Name",
    phone: "Phone",
    baseSalary: "Base Salary",
    waiter: "Waiter",
    barista: "Barista",
    helper: "Helper",
    manager: "Manager",
    present: "Present",
    absent: "Absent",
    halfDay: "Half Day",
    quarterDay: "Quarter Day",
    export: "Export Payroll",
    calculate: "Calculate Salaries",
    cancel: "Cancel",
    save: "Save",
    amount: "Amount",
    egp: "EGP",
    admin: "Admin",
    addBranch: "Add Branch",
    branchName: "Branch Name",
    branches: "Branches",
    pending: "Pending",
    approved: "Approved",
    approve: "Approve",
    firstNamePlaceholder: "Ahmed",
    lastNamePlaceholder: "Moustafa",
    phonePlaceholder: "01XXXXXXXXX",
    baseSalaryPlaceholder: "3000",
    pickADate: "Pick a date",
    users: "Users",
    addUser: "Add User",
    addUserDescription: "Add a new user to the system and assign login credentials.",
    email: "Email",
    password: "Password",
    editBranch: "Edit Branch",
    bulkAttendance: "Bulk Attendance", // New translation
    markPresent: "Mark Present", // New translation
    markAbsent: "Mark Absent", // New translation
    selectAll: "Select All", // New translation
    today: "Today", // New translation
    yesterday: "Yesterday", // New translation
    // Dashboard specific translations
    terminate: "Terminate",
    terminated: "Terminated",
    terminatedAt: "Terminated at ({month}/{year})",
    welcomeMessage: "Welcome to Charlie's Cafe Management System",
    totalEmployees: "Total Employees",
    monthlyPayroll: "Monthly Payroll",
    averageAttendance: "Average Attendance",
    activeBranches: "Active Branches",
    estimatedForCurrentMonth: "Estimated for current month",
    operationalLocations: "Operational locations",
    staffByRole: "Staff by Role",
    attendanceByRole: "Attendance by Role",
    attendanceAlerts: "Attendance Alerts",
    employeesBelow80: "Employees with attendance below 80%",
    allEmployeesGoodAttendance: "All employees have good attendance!",
    quickActions: "Quick Actions",
    commonTasksShortcuts: "Common tasks and shortcuts",
    markAttendanceAction: "Mark Attendance",
    bulkAttendanceManagement: "Bulk attendance management",
    addEmployeeAction: "Add Employee",
    registerNewStaff: "Register new staff member",
    generatePayroll: "Generate Payroll",
    calculateMonthlySalaries: "Calculate monthly salaries",
    manageBranches: "Manage Branches",
    addOrEditLocations: "Add or edit locations",
    days: "days",
    // Table and Dialog specific translations
    actions: "Actions",
    edit: "Edit",
    delete: "Delete",
    status: "Status",
    startDate: "Start Date",
    markAttendanceDescription:
      "Mark attendance for each day of the month. Click on any day to change attendance status.",
    fullDay: "Full Day",
    absentDay: "Absent",
    bonusDays: "Bonus Days",
    penaltyDays: "Penalty Days",
    baseAttendedDays: "Base Attended Days",
    absentDaysCount: "Absent Days",
    totalAdjustedDays: "Total Adjusted Days",
    bulkAttendanceTitle: "Bulk Attendance Management",
    bulkAttendanceDescription: "Select employees and mark their attendance for the selected date.",
    selectDate: "Select Date",
    employee: "Employee",
    currentStatus: "Current Status",
    employeesSelected: "employees selected",
    noEmployeesSelected: "No employees selected",
    close: "Close",
    editEmployeeTitle: "Edit Employee",
    editEmployeeDescription: "Make changes to employee details here.",
    addEmployeeDescription: "Add a new employee to the payroll system.",
    addManagerDescription: "Add a new manager to the system and assign login credentials.",
    addBranchDescription: "Add a new branch to the system.",
    editBranchDescription: "Make changes to branch details here.",
    staffByBranch: "Staff by Branch",
    employeeDistribution: "Employee distribution across branches",
    captin_order: "Captain Order",
    steward: "Steward",
    captinOrder: "Captain Order",
    selectRole: "Select Role",
    selectBranches: "Select Branches",
    allowedAbsentDays: "Allowed Absent Days",
  },
  ar: {
    dashboard: "لوحة التحكم",
    payroll: "كشف الرواتب",
    resources: "الموارد",
    staff: "الموظفون",
    selectBranch: "اختر الفرع",
    selectMonth: "اختر الشهر",
    resourceName: "اسم الموظف",
    employeeName: "اسم الموظف",
    role: "المنصب",
    attendance: "الحضور",
    totalDays: "إجمالي الأيام",
    bonusPenalty: "مكافأة/خصم",
    finalSalary: "الراتب النهائي",
    addResource: "إضافة موظف",
    addEmployee: "إضافة موظف",
    addManager: "إضافة مدير", // New translation
    firstName: "الاسم الأول",
    lastName: "اسم العائلة",
    phone: "رقم الهاتف",
    baseSalary: "الراتب الأساسي",
    waiter: "نادل",
    barista: "باريستا",
    helper: "مساعد",
    manager: "مدير",
    present: "حاضر",
    absent: "غائب",
    halfDay: "نصف يوم",
    quarterDay: "ربع يوم",
    export: "تصدير كشف الرواتب",
    calculate: "حساب الرواتب",
    cancel: "إلغاء",
    save: "حفظ",
    amount: "المبلغ",
    egp: "جنيه مصري",
    admin: "مسؤول",
    addBranch: "إضافة فرع",
    branchName: "اسم الفرع",
    branches: "الفروع",
    pending: "معلق",
    approved: "موافق عليه",
    approve: "موافقة",
    firstNamePlaceholder: "أحمد",
    lastNamePlaceholder: "مصطفى",
    phonePlaceholder: "01XXXXXXXXX",
    baseSalaryPlaceholder: "3000",
    pickADate: "اختر تاريخًا",
    users: "المستخدمون",
    addUser: "إضافة مستخدم",
    addUserDescription: "أضف مستخدمًا جديدًا إلى النظام وقم بتعيين بيانات اعتماد تسجيل الدخول.",
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    editBranch: "تعديل الفرع",
    bulkAttendance: "الحضور الجماعي", // New translation
    markPresent: "تسجيل حضور", // New translation
    markAbsent: "تسجيل غياب", // New translation
    selectAll: "تحديد الكل", // New translation
    today: "اليوم", // New translation
    yesterday: "أمس", // New translation
    // Dashboard specific translations
    terminate: "إنهاء الخدمة",
    terminated: "تم إنهاء الخدمة",
    terminatedAt: "تم إنهاء الخدمة في ({month}/{year})",
    welcomeMessage: "مرحبًا بك في نظام إدارة مقهى تشارليز",
    totalEmployees: "إجمالي الموظفين",
    monthlyPayroll: "كشف الرواتب الشهري",
    averageAttendance: "متوسط الحضور",
    activeBranches: "الفروع النشطة",
    estimatedForCurrentMonth: "تقديري للشهر الحالي",
    operationalLocations: "المواقع التشغيلية",
    staffByRole: "الموظفون حسب المنصب",
    attendanceByRole: "الحضور حسب المنصب",
    attendanceAlerts: "تنبيهات الحضور",
    employeesBelow80: "الموظفون الذين تقل نسبة حضورهم عن 80%",
    allEmployeesGoodAttendance: "جميع الموظفين لديهم حضور جيد!",
    quickActions: "إجراءات سريعة",
    commonTasksShortcuts: "المهام والاختصارات الشائعة",
    markAttendanceAction: "تسجيل الحضور",
    bulkAttendanceManagement: "إدارة الحضور الجماعي",
    addEmployeeAction: "إضافة موظف",
    registerNewStaff: "تسجيل موظف جديد",
    generatePayroll: "إنشاء كشف الرواتب",
    calculateMonthlySalaries: "حساب الرواتب الشهرية",
    manageBranches: "إدارة الفروع",
    addOrEditLocations: "إضافة أو تعديل المواقع",
    days: "أيام",
    // Table and Dialog specific translations
    actions: "الإجراءات",
    edit: "تعديل",
    delete: "حذف",
    status: "الحالة",
    startDate: "تاريخ البدء",
    markAttendanceDescription: "حدد حضور كل يوم من الشهر. انقر على أي يوم لتغيير حالة الحضور.",
    fullDay: "يوم كامل",
    absentDay: "غائب",
    bonusDays: "أيام المكافأة",
    penaltyDays: "أيام الجزاء",
    baseAttendedDays: "أيام الحضور الأساسية",
    absentDaysCount: "أيام الغياب",
    totalAdjustedDays: "إجمالي الأيام المعدلة",
    bulkAttendanceTitle: "إدارة الحضور الجماعي",
    bulkAttendanceDescription: "حدد الموظفين وسجل حضورهم للتاريخ المحدد.",
    selectDate: "تحديد التاريخ",
    employee: "الموظف",
    currentStatus: "الحالة الحالية",
    employeesSelected: "موظفين محددين",
    noEmployeesSelected: "لم يتم تحديد موظفين",
    close: "إغلاق",
    editEmployeeTitle: "تعديل بيانات الموظف",
    editEmployeeDescription: "قم بإجراء تغييرات على تفاصيل الموظف هنا.",
    addEmployeeDescription: "أضف موظفًا جديدًا إلى نظام كشوف المرتبات.",
    addManagerDescription: "أضف مديرًا جديدًا إلى النظام وقم بتعيين بيانات اعتماد تسجيل الدخول.",
    addBranchDescription: "أضف فرعًا جديدًا إلى النظام.",
    editBranchDescription: "قم بإجراء تغييرات على تفاصيل الفرع هنا.",
    staffByBranch: "الموظفون حسب الفرع",
    employeeDistribution: "توزيع الموظفين عبر الفروع",
    captin_order: "كابتن اوردر",
    steward: "إستيورد",
    captinOrder: "كابتن اوردر",
    selectRole: "اختر المنصب",
    selectBranches: "اختر الفروع",
    allowedAbsentDays: "أيام الغياب المسموح بها",
  },
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("en")

  const t = (key: string): string => {
    return translations[language][key as keyof (typeof translations)["en"]] || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      <div className={language === "ar" ? "rtl" : "ltr"} dir={language === "ar" ? "rtl" : "ltr"}>
        {children}
      </div>
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
