# MSME Schemes Portal — Backend

A complete Node.js + Express + MongoDB (Mongoose) REST API backend built for the **MSME** Angular frontend
(schemes browsing, scheme matching, applications, notifications, profile, and contact form).

It replaces the frontend's `localStorage`-based `Auth`, `ApplicationService`, `NotificationService`, and
`SchemeService` with a real, validated, persistent API.

---

## 1. Tech Stack

- **Node.js** + **Express** — REST API server
- **MongoDB** + **Mongoose** — database & ODM (6 collections, see below)
- **express-validator** — request/form validation
- **JWT (jsonwebtoken)** + **bcryptjs** — authentication & password hashing
- **helmet**, **cors**, **express-mongo-sanitize**, **express-rate-limit** — security hardening
- **morgan** — request logging (dev only)

---

## 2. MongoDB Collections (6)

| Collection      | Model               | Purpose                                                              |
|------------------|---------------------|-----------------------------------------------------------------------|
| `users`          | `User.js`           | Accounts + business profile (replaces `Auth` service + `User` model)  |
| `schemes`        | `Scheme.js`         | MSME government schemes (replaces `SchemeService` hardcoded array)    |
| `applications`   | `Application.js`    | A user's application to a scheme + its stage (replaces `ApplicationService`) |
| `notifications`  | `Notification.js`   | Per-user notifications (replaces `NotificationService`)               |
| `contactmessages`| `ContactMessage.js` | Submissions from the Contact page form                                |
| `documents`      | `Document.js`       | Documents attached/required for an application (e.g. Project Report, PAN) |

Each model has Mongoose-level validation (`required`, `enum`, `match`, `minlength`/`maxlength`, custom
validators) **and** matching `express-validator` request-level validation, so bad input is rejected before
it ever reaches the database.

---

## 3. Setup

```bash
cd msme-backend
npm install
cp .env.example .env
# edit .env and set MONGO_URI, JWT_SECRET, CLIENT_ORIGIN

# Option A: local MongoDB
#   MONGO_URI=mongodb://127.0.0.1:27017/msme_portal
# Option B: MongoDB Atlas (cloud, free tier)
#   MONGO_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/msme_portal

npm run seed     # populates the `schemes` collection with the 6 starter schemes
npm run dev      # starts with nodemon on http://localhost:5000
# or: npm start
```

Health check: `GET http://localhost:5000/api/health`

### Connecting the Angular frontend

In your Angular services, replace the `localStorage` calls with `HttpClient` calls to
`http://localhost:5000/api/...` (see endpoint table below). Store the JWT returned from
`/api/auth/login` or `/api/auth/register` (e.g. in a signal + `localStorage['token']`) and send it as:

```
Authorization: Bearer <token>
```

on every protected request.

---

## 4. API Reference

All responses follow the shape:
```json
{ "success": true, "data": ... }
```
or on error:
```json
{ "success": false, "message": "...", "errors": [ { "field": "email", "message": "..." } ] }
```

### Auth (`/api/auth`) — public unless noted
| Method | Route | Description |
|---|---|---|
| POST | `/register` | Create account (name, email, phone, password, confirmPassword, business fields) |
| POST | `/login` | Login with email + password, returns JWT |
| GET | `/me` | 🔒 Get current logged-in user |

### Users (`/api/users`) — 🔒 all require login
| Method | Route | Description |
|---|---|---|
| GET | `/` | Admin only — list all users (paginated) |
| GET | `/:id` | Get a user (self or admin) |
| PUT | `/:id` | Update profile fields (self or admin) |
| DELETE | `/:id` | Delete account (self or admin) |

### Schemes (`/api/schemes`)
| Method | Route | Description |
|---|---|---|
| GET | `/` | Public — list schemes. Filters: `?authority=&category=&businessType=&search=` |
| GET | `/:id` | Public — get one scheme |
| GET | `/match/me` | 🔒 Get schemes matched to the logged-in user's profile |
| POST | `/` | 🔒 Admin only — create scheme |
| PUT | `/:id` | 🔒 Admin only — update scheme |
| DELETE | `/:id` | 🔒 Admin only — delete scheme |

