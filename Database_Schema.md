# Database Schema - Digital Student Clearance System

This document outlines the complete data structure and relationships for the African Leadership Academy Digital Student Clearance System.



## Core Entities

### 1. User Entity

The base user entity that applies to all user types in the system.

```typescript
interface User {
  id: string;                    // Unique identifier (UUID)
  email: string;                 // User email (unique)
  password: string;              // Hashed password
  role: UserRole;                // User role type
  firstName: string;             // User's first name
  lastName: string;              // User's last name
  createdAt: Date;               // Account creation timestamp
  updatedAt: Date;               // Last update timestamp
  isActive: boolean;             // Account active status
  isLocked: boolean;             // Account lock status (security)
  lockReason?: string;           // Reason for account lock
  failedLoginAttempts: number;   // Failed login counter
  lastLoginAttempt?: Date;       // Timestamp of last login attempt
  lastSuccessfulLogin?: Date;    // Timestamp of last successful login
}
```

**Email Domain Rules:**
- Students: `@alastudents.org`
- All staff (Teachers, Advisors, Hall Heads, Year Heads, Admin): `@africanleadershipacademy.org`

### 2. User Roles

```typescript
enum UserRole {
  ADMIN = 'admin',
  STUDENT = 'student',
  TEACHER = 'teacher',
  STATION_STAFF = 'station_staff',
  HALL_HEAD = 'hall_head',
  ADVISOR = 'advisor',
  YEAR_HEAD = 'year_head'
}
```

**Role Hierarchy:**
1. Admin (highest authority)
2. Year Head
3. Advisor
4. Hall Head
5. Teacher
6. Station Staff
7. Student

### 3. Student (extends User)

```typescript
interface Student extends User {
  role: 'student';
  studentId: string;             // Unique student identifier
  yearLevel: number;             // Academic year (e.g., 1, 2, 3, 4)
  advisorId: string;             // Reference to assigned Advisor
  yearHeadId: string;            // Reference to assigned Year Head
  hallId?: string;               // Reference to assigned Hall
  clearanceStatus: ClearanceStatus;  // Overall clearance status
  assignedItems: AssignedItem[]; // Items assigned to student
  reportedIssues: ReportedIssue[]; // Issues reported by student
}
```

### 4. Teacher (extends User)

```typescript
interface Teacher extends User {
  role: 'teacher';
  teacherId: string;             // Unique teacher identifier
  subjects: string[];            // Subjects taught (e.g., ['Mathematics', 'Physics'])
  department?: string;           // Department affiliation
  students: string[];            // Array of student IDs under this teacher
}
```

**Example Teacher:**
- Name: Ismail Adeleke
- Email: `ismail.adeleke@africanleadershipacademy.org`
- Subjects: Mathematics, Computer Science, Physics

### 5. Advisor (extends User)

```typescript
interface Advisor extends User {
  role: 'advisor';
  advisorId: string;             // Unique advisor identifier
  students: string[];            // Array of student IDs being advised
  maxStudents?: number;          // Maximum advisee capacity
}
```

**Example Advisor:**
- Name: Ms. Catherine Delight

### 6. Year Head (extends User)

```typescript
interface YearHead extends User {
  role: 'year_head';
  yearHeadId: string;            // Unique year head identifier
  yearLevel: number;             // Year level responsibility (1-4)
  students: string[];            // Array of student IDs in this year
}
```

**Example Year Head:**
- Name: Ms. Sebabatso

### 7. Hall Head (extends User)

```typescript
interface HallHead extends User {
  role: 'hall_head';
  hallHeadId: string;            // Unique hall head identifier
  hallId: string;                // Hall/dormitory identifier
  hallName: string;              // Hall name
  students: string[];            // Array of student IDs in this hall
}
```

### 8. Station Staff (extends User)

```typescript
interface StationStaff extends User {
  role: 'station_staff';
  staffId: string;               // Unique staff identifier
  stationName: string;           // Reception/station location
  responsibilities: string[];    // Areas of responsibility
}
```

## Clearance-Related Entities

### 9. Assigned Item

Items assigned to students that need to be cleared.

```typescript
interface AssignedItem {
  id: string;                    // Unique item identifier (UUID)
  studentId: string;             // Reference to Student
  itemName: string;              // Name of the item
  category: ItemCategory;        // Category of the item
  assignedBy: string;            // User ID who assigned the item
  assignedByRole: UserRole;      // Role of the assigner
  assignedDate: Date;            // When item was assigned
  dueDate?: Date;                // Optional due date
  status: ItemStatus;            // Current status of the item
  priority: Priority;            // Priority level
  description?: string;          // Additional description
  approvals: Approval[];         // Array of approval records
  isCompleted: boolean;          // Whether item is fully cleared
  isCrossedOut: boolean;         // Student crossed out (completed)
  completedDate?: Date;          // When item was completed
  notes?: string;                // Additional notes
}
```

