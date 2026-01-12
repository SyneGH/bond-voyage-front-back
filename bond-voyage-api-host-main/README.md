# Node.js Prisma Authentication Boilerplate

A robust Node.js authentication boilerplate with TypeScript, Prisma ORM, PostgreSQL, Redis caching, and JWT authentication.

## 🚀 Features

- **Authentication & Authorization**

  - JWT-based authentication with access tokens (14 minutes) and refresh tokens (7 days)
  - Role-based access control (USER, ADMIN)
  - Secure password hashing with bcrypt
  - Cookie-based refresh token storage

- **Database & Caching**

  - PostgreSQL with Prisma ORM
  - Redis caching for improved performance
  - Database migrations and seeding

- **Security**

  - Helmet for security headers
  - CORS configuration
  - Input validation with Joi
  - SQL injection protection via Prisma

- **Developer Experience**
  - TypeScript for type safety
  - Hot reloading with ts-node-dev
  - Structured logging with Morgan
  - Docker support for easy development

## 📋 Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- Redis (v6 or higher)
- Docker & Docker Compose (optional)

## 🛠️ Installation

### Option 1: Using Docker (Recommended)

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd nodejs-prisma-auth-boilerplate
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start services with Docker**

   ```bash
   docker-compose up -d
   ```

4. **Set up environment variables**

   ```bash
   cp .env.example .env
   ```

   Update the `.env` file with your configuration:

   ```env
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/auth_db?schema=public"
   JWT_ACCESS_SECRET=your-super-secret-jwt-access-key-here
   JWT_REFRESH_SECRET=your-super-secret-jwt-refresh-key-here
   JWT_ACCESS_EXPIRE=14m
   JWT_REFRESH_EXPIRE=7d
   PORT=8087
   NODE_ENV=development
   REDIS_HOST=localhost
   REDIS_PORT=6379
   BCRYPT_SALT_ROUNDS=12
   ```

5. **Generate Prisma client and run migrations**

   ```bash
   npm run db:generate
   npm run db:push
   ```

6. **Seed the database**

   ```bash
   npm run db:seed
   ```

7. **Start the development server**
   ```bash
   npm run dev
   ```

### Option 2: Manual Setup

1. **Install and configure PostgreSQL**
2. **Install and configure Redis**
3. **Follow steps 1, 2, 4-7 from Option 1**

## 🔧 Available Scripts

```bash
# Development
npm run dev          # Start development server with hot reload
npm run build        # Build the TypeScript code
npm run start        # Start production server

# Database
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to database
npm run db:migrate   # Run database migrations
npm run db:studio    # Open Prisma Studio
npm run db:seed      # Seed database with initial data
```

## 📡 API Endpoints (Complete)

All routes are prefixed with `/api/v1`. Unless noted as Public, endpoints require authentication; "Admin" requires the admin role.

### Authentication & OTP (`/auth`)

| Method | Endpoint | Description | Access |
| --- | --- | --- | --- |
| POST | `/auth/register` | Register a new user account. | Public |
| POST | `/auth/login` | Authenticate with email/password; returns tokens. | Public |
| POST | `/auth/refresh-token` | Refresh access token using refresh token. | Public |
| POST | `/auth/reset-password` | Begin password reset flow. | Public |
| POST | `/auth/send-otp` | Send OTP (e.g., for verification/reset). | Public |
| POST | `/auth/verify-otp` | Verify a submitted OTP. | Public |
| POST | `/auth/logout` | Log out current session. | Private |
| POST | `/auth/logout-all` | Invalidate all sessions for the user. | Private |
| GET | `/auth/profile` | Retrieve the authenticated user profile. | Private |

### Users (`/users`)

| Method | Endpoint | Description | Access |
| --- | --- | --- | --- |
| PATCH | `/users/profile` | Update own profile. | Private |
| PUT | `/users/change-password` | Change own password. | Private |
| GET | `/users/me/stats` | View personal stats. | Private |
| GET | `/users/me/activity-logs` | View own activity logs. | Private |
| POST | `/users` | Create a user. | Admin |
| GET | `/users` | List users (pagination supported). | Admin |
| GET | `/users/:id` | Retrieve a user by ID. | Admin |
| PATCH | `/users/:id` | Update a user. | Admin |
| PATCH | `/users/:id/deactivate` | Deactivate a user. | Admin |
| DELETE | `/users/:id` | Delete a user. | Admin |

### Itineraries & Collaboration (`/itineraries`)

| Method | Endpoint | Description | Access |
| --- | --- | --- | --- |
| POST | `/itineraries` | Create an itinerary. | Private |
| GET | `/itineraries` | List itineraries owned by the user. | Private |
| GET | `/itineraries/:id` | Get itinerary details. | Private |
| PATCH | `/itineraries/:id` | Update an itinerary. | Private |
| DELETE | `/itineraries/:id` | Delete an itinerary. | Private |
| PATCH | `/itineraries/:id/send` | Send itinerary for request/approval. | Private |
| PATCH | `/itineraries/:id/confirm` | Confirm an itinerary. | Private |
| GET | `/itineraries/:id/versions` | List saved versions. | Private |
| GET | `/itineraries/:id/versions/:versionId` | View specific version details. | Private |
| POST | `/itineraries/:id/versions/:versionId/restore` | Restore an itinerary version. | Private |
| POST | `/itineraries/:id/collaborators` | Add a collaborator. | Private |
| GET | `/itineraries/:id/collaborators` | List collaborators. | Private |
| DELETE | `/itineraries/:id/collaborators/:userId` | Remove a collaborator. | Private |

### Bookings & Collaboration (`/bookings`)

| Method | Endpoint | Description | Access |
| --- | --- | --- | --- |
| GET | `/bookings/my-bookings` | List bookings owned by the user. | Private |
| GET | `/bookings/shared-with-me` | List bookings shared with the user. | Private |
| POST | `/bookings` | Create a booking. | Private |
| PATCH | `/bookings/:id/submit` | Submit booking for processing. | Private |
| PATCH | `/bookings/:id/cancel` | Cancel a booking. | Private |
| PUT | `/bookings/:id` | Update booking itinerary details. | Private |
| POST | `/bookings/:id/payments` | Add a payment proof for a booking. | Private |
| GET | `/bookings/:id/payments` | List payments for a booking. | Private |
| DELETE | `/bookings/:id` | Delete a draft booking. | Private |
| GET | `/bookings/:id` | Get booking details. | Private/Admin (collaborator or owner) |
| GET | `/bookings/admin/bookings` | Admin list of all bookings. | Admin |
| PATCH | `/bookings/:id/status` | Admin update of booking status. | Admin |
| POST | `/bookings/:id/collaborators` | Add a booking collaborator. | Private |
| GET | `/bookings/:id/collaborators` | List booking collaborators. | Private |
| DELETE | `/bookings/:id/collaborators/:collaboratorUserId` | Remove a booking collaborator. | Private |

### Payments (`/payments`)

| Method | Endpoint | Description | Access |
| --- | --- | --- | --- |
| GET | `/payments` | List payments (filtered by caller role). | Private |
| POST | `/payments/:id` | Create a payment for a booking. | Private |
| GET | `/payments/:id/proof` | Retrieve payment proof. | Private |
| PATCH | `/payments/:id/status` | Update payment status. | Admin |

### Tour Packages (`/tour-packages`)

| Method | Endpoint | Description | Access |
| --- | --- | --- | --- |
| GET | `/tour-packages` | List tour packages. | Public |
| GET | `/tour-packages/:id` | Get a tour package. | Public |
| POST | `/tour-packages` | Create a tour package. | Admin |
| PUT | `/tour-packages/:id` | Update a tour package. | Admin |
| DELETE | `/tour-packages/:id` | Remove a tour package. | Admin |

### Inquiries (`/inquiries`)

| Method | Endpoint | Description | Access |
| --- | --- | --- | --- |
| GET | `/inquiries` | List inquiries. | Private |
| POST | `/inquiries` | Submit an inquiry. | Private |
| POST | `/inquiries/:id/messages` | Add a message to an inquiry. | Private |

### Feedback (`/feedback`)

| Method | Endpoint | Description | Access |
| --- | --- | --- | --- |
| POST | `/feedback` | Submit feedback. | Private |
| GET | `/feedback` | List feedback. | Admin |
| PATCH | `/feedback/:id/respond` | Respond to feedback. | Admin |

### Activity & Audit Logs (`/activity-logs`, `/admin/audit-logs`)

| Method | Endpoint | Description | Access |
| --- | --- | --- | --- |
| GET | `/activity-logs` | List activity logs. | User/Admin |
| GET | `/activity-logs/:id` | View an activity log entry. | Admin |
| GET | `/admin/audit-logs` | Alias for activity log list. | User/Admin |
| GET | `/admin/audit-logs/:id` | Alias for activity log detail. | Admin |

### Notifications (`/notifications`)

| Method | Endpoint | Description | Access |
| --- | --- | --- | --- |
| GET | `/notifications` | List notifications. | Private |
| PATCH | `/notifications/:id/read` | Mark a notification as read. | Private |
| PATCH | `/notifications/read-all` | Mark all notifications as read. | Private |

### Weather (`/weather`)

| Method | Endpoint | Description | Access |
| --- | --- | --- | --- |
| GET | `/weather` | Current weather lookup. | Public |
| GET | `/weather/forecast` | Weather forecast lookup. | Public |

### Routes (Distance/Optimization) (`/routes`)

| Method | Endpoint | Description | Access |
| --- | --- | --- | --- |
| POST | `/routes/calculate` | Calculate route details. | Private |
| POST | `/routes/optimize` | Optimize a multi-stop route. | Private |

