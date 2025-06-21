"use client"
import { useParams, useRouter } from "next/navigation";
import { useBranch } from "@/contexts/branch-context";
import { useUser } from "@/contexts/user-context";
import { useEmployee } from "@/contexts/employee-context";
import { Header } from "@/components/header";
import { AddUserDialog } from "@/components/add-user-dialog";
import { useLanguage } from "@/contexts/language-context";
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, DollarSign, TrendingUp, Building2, ChevronDown, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const months = [
  "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
];

export default function BranchDetailsPage() {
  const { branchId } = useParams();
  const { branches, isLoading: branchesLoading } = useBranch();
  const { users, updateUser } = useUser();
  const { employees, getActiveEmployeesForPayroll } = useEmployee();
  const { t, language } = useLanguage();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const normalizedBranchId = typeof branchId === 'string' ? branchId : Array.isArray(branchId) ? branchId[0] : '';
  const [selectedBranchId, setSelectedBranchId] = useState(normalizedBranchId);
  // Only allow months for the current year
  const currentYear = new Date().getFullYear();
  const monthsThisYear = months.map((m, idx) => ({ label: m, value: String(idx) }));
  // Branch switcher options
  const branchOptions = branches.map(b => ({ label: b.name, value: b.id }));
  const router = useRouter();

  // If branchId changes via switcher, update selectedBranchId and push route
  const handleBranchChange = (id: string) => {
    setSelectedBranchId(id);
    window.location.href = `/branches/${id}`;
  };

  if (branchesLoading) {
    return (
      <div className="flex-1 flex flex-col min-h-screen items-center justify-center">
        <Header />
        <div className="flex flex-col items-center justify-center flex-1">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground mb-4" />
          <p className="text-lg text-muted-foreground mb-8">Loading branch data...</p>
        </div>
      </div>
    );
  }
  if (!normalizedBranchId) return <div className="p-8">Branch not found.</div>;
  const branch = branches.find(b => b.id === normalizedBranchId);
  const owners = users.filter(u => u.role === "owner" && u.branch_ids.includes(normalizedBranchId));
  const staff = employees.filter(emp => emp.branch_ids.includes(normalizedBranchId));
  const staffForMonth = getActiveEmployeesForPayroll(staff, selectedMonth + 1, selectedYear);

  // Calculate total salaries for the month
  const monthKey = `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}`;
  const totalSalaries = staffForMonth.reduce((sum, emp) => {
    const attendance = emp.attendance?.[normalizedBranchId]?.[monthKey] || {};
    const baseAttendedDays = Object.values(attendance).reduce((s, v) => s + (typeof v === 'number' ? v : 0), 0);
    const bonus = emp.bonus_days?.[normalizedBranchId]?.[monthKey] || 0;
    const penalty = emp.penalty_days?.[normalizedBranchId]?.[monthKey] || 0;
    const totalAdjustedDays = baseAttendedDays + bonus - penalty;
    const salary = (emp.base_salary / 30) * (totalAdjustedDays + (emp.allowed_absent_days || 0));
    return sum + salary;
  }, 0);
  const roundedTotalSalaries = Math.ceil(totalSalaries / 5) * 5;

  // Dummy revenue for the month
  const dummyRevenue = 100000 + (selectedMonth * 1000);
  const payrollRatio = dummyRevenue > 0 ? (totalSalaries / dummyRevenue) * 100 : 0;
  const avgSalary = staffForMonth.length > 0 ? totalSalaries / staffForMonth.length : 0;

  // For dropdown display
  const selectedBranchObj = branches.find(b => b.id === selectedBranchId);
  const selectedMonthLabel = monthsThisYear[selectedMonth]?.label || months[selectedMonth];

  // Owners not assigned to this branch
  const availableOwners = users.filter(u => u.role === "owner" && !u.branch_ids.includes(normalizedBranchId));
  // Assign owner to branch
  const handleAssignOwner = async (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    await updateUser(userId, { branch_ids: [...user.branch_ids, normalizedBranchId] });
  };

  if (!branch) return <div className="p-8">Branch not found.</div>;

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Header />
      <div className="flex-1 space-y-4 p-3 sm:p-4 md:p-8 pt-4 sm:pt-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={() => router.push('/branches')} className="mt-2 sm:mt-0">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">
                {branch.name}
              </h1>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="ml-1">
                    <Building2 className="h-5 w-5 text-muted-foreground" />
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  {branches.map((branch) => (
                    <DropdownMenuItem key={branch.id} onClick={() => handleBranchChange(branch.id)}>
                      {branch.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          {/* Filters Row */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2 justify-between w-full sm:w-auto">
                    <span>{selectedMonthLabel} {currentYear}</span>
                    <ChevronDown className="h-4 w-4 shrink-0" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {monthsThisYear.map((opt, idx) => (
                    <DropdownMenuItem
                      key={opt.value}
                      onClick={() => setSelectedMonth(Number(opt.value))}
                    >
                      {opt.label} {currentYear}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
        {/* Statistics Cards */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Staff Salaries</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{roundedTotalSalaries.toLocaleString(undefined, { maximumFractionDigits: 0 })} EGP</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Dummy Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dummyRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })} EGP</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Payroll/Revenue Ratio</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{payrollRatio.toFixed(1)}%</div>
            </CardContent>
          </Card>
          {/* Revenue per Owner card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue per Owner</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{owners.length > 0 ? (dummyRevenue / owners.length).toLocaleString(undefined, { maximumFractionDigits: 0 }) + ' EGP' : '-'}</div>
            </CardContent>
          </Card>
        </div>
        {/* Owners and Staff Lists at Bottom */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 mt-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                Owners <Badge variant="secondary">{owners.length}</Badge>
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {owners.length > 0 ? (
                <Table>
                  <TableBody>
                    {owners.map(o => (
                      <TableRow key={o.id}>
                        <TableCell className="font-medium">{o.first_name} {o.last_name}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <span className="text-muted-foreground text-sm">No owners assigned.</span>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                Staff <Badge variant="secondary">{staff.length}</Badge>
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {staff.length > 0 ? (
                <Table>
                  <TableBody>
                    {staff.map(s => (
                      <TableRow key={s.id}>
                        <TableCell className="font-medium">{s.first_name} {s.last_name}</TableCell>
                        <TableCell className="text-muted-foreground text-xs">{t(s.role)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <span className="text-muted-foreground text-sm">No staff assigned.</span>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 