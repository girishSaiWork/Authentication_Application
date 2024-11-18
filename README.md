# Authentication Application

A full-stack authentication system built with Node.js, Express, React, and PostgreSQL, featuring secure user registration and login functionalities.

## Features

- User Registration with Email Verification
- Secure Login/Logout System
- Password Reset Functionality
- JWT Token-based Authentication
- HTTP-only Cookies for Enhanced Security
- Protected Routes
- User Session Management
- Password Hashing using bcrypt
- Email Notifications via Mailtrap

## Tech Stack

### Backend
- Node.js
- Express.js
- PostgreSQL
- JSON Web Tokens (JWT)
- bcrypt for password hashing
- nodemailer for email services

### Frontend
- React
- Axios for API calls
- React Router for navigation
- Tailwind CSS for styling
- Context API for state management

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL
- npm or yarn
- Mailtrap account for email testing

## Environment Variables

### Backend (.env)
```
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Database Configuration
POSTGRES_USER=postgres
POSTGRES_HOST=localhost
POSTGRES_DB=postgres
POSTGRES_PASSWORD=your_password
POSTGRES_PORT=5432

# JWT Configuration
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=6h

# Cookie Configuration
COOKIE_SECRET=your_cookie_secret

# Mailtrap Configuration
MAILTRAP_HOST=sandbox.smtp.mailtrap.io
MAILTRAP_PORT=2525
MAILTRAP_USER=your_mailtrap_user
MAILTRAP_PASS=your_mailtrap_password
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
```

## Installation

1. Clone the repository
```bash
git clone https://github.com/girishSaiWork/Authentication_Application.git
cd Authentication_Application
```

2. Install Backend Dependencies
```bash
cd backend
npm install
```

3. Install Frontend Dependencies
```bash
cd frontend
npm install
```

4. Set up PostgreSQL Database
- Create a new database
- Update the .env file with your database credentials

5. Set up Environment Variables
- Create .env files in both backend and frontend directories
- Fill in the required environment variables as shown above

## Running the Application

1. Start the Backend Server
```bash
cd backend
npm run dev
```

2. Start the Frontend Development Server
```bash
cd frontend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## API Endpoints

### Public Routes
- POST `/api/auth/register` - User registration
- POST `/api/auth/login` - User login
- POST `/api/auth/verify-email` - Email verification
- POST `/api/auth/forgot-password` - Password reset request
- POST `/api/auth/reset-password` - Password reset

### Protected Routes
- GET `/api/auth/check-auth` - Check authentication status
- POST `/api/auth/logout` - User logout

## Security Features

- Password Hashing
- JWT Token Authentication
- HTTP-only Cookies
- CORS Protection
- Input Validation
- Rate Limiting
- XSS Protection
- CSRF Protection

## Future Enhancements

- Two-factor Authentication
- Social Login Integration
- User Profile Management
- Role-based Access Control
- Advanced Logging System
- Session Management
- Account Deletion
- Profile Picture Upload

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.