### Places (`/places`)

| Method | Endpoint | Description | Access |
| --- | --- | --- | --- |
| GET | `/places/search` | Search for places. | Public |

### Chatbots & Smart Trip (`/chatbots`, `/ai`)

| Method | Endpoint | Description | Access |
| --- | --- | --- | --- |
| POST | `/chatbots/roameo` | FAQ chatbot response (Roameo). | Public |
| POST | `/chatbots/roaman` | Smart trip planner (Roaman). | Public |
| POST | `/ai/itinerary` | AI-generated itinerary draft. | Public |

### FAQs (`/faqs`)

| Method | Endpoint | Description | Access |
| --- | --- | --- | --- |
| GET | `/faqs` | Public FAQ list/search. | Public |
| POST | `/faqs` | Create FAQ entry. | Admin |
| PUT | `/faqs/:id` | Update FAQ entry. | Admin |
| DELETE | `/faqs/:id` | Delete FAQ entry. | Admin |

### Dashboard (`/dashboard`)

| Method | Endpoint | Description | Access |
| --- | --- | --- | --- |
| GET | `/dashboard/stats` | Admin analytics snapshot. | Admin |

### Uploads (`/upload`)

| Method | Endpoint | Description | Access |
| --- | --- | --- | --- |
| POST | `/upload/itinerary-thumbnail` | Upload itinerary thumbnail image. | Public |

### Places & Weather Discovery (`/places`, `/weather`)

- See dedicated sections above for search and forecast endpoints.

### Health Check

| Method | Endpoint | Description | Access |
| --- | --- | --- | --- |
| GET | `/health` | API health status. | Public |

## 📝 API Usage Examples

### Register User

```bash
curl -X POST http://localhost:8087/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "employeeId": "EMP001",
    "mobile": "+1234567890",
    "password": "Password@123"
  }'
```

### Login

```bash
curl -X POST http://localhost:8087/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "employeeId": "EMP001",
    "password": "Password@123"
  }'
```

### Get Profile (Protected Route)

```bash
curl -X GET http://localhost:8087/api/v1/auth/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Get All Users (Admin Only)

```bash
curl -X GET "http://localhost:8087/api/v1/users?page=1&limit=10&search=john" \
  -H "Authorization: Bearer YOUR_ADMIN_ACCESS_TOKEN"
```

## 🔐 Default Credentials

After running the seed command, you can use these credentials:

**Admin User:**

- Employee ID: `ADM001`
- Password: `Admin@123`

**Regular User:**

- Employee ID: `USR001`
- Password: `User@123`

## 🏗️ Project Structure

```
src/
├── config/           # Configuration files
│   ├── database.ts   # Prisma configuration
│   └── redis.ts      # Redis configuration
├── constants/        # Application constants
├── controllers/      # Route controllers
├── middlewares/      # Express middlewares
├── routes/           # API routes
├── services/         # Business logic services
├── types/            # TypeScript type definitions
├── utils/            # Utility functions
├── validations/      # Joi validation schemas
├── app.ts           # Express app setup
└── index.ts         # Application entry point

prisma/
└── schema.prisma    # Prisma schema definition
```

## 🛡️ Security Features

- **Password Hashing**: Uses bcrypt with configurable salt rounds
- **JWT Security**: Separate secrets for access and refresh tokens
- **CORS Protection**: Configurable CORS settings
- **Rate Limiting**: Ready for implementation
- **Input Validation**: Joi schema validation for all inputs
- **SQL Injection Protection**: Prisma ORM prevents SQL injection
- **XSS Protection**: Helmet middleware for security headers

## 📊 Caching Strategy

The application implements Redis caching for:

- User list queries (5 minutes TTL)
- Individual user data (10 minutes TTL)
- Automatic cache invalidation on data updates

## 🚀 Deployment

### Environment Variables for Production

```env
NODE_ENV=production
DATABASE_URL=your_production_database_url
JWT_ACCESS_SECRET=your_production_access_secret
JWT_REFRESH_SECRET=your_production_refresh_secret
REDIS_HOST=your_redis_host
REDIS_PORT=6379
FRONTEND_URL=https://your-frontend-domain.com
```

### Docker Production Build

```bash
# Build production image
docker build -t nodejs-auth-api .

# Run with production environment
docker run -p 3000:3000 --env-file .env.production nodejs-auth-api
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:

- Create an issue in the repository
- Check the documentation
- Review the code examples

## 🔄 Migration from MongoDB

This boilerplate provides equivalent functionality to your MongoDB implementation with the following key differences:

1. **Prisma ORM** instead of Mongoose
2. **PostgreSQL** instead of MongoDB
3. **Structured relational data** instead of document-based
4. **Type-safe database queries** with Prisma Client
5. **Better performance** with SQL optimizations and Redis caching

The API endpoints and authentication flow remain the same, making migration seamless.
