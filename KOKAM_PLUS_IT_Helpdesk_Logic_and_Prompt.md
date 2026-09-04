# Ticket Management Logic – IT Guy & User Workflow

Build the ticket workflow with different interfaces and permissions for regular users and IT Guys.

## 1. User Roles

There are two main roles:

### Regular User / Requester

The employee who creates and submits a support ticket.

### IT Guy / Technician

The employee who receives, manages, and resolves support tickets.

The sidebar and available features must be different depending on the user's role.

---

# 2. Regular User Sidebar

A regular user must NOT have a `Tickets` section in the sidebar.

The regular user's sidebar should contain:

* Dashboard
* Mes demandes
* Historique
* Other normal sections

The regular user creates a support request from the request/ticket creation interface.

After submitting the request, it is sent to the assigned IT Guy.

---

# 3. IT Guy Sidebar

The IT Guy must have a different sidebar.

The IT Guy is the ONLY role that has the `Tickets` section.

Example:

* Dashboard
* Tickets
* Mes demandes
* Historique
* Other normal sections

The `Tickets` menu must never be displayed to regular users.

IMPORTANT:

Do not only hide the menu on the frontend.

The Django REST API must also enforce role-based permissions so that a regular user cannot access IT ticket endpoints manually.

---

# 4. Ticket Creation

When a regular user creates a ticket, the ticket contains:

* Ticket ID
* Titre
* Catégorie
* Service
* Utilisateur concerné
* Bureau
* Description
* Priorité
* Date de création
* Demandeur
* Assigned IT Guy / Technician
* Statut

The Service field is read-only when appropriate.

The user selects the person concerned by the problem.

If the selected user belongs to a specific bureau, the bureau should automatically be retrieved from that user's profile.

After the ticket is submitted:

1. The ticket is stored in the database.
2. The ticket is assigned to the appropriate IT Guy.
3. The ticket appears in the assigned IT Guy's `Tickets`.
4. The ticket appears in the requester's `Mes demandes`.
5. The ticket must not appear in any other user's requests.

---

# 5. IT Guy – Tickets Page

When the IT Guy clicks `Tickets` in the sidebar, display all active tickets assigned to that IT Guy.

The IT Guy should see a list containing information such as:

* Ticket ID
* Titre
* Catégorie
* Demandeur
* Service
* Bureau
* Priorité
* Date
* Statut

The IT Guy must only see tickets assigned to them.

Example:

```text
Tickets

#1024   Computer Problem     High      New
#1025   Network Problem      Medium    In Progress
#1026   Printer Problem      Low       New
```

---

# 6. IT Guy – Ticket Details

When the IT Guy clicks on a ticket, open the complete ticket details page.

Display all ticket information:

* Ticket ID
* Titre
* Catégorie
* Service
* Utilisateur concerné
* Bureau
* Demandeur
* Description
* Priorité
* Created date
* Assigned IT Guy
* Current Status
* Any additional ticket information

At the top of the page, provide a status control/button.

Example:

```text
Status: [ In Progress ▼ ]
```

The IT Guy can update the status according to the allowed workflow.

---

# 7. Status Synchronization

The ticket status must be shared between the requester and the IT Guy.

There must NOT be two different statuses for the same ticket.

The status stored in the database is the single source of truth.

For example:

### Initial state

```text
Status = New
```

The requester sees:

```text
My Request
Status: New
```

The IT Guy sees:

```text
Tickets
Status: New
```

---

# 8. IT Guy Changes Status to "In Progress"

When the IT Guy starts working on the ticket:

```text
New → In Progress
```

The backend updates the ticket status.

The requester must then see:

```text
Status: In Progress
```

The IT Guy must also see:

```text
Status: In Progress
```

Both users are looking at the same ticket and the same status.

---

# 9. Ticket Resolution

When the IT Guy finishes the work, the ticket can be marked as:

```text
In Progress → Done
```

The IT Guy must NOT permanently delete the ticket.

The ticket remains stored in the database.

Only its status changes.

The requester immediately sees:

```text
Status: Done
```

---

# 10. Active Tickets vs History

A ticket should be considered active while its status is not `Done`.

For example:

```text
New
In Progress
```

These tickets remain in the active sections.