### 10. Item Categories

```typescript
enum ItemCategory {
  SUBJECT_BY_SUBJECT = 'subject_by_subject',
  OTHER_REQUIREMENTS = 'other_requirements'
}
```

**Subject-by-Subject Items:**
- Calculator
- Mathematics textbook
- Computer Science textbook
- Physics textbook

**Other Requirements:**
- Uniform
- Sports equipment

### 11. Item Status

```typescript
enum ItemStatus {
  PENDING = 'pending',           // Assigned but not started
  SUBMITTED = 'submitted',       // Student submitted to reception
  IN_REVIEW = 'in_review',       // Under review by staff
  APPROVED = 'approved',         // Approved by required parties
  REJECTED = 'rejected',         // Rejected, needs resubmission
  COMPLETED = 'completed',       // Fully cleared
  REPORTED = 'reported'          // Issue reported
}
```

### 12. Priority Levels

```typescript
enum Priority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}
```

### 13. Approval Record

Tracks individual approvals in the multi-step approval process.

```typescript
interface Approval {
  id: string;                    // Unique approval identifier
  itemId: string;                // Reference to AssignedItem
  approverId: string;            // User ID of approver
  approverRole: UserRole;        // Role of approver
  approverName: string;          // Name of approver
  status: ApprovalStatus;        // Approval status
  approvalDate?: Date;           // When approved/rejected
  comments?: string;             // Approver comments
  order: number;                 // Order in approval sequence
  isRequired: boolean;           // Whether this approval is required
}
```

### 14. Approval Status

```typescript
enum ApprovalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  NOT_REQUIRED = 'not_required'
}
```

**Approval Flow Order:**
1. Station Staff (verifies item submission)
2. Teacher (subject-specific items)
3. Hall Head (hall-related requirements)
4. Advisor (student-specific review)
5. Year Head (final approval)

### 15. Clearance Status

Overall clearance status for a student.

```typescript
enum ClearanceStatus {
  NOT_STARTED = 'not_started',   // No items assigned
  IN_PROGRESS = 'in_progress',   // Some items pending
  PENDING_APPROVAL = 'pending_approval', // All submitted, awaiting approvals
  CLEARED = 'cleared',           // All items approved
  INCOMPLETE = 'incomplete'      // Past deadline with pending items
}
```

## Issue Tracking Entities

### 16. Reported Issue

Issues reported by students about missing or damaged items.

```typescript
interface ReportedIssue {
  id: string;                    // Unique issue identifier (UUID)
  studentId: string;             // Reference to Student
  studentName: string;           // Student full name
  studentEmail: string;          // Student email
  itemId: string;                // Reference to AssignedItem
  itemName: string;              // Name of the item
  issueType: IssueType;          // Type of issue
  description: string;           // Detailed description
  reportedDate: Date;            // When issue was reported
  status: IssueStatus;           // Current status
  assignedTo?: string;           // User ID of person handling issue
  resolvedBy?: string;           // User ID who resolved
  resolvedDate?: Date;           // When issue was resolved
  resolutionNotes?: string;      // Notes from resolver
  priority: Priority;            // Priority level
}
```

### 17. Issue Types

```typescript
enum IssueType {
  MISSING = 'missing',           // Item is missing
  DAMAGED = 'damaged',           // Item is damaged
  INCORRECT = 'incorrect',       // Wrong item assigned
  OTHER = 'other'                // Other issues
}
```

### 18. Issue Status

```typescript
enum IssueStatus {
  OPEN = 'open',                 // Newly reported
  IN_PROGRESS = 'in_progress',   // Being worked on
  RESOLVED = 'resolved',         // Issue fixed
  CLOSED = 'closed'              // Closed without resolution
}
```

## Security Entities

### 19. Unlock Request

Requests to unlock locked accounts.

```typescript
interface UnlockRequest {
  id: string;                    // Unique request identifier
  userId: string;                // Reference to locked User
  userEmail: string;             // User's email
  userName: string;              // User's full name
  requestDate: Date;             // When request was made
  reason: string;                // Reason for unlock
  status: UnlockRequestStatus;   // Request status
  approvedBy?: string;           // Admin who approved
  approvedDate?: Date;           // When approved
  rejectedReason?: string;       // Reason if rejected
}
```

