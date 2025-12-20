# Role-Based Access Control (RBAC) Configuration

## Overview
The admin dashboard now supports role-based access control with a centralized configuration system. This allows you to control which navigation items are visible and accessible based on user roles.

## File Structure

```
lib/config/navigation.ts          # Navigation configuration
components/layout/Sidebar.tsx      # Updated to use role-based config
components/auth/RoleGuard.tsx      # Route protection component
```

## Supported Roles

- `admin` - Full access to all features
- `staff` - Limited access to operational features
- `student` - (Future use) Very limited access

## Configuration File

**Location:** `lib/config/navigation.ts`

### Adding/Modifying Menu Items

```typescript
{
  name: "Users",                    // Display name
  href: "/dashboard/users",         // Route path
  icon: Users,                      // Lucide icon
  implemented: true,                // Is this feature ready?
  allowedRoles: ["admin", "staff"], // Who can see this?
  description: "Manage users",      // Tooltip text
}
```

### Current Access Matrix

| Module        | Admin | Staff | Notes                    |
|--------------|-------|-------|--------------------------|
| Dashboard    | ✅    | ✅    | Overview for both        |
| Users        | ✅    | ✅    | Both can manage users    |
| Departments  | ✅    | ❌    | Admin only               |
| Academic     | ✅    | ✅    | Both can manage          |
| Posts        | ✅    | ✅    | Content management       |
| Events       | ✅    | ✅    | Event management         |
| Groups       | ✅    | ✅    | Group management         |
| Alerts       | ✅    | ✅    | Send notifications       |
| Analytics    | ✅    | ❌    | Admin only (future)      |
| Settings     | ✅    | ❌    | System settings (future) |

## How to Change Access Control

### 1. **Grant Staff Access to a Feature**

In `lib/config/navigation.ts`, add `"staff"` to `allowedRoles`:

```typescript
{
  name: "Settings",
  href: "/dashboard/settings",
  icon: Settings,
  implemented: false,
  allowedRoles: ["admin", "staff"], // ← Added staff
  description: "System settings",
}
```

### 2. **Restrict Feature to Admin Only**

Remove `"staff"` from `allowedRoles`:

```typescript
{
  name: "Analytics",
  href: "/dashboard/analytics",
  icon: BarChart3,
  implemented: false,
  allowedRoles: ["admin"], // ← Only admin
  description: "Reports and analytics",
}
```

### 3. **Add a New Menu Item**

Add to the `navigationConfig` array:

```typescript
{
  name: "Library",
  href: "/dashboard/library",
  icon: BookOpen,
  implemented: true,
  allowedRoles: ["admin", "staff"],
  description: "Library management",
}
```

## Route Protection (Optional)

To protect individual routes, wrap the page component with `RoleGuard`:

```typescript
// app/dashboard/departments/page.tsx
import { RoleGuard } from "@/components/auth/RoleGuard";

export default function DepartmentsPage() {
  return (
    <RoleGuard>
      <div>Departments Content</div>
    </RoleGuard>
  );
}
```

**Note:** The sidebar already filters items, so `RoleGuard` is mainly for additional security if someone tries to access the URL directly.

## Utility Functions

### `getNavigationForRole(role: string)`
Returns filtered navigation items for a specific role.

```typescript
import { getNavigationForRole } from "@/lib/config/navigation";

const adminNav = getNavigationForRole("admin");
const staffNav = getNavigationForRole("staff");
```

### `hasAccessToRoute(role: string, route: string)`
Check if a role has access to a specific route.

```typescript
import { hasAccessToRoute } from "@/lib/config/navigation";

if (hasAccessToRoute("staff", "/dashboard/settings")) {
  // Allow access
}
```

## Testing

### Test as Admin
1. Login as admin user
2. Sidebar should show all menu items (except unimplemented)

### Test as Staff
1. Login as staff user
2. Sidebar should hide: Departments, Analytics, Settings, Files, Rewards, Store
3. Attempting to access restricted URLs should redirect to dashboard

## Visual Indicators

The sidebar footer now shows the user's role:
- **Admin Access** - Red badge
- **Staff Access** - Blue badge

## Future Enhancements

- [ ] Add `student` role with limited dashboard
- [ ] Add permission-level granularity (read, write, delete)
- [ ] Add dynamic role assignment UI
- [ ] Add audit logging for access attempts
- [ ] Add role-based API endpoint protection

## Example Scenarios

### Scenario 1: New Feature for Admin Only
```typescript
{
  name: "System Logs",
  href: "/dashboard/system-logs",
  icon: FileText,
  implemented: true,
  allowedRoles: ["admin"], // Only admin
  description: "View system logs",
}
```

### Scenario 2: New Feature for Both
```typescript
{
  name: "Attendance",
  href: "/dashboard/attendance",
  icon: CheckSquare,
  implemented: true,
  allowedRoles: ["admin", "staff"], // Both
  description: "Track attendance",
}
```

### Scenario 3: Hide Feature Temporarily
```typescript
{
  name: "Beta Feature",
  href: "/dashboard/beta",
  icon: Sparkles,
  implemented: false, // Set to false to hide
  allowedRoles: ["admin"],
  description: "Coming soon",
}
```

## Troubleshooting

**Q: Sidebar item not showing for staff?**
A: Check that `"staff"` is in the `allowedRoles` array.

**Q: User can still access URL directly?**
A: Wrap the page component with `<RoleGuard>`.

**Q: Want to add a new role?**
A: Add it to the `UserRole` type in `navigation.ts` and update the config.

**Q: Changes not reflecting?**
A: Clear browser cache and restart dev server.

---

**Made with ❤️ for Yunite Admin Dashboard**
