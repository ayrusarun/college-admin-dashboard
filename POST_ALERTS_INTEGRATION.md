# Post Alerts Integration Guide

This document describes how to integrate post alerts when the posts feature is implemented.

## Overview

Post alerts allow you to send notifications to specific users related to a post. This is useful for:
- Notifying users of replies to their posts
- Alerting users about important post updates
- Sending custom notifications related to post content

## API Endpoint

The post alert API is already implemented in `lib/api/client.ts`:

```typescript
createPostAlert: (
  postId: number,
  data: {
    user_id: number;
    title: string;
    message: string;
    alert_type?: string;
    expires_at?: string;
  }
) => apiClient.post(`/alerts/post-alerts/${postId}`, data)
```

## Integration Steps

### 1. Add Post Alert Button to Post Detail Page

When you create the post detail page (e.g., `app/dashboard/posts/[id]/page.tsx`), add a "Send Alert" button similar to what we did for groups:

```typescript
import { Bell } from "lucide-react";
import { alertApi } from "@/lib/api/client";
import { AlertType } from "@/lib/types";

// In your component:
const [showPostAlertModal, setShowPostAlertModal] = useState(false);
const [postAlertData, setPostAlertData] = useState({
  user_id: 0,
  title: "",
  message: "",
  alert_type: AlertType.GENERAL,
  expires_at: "",
});

const handleSendPostAlert = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    await alertApi.createPostAlert(postId, {
      user_id: postAlertData.user_id,
      title: postAlertData.title,
      message: postAlertData.message,
      alert_type: postAlertData.alert_type,
      expires_at: postAlertData.expires_at || undefined,
    });
    
    setShowPostAlertModal(false);
    alert("Post alert sent successfully!");
  } catch (error: any) {
    alert(`Failed to send alert: ${error.message}`);
  }
};
```

### 2. Add Alert Button to Post Detail UI

```tsx
<button
  onClick={() => setShowPostAlertModal(true)}
  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
>
  <Bell className="w-5 h-5" />
  Send Alert
</button>
```

### 3. Create Post Alert Modal

```tsx
<Modal
  isOpen={showPostAlertModal}
  onClose={() => setShowPostAlertModal(false)}
  title="Send Post Alert"
>
  <form onSubmit={handleSendPostAlert} className="space-y-4">
    <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-800">
      This alert will be linked to this post and sent to the specified user.
    </div>

    <div>
      <label className="block text-sm font-medium mb-1">User ID *</label>
      <input
        type="number"
        value={postAlertData.user_id || ""}
        onChange={(e) =>
          setPostAlertData({
            ...postAlertData,
            user_id: Number(e.target.value),
          })
        }
        required
        className="w-full px-3 py-2 border rounded-lg"
        placeholder="Enter user ID"
      />
    </div>

    <div>
      <label className="block text-sm font-medium mb-1">Title *</label>
      <input
        type="text"
        value={postAlertData.title}
        onChange={(e) =>
          setPostAlertData({ ...postAlertData, title: e.target.value })
        }
        required
        className="w-full px-3 py-2 border rounded-lg"
      />
    </div>

    <div>
      <label className="block text-sm font-medium mb-1">Message *</label>
      <textarea
        value={postAlertData.message}
        onChange={(e) =>
          setPostAlertData({ ...postAlertData, message: e.target.value })
        }
        required
        rows={4}
        className="w-full px-3 py-2 border rounded-lg"
      />
    </div>

    <div>
      <label className="block text-sm font-medium mb-1">Alert Type</label>
      <select
        value={postAlertData.alert_type}
        onChange={(e) =>
          setPostAlertData({
            ...postAlertData,
            alert_type: e.target.value as AlertType,
          })
        }
        className="w-full px-3 py-2 border rounded-lg"
      >
        {Object.values(AlertType).map((type) => (
          <option key={type} value={type}>
            {type.replace(/_/g, " ")}
          </option>
        ))}
      </select>
    </div>

    <div>
      <label className="block text-sm font-medium mb-1">
        Expiration Date (Optional)
      </label>
      <input
        type="datetime-local"
        value={postAlertData.expires_at}
        onChange={(e) =>
          setPostAlertData({ ...postAlertData, expires_at: e.target.value })
        }
        className="w-full px-3 py-2 border rounded-lg"
      />
    </div>

    <div className="flex gap-3 pt-4">
      <button
        type="button"
        onClick={() => setShowPostAlertModal(false)}
        className="flex-1 px-4 py-2 border rounded hover:bg-gray-50"
      >
        Cancel
      </button>
      <button
        type="submit"
        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Send Alert
      </button>
    </div>
  </form>
</Modal>
```

