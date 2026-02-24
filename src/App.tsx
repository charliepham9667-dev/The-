import { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { Login } from './pages/auth/Login';
// Owner pages
import { Dashboard } from './pages/owner/Dashboard';
import { Staffing } from './pages/owner/Staffing';
import { Alerts } from './pages/owner/Alerts';
import { WeeklyFocus } from './pages/owner/WeeklyFocus';
import { MyDashboard } from './pages/owner/MyDashboard';
import { WorkforceOverview } from './pages/owner/WorkforceOverview';
import { ManagerPerformance } from './pages/owner/ManagerPerformance';
import { TaskDelegation } from './pages/owner/TaskDelegation';
import { InvestorDashboard } from './pages/investor/InvestorDashboard';
import { TeamDirectory } from './pages/owner/TeamDirectory';
import { EmployeeProfile } from './pages/owner/EmployeeProfile';
import { Calendar } from './pages/owner/Calendar';
import { Resources } from './pages/owner/Resources';
// Finance pages
import { PLPerformance } from './pages/finance/PLPerformance';
import { ReportBuilder } from './pages/finance/ReportBuilder';
import { CategoryDrilldown } from './pages/finance/CategoryDrilldown';
import { CashFlow } from './pages/finance/CashFlow';
import { CostControl } from './pages/finance/CostControl';
import { Forecast } from './pages/finance/Forecast';
// Staff pages
import { StaffDashboard } from './pages/staff/StaffDashboard';
import { MyShifts } from './pages/staff/MyShifts';
import { Profile } from './pages/staff/Profile';
import { Tasks } from './pages/staff/Tasks';
import { Leave } from './pages/staff/Leave';
// Manager pages
import { ManagerDashboard, Reservations, LeaveApproval, Announcements } from './pages/manager';
// Admin pages
import { SyncData } from './pages/admin/SyncData';
// Common pages
import { Chat } from './pages/Chat';
import { AnnouncementsFeed, AnnouncementDetail } from './pages/common/AnnouncementsFeed';
import { MyDelegatedTasks } from './pages/common/MyDelegatedTasks';
import DesignSystemPage from './pages/DesignSystem';
import { useAuthStore } from './stores/authStore';
import { RoleGuard } from './components/auth/RoleGuard';

function ProtectedRoute() {
  const user = useAuthStore((s) => s.user);
  const initialized = useAuthStore((s) => s.initialized);
  const initialize = useAuthStore((s) => s.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  // Show loading while checking auth
  if (!initialized) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <DashboardLayout />;
}

// Smart dashboard redirect based on role (respects viewAs)
function DashboardRedirect() {
  const profile = useAuthStore((s) => s.profile);
  const viewAs = useAuthStore((s) => s.viewAs);
  
  const effectiveRole = viewAs?.role || profile?.role;
  
  if (effectiveRole === 'staff') {
    return <StaffDashboard />;
  }
  if (effectiveRole === 'manager') {
    return <ManagerDashboard />;
  }
  if (effectiveRole === 'investor') {
    return <InvestorDashboard />;
  }
  return <Dashboard />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<ProtectedRoute />}>
        {/* Smart Dashboard - shows role-appropriate view */}
        <Route index element={<DashboardRedirect />} />
        
        {/* Owner-only routes */}
        <Route path="my-dashboard" element={
          <RoleGuard allowedRoles={['owner']}>
            <MyDashboard />
          </RoleGuard>
        } />
        <Route path="weekly-focus" element={
          <RoleGuard allowedRoles={['owner']}>
            <WeeklyFocus />
          </RoleGuard>
        } />
        
        {/* Owner & Manager routes */}
        <Route path="alerts" element={
          <RoleGuard allowedRoles={['owner', 'manager']}>
            <Alerts />
          </RoleGuard>
        } />
        <Route path="ops/workforce" element={
          <RoleGuard allowedRoles={['owner', 'manager']}>
            <WorkforceOverview />
          </RoleGuard>
        } />
        <Route path="ops/staffing" element={
          <RoleGuard allowedRoles={['owner', 'manager']}>
            <Staffing />
          </RoleGuard>
        } />
        
        {/* Owner-only Finance routes */}
        <Route path="finance/pl" element={
          <RoleGuard allowedRoles={['owner']}>
            <PLPerformance />
          </RoleGuard>
        } />
        <Route path="finance/reports" element={
          <RoleGuard allowedRoles={['owner']}>
            <ReportBuilder />
          </RoleGuard>
        } />
        <Route path="finance/category" element={
          <RoleGuard allowedRoles={['owner']}>
            <CategoryDrilldown />
          </RoleGuard>
        } />
        <Route path="finance/cashflow" element={
          <RoleGuard allowedRoles={['owner']}>
            <CashFlow />
          </RoleGuard>
        } />
        <Route path="finance/costs" element={
          <RoleGuard allowedRoles={['owner']}>
            <CostControl />
          </RoleGuard>
        } />
        <Route path="finance/forecast" element={
          <RoleGuard allowedRoles={['owner']}>
            <Forecast />
          </RoleGuard>
        } />
        <Route path="ops/managers" element={
          <RoleGuard allowedRoles={['owner']}>
            <ManagerPerformance />
          </RoleGuard>
        } />
        
        {/* Admin routes (owner only) */}
        <Route path="admin/sync" element={
          <RoleGuard allowedRoles={['owner']}>
            <SyncData />
          </RoleGuard>
        } />
        
        {/* Staff routes (accessible by all) */}
        <Route path="staff/dashboard" element={<StaffDashboard />} />
        <Route path="my-shifts" element={<MyShifts />} />
        <Route path="profile" element={<Profile />} />
        <Route path="tasks" element={<Tasks />} />
        <Route path="my-tasks" element={<MyDelegatedTasks />} />
        <Route path="leave" element={<Leave />} />
        
        {/* Manager routes */}
        <Route path="manager/dashboard" element={
          <RoleGuard allowedRoles={['owner', 'manager']}>
            <ManagerDashboard />
          </RoleGuard>
        } />
        <Route path="manager/reservations" element={
          <RoleGuard allowedRoles={['owner', 'manager']}>
            <Reservations />
          </RoleGuard>
        } />
        <Route path="manager/reservations/new" element={
          <RoleGuard allowedRoles={['owner', 'manager']}>
            <Reservations />
          </RoleGuard>
        } />
        <Route path="manager/leave" element={
          <RoleGuard allowedRoles={['owner', 'manager']}>
            <LeaveApproval />
          </RoleGuard>
        } />
        <Route path="manager/announcements" element={
          <RoleGuard allowedRoles={['owner', 'manager']}>
            <Announcements />
          </RoleGuard>
        } />
        <Route path="manager/announcements/new" element={
          <RoleGuard allowedRoles={['owner', 'manager']}>
            <Announcements />
          </RoleGuard>
        } />
        
        {/* Owner-only routes */}
        <Route path="owner/tasks" element={
          <RoleGuard allowedRoles={['owner']}>
            <TaskDelegation />
          </RoleGuard>
        } />
        <Route path="owner/team" element={
          <RoleGuard allowedRoles={['owner']}>
            <TeamDirectory />
          </RoleGuard>
        } />
        <Route path="owner/team/:id" element={
          <RoleGuard allowedRoles={['owner', 'manager']}>
            <EmployeeProfile />
          </RoleGuard>
        } />
        <Route path="owner/calendar" element={
          <RoleGuard allowedRoles={['owner']}>
            <Calendar />
          </RoleGuard>
        } />
        <Route path="resources" element={<Resources />} />
        <Route path="owner/resources" element={
          <RoleGuard allowedRoles={['owner']}>
            <Resources />
          </RoleGuard>
        } />
        <Route path="investor/dashboard" element={
          <RoleGuard allowedRoles={['owner', 'investor']}>
            <InvestorDashboard />
          </RoleGuard>
        } />
        
        {/* Common routes - accessible by all */}
        <Route path="announcements" element={<AnnouncementsFeed />} />
        <Route path="announcements/:id" element={<AnnouncementDetail />} />
        <Route path="chat" element={<Chat />} />
        <Route path="design-system" element={<DesignSystemPage />} />
      </Route>
    </Routes>
  );
}
