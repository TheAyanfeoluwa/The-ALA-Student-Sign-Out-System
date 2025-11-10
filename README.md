# African Leadership Academy - Digital Student Clearance System

A comprehensive digital clearance system that replaces physical signatures with a streamlined workflow for student clearance management at African Leadership Academy.

## Overview

The Digital Student Clearance System enables students to submit required items to reception and receive digital approvals from multiple parties including station staff, teachers, hall heads, advisors, and year heads. The system features role-based access control, multi-step approval processes, and real-time webhook integration with Make.com for automated notifications.

## Features

### Core Functionality
- **Multi-Role Dashboard System**: Separate dashboards for Admin, Students, Teachers, Station Staff, Hall Heads, Advisors, and Year Heads
- **Digital Approval Workflow**: Streamlined multi-step approval process replacing physical signatures
- **Item Management**: Track subject-specific and general requirements (calculators, textbooks, uniforms, sports equipment)
- **Real-Time Updates**: Centralized data store using React Context for live synchronization across all dashboards
- **Webhook Integration**: Comprehensive Make.com integration for automated notifications and updates

### Student Features
- View assigned items and clearance status
- Report missing or damaged items with detailed descriptions
- Track approval progress from multiple parties
- Cross-out completed items
- Real-time status updates

### Teacher Features
- Multi-student selection for adding requirements
- View and manage student assigned items
- "Reported Issues" tab to view and resolve student-reported problems
- Add resolution notes when marking issues as resolved
- Approve/reject student clearances

### Admin Features
- Create accounts for teachers, advisors, hall heads, and year heads
- User management and role assignment
- Unlock user accounts (brute-force protection)
- Multi-sheet CSV/Excel export functionality
- System-wide monitoring and reporting

### Security Features
- Brute-force protection with automatic account lockout
- Immediate sign-in after admin approval of unlock requests
- Forgot password functionality with email delivery
- Input validation and sanitization
- Password masking
- Role-based access control

## Tech Stack

- **Frontend**: React with TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui components
- **Icons**: Lucide React
- **State Management**: React Context API
- **Build Tool**: Vite
- **Font**: Montserrat (via Google Fonts)

## Design System

### Brand Colors
- **Gold**: `#baa768`
- **Maroon**: `#800000`
- **Typography**: Montserrat font family

## Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager

### Steps

1. **Clone the github repository** (or navigate to the project directory)

2. **Install dependencies**
   ```bash
   npm install
   ```
   or
   ```bash
   yarn install
   ```

3. **Configure environment** (optional)
   - The system uses mock data by default
   - No additional configuration required for local development

## Running the Application

### Development Mode

Start the development server:

```bash
npm run dev
```
or
```bash
yarn dev
```

The application will be available at `http://localhost:5173` (or another port if 5173 is in use).

### Production Build

Build the application for production:

```bash
npm run build
```
or
```bash
yarn build
```

Preview the production build:

```bash
npm run preview
```
or
```bash
yarn preview
```

## User Roles & Permissions

| Role | Permissions |
|------|------------|
| **Admin** | Full system access, user management, account creation, unlock requests, exports |
| **Student** | View assigned items, report issues, track clearance status |
| **Teacher** | Add requirements, manage student items, resolve reported issues, approve clearances |
| **Station Staff** | Process student submissions, verify items, update statuses |
| **Hall Head** | Review and approve hall-related clearances |
| **Advisor** | Review and approve student clearances under their advising |
| **Year Head** | Final approval authority for year-level clearances |

## Clearance Items

### Subject-by-Subject Requirements
- Calculator
- Mathematics textbook
- Computer Science textbook
- Physics textbook etc.

### Other Requirements
- Uniform
- Sports equipment etc.

## Key Features Guide

### For Students
1. **Login** with your @alastudents.org email
2. **View assigned items** on your dashboard
3. **Report issues** for missing/damaged items using the "Report Issue" button
4. **Track progress** as items get approved by different parties

### For Teachers
1. **Login** with your @africanleadershipacademy.org email
2. **Add requirements** to multiple students at once
3. **View reported issues** in the "Reported Issues" tab
4. **Mark issues as resolved** with optional resolution notes
5. **Approve clearances** for your subject area

### For Admins
1. **Login** with admin credentials
2. **Create accounts** for teachers, advisors, hall heads, and year heads
3. **Manage users** and unlock accounts if needed
4. **Export data** using multi-sheet CSV/Excel functionality
5. **Monitor system** activity and clearance progress




## Security Features

### Brute-Force Protection
- Automatic account lockout after multiple failed login attempts
- Admin unlock request system
- Immediate sign-in capability after admin approval



### Input Validation
- Client-side validation for all forms
- Email format validation
- Required field enforcement
- Sanitization of user inputs

## Data Export

Admins can export comprehensive system data in multiple formats:
- **CSV Format**: Individual CSV files for each data category
- **Filtered Exports**: Export specific date ranges or user groups



## Development Notes

### State Management
- Uses React Context API for centralized data store
- Real-time synchronization across all dashboards
- Automatic updates on data changes

### Styling
- Tailwind CSS v4.0 (no config file needed)
- Custom CSS tokens in `styles/globals.css`
- Montserrat font loaded via Google Fonts

### Email Domains
- Students: `@alastudents.org`
- Staff: `@africanleadershipacademy.org`

## Troubleshooting

### Account Locked
If your account is locked due to too many failed login attempts:
1. Contact an administrator
2. Admin will approve your unlock request
3. You can immediately sign in again

### Forgot Password
1. Click "Forgot password?" on the login page
2. Enter your email address
3. Check your email for password information

### Items Not Updating
- Ensure you're connected to the internet
- Refresh the page
- Check that all required fields are filled
- Contact admin if issues persist


## Future Enhancements

Potential features for future releases:
- Mobile application
- SMS notifications
- Bulk import of student data
- Advanced reporting and analytics
- Integration with student information systems
- Document attachment capabilities
- QR code scanning for item verification


**Built by**: Ayanfeoluwa Ayanlade, Hassiet Fisseha, Yabets Abebe