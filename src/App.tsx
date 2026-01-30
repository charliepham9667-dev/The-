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
// Admin pages
import { SyncData } from './pages/admin/SyncData';
// Shared pages
import { Chat } from './pages/Chat';
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
      <div className="flex h-screen items-center justify-center bg-[#0f1419]">
        <div className="text-slate-400">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <DashboardLayout />;
}

// Smart dashboard redirect based on role
function DashboardRedirect() {
  const profile = useAuthStore((s) => s.profile);
  
  if (profile?.role === 'staff') {
    return <StaffDashboard />;
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
        <Route path="my-shifts" element={<MyShifts />} />
        <Route path="profile" element={<Profile />} />
        
        {/* Chat - accessible by all */}
        <Route path="chat" element={<Chat />} />
      </Route>
    </Routes>
  );
}

