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

## 📡 API Endpoints

### Authentication Routes (`/api/v1/auth`)

| Method | Endpoint         | Description             | Access  |
| ------ | ---------------- | ----------------------- | ------- |
| POST   | `/register`      | Register new user       | Public  |
| POST   | `/login`         | User login              | Public  |
| POST   | `/refresh-token` | Refresh access token    | Public  |
| POST   | `/logout`        | Logout user             | Private |
| POST   | `/logout-all`    | Logout from all devices | Private |
| GET    | `/profile`       | Get user profile        | Private |

### User Routes (`/api/v1/users`)

| Method | Endpoint           | Description               | Access  |
| ------ | ------------------ | ------------------------- | ------- |
| GET    | `/`                | Get all users (paginated) | Admin   |
| GET    | `/:id`             | Get user by ID            | Admin   |
| PUT    | `/profile`         | Update own profile        | Private |
| PUT    | `/change-password` | Change password           | Private |
| PATCH  | `/:id/deactivate`  | Deactivate user           | Admin   |
| DELETE | `/:id`             | Delete user               | Admin   |

### Health Check (`/api/v1/health`)

| Method | Endpoint  | Description       | Access |
| ------ | --------- | ----------------- | ------ |
| GET    | `/health` | API health status | Public |

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
    "phoneNumber": "+1234567890",
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
