# Social Media App

A modern and scalable social media backend application built with advanced web technologies, providing authentication, real-time communication, and rich social features.

---
## Features

### User Management
- User registration and authentication
- Email verification and password recovery
- Profile management with image uploads
- Role-based access control (Admin, SuperAdmin, User)
- Account freeze and restore functionality

### Social Features
- Create, read, update, delete posts
- Comment system
- Friend request system
- Real-time chat using Socket.IO
- Profile and cover image uploads

### Technical Features
- RESTful API with GraphQL support
- JWT and Google OAuth authentication
- File uploads using AWS S3 and Cloudinary
- Email notifications via Nodemailer
- Security features (rate limiting, security headers)
- Data validation using Zod

---

## Tech Stack

### Backend
- Runtime: Node.js
- Framework: Express.js
- Language: TypeScript
- Database: MongoDB (Mongoose)
- Authentication: JWT, Google OAuth
- Storage: AWS S3, Cloudinary
- Real-time: Socket.IO
- API: REST + GraphQL
- Validation: Zod
- Email: Nodemailer

### Tools & Security
- TypeScript, Nodemon, Concurrently
- Helmet, CORS, Rate Limiting

---

## Prerequisites

- Node.js (v18+)
- MongoDB
- AWS S3 account
- Cloudinary account
- Google OAuth credentials (optional)

---

## Installation

### 1. Clone the repository
```bash
git clone https://github.com/salembalboul/Social_Media_App..git
cd Social_Media_App
2. Install dependencies
npm install
3. Run the application
# Development
npm run dev

# Production
npm run build
npm start
```

## Project Structure

```bash
social-media-app/
├── src/
│   ├── DB/
│   ├── middleware/
│   ├── modules/
│   │   ├── users/
│   │   ├── posts/
│   │   ├── chat/
│   │   ├── comment/
│   │   └── graphql/
│   ├── utils/
│   ├── service/
│   ├── app.controller.ts
│   └── index.ts
├── FE/
├── uploads/
├── package.json
├── tsconfig.json
└── README.md
```

## API Endpoints
```bash
Authentication
POST /signUp
POST /signIn
POST /loginWithGmail
PATCH /confirmEmail
PATCH /forgetPassword
PATCH /resetPassword
POST /logOut
GET /refreshToken

User Profile
GET /profile
PATCH /updateProfileImage
PATCH /freezeAccount/:userId
PATCH /restoreAccount/:userId
PATCH /updateRole/:userId

Social Features
PATCH /sendRequest/:sendTo
PATCH /acceptRequest/:requestId

Admin
GET /dashBoard
PATCH /updateRole/:userId
```

## Security Features
- JWT-based authentication
- Role-based authorization
- Password hashing using bcrypt
- Rate limiting and security headers
- Input validation using Zod
- Secure file upload handling
