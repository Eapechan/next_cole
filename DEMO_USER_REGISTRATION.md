# User Registration Demo Guide

## 🎯 Overview

This guide demonstrates how to test the new user registration functionality in the NextCoal Initiative application.

## 🚀 How to Test New User Registration

### Step 1: Access the Signup Page

1. Navigate to `/signup` in your application
2. You'll see a comprehensive registration form with the following fields:
   - Full Name
   - Email Address
   - Organization/Mine Name
   - Role (Mine Operator, Environmental Regulator, System Admin)
   - Mine ID (required for Mine Operators)
   - Password
   - Confirm Password
   - Terms of Service agreement

### Step 2: Create a New User

Fill out the form with test data:

**Example 1 - Mine Operator:**

```
Full Name: John Doe
Email: john.doe@newmine.gov.in
Organization: New Coal Mine Ltd
Role: Mine Operator
Mine ID: MINE999
Password: password123
Confirm Password: password123
```

**Example 2 - Regulator:**

```
Full Name: Dr. Sarah Johnson
Email: sarah.johnson@environment.gov.in
Organization: Ministry of Environment
Role: Environmental Regulator
Password: password123
Confirm Password: password123
```

**Example 3 - Admin:**

```
Full Name: System Manager
Email: manager@nextcoal-initiative.gov.in
Organization: Coal Ministry
Role: System Admin
Password: password123
Confirm Password: password123
```

### Step 3: Submit and Verify

1. Check the "I agree to Terms of Service" checkbox
2. Click "Create Account"
3. The system will:
   - Validate all required fields
   - Check for duplicate emails
   - Create the new user account
   - **Initialize empty emission data for the new user**
   - Automatically log you in
   - Redirect to the dashboard

### Step 4: Verify Empty Dashboard Data

1. After registration, you'll be redirected to the dashboard
2. **New users will see:**
   - Zero emissions (0 tonnes CO2e)
   - Zero carbon sinks (0 tonnes CO2e)
   - Zero net emissions (0 tonnes CO2e)
   - No emission entries in the data tables
   - No carbon sink entries
   - No strategy entries
3. This ensures new users start with a clean slate

### Step 5: View Registered Users

1. Log in as an admin user (admin@nextcoal-initiative.gov.in / password123)
2. Navigate to the Admin page
3. Click on the "Users" tab
4. You'll see the UserManager component showing all registered users
5. Use the "Refresh" button to update the list
6. Use "Reset Users" to clear all custom users and return to defaults

## 🔧 Technical Implementation Details

### Data Storage

- User data is stored in `localStorage` under the key `nextcoal_mock_users`
- **Emission data is user-specific** and stored under `nextcoal_emissions_{userId}`
- **Carbon sink data is user-specific** and stored under `nextcoal_carbon_sinks_{userId}`
- **Strategy data is user-specific** and stored under `nextcoal_strategies_{userId}`
- Each user object contains:
  ```typescript
  {
    id: string;
    email: string;
    password: string;
    name: string;
    role: 'mine-operator' | 'regulator' | 'admin';
    organization: string;
    mineId?: string; // Only for mine operators
  }
  ```

### Authentication Flow

1. **Registration**: `register()` function in AuthContext
2. **Validation**: Email uniqueness, required fields, password confirmation
3. **Storage**: Saves to localStorage with auto-generated ID
4. **Data Initialization**: Creates empty emission data for new users
5. **Auto-login**: Automatically logs in the new user
6. **Navigation**: Redirects to dashboard

### User-Specific Data Management

- **Demo Users (ID '1')**: Have sample emission data for demonstration
- **New Users**: Start with completely empty emission data
- **Data Isolation**: Each user's data is completely separate
- **Persistent Storage**: User data persists across sessions

### Error Handling

- Duplicate email addresses
- Missing required fields
- Password mismatch
- Invalid role selection
- Network/API simulation errors

## 🧪 Testing Scenarios

### ✅ Valid Registration

- All fields filled correctly
- Unique email address
- Matching passwords
- Terms accepted
- **Empty dashboard data for new users**

### ❌ Invalid Registration

- Duplicate email (should show error)
- Missing required fields
- Password mismatch
- Terms not accepted
- Missing Mine ID for operators

### 🔄 User Management

- View all registered users in Admin panel
- Refresh user list
- Reset to default users
- Verify user data persistence
- **Verify user-specific data isolation**

### 📊 Dashboard Data Verification

- **New users see zero emissions**
- **New users see zero carbon sinks**
- **New users see empty data tables**
- Demo users see sample data
- Data persists across login/logout

## 🎨 UI Features

- Loading states during registration
- Error messages for validation failures
- Success feedback and auto-login
- Responsive design
- Role-based form fields (Mine ID for operators)
- Modern styling with sustainability theme
- **Empty state indicators for new users**

## 🔐 Security Notes

- This is a demo implementation using localStorage
- In production, use proper backend authentication
- Passwords are stored in plain text (demo only)
- Implement proper password hashing and validation
- Add email verification and password strength requirements
- **User data is isolated per user ID**

## 📱 Demo Credentials

You can still use the original demo accounts:

- **Mine Operator**: operator@nextcoal-initiative.gov.in / password123 (has sample data)
- **Regulator**: regulator@nextcoal-initiative.gov.in / password123 (has sample data)
- **Admin**: admin@nextcoal-initiative.gov.in / password123 (has sample data)

## 🚀 Next Steps

1. Test creating different user types
2. Verify login with new accounts
3. **Verify empty dashboard data for new users**
4. Check user management in Admin panel
5. Test error scenarios
6. Reset users and verify defaults restored
7. **Add emission data and verify it's user-specific**
