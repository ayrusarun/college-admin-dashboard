# Admin Role & Access Control Guide# Admin Role Restriction - Implementation Summary



## Overview## ✅ Changes Made

This document explains the role-based access control (RBAC) system in the college admin dashboard.

The dashboard has been updated to **only allow users with 'admin' role** to access it.

## Backend Roles (API)

### 1. Login Validation (`lib/auth/AuthContext.tsx`)

The backend supports 4 roles defined in `UserRole` enum:- After successful authentication, the system checks if `user.role === "admin"`

- If user is not an admin, the token is removed and an error is thrown

```python- Error message: "Access denied. Only administrators can access this dashboard."

class UserRole(enum.Enum):

    ADMIN = "admin"### 2. Protected Route Guard (`lib/auth/ProtectedRoute.tsx`)

    STAFF = "staff"- Added role check in the `useEffect` hook

    STUDENT = "student"- If user is authenticated but not an admin:

    TEACHER = "teacher"  - Shows "Access Denied" screen with shield icon

```  - Displays message: "This dashboard is restricted to administrators only"

  - Auto-redirects to login after 3 seconds

### Role Definitions  - Calls `logout()` to clear session



1. **ADMIN** - Full system access### 3. Login Page Updates (`app/login/page.tsx`)

   - Can access admin dashboard- Updated heading to show "Admin access only"

   - Can manage all users, departments, academic structures- Added warning banner: "⚠️ This dashboard is restricted to administrators"

   - Can view analytics and settings- Changed credential message to "Use your admin credentials"

   - No restrictions- Added note: "Only users with 'admin' role can access"



2. **STAFF** - Limited administrative access### 4. Header Badge (`components/layout/Header.tsx`)

   - Can access admin dashboard- Replaced role text with "Administrator" badge

   - Can manage users in their college- Blue badge styling to emphasize admin status

   - Can view posts, events, alerts

   - **Cannot access**: Departments, Analytics, Settings## 🔒 Security Flow



3. **TEACHER** - Academic role```

   - Has department and program assignments1. User enters credentials → Login

   - Can be assigned to classes as class teacher2. API returns JWT token

   - Uses the mobile/web app (not admin dashboard)3. System fetches user profile

   - Can create posts and manage class content4. Check: user.role === "admin"?

   ├─ YES → Allow access to dashboard

4. **STUDENT** - Basic user role   └─ NO  → Show "Access Denied" → Logout → Redirect to login

   - Has full academic hierarchy (department, program, cohort, class)```

   - Uses the mobile/web app (not admin dashboard)

   - Can view content, participate in groups## 🧪 Testing



## Frontend Dashboard AccessTo test the admin restriction:



### Who Can Login to Admin Dashboard?1. **Admin User** (should work):

   - Login with a user that has `role: "admin"`

Only **ADMIN** and **STAFF** roles can access `/dashboard`   - Should see dashboard successfully



This is enforced at two levels:2. **Non-Admin User** (should be blocked):

   - Login with a user that has `role: "student"`, `"staff"`, or `"teacher"`

1. **AuthContext** (`lib/auth/AuthContext.tsx`):   - Should see error: "Access denied. Only administrators can access this dashboard."

```typescript   - OR if already logged in, see "Access Denied" screen for 3 seconds

if (userData.role !== "admin" && userData.role !== "staff") {   - Then auto-logout and redirect to login

  throw new Error("Only administrators and staff can access this dashboard.");

}## 📝 API Response Expected

```

Your MyCampus API should return user data like:

2. **ProtectedRoute** (`lib/auth/ProtectedRoute.tsx`):

```typescript```json