### 20. Unlock Request Status

```typescript
enum UnlockRequestStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}
```

### 21. Login Attempt

Track login attempts for security monitoring.

```typescript
interface LoginAttempt {
  id: string;                    // Unique attempt identifier
  email: string;                 // Email used in attempt
  timestamp: Date;               // When attempt was made
  success: boolean;              // Whether attempt succeeded
  ipAddress?: string;            // IP address (if available)
  userAgent?: string;            // Browser/device info
  failureReason?: string;        // Reason for failure
}
```

## System Configuration Entities

### 22. Requirement Template

Templates for creating clearance requirements.

```typescript
interface RequirementTemplate {
  id: string;                    // Unique template identifier
  name: string;                  // Template name
  category: ItemCategory;        // Item category
  description: string;           // Template description
  defaultPriority: Priority;     // Default priority level
  requiredApprovers: UserRole[]; // Required approver roles
  isActive: boolean;             // Whether template is active
  createdBy: string;             // Admin who created
  createdDate: Date;             // Creation date
}
```

### 23. Webhook Configuration

Configuration for Make.com webhook integrations.

```typescript
interface WebhookConfig {
  id: string;                    // Unique config identifier
  name: string;                  // Webhook name
  url: string;                   // Make.com webhook URL
  eventType: WebhookEventType;   // Type of event to trigger on
  isActive: boolean;             // Whether webhook is active
  headers?: Record<string, string>; // Custom headers
  createdBy: string;             // Admin who created
  createdDate: Date;             // Creation date
  lastTriggered?: Date;          // Last trigger timestamp
}
```

### 24. Webhook Event Types

```typescript
enum WebhookEventType {
  ITEM_ASSIGNED = 'item_assigned',
  ITEM_SUBMITTED = 'item_submitted',
  ITEM_APPROVED = 'item_approved',
  ITEM_REJECTED = 'item_rejected',
  ISSUE_REPORTED = 'issue_reported',
  ISSUE_RESOLVED = 'issue_resolved',
  CLEARANCE_COMPLETED = 'clearance_completed',
  ACCOUNT_LOCKED = 'account_locked',
  ACCOUNT_UNLOCKED = 'account_unlocked'
}
```

### 25. Notification

System notifications for users.

```typescript
interface Notification {
  id: string;                    // Unique notification identifier
  userId: string;                // Recipient user ID
  type: NotificationType;        // Type of notification
  title: string;                 // Notification title
  message: string;               // Notification message
  isRead: boolean;               // Read status
  createdDate: Date;             // Creation timestamp
  readDate?: Date;               // When marked as read
  relatedEntityId?: string;      // Related item/issue ID
  actionUrl?: string;            // Optional action URL
}
```

### 26. Notification Types

```typescript
enum NotificationType {
  ITEM_ASSIGNED = 'item_assigned',
  APPROVAL_NEEDED = 'approval_needed',
  ITEM_APPROVED = 'item_approved',
  ITEM_REJECTED = 'item_rejected',
  ISSUE_REPORTED = 'issue_reported',
  ISSUE_RESOLVED = 'issue_resolved',
  CLEARANCE_COMPLETE = 'clearance_complete',
  SYSTEM_ALERT = 'system_alert'
}
```

## Data Relationships

### Relationship Diagram

```
User (Base)
├── Student
│   ├── assignedItems[] → AssignedItem
│   ├── reportedIssues[] → ReportedIssue
│   ├── advisorId → Advisor
│   ├── yearHeadId → YearHead
│   └── hallId → Hall
├── Teacher
│   └── students[] → Student
├── Advisor
│   └── students[] → Student
├── YearHead
│   └── students[] → Student
├── HallHead
│   └── students[] → Student
└── Admin

AssignedItem
├── studentId → Student
├── assignedBy → User
├── approvals[] → Approval
└── relatedIssue? → ReportedIssue

Approval
├── itemId → AssignedItem
└── approverId → User

ReportedIssue
├── studentId → Student
├── itemId → AssignedItem
├── assignedTo? → User
└── resolvedBy? → User

UnlockRequest
├── userId → User
└── approvedBy? → Admin

Notification
├── userId → User
└── relatedEntityId? → AssignedItem | ReportedIssue
```

### Key Relationships

1. **One-to-Many Relationships:**
   - One Student has many AssignedItems
   - One Student has many ReportedIssues
   - One Teacher has many Students
   - One Advisor has many Students
   - One Year Head has many Students
   - One Hall Head has many Students
   - One AssignedItem has many Approvals

