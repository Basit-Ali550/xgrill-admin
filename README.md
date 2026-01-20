This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Project Overview

The **Grill-X Admin Panel** is a comprehensive dashboard for managing the Grill-X restaurant operations. It provides real-time updates for orders, inventory management, and product control.

### Key Features

1.  **Real-Time Dashboard**:
    - Visual statistics for Total Orders, Pending Orders, Total Products, and Low Stock Items.
    - Live order feeds with "Pending", "Accepted", "Preparing", etc., statuses.
    - Automatic notifications (sound + visual) for new events.
2.  **Order Management**:
    - View and update order statuses.
    - Real-time synchronization with the mobile app and backend.
3.  **Inventory & Product Management**:
    - Add, edit, and delete products.
    - Track stock levels with low-stock alerts.
    - Manage product categories (Burgers, Steaks, Pizza, etc.).
4.  **Authentication**:
    - **Server Actions**: Uses Next.js Server Actions for secure login.
    - **Cookies**: Authentication state is managed via secure HTTP-only cookies.
    - **Context**: `AuthContext` is minimized, primarily used for client-side UI state.
    - **Socket**: Token-based socket authentication.

## Project Structure & Customizations

### Core Directories

- **`src/app`**: Contains the application routes and pages.
  - `src/app/actions`: **(New)** Server Actions for secure backend interactions.
    - `auth.js`: Handles login/logout logic server-side.
    - `products.js`: Handles product creation server-side.
  - `src/app/dashboard`: The main dashboard area.
    - `page.js`: Main stats overview and recent activity.
    - `orders/`: Orders management page.
    - `products/`: Product management page.
    - `inventory/`: Inventory tracking page.
  - `src/app/login`: Authentication page (uses `loginAction`).
- **`src/components`**: Reusable UI components.
  - **Structure**:
    - `Header.jsx`: Top navigation bar with title.
    - `Sidebar.jsx`: Side navigation menu with active state styling and socket connection status.
  - **Products**:
    - `products/AddProductModal.jsx`: Formik-based modal. Uses `createProductAction` for secure submission.
  - **UI Library (`src/components/ui`)**:
    - `button.jsx`: Styled button component with variants.
    - `input.jsx`: Text input component.
    - `select.jsx`: Dropdown select component.
    - `modal.jsx`: Reusable modal wrapper with animations.
    - `form-components.jsx`: Wrappers (`FormInput`, `FormSelect`, `FormTextarea`) integrating Formik validation display.
    - `badge.jsx`, `card.jsx`, `label.jsx`: Display components.
- **`src/context`**:
  - `SocketContext.jsx`: Manages Socket.io connection, handles real-time events (connect/disconnect), and plays notification sounds.
- **`src/hooks`**: Custom React hooks for data fetching and logic.
  - `useOrders.js`: Fetches and manages order state.
  - `useInventory.js`: Manages stock levels and low-stock logic.
  - `useProducts.js`: Handles product CRUD operations.
- **`src/lib`**:
  - `validations.js`: Yup validation schemas for forms (e.g., `productSchema`).

### Technologies Used

- **Framework**: Next.js 13+ (App Router)
- **Data Mutation**: Server Actions (`use server`)
- **Styling**: Tailwind CSS & Vanilla CSS (in global styles/JSX)
- **Forms**: Formik + Yup
- **Real-time**: Socket.io Client
- **Icons**: Lucide React / Emoji-based UI

* **Forms**: Formik + Yup
* **Real-time**: Socket.io Client
* **Icons**: Lucide React / Emoji-based UI

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
