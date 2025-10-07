# FoodieFinds: Restaurant Showcase App

This is a full-stack React application built with a Manifest backend. It allows chefs to sign up, create their restaurant profiles, and manage their menus. Customers can browse restaurants.

## Core Features

- **User Authentication**: Secure sign-up and login for different user roles (Chef, Customer).
- **Role-Based UI**: The user interface adapts based on whether you are a Chef or a Customer. Chefs get a dashboard to manage their restaurants.
- **Restaurant Management (for Chefs)**: 
  - Create, update, and delete restaurants.
  - Upload a cover photo for each restaurant.
  - Categorize restaurants by cuisine type.
- **Menu Management (for Chefs)**: 
  - Add, update, and delete menu items for their restaurants.
  - Include photos, descriptions, prices, and categories for each item.
- **Public Restaurant Directory**: All users can view the list of restaurants.

## Backend by Manifest

This entire application is powered by Manifest, which auto-generates the database, REST API, and admin panel from a simple YAML configuration.

- **Entities**: `User`, `Restaurant`, `MenuItem`
- **Features Used**: 
  - `authenticable`: For user accounts.
  - `type: image`: For photo uploads.
  - `type: choice`: For categories like cuisine and menu type.
  - `type: money`: For handling prices.
  - `belongsTo`: To create relationships between users, restaurants, and menu items.
  - **Policies**: To ensure only chefs can create restaurants and only owners can edit their own content.

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm or yarn

### Running the Application

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Start the Development Server**:
    The application is configured to connect to the deployed Manifest backend via environment variables.
    ```bash
    npm run dev
    ```

3.  **Access the App**:
    Open your browser and navigate to `http://localhost:5173`.

### Demo Accounts

- **Chef Account**:
  - **Email**: `chef@example.com`
  - **Password**: `password`

- **Admin Panel**:
  - Access the auto-generated admin panel at the `BACKEND_URL` provided in your environment, followed by `/admin`.
  - **Admin Email**: `admin@manifest.build`
  - **Admin Password**: `admin`