2. **Many-to-One Relationships:**
   - Many Students belong to one Advisor
   - Many Students belong to one Year Head
   - Many Students belong to one Hall Head
   - Many AssignedItems belong to one Student
   - Many ReportedIssues belong to one Student

3. **Optional Relationships:**
   - AssignedItem may have a related ReportedIssue
   - ReportedIssue may be assigned to a User
   - Student may belong to a Hall

## Data Validation Rules

### Email Validation
- Students: Must end with `@alastudents.org`
- Staff: Must end with `@africanleadershipacademy.org`
- Must be unique across the system

### Password Requirements
- Minimum length: 8 characters
- Stored as hashed values (not plaintext)
- Password masking in UI

### Account Locking
- Lock after 5 failed login attempts
- Requires admin approval to unlock
- Timer resets on successful login

### Item Assignment
- Must have valid studentId
- Must have valid assignedBy userId
- Category must be valid ItemCategory
- Status must be valid ItemStatus

### Approval Flow
- Must follow defined order (Station → Teacher → Hall Head → Advisor → Year Head)
- Cannot skip required approvals
- Approver must have appropriate role

### Issue Reporting
- Must reference valid itemId
- Must provide description (minimum 10 characters)
- Issue type must be valid IssueType

## Default Data

### Default Admin Account
```json
{
  "email": "admin@africanleadershipacademy.org",
  "password": "admin123",
  "firstName": "System",
  "lastName": "Administrator",
  "role": "admin"
}
```

### Default Staff Members
```json
{
  "teachers": [
    {
      "firstName": "Ismail",
      "lastName": "Adeleke",
      "email": "ismail.adeleke@africanleadershipacademy.org",
      "subjects": ["Mathematics", "Computer Science", "Physics"]
    }
  ],
  "advisors": [
    {
      "firstName": "Catherine",
      "lastName": "Delight",
      "email": "catherine.delight@africanleadershipacademy.org"
    }
  ],
  "yearHeads": [
    {
      "firstName": "Sebabatso",
      "lastName": "Unknown",
      "email": "sebabatso@africanleadershipacademy.org",
      "yearLevel": 1
    }
  ]
}
```

### Default Item Templates

**Subject-by-Subject:**
- Calculator
- Mathematics textbook
- Computer Science textbook  
- Physics textbook

**Other Requirements:**
- Uniform
- Sports equipment

## Indexes and Performance

### Recommended Indexes

For optimal performance, the following fields should be indexed:

**User Collection:**
- `email` (unique)
- `role`
- `isActive`
- `isLocked`

**AssignedItem Collection:**
- `studentId`
- `status`
- `assignedBy`
- `dueDate`
- `category`

**ReportedIssue Collection:**
- `studentId`
- `status`
- `assignedTo`
- `reportedDate`

**Approval Collection:**
- `itemId`
- `approverId`
- `status`
- `order`

**Notification Collection:**
- `userId`
- `isRead`
- `createdDate`

## Data Storage

Currently implemented using:
- **Frontend State**: React Context API
- **Session Storage**: Browser session storage for temporary data
- **Local Storage**: Browser local storage for persistent client-side data

For production deployment, consider migrating to:
- **Database**: Supabase PostgreSQL or similar
- **File Storage**: For document attachments (future feature)
- **Cache Layer**: Redis for session management

## Migration Notes

When migrating to a production database:

1. Convert TypeScript interfaces to database schemas
2. Implement proper foreign key constraints
3. Set up database indexes as outlined above
4. Implement data backup and recovery procedures
5. Set up database migrations for schema changes
6. Configure proper access control and row-level security

## Security Considerations

### Data Protection
- Passwords must be hashed (bcrypt, argon2, or similar)
- Sensitive data should be encrypted at rest
- Implement proper authentication tokens (JWT)
- Use HTTPS for all data transmission

### Access Control
- Implement row-level security based on user roles
- Students can only view their own data
- Teachers can only view their assigned students
- Admins have full access

### Audit Trail
- Log all data modifications
- Track who created/updated each record
- Maintain timestamps for all operations
- Store IP addresses for security events

## Backup and Recovery

### Backup Strategy
- Daily automated backups
- Point-in-time recovery capability
- Separate backups for different data types
- Off-site backup storage

### Data Retention
- User data: Retain for academic year + 2 years
- Clearance records: Retain for 5 years
- Login attempts: Retain for 90 days
- Notifications: Retain for 1 year

---

(All data can be exported as a CSV file for eacy viewing)