# The Roof Workspace - Auth & Navigation Fix

## Implementation Guide

This package contains the consolidated auth system and navigation shell for The Roof workspace.

---

## Files Included

| File | Location | Purpose |
|------|----------|---------|
| `ProtectedRoute.tsx` | `src/components/auth/` | Single source of truth for route protection |
| `RoleGuard.tsx` | `src/components/auth/` | Role-based access control with loading states |
| `authStore.ts` | `src/stores/` | Improved Zustand auth store (no timeout hack) |
| `RoleSidebar07.tsx` | `src/components/layout/` | Role-based navigation sidebar |
| `DashboardLayout.tsx` | `src/components/layout/` | App shell (no duplicate init) |
| `App.tsx` | `src/` | Updated routing with consolidated auth |

---

## Installation Steps

### Step 1: Backup Current Files
```bash
# Create backup folder
mkdir -p src/_backup

# Backup existing files
cp src/App.tsx src/_backup/
cp src/stores/authStore.ts src/_backup/
cp src/components/auth/ProtectedRoute.tsx src/_backup/
cp src/components/auth/RoleGuard.tsx src/_backup/
cp src/components/layout/DashboardLayout.tsx src/_backup/
```

### Step 2: Replace Files
```bash
# Copy new files (from this package)
cp the-roof-auth-fix/App.tsx src/
cp the-roof-auth-fix/authStore.ts src/stores/
cp the-roof-auth-fix/ProtectedRoute.tsx src/components/auth/
cp the-roof-auth-fix/RoleGuard.tsx src/components/auth/
cp the-roof-auth-fix/DashboardLayout.tsx src/components/layout/
cp the-roof-auth-fix/RoleSidebar07.tsx src/components/layout/
```

### Step 3: Verify Imports
Make sure these imports exist in your project:
- `@/components/ui/sidebar` (SidebarProvider, etc.)
- `@/components/ui/dropdown-menu`
- `@/components/ui/avatar`
- `@/components/ui/badge`
- `lucide-react`

### Step 4: Test
```bash
npm run dev
```

Verify:
1. Login page loads at `/login`
2. After login, redirects to appropriate dashboard
3. Sidebar shows correct items for role
4. No blank screens during loading
5. Sign out works

---

## What Changed

### Auth Store (`authStore.ts`)

**Before:**
- 5-second timeout that could cause false logouts
- No error state tracking
- Duplicate fallback profile code

**After:**
- Proper async initialization (no timeout)
- `error` state for handling failures
- `clearError()` action
- Singleton pattern for auth listener
- Cleaner fallback profile helper

### ProtectedRoute (`ProtectedRoute.tsx`)

**Before:**
- Two competing implementations
- No profile loading state

**After:**
- Single source of truth
- Shows "Loading your profile..." when user exists but profile is fetching
- Proper loading UI with spinner

### RoleGuard (`RoleGuard.tsx`)

**Before:**
- Returns `null` when profile not loaded (blank screen!)

**After:**
- Shows loading spinner while profile loads
- Checks `initialized` state

### DashboardLayout (`DashboardLayout.tsx`)

**Before:**
- Called `initialize()` (duplicate of App.tsx)

**After:**
- Removed duplicate initialization
- Clean, simple layout wrapper

### App.tsx

**Before:**
- Inline `ProtectedRoute` function
- Called `initialize()` in useEffect

**After:**
- Uses imported `ProtectedRoute` component
- Cleaner route structure
- No duplicate code

---

## Navigation Structure

The sidebar now shows items based on user role:

### Staff sees:
- Dashboard
- My Tasks
- Daily Checklist
- Check In/Out
- My Shifts
- Announcements
- Resources
- Chat

### Manager sees (+ Staff items):
- Task Delegation
- Schedule Builder
- Checklist Templates
- Leave Approval
- Post Announcement
- Team Directory
- Attendance

### Owner sees (+ Manager items):
- Finance (Summary, P&L, Cash Flow)
- Org Chart
- Settings
- Roles & Permissions

---

## Missing Pages to Create

Based on the PRD, these pages need to be created:

| Page | Route | Priority |
|------|-------|----------|
| Check In/Out | `/check-in` | High |
| Daily Checklist | `/checklists` | High |
| Checklist Templates | `/manager/checklists` | High |
| Attendance View | `/manager/attendance` | Medium |

---

## Next Steps

1. **Apply these files** to your codebase
2. **Test the auth flow** (login, logout, role switching)
3. **Create the missing pages** (Check-in, Checklists)
4. **Add real data** to the sidebar badges (task counts, etc.)

---

## Troubleshooting

### Blank screen after login
- Check browser console for errors
- Verify `profiles` table has data for the user
- Check Supabase RLS policies

### Sidebar not showing
- Verify `SidebarProvider` is imported correctly
- Check that `@/components/ui/sidebar` exists

### Role-based items not filtering
- Check `profile.role` value in console
- Verify role is one of: `owner`, `manager`, `staff`

---

*Generated: February 4, 2026*
*Framework: Vibe-Coding AI v3.0*
