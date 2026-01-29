# Crossfit Booking Frontend

CrossFit gym booking application where users can register/login, view weekly WOD schedules, book training slots, and cancel reservations.
Administrators can manage WOD descriptions and generate weekly schedules.

The application communicates with a Spring Boot REST API secured with JWT authentication.

---

## General Requirements

- Node.js 22.19.0
- npm 11.6.0
- Angular CLI 20.3.13

---

## Tech Stack

- Angular 20.3.15
- Angular CLI 20.3.13
- Angular Router
- Angular HttpClient
- Angular Material 20.2.14
- TypeScript 5.9.3
- RxJS 7.8.2
- Zone.js 0.15.1

---

## Features

### User
- Register & Login
- View weekly WOD schedule
- Book one training slot per day
- Cancel bookings
- JWT-based authentication

### Admin
- View and manage weekly schedules
- Manage bookings
- Role-based UI access

---

## Configuration

### Environment files

API configuration is handled through Angular environment files.

#### `src/environments/environment.ts` (development example)

```ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api'
};

```


### `src/environments/environment.prod.ts (production example)

```ts

export const environment = {
  production: true,
  apiUrl: '<BACKEND_API_URL>'
};

```

## Run (Local Development)
Install dependencies

- npm install

Start development server

- ng serve

The application will be available at:

http://localhost:4200

The app automatically reloads on source code changes.
## Build
Production build

- ng build

Build artifacts will be generated in:

dist/

## Backend Integration

The frontend expects a running backend API with:

    JWT authentication

    REST endpoints under /api/**

    Swagger-documented endpoints

## Security

    JWT token stored client-side and attached via HTTP interceptor

    Route protection via Angular Guards

    Role-based UI rendering

## Deploy

Deployment steps (generic):

    Run ng build

    Deploy the contents of dist/

    Configure environment-specific API URL

## Notes

    CORS is handled on the backend

    JWT token must be provided by the backend authentication endpoints