## Use Cases

### 1. Reply Notifications
When a user replies to a post, automatically send an alert to the post author:

```typescript
await alertApi.createPostAlert(postId, {
  user_id: postAuthorId,
  title: "New Reply to Your Post",
  message: `${replyAuthorName} replied to your post: "${postTitle}"`,
  alert_type: AlertType.GENERAL,
});
```

### 2. Post Update Notifications
When a post is edited or updated by moderators:

```typescript
await alertApi.createPostAlert(postId, {
  user_id: postAuthorId,
  title: "Your Post Was Updated",
  message: "Your post has been updated by a moderator.",
  alert_type: AlertType.SYSTEM_NOTIFICATION,
});
```

### 3. Featured Post Notifications
When a post is featured or highlighted:

```typescript
await alertApi.createPostAlert(postId, {
  user_id: postAuthorId,
  title: "Your Post Was Featured!",
  message: "Congratulations! Your post has been featured on the main feed.",
  alert_type: AlertType.ANNOUNCEMENT,
});
```

## User Search Enhancement

Consider adding a user search dropdown instead of manual user ID entry for better UX:

```typescript
// Add to your component state:
const [userSearchTerm, setUserSearchTerm] = useState("");
const [searchResults, setSearchResults] = useState<User[]>([]);

// Implement debounced search similar to groups page:
useEffect(() => {
  const timeoutId = setTimeout(() => {
    if (userSearchTerm.length >= 2) {
      searchUsers(userSearchTerm);
    } else {
      setSearchResults([]);
    }
  }, 300);

  return () => clearTimeout(timeoutId);
}, [userSearchTerm]);

const searchUsers = async (term: string) => {
  try {
    const response = await userApi.getUsers({ limit: 100 });
    const users = response.data || [];
    const filtered = users.filter(
      (user: User) =>
        user.username.toLowerCase().includes(term.toLowerCase()) ||
        user.full_name.toLowerCase().includes(term.toLowerCase())
    );
    setSearchResults(filtered.slice(0, 20));
  } catch (error) {
    console.error("Failed to search users:", error);
  }
};
```

## Backend Response

The API returns an `AlertResponse` object with these fields:

```typescript
{
  id: number;
  title: string;
  message: string;
  alert_type: AlertType;
  post_id: number;          // Linked to the post
  post_title?: string;      // Title of the linked post
  user_id: number;          // Recipient
  is_read: boolean;
  is_expired: boolean;
  created_at: string;
  creator_name: string;
  time_ago: string;
  // ... other fields
}
```

## Testing

When implementing, test these scenarios:

1. ✅ Send alert to valid user
2. ✅ Send alert with expiration date
3. ✅ Send alert without expiration
4. ✅ Try different alert types
5. ✅ Verify alert appears in user's alert list with `post_title` populated
6. ✅ Error handling for invalid user IDs
7. ✅ Error handling for invalid post IDs

## Notes

- Post alerts are user-specific (one recipient per alert)
- For broadcasting to multiple users about a post, loop through users and create individual alerts
- The `post_id` links the alert to the post, allowing navigation from alert to post
- Consider rate limiting to prevent alert spam
- Add permission checks to ensure only authorized users can send post alerts
