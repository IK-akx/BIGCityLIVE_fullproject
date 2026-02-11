# BIG CITY LIVE – Web2 Final Project
## Project Overview

BIG CITY LIVE is a full-stack event management platform that allows users to discover, explore, and purchase tickets for city events.

The system includes:
- Public event browsing
- Secure authentication using JWT
- Role-based access control (User/Admin)
- Ticket purchasing and cancellation
- Admin event management
- Validation and global error handling
- Email notifications via SMTP

The application is built using:
- Backend: Node.js + Express + MongoDB (Atlas)
- Frontend: Vanilla HTML, CSS, JavaScript
- Authentication: JWT
- Validation: Joi
- Database ORM: Mongoose


Architecture:
Client (Frontend - Vanilla JS) -> Express REST API -> MongoDB Atlas

Frontend is served directly by Express at: http://localhost:5000

Frontend is served directly by Express at:

http://localhost:5000


## Authentication & Security

- JWT-based authentication
- Password hashing using bcrypt
- Role-based access control (RBAC)
- Protected private endpoints
- Owner check on ticket operations
- Validation using Joi
- Global error handling middleware


## User Roles
### User
Can:
- View events
- Purchase tickets
- Cancel own tickets
- Delete own tickets
- Edit profile

Cannot:
- Create/edit/delete events

### Admin

Can:
- Create events
- Edit events
- Delete events
- Manage ticket types

## Database Structure
### User Collection
```json
{
  username: String,
  email: String (unique),
  password: String (hashed),
  role: "user" | "admin",
  createdAt,
  updatedAt
}
```

### Event Collection
```json
{
  title: String,
  description: String,
  category: Enum,
  date: Date,
  location: String,
  imageUrl: String,
  ticketTypes: [
    {
      name: String,
      price: Number,
      total: Number,
      sold: Number
    }
  ],
  createdBy: ObjectId(User)
}
```

### Ticket Collection
```json
{
  user: ObjectId(User),
  event: ObjectId(Event),
  ticketType: String,
  price: Number,
  quantity: Number,
  status: "active" | "cancelled",
  createdAt
}
```

## API Endpoints

### Public
| Method | Route           | Description         |
| ------ | --------------- | ------------------- |
| POST   | /register       | Create account      |
| POST   | /login          | Login & receive JWT |
| GET    | /api/events     | Get all events      |
| GET    | /api/events/:id | Get event details   |

### Private User Endpoints
| Method | Route          | Description        |
| ------ | -------------- | ------------------ |
| GET    | /users/profile | Get current user   |
| PUT    | /users/profile | Update profile     |
| GET    | /tickets       | Get user's tickets |
| POST   | /tickets       | Purchase ticket    |
| PUT    | /tickets/:id   | Cancel ticket      |
| DELETE | /tickets/:id   | Delete ticket      |

### Admin Endpoints
| Method | Route           | Description  |
| ------ | --------------- | ------------ |
| POST   | /api/events     | Create event |
| PUT    | /api/events/:id | Update event |
| DELETE | /api/events/:id | Delete event |


## alidation & Error Handling
- Joi validation middleware
- Structured error responses:

```json
{
  "message": "Validation failed",
  "errors": [
    { "field": "email", "message": "Invalid email format" }
  ]
}
```

- Global error middleware
- 404 not found handler


## Project Requirements Coverage
| Requirement                 | Status |
| --------------------------- | ------ |
| JWT Authentication          | ✅      |
| Private Routes              | ✅      |
| Role-Based Access           | ✅      |
| CRUD Operations             | ✅      |
| Second Collection (Tickets) | ✅      |
| Validation Middleware       | ✅      |
| Global Error Handling       | ✅      |
| MongoDB Atlas               | ✅      |
| Frontend Integration        | ✅      |
| SMTP Email (planned)        | ✅      |

## Future Improvements
- Payment gateway integration
- Real-time ticket availability updates
- Email confirmation system
- Image upload via cloud storage
- Pagination for events
- Dashboard analytics for admin

## Conclusion

BIG CITY LIVE successfully demonstrates:
- Secure REST API development
- JWT-based authentication
- Role-based authorization
- Full CRUD functionality
- Clean frontend-backend integration
- Production-style architecture

This project fulfills all final project requirements and extends them with additional real-world functionality.