### Applications (`/api/applications`) — 🔒 all require login
| Method | Route | Description |
|---|---|---|
| GET | `/` | List current user's applications (admin: `?all=true` for everyone's) |
| GET | `/:id` | Get one application (owner or admin) |
| POST | `/` | Apply to a scheme: `{ schemeId, note?, applicantDetails? }` |
| PUT | `/:id/stage` | Update application stage: `{ stage, note? }` |
| DELETE | `/:id` | Withdraw/delete an application |

### Notifications (`/api/notifications`) — 🔒 all require login
| Method | Route | Description |
|---|---|---|
| GET | `/` | List current user's notifications + unread count |
| POST | `/` | Create a notification `{ message, type?, relatedApplication? }` |
| PUT | `/mark-all-read` | Mark all as read |
| PUT | `/:id/read` | Mark one as read |
| DELETE | `/:id` | Delete a notification |

### Contact (`/api/contact`)
| Method | Route | Description |
|---|---|---|
| POST | `/` | Public — submit contact form `{ name, email, phone?, subject, message }` |
| GET | `/` | 🔒 Admin only — list messages (`?status=new`) |
| GET | `/:id` | 🔒 Admin only — get one message |
| PUT | `/:id/status` | 🔒 Admin only — update status (`new`/`in-progress`/`resolved`) |
| DELETE | `/:id` | 🔒 Admin only — delete a message |

### Documents (`/api/documents`) — 🔒 all require login
| Method | Route | Description |
|---|---|---|
| GET | `/application/:applicationId` | List documents for an application (owner or admin) |
| POST | `/` | Attach a document `{ applicationId, documentType, fileName, fileUrl }` |
| PUT | `/:id/status` | Update status (`missing`/`uploaded`/`verified`/`rejected`) |
| DELETE | `/:id` | Delete a document record |

---

## 5. Validation Rules (highlights)

- **Register**: name (2-100 chars), valid email, phone must match `^[6-9]\d{9}$` (Indian mobile),
  password ≥ 6 chars, `confirmPassword` must match `password`.
- **Login**: valid email + password ≥ 6 chars.
- **Scheme**: `schemeId` must be a unique slug; `authority` restricted to `Central`/`Tamil Nadu`;
  `businessTypes` must be a non-empty array of allowed values.
- **Application**: `schemeId` must reference a real, existing scheme; a user cannot apply twice to the
  same scheme (unique index on `user + scheme`); `stage` restricted to the 6 allowed values.
- **Contact**: message must be 10-2000 characters; phone (if given) validated the same way as registration.
- **Document**: `documentType` and `status` restricted to fixed enums; `fileUrl` must be a valid URL.

All Mongoose schemas re-enforce these same rules at the database layer as a second line of defense.

---

## 6. Project Structure

```
msme-backend/
├── config/db.js                # MongoDB connection
├── models/                     # 6 Mongoose schemas (the 6 collections)
├── middleware/                 # auth (JWT), validate, errorHandler
├── validators/                 # express-validator rule sets per resource
├── controllers/                # business logic / CRUD handlers
├── routes/                     # Express routers, mounted in server.js
├── utils/                      # asyncHandler, generateToken, seedSchemes
├── server.js                   # app entry point
├── .env.example
└── package.json
```

## 7. Notes

- The first registered admin must be created manually: register a normal user, then in `mongosh` or
  MongoDB Compass set `role: "admin"` on that user document.
- CORS is restricted to `CLIENT_ORIGIN` (defaults to the Angular dev server, `http://localhost:4200`).
- Passwords are hashed with bcrypt (10 salt rounds) and never returned in API responses.
