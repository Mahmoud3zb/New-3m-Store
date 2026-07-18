# 🛒 3M Store — Premium Boutique E-Commerce Platform

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-blue.svg?style=flat-square&color=black)](https://nodejs.org/)
[![Vite Version](https://img.shields.io/badge/vite-%5E5.0.0-purple.svg?style=flat-square&color=646CFF)](https://vitejs.dev/)
[![React Version](https://img.shields.io/badge/react-%5E18.0.0-blue.svg?style=flat-square&color=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/typescript-%5E5.0.0-blue.svg?style=flat-square&color=3178C6)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/tailwindcss-%5E3.0.0-cyan.svg?style=flat-square&color=38BDF8)](https://tailwindcss.com/)

A premium, full-stack boutique e-commerce solution built with a decoupled monorepo architecture. Featuring a robust Node/Express/TypeScript backend, MongoDB database, secure Stripe integration, and an asymmetrical, minimalist Vite-powered React frontend optimized with high-converting UX features.

---

## 🌟 Advanced High-Converting UX Features

### 1. 📐 Interactive Size Guide Modal
* **Dynamic Highlight:** Automatically detects the user's selected size on the product page and highlights the corresponding measurements row in solid black.
* **Bi-directional Support:** Seamlessly localized with RTL/LTR responsive table alignments.

### 2. 🎟️ Promo Code Discount System
* **Client-Side Validation & Calculations:** Supports dynamic promo codes like `WELCOME10` (10% off), `3M20` (20% off), and `FREE50` (flat 50 EGP discount).
* **Live Price Recalculation:** Instantly updates subtotal, discount values (in red), and total checkout prices with interactive close buttons to dismiss applied tags.

### 3. 💬 Floating WhatsApp Support Widget
* **Context-Aware Message Routing:** Automatically queries React Query's cache memory to grab product details (`name`, `price`, `page URL`) and construct a pre-filled, personalized support chat link with zero extra API network requests.
* **Adaptive Spacing:** Offsets dynamically to `bottom-24` on mobile screens to float cleanly above the bottom navigation bar.

### 4. 🔍 Instant Autocomplete Search
* **Debounced Input:** Restricts server requests using a 300ms input debounce mechanism.
* **Click-Outside Dismissal:** Features document event listeners that safely close suggestions when users click away.
* **Full-Screen Mobile Overlay:** Redesigned center mobile FAB button with a cutout effect that opens a full-screen search deck with live suggestions.

### 5. 📈 Dynamic SEO & Social Sharing
* **Dynamic Document Headers**: Powered by `react-helmet-async` to dynamically inject and update OpenGraph and Meta tags for specific pages.
* **Structured Preview Cards**: Allows sharing product links directly to WhatsApp, Facebook, or Twitter with interactive previews displaying product cover image, price, and descriptive meta descriptions.

---

## 📂 Repository Structure

The project is organized into two main workspaces:

```bash
3m-store/
├── 3m-backend/          # Node.js + Express + TypeScript Backend
│   ├── src/
│   │   ├── auth/        # Authentication routes & controllers (Local & Google OAuth)
│   │   ├── cart/        # Cart management
│   │   ├── category/    # Product category CRUD operations
│   │   ├── middlewares/ # Express middlewares (Auth, Upload, Validation)
│   │   ├── order/       # Order tracking and creation
│   │   ├── payment/     # Stripe payments and webhooks
│   │   ├── product/     # Product inventory management
│   │   ├── review/      # Product reviews & ratings
│   │   └── user/        # User profile & wishlist management
│   ├── index.ts         # Server entry point
│   ├── tsconfig.json    # TypeScript configurations
│   └── package.json     # Node dependencies & scripts
└── 3m-frontend/         # Vite-powered Frontend Application
    ├── src/
    │   ├── components/  # Core shared layouts (Navbar, Footer, MobileNav)
    │   ├── features/    # Feature-based views (Cart, Checkout, Products, Auth)
    │   ├── lib/         # i18n Translations dictionaries
    │   ├── services/    # Axios API service integrations
    │   └── store/       # Zustand State Management stores
```

---

## ⚡ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React, Vite, Tailwind CSS, Zustand, React Query (TanStack), Axios, Lucide Icons, React Hot Toast, React Helmet Async |
| **Backend** | Node.js, Express.js (v5), TypeScript, MongoDB via Mongoose, Multer + Cloudinary, Winston Logger, Express Rate Limit |
| **Services & API** | Stripe Payments, Google OAuth, Nodemailer (Gmail SMTP), Vercel |

---

## 🚀 Getting Started

### 📋 Prerequisites
* [Node.js](https://nodejs.org/) (v18+ recommended)
* [MongoDB](https://www.mongodb.com/) (Local server or MongoDB Atlas cluster)
* [Stripe Account & CLI](https://stripe.com/docs/stripe-cli) (For local payment webhook verification)

---

### 🔧 1. Backend Setup

1. **Navigate to the backend directory**:
   ```bash
   cd 3m-backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   Create a `.env` file in the root of `3m-backend/`:
   ```env
   PORT=3000
   DB_URL=mongodb://localhost:27017
   DB_NAME=3m-store

   # Authentication
   JWT_SECRET=your_jwt_secret_here

   # Google OAuth
   GOOGLE_CLIENT_ID=your_google_client_id_here

   # Email Settings
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_gmail_app_password_here

   # Cloudinary File Storage
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret

   # Stripe Payment Settings
   STRIPE_SECRET_KEY=your_stripe_secret_key
   STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```
   The backend will start running at `http://localhost:3000`.

---

### 💻 2. Frontend Setup

1. **Navigate to the frontend directory**:
   ```bash
   cd 3m-frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   Create a `.env` file in the root of `3m-frontend/`:
   ```env
   VITE_API_URL=http://localhost:3000/api
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```
   The frontend application will start running at `http://localhost:5173`.

---

## 🔒 Security, Reliability & Middleware Features

* **Double-Tiered API Rate Limiting**: Features endpoint limiters via `express-rate-limit` allowing 200 requests/15 mins on general routes, and a strict 20 requests/15 mins limit on authentication & coupon routes to block brute-force.
* **ACID Transactions**: MongoDB sessions protect e-commerce checkouts by dynamically managing size and color inventory modifications in a transactional bubble, reverting stock mutations if any step fails.
* **Enterprise Log Auditing**: Implements `winston` logging streaming runtime activity to `logs/combined.log` and unexpected exceptions to `logs/error.log`.
* **Secure Auth State:** Credentials and sessions are authorized via secure `httpOnly` cookies using JSON Web Tokens (JWT).
* **Cryptographic Signatures:** Stripe webhook responses are cryptographically verified to block mock payment requests.
* **Auto-upload Pipelines:** Multipart uploads are sent directly to Cloudinary storage via custom `multer-storage-cloudinary` configs.
* **Data Validation:** Route payloads are validated at runtime using `express-validator` schema rules.
