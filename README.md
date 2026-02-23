# Smart Feedback System

A full-stack responsive feedback platform with Admin and User flows.

## Tech Stack
- Frontend: React + Tailwind CSS + Recharts + QRCode
- Backend: Node.js + Express
- Database: MongoDB + Mongoose
- Auth: JWT (Admin login)

## Project Structure
```text
attempt1/
  backend/
    .env.example
    package.json
    src/
      app.js
      server.js
      config/
        db.js
      controllers/
        authController.js
        formController.js
        responseController.js
      middleware/
        auth.js
        error.js
      models/
        Admin.js
        Form.js
        Response.js
      routes/
        authRoutes.js
        formRoutes.js
        responseRoutes.js
      utils/
        analytics.js
  frontend/
    .env.example
    package.json
    index.html
    postcss.config.js
    tailwind.config.js
    vite.config.js
    src/
      main.jsx
      App.jsx
      index.css
      api/
        client.js
        services.js
      components/
        FormBuilder.jsx
        FormCard.jsx
        ReportPanel.jsx
      context/
        AuthContext.jsx
      pages/
        AdminDashboardPage.jsx
        AdminLoginPage.jsx
        NotFoundPage.jsx
        PublicFormPage.jsx
      routes/
        ProtectedRoute.jsx
```

## Features
- JWT-based secure admin login
- Admin signup (multi-user)
- Create/edit/delete forms
- Activate/deactivate form status
- Dynamic questions: text, rating (1-5), multiple choice
- Shareable public link + QR code per form
- Anonymous feedback submission
- Form closed state handling
- Summary analytics:
  - total responses
  - average rating by question
  - multiple-choice distribution
  - recent submissions
  - lowest-rated question insight
- Responsive dashboard and public form UI
- Pagination for responses
- CSV export endpoint

## Backend Setup
1. Open terminal in `backend/`
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create `.env` from `.env.example`
4. Run backend:
   ```bash
   npm run dev
   ```

Backend runs on `http://localhost:5000`.

## Frontend Setup
1. Open terminal in `frontend/`
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create `.env` from `.env.example`
4. Run frontend:
   ```bash
   npm run dev
   ```

Frontend runs on `http://localhost:5173`.

## Default Admin
On backend startup, default admin is auto-seeded using env vars:
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`

Example defaults in `.env.example`:
- `admin@example.com`
- `Admin@123`

## API Endpoints
### Auth
- `POST /api/admin/signup`
- `POST /api/admin/login`

### Forms
- `POST /api/forms` (protected)
- `GET /api/forms` (protected)
- `GET /api/forms/:id` (public)
- `PUT /api/forms/:id` (protected)
- `PATCH /api/forms/:id/status` (protected)
- `DELETE /api/forms/:id` (protected)
- `GET /api/forms/:id/summary` (protected)

### Responses
- `POST /api/responses/:formId` (public)
- `GET /api/responses/:formId?page=1&limit=10` (protected, paginated)
- `GET /api/responses/:formId?page=1&limit=100&format=csv` (protected, CSV export)

## Notes
- Ensure MongoDB is running locally or update `MONGODB_URI`.
- Keep JWT and DB credentials in environment variables.
- For production, configure strict CORS and secure secrets.
- Forms and response reports are isolated per signed-in account.