if (user.role !== "admin" && user.role !== "staff") {{

  // Show access denied and logout  "id": 1,

}  "username": "admin_user",

```  "email": "admin@college.edu",

  "full_name": "Admin User",

### Navigation Filtering  "role": "admin",  // ← This must be "admin"

  "college_id": 1,

The sidebar automatically filters menu items based on user role using `navigation.ts`:  "college_name": "My College"

}

```typescript```

export const navigationConfig: NavigationItem[] = [

  {## ✨ User Experience

    name: "Dashboard",

    allowedRoles: ["admin", "staff"], // Both can see- **Login**: Clear warning that only admins can access

  },- **Access Denied**: Friendly error screen with auto-redirect

  {- **Dashboard**: Admin badge in header shows privileged status

    name: "Departments",- **Security**: No way to bypass - checked on both login and every protected route

    allowedRoles: ["admin"], // Admin only

  },---

  // ...

];All changes are live! The dashboard now strictly enforces admin-only access. 🔐

```

## User Creation Requirements

### Required Fields for ALL Roles

**ALL users** (admin, staff, teacher, student) **MUST have**:
- `username` - Unique identifier
- `email` - Valid email address
- `password` - Account password
- `full_name` - Display name
- `department_id` - **REQUIRED** - Department assignment
- `college_id` - Auto-assigned from current user

### Optional Academic Fields (Students & Teachers)

For students and teachers, additional academic fields are optional:
- `program_id` - Academic program (e.g., B.Tech CS)
- `cohort_id` - Batch/admission year group
- `class_id` - Class section
- `admission_year` - Year of admission (auto-populated from cohort)

### Staff & Admin Users

Staff and admin users:
- ✅ **MUST** select a department (administrative department)
- ❌ Do NOT need program, cohort, or class
- Used for administrative grouping and permissions

## User Creation Form Flow

### Creating a Staff User

1. Fill basic information:
   - Full Name: "Raju"
   - Username: "Raju"
   - Email: "surya1108er@gmail.com"
   - Password: (secure password)

2. Select Role: **Staff**

3. **Department Assignment** (Required):
   - Select administrative department (e.g., "Administration", "IT", "HR")

4. Click "Create User"

### Creating a Student User

1. Fill basic information (same as above)

2. Select Role: **Student**

3. **Department Assignment** (Required):
   - Select academic department

4. **Academic Information** (Optional):
   - Select Program (e.g., "B.Tech Computer Science")
   - Select Cohort (e.g., "Batch of 2025")
   - Select Class/Section (e.g., "Section A")

5. Click "Create User"

## Access Matrix

| Feature | Admin | Staff | Teacher | Student |
|---------|-------|-------|---------|---------|
| Login to Dashboard | ✅ | ✅ | ❌ | ❌ |
| View Dashboard Stats | ✅ | ✅ | ❌ | ❌ |
| Manage Users | ✅ | ✅ | ❌ | ❌ |
| Manage Departments | ✅ | ❌ | ❌ | ❌ |
| View Academic Structure | ✅ | ✅ | ❌ | ❌ |
| Manage Posts | ✅ | ✅ | ❌ | ❌ |
| Manage Events | ✅ | ✅ | ❌ | ❌ |
| Manage Groups | ✅ | ✅ | ❌ | ❌ |
| Manage Alerts | ✅ | ✅ | ❌ | ❌ |
| View Analytics | ✅ | ❌ | ❌ | ❌ |
| System Settings | ✅ | ❌ | ❌ | ❌ |

## Modifying Access Control

### To Allow/Restrict Features

Edit `lib/config/navigation.ts` and modify the `allowedRoles` array:

```typescript
{
  name: "Analytics",
  href: "/dashboard/analytics",
  icon: BarChart3,
  implemented: true,
  allowedRoles: ["admin"], // Change to ["admin", "staff"] to allow staff
},
```

### To Add Route Protection

Use `RoleGuard` component in pages that need role checking:

```typescript
import { RoleGuard } from "@/lib/auth/RoleGuard";

export default function AdminOnlyPage() {
  return (
    <>
      <RoleGuard />
      {/* Page content */}
    </>
  );
}
```

## Summary

✅ **Fixed Issues:**
- Department is now required for ALL roles (staff, admin, teacher, student)
- Staff users can now login and access the dashboard
- User creation form shows department selection for all roles
- Academic fields are optional and only shown for students/teachers

✅ **Backend Compatibility:**
- Backend has 4 roles: admin, staff, student, teacher
- All roles require department_id
- Frontend correctly sends all required fields

✅ **Access Control:**
- Admin: Full access to all features
- Staff: Limited access (no departments, analytics, settings)
- Teacher/Student: Cannot access admin dashboard
