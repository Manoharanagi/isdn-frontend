# ISDN Frontend

**IslandLink Sales Distribution Network** — React frontend for the ISDN Management System, providing dashboards and interfaces for managing sales, inventory, orders, deliveries, payments, and real-time delivery tracking.

## What I Built

A single-page application (SPA) built with React 19 and Vite, consuming the ISDN Spring Boot REST API. Key modules include:

- **Authentication** — Login and registration with JWT token management
- **Dashboard** — Sales summaries, top products, regional sales charts, driver performance, inventory overview
- **Product Management** — Browse, search, and manage products and categories
- **Cart & Orders** — Add to cart, place orders, view order history and details
- **Inventory** — Stock levels and stock movement tracking
- **Delivery Management** — View and update delivery status
- **Driver Interface** — Driver assignment and performance tracking
- **Real-time Delivery Tracking** — Live map tracking using Google Maps API
- **Payment** — PayHere payment gateway integration with success/cancel flows

## Technologies Used

| Technology | Version | Purpose |
|---|---|---|
| React | 19 | UI framework |
| Vite | 7 | Build tool & dev server |
| React Router DOM | 7 | Client-side routing |
| Axios | 1.x | HTTP client for API calls |
| Chart.js + react-chartjs-2 | 4.x | Dashboard charts and graphs |
| Google Maps API (`@react-google-maps/api`) | 2.x | Live delivery tracking map |
| Tailwind CSS | 4.x | Utility-first styling |
| React Toastify | 11.x | Toast notifications |
| ESLint | 9.x | Code linting |

## How to Run

### Prerequisites

- Node.js 18+
- npm or yarn
- ISDN backend API running at `http://localhost:8080`

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Manoharanagi/isdn-frontend.git
   cd isdn-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:5173`.

### Build for Production

```bash
npm run build
```

Output is placed in the `dist/` folder.

### Preview Production Build

```bash
npm run preview
```

## Backend

This frontend connects to the [ISDN Management System backend](https://github.com/Manoharanagi/isdn-management-system) (Spring Boot REST API running on port `8080`).

## Academic Supervision
This project was guided by Nimesha Rajakaruna as part of undergraduate coursework.

Git Hub Name - nimesharajakaruna1-beep
