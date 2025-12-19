# BondVoyage- Notification System Features

## Overview
The notification system provides real-time alerts and updates for all critical activities across the BondVoyage. Admins receive instant notifications about bookings, payments, user activities, inquiries, feedback, and system events.

## Notification Types & Details

### 1. Booking Notifications

#### 1.1 New Booking Requests
- **Trigger**: When a customer submits a new booking for approval
- **Priority**: High
- **Details Displayed**:
  - Customer name
  - Booking ID
  - Destination
  - Package type
  - Submission timestamp
- **Actionable**: Yes - Links to Approvals page
- **Icon**: Calendar
- **Color**: Ocean Blue gradient (#0A7AFF to #3B9EFF)

#### 1.2 Booking Status Changes
- **Trigger**: When booking status changes (Approved, Confirmed, Pending)
- **Priority**: Medium
- **Details Displayed**:
  - Booking ID
  - Customer name
  - New status
  - Destination/itinerary name
- **Actionable**: Yes - Links to Bookings page
- **Icon**: CheckCircle
- **Color**: Green gradient (#10B981 to #14B8A6)

### 2. Payment Notifications

#### 2.1 Payment Received
- **Trigger**: When full or partial payment is received
- **Priority**: Medium
- **Details Displayed**:
  - Amount received (₱)
  - Booking ID
  - Customer name
  - Payment method
  - New payment status (Paid/Partial)
- **Actionable**: Yes - Links to Bookings page
- **Icon**: CreditCard
- **Color**: Golden gradient (#FFB84D to #FF9800)

#### 2.2 Payment Reminder
- **Trigger**: When payment is due or overdue
- **Priority**: High
- **Details Displayed**:
  - Outstanding balance
  - Booking ID
  - Customer name
  - Due date
- **Actionable**: Yes - Links to Bookings page
- **Icon**: CreditCard
- **Color**: Golden gradient (#FFB84D to #FF9800)

### 3. Trip Status Notifications

#### 3.1 Trip Completed
- **Trigger**: When a trip is marked as completed
- **Priority**: Low
- **Details Displayed**:
  - Booking ID
  - Customer name
  - Destination
  - Completion date
- **Actionable**: Yes - Links to History page
- **Icon**: CheckCircle
- **Color**: Teal gradient (#14B8A6 to #10B981)

#### 3.2 Trip Cancelled
- **Trigger**: When a booking is cancelled
- **Priority**: Medium
- **Details Displayed**:
  - Booking ID
  - Customer name
  - Cancellation reason
  - Refund status
- **Actionable**: Yes - Links to History page
- **Icon**: X Circle
- **Color**: Red gradient (#FF6B6B to #EF4444)

### 4. User Activity Notifications

#### 4.1 New User Registration
- **Trigger**: When a new user creates an account
- **Priority**: Low
- **Details Displayed**:
  - User ID
  - User name
  - Email address
  - Registration date
- **Actionable**: Yes - Links to Users page
- **Icon**: User
- **Color**: Purple gradient (#A78BFA to #8B5CF6)

#### 4.2 User Profile Updates
- **Trigger**: When users update their profile information
- **Priority**: Low
- **Details Displayed**:
  - User name
  - Fields updated
  - Update timestamp
- **Actionable**: Yes - Links to Users page
- **Icon**: User
- **Color**: Purple gradient (#A78BFA to #8B5CF6)

### 5. Feedback Notifications

#### 5.1 New Customer Feedback
- **Trigger**: When a customer submits feedback/review
- **Priority**: Low to Medium (based on rating)
- **Details Displayed**:
  - Customer name
  - Star rating (1-5)
  - Booking/trip reference
  - Feedback preview
  - Submission timestamp
- **Actionable**: Yes - Links to Feedback page
- **Icon**: Star
- **Color**: Sunset gradient (#FFB84D to #FB7185)

#### 5.2 Negative Feedback Alert
- **Trigger**: When feedback with 1-2 stars is received
- **Priority**: High
- **Details Displayed**:
  - Customer name
  - Star rating
  - Feedback preview
  - Booking reference
- **Actionable**: Yes - Links to Feedback page
- **Icon**: Star
- **Color**: Red gradient (#FF6B6B to #FB7185)

### 6. Inquiry Notifications

#### 6.1 New Client Inquiry
- **Trigger**: When a client submits a new inquiry
- **Priority**: High
- **Details Displayed**:
  - Inquiry ID
  - Client name
  - Subject/topic
  - Preview of message
  - Submission timestamp
- **Actionable**: Yes - Links to Inquiries page
- **Icon**: HelpCircle
- **Color**: Ocean Blue gradient (#0A7AFF to #14B8A6)

#### 6.2 New Inquiry Message
- **Trigger**: When a client sends a message in existing inquiry
- **Priority**: High
- **Details Displayed**:
  - Inquiry ID
  - Client name
  - Subject
  - Message preview
  - Timestamp
- **Actionable**: Yes - Links to Inquiries page (opens specific conversation)
- **Icon**: MessageSquare
- **Color**: Ocean Blue gradient (#0A7AFF to #14B8A6)

#### 6.3 Inquiry Status Change
- **Trigger**: When inquiry is resolved or reopened
- **Priority**: Low
- **Details Displayed**:
  - Inquiry ID
  - Client name
  - New status
  - Action timestamp
- **Actionable**: Yes - Links to Inquiries page
- **Icon**: HelpCircle
- **Color**: Ocean Blue gradient (#0A7AFF to #14B8A6)

### 7. Itinerary Notifications

#### 7.1 New Itinerary Request
- **Trigger**: When customer requests custom itinerary
- **Priority**: High
- **Details Displayed**:
  - Request ID
  - Customer name
  - Destination
  - Number of travelers
  - Special requirements
- **Actionable**: Yes - Links to Itinerary page
- **Icon**: FileText
- **Color**: Green gradient (#10B981 to #14B8A6)

#### 7.2 Standard Itinerary Booked
- **Trigger**: When customer books a standard itinerary template
- **Priority**: Medium
- **Details Displayed**:
  - Booking ID
  - Customer name
  - Itinerary name
  - Travel dates
  - Number of travelers
- **Actionable**: Yes - Links to Bookings page
- **Icon**: FileText
- **Color**: Green gradient (#10B981 to #14B8A6)

### 8. System Notifications

#### 8.1 System Updates
- **Trigger**: When dashboard is updated or maintenance scheduled
- **Priority**: Low
- **Details Displayed**:
  - Update version
  - New features
  - Maintenance schedule
  - Impact on operations
- **Actionable**: No
- **Icon**: AlertCircle
- **Color**: Gray gradient (#64748B to #475569)

#### 8.2 System Alerts
- **Trigger**: Critical system events or errors
- **Priority**: Urgent
- **Details Displayed**:
  - Alert type
  - Affected areas
  - Recommended actions
  - Contact information
- **Actionable**: No (informational)
- **Icon**: AlertCircle
- **Color**: Red gradient (#FF6B6B to #EF4444)

## Notification Priority Levels

### Urgent (Red Badge)
- Critical system alerts
- Multiple failed payments
- Security concerns
- **Color**: #FF6B6B
- **Badge**: Red with white text

### High (Orange Badge)
- New booking requests
- New inquiry messages
- Negative feedback (1-2 stars)
- New itinerary requests
- Payment reminders
- **Color**: #FFB84D
- **Badge**: Orange with white text

### Medium (Blue Badge)
- Booking status changes
- Payment received
- Standard bookings
- Trip cancellations
- New inquiries
- **Color**: #0A7AFF
- **Badge**: Blue with white text

### Low (Gray Badge)
- Trip completions
- New user registrations
- Positive feedback
- System updates
- Inquiry resolved
- **Color**: #E5E7EB
- **Badge**: Gray with gray text

## Notification Features

### Main Notification Page Features
1. **Stats Dashboard**
   - Total Notifications
   - Unread Count
   - Today's Notifications

2. **Tabs**
   - All Notifications
   - Unread Only

3. **Type Filters**
   - Filter by notification type
   - Multiple selection
   - Active filter count badge

4. **Bulk Actions**
   - Mark All as Read
   - Clear Read Notifications

5. **Individual Notification Actions**
   - Mark as Read/Unread
   - Delete notification
   - Quick navigation to related page

6. **Visual Indicators**
   - Unread notifications: Blue border, light blue background
   - Priority badges
   - Actionable tags
   - Time stamps (relative and absolute)
   - Type-specific icons and colors

### Notification Bell Overlay Features
1. **Quick View**
   - Shows last 5 notifications
   - Unread count in header
   - Quick navigation on click

2. **Visual Design**
   - Glassmorphism effect (backdrop blur)
   - Smooth animations
   - Compact card layout

3. **Interactive Elements**
   - Click notification to navigate
   - View All button links to full page
   - Close button
   - Pulsing unread indicator

4. **Real-time Updates**
   - Badge on bell icon shows unread count
   - Pulse animation for urgent notifications

## Design Specifications

### Colors (BondVoyage Brand Kit)
- **Primary**: Ocean Blue (#0A7AFF)
- **Secondary**: Tropical Teal (#14B8A6)
- **Success**: Jade Green (#10B981)
- **Warning**: Golden Hour (#FFB84D)
- **Danger**: Sunset Coral (#FF6B6B)
- **Info**: Sky Blue (#3B9EFF)

### Typography
- **Title**: 16px, Semibold
- **Message**: 14px, Regular
- **Timestamp**: 12px, Regular
- **Badge**: 12px, Medium

### Spacing
- Card padding: 20px (5 units)
- Card gap: 12px (3 units)
- Section margins: 24px (6 units)

### Shadows & Effects
- Card hover: 0 4px 12px rgba(10,122,255,0.1)
- Unread highlight: 0 4px 12px rgba(10,122,255,0.15)
- Icon shadow: 0 2px 8px [color]/20

### Animations
- Notification appear: Fade + slide up (300ms)
- Hover effects: 200ms ease-out
- Badge pulse: 2s infinite

## Integration Points

### From Approvals Page
- New booking requests
- Booking approval/rejection
- Status changes

### From Bookings Page
- Payment updates
- Booking modifications
- Trip status changes
- Booking cancellations

### From Users Page
- New registrations
- Profile updates
- Account status changes

### From Feedback Page
- New feedback submissions
- Rating alerts (especially low ratings)

### From Inquiries Page
- New inquiries
- New messages in conversations
- Inquiry status changes

### From Itinerary Page
- New itinerary requests
- Standard itinerary bookings
- Template updates

### From History Page
- Trip completions
- Final status confirmations

## Future Enhancements (Optional)
1. Email notifications for critical alerts
2. SMS notifications for urgent matters
3. Push notifications (browser)
4. Notification preferences/settings
5. Scheduled digest reports
6. Search within notifications
7. Export notification history
8. Custom notification rules
9. Team/role-based notifications
10. Notification analytics dashboard
