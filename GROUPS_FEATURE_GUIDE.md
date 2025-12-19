# User Groups Feature - Quick Reference

## Overview
The User Groups feature allows administrators to create, manage, and organize different types of groups within the college community.

## Group Types
- **ACADEMIC**: Department-related or course groups
- **CLUB**: Student clubs and organizations
- **EVENT**: Event-specific groups
- **CUSTOM**: Custom community groups

## Group Roles
- **OWNER**: Full control over the group (cannot be removed)
- **ADMIN**: Can manage members and settings
- **MODERATOR**: Can manage content and some member actions
- **MEMBER**: Basic member with view/participate permissions

## Features

### 1. Group Management
- **Create Groups**: `/dashboard/groups` → Click "Create Group" button
- **Edit Groups**: Only OWNER and ADMIN can edit group details
- **Delete Groups**: Only OWNER can delete (except ACADEMIC groups)
- **View Groups**: All authenticated users can view groups list

### 2. Member Management
- **Add Members**: OWNER/ADMIN can add members with specific roles
- **Update Roles**: OWNER/ADMIN can change member roles
- **Remove Members**: OWNER/ADMIN can remove members (except OWNER)
- **Join Groups**: Users can self-join open groups

### 3. Group Settings
- **Open Groups**: Anyone can join (optionally requires approval)
- **Closed Groups**: Only admins can add members
- **Requires Approval**: Join requests need admin approval
- **Allowed Post Roles**: Define which roles can post in the group

### 4. Filters & Search
- Filter by group type (ACADEMIC, CLUB, EVENT, CUSTOM)
- Filter by open/closed status
- Search by group name or description

## API Endpoints

### Groups
```
GET    /groups/                     - List all groups
GET    /groups/my-groups            - Get current user's groups
GET    /groups/{id}                 - Get group details with members
POST   /groups/                     - Create new group
PUT    /groups/{id}                 - Update group
DELETE /groups/{id}                 - Delete group (soft delete)
POST   /groups/{id}/join            - Join open group
```

### Members
```
GET    /groups/{id}/members         - List group members
POST   /groups/{id}/members         - Add member to group
PUT    /groups/{id}/members/{user_id} - Update member role
DELETE /groups/{id}/members/{user_id} - Remove member
```

## UI Pages

### Groups List (`/dashboard/groups`)
- Grid view of all groups
- Create, edit, delete actions
- Filters and search
- View group cards with key info

### Group Detail (`/dashboard/groups/[id]`)
- Group banner and information
- Full member list with roles
- Add/remove members
- Update member roles
- Role-based action visibility

## Permissions

### Create Group
- ADMIN: Can create any group type
- TEACHER: Can create ACADEMIC groups
- STUDENT: Can create CLUB, EVENT, CUSTOM groups

### Manage Group
- OWNER: Full control (edit, delete, manage members)
- ADMIN: Edit settings, manage members
- MODERATOR: Limited management
- MEMBER: View and participate only

### Delete Group
- Only OWNER can delete
- ACADEMIC groups cannot be deleted

## TypeScript Types

```typescript
interface Group {
  id: number;
  name: string;
  group_type: GroupType;
  description?: string;
  logo?: string;
  banner_url?: string;
  is_open: boolean;
  requires_approval: boolean;
  member_count?: number;
  my_role?: GroupRole;
  // ... more fields
}

interface MemberInfo {
  user_id: number;
  username: string;
  full_name: string;
  email?: string;
  role: GroupRole;
  joined_at: string;
  is_active: boolean;
}
```

## Usage Examples

### Creating a Group
1. Navigate to `/dashboard/groups`
2. Click "Create Group" button
3. Fill in group details:
   - Name (required)
   - Type (required)
   - Description
   - Logo and banner URLs
   - Open/closed settings
4. Click "Create Group"

### Adding Members
1. Navigate to group detail page
2. Click "Add Member" button
3. Search for user by username, name, or email
4. Select user from results
5. Choose member role
6. Click "Add Member"

### Managing Member Roles
1. Navigate to group detail page
2. Find member in the list
3. Click edit icon next to member
4. Select new role from dropdown
5. Click "Update Role"

## Best Practices

1. **Group Names**: Use clear, descriptive names
2. **Descriptions**: Provide helpful context about the group's purpose
3. **Open Groups**: Use for public communities
4. **Closed Groups**: Use for private or official groups
5. **Roles**: Assign appropriate roles based on responsibilities
6. **ACADEMIC Groups**: Should be managed by department admins

## Mobile Compatibility
- Responsive design works on all screen sizes
- Touch-friendly buttons and interactions
- Optimized modal dialogs for mobile

## Notes
- All groups are scoped to the college (multi-tenant support)
- Soft delete preserves group history
- Role hierarchy enforced by backend
- Real-time member count updates
