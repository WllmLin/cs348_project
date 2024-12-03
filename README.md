# CS348 Project Writeup - William Lin

[GitHub Repository](https://github.com/WllmLin/cs348_project)

## Database Schema

- **Users**: Stores user information (`user_id`, `name`, `email`, `phone_no`).
- **Teams**: Information on teams within the organization (`team_id`, `name`, `description`).
- **Tasks**: Tracks tasks (`task_id`, `title`, `description`, `status`, `due_date`, `assigned_to`, `oncall_team`, `completion_time`, `creation_time`).

### Indices:
- Date
- Status on Tasks

## Supported Queries:
- **Date**: Filter for overdue tasks (`date < current`, `status != completed`), filter for incomplete tasks before a certain date.
- **Status**: Filter for incomplete, pending, in-progress, and overdue tasks.

---

## Isolation Level: Read Committed

For a task management web app, **Read Committed isolation** is likely the best choice because:

- **Consistency**: It avoids dirty reads, ensuring that users always see committed, consistent data.
- **Performance**: It provides a good balance between consistency and performance.
- **Use Cases**: Your app may allow users to edit, assign, or update tasks, so you don’t want them to read data that is in the process of being modified (which could happen with Read Uncommitted).

---

## Lessons Learne