Once the status becomes:

```text
Done
```

the ticket is removed from the active lists.

### IT Guy

The completed ticket disappears from:

```text
Tickets
```

and becomes available in:

```text
Historique
```

### Requester

The completed ticket disappears from:

```text
Mes demandes
```

and becomes available in:

```text
Historique
```

IMPORTANT:

The ticket is NOT deleted from the database.

It is only moved logically from the active list to the history list based on its status.

---

# 11. Database Logic

Use the ticket status as the source for determining where the ticket appears.

For example:

```text
status = "NEW"
        ↓
Active Tickets

status = "IN_PROGRESS"
        ↓
Active Tickets

status = "DONE"
        ↓
History
```

Do NOT create duplicate tickets for history.

The same database record must be used.

Example:

```text
Ticket #1024

status: IN_PROGRESS
requester: John
assigned_to: IT Technician
```

When completed:

```text
Ticket #1024

status: DONE
requester: John
assigned_to: IT Technician
```

The record remains the same.

---

# 12. Backend Permissions

Implement proper Django REST API permissions.

### Regular User

Can:

* Create tickets
* View their own tickets
* View the status of their own tickets
* View their own history

Cannot:

* Access the IT `Tickets` endpoint
* View tickets assigned to other users
* Modify ticket status unless explicitly allowed
* Modify another user's ticket

### IT Guy

Can:

* View tickets assigned to them
* Open ticket details
* Update ticket status
* Mark tickets as Done
* View their ticket history

Cannot:

* Modify tickets assigned to another IT Guy unless they have a special permission

### Admin

The admin can have full access to all tickets.

---

# 13. API Logic

Create endpoints following this logic.

Example:

```text
GET /api/tickets/
```

For an IT Guy:

Return only tickets assigned to the authenticated IT Guy.

For a regular user:

Do not allow access to the IT ticket list.

---

Requester endpoint:

```text
GET /api/my-requests/
```

Return only tickets created by the authenticated requester.

History:

```text
GET /api/tickets/history/
```

Return completed tickets for the authenticated user according to their role.

Status update:

```text
PATCH /api/tickets/{id}/
```

The backend must verify that the authenticated IT Guy is actually assigned to the ticket before allowing the status update.

---

# 14. Frontend Logic

React must dynamically render the sidebar based on the authenticated user's role.

Example:

```javascript
if (user.role === "IT") {
    showTicketsMenu();
}
```

Regular users:

```javascript
if (user.role !== "IT") {
    hideTicketsMenu();
}
```

However, frontend hiding is NOT a security mechanism.

Django must enforce the permissions server-side.

---

# 15. Important Workflow

The complete workflow must be:

```text
Regular User
     ↓
Create Ticket
     ↓
Ticket assigned to IT Guy
     ↓
IT Guy sees ticket in "Tickets"
     ↓
IT Guy opens ticket
     ↓
IT Guy changes status
     ↓
NEW
     ↓
IN PROGRESS
     ↓
DONE
     ↓
Requester sees DONE
     ↓
Ticket disappears from active requests
     ↓
Ticket appears in Requester's History
     ↓
Ticket disappears from IT Guy's active Tickets
     ↓
Ticket appears in IT Guy's History
```

---

# 16. Critical Rules

1. There is only ONE ticket record in the database.
2. The requester and IT Guy always see the same ticket status.
3. The IT Guy is the only role that sees `Tickets` in the sidebar.
4. Regular users must never see the IT `Tickets` menu.
5. Backend permissions must enforce these rules.
6. An IT Guy only sees tickets assigned to them.
7. A requester only sees their own requests.
8. `Done` means the ticket is completed.
9. A completed ticket is moved logically to `Historique`.
10. Completed tickets must NEVER be physically deleted from the database.
11. History must use the same ticket records, not duplicated records.
12. Status changes must be saved through the Django REST API.
13. The frontend should refresh/update the ticket status so both sides see the latest state.
14. Keep the implementation clean, scalable, and consistent with React + Vite + Django REST Framework.
15. Do not break the existing authentication, user, service, bureau, category, priority, or ticket functionality.
16. Before modifying existing code, inspect the current project structure and reuse existing models/components/API logic where possible.
