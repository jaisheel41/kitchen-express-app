# Kitchen Express - Cloud Kitchen Management System

A comprehensive, mobile-first web application designed to streamline operations for cloud kitchens. Built with modern web technologies, Kitchen Express helps manage orders, menu items, expenses, and generate reports - all optimized for easy use on mobile devices.

## 📖 About

Kitchen Express was created to simplify daily operations for cloud kitchen businesses. The application focuses on making order management, payment tracking, and financial reporting as intuitive and fast as possible, especially for users who primarily work on mobile devices.

### The Idea

Traditional kitchen management systems are often complex, desktop-focused, and not optimized for the fast-paced environment of a cloud kitchen. Kitchen Express was designed from the ground up to be:

- **Mobile-first**: Every feature is optimized for touch and mobile screens
- **Fast**: Quick order creation, status updates, and payment tracking
- **Simple**: Intuitive interface that doesn't require training
- **Complete**: All essential features in one place - orders, menu, expenses, and reports

### How It Evolved

The project started as a solution to manage daily kitchen operations more efficiently. Key requirements included:
- Quick order entry with minimal typing
- Real-time order status tracking
- Easy payment method management (COD/UPI)
- Daily order number reset (starting from 1 each day)
- Thermal receipt printing
- Expense tracking for profit calculation
- Simple reporting for daily operations

## 🚀 Technologies Used

### Frontend
- **Next.js 15+** - React framework with App Router for server-side rendering and routing
- **React 19** - UI library for building interactive components
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework for styling
- **shadcn/ui** - High-quality component library built on Radix UI
- **Lucide React** - Icon library

### Backend & Database
- **Supabase** - Backend-as-a-Service providing:
  - PostgreSQL database
  - Authentication
  - Real-time capabilities
  - Row Level Security (RLS)

### Key Libraries
- **@supabase/ssr** - Server-side rendering support for Supabase
- **@supabase/supabase-js** - Supabase JavaScript client
- **next-themes** - Theme management (light mode only)
- **class-variance-authority** - Component variant management

## ✨ Main Features

### 1. Today's Orders Dashboard (`/today`)
- **Active Orders**: View all orders due today with real-time status updates
- **Status Management**: Quick status progression (New → Preparing → Completed)
- **Payment Tracking**: Mark orders as paid/unpaid with payment method (COD/UPI)
- **Completed Section**: Collapsible section showing completed and paid orders
- **Quick Actions**: Fast payment updates and status changes

### 2. Order Management

#### Create New Order (`/orders/new`)
- **Customer Management**: Search by address (primary) or phone number
- **Smart Customer Lookup**: Automatically finds existing customers or creates new ones
- **Menu Integration**: Category-based menu item selection for faster ordering
- **Custom Items**: Add items not in the menu
- **Order Types**: ASAP, Scheduled, or Prebook orders
- **Flexible Pricing**: Delivery fees and discounts
- **Auto-print Receipt**: Automatically opens print dialog after order creation

#### Order History (`/orders`)
- **Search**: Find orders by order number or customer phone
- **Advanced Filters**: 
  - Date range (due date)
  - Order status (new, preparing, completed, cancelled)
  - Payment method (COD/UPI)
  - Payment status (paid/unpaid)
- **Pagination**: Efficient browsing through large order lists
- **Quick Navigation**: Click any order to view details

#### Order Details (`/orders/[id]`)
- **Complete Order Information**: View all order details, items, and customer info
- **Status Updates**: Change order status with one click
- **Payment Management**: Set payment method and toggle payment status
- **Item Management**: Add, edit, or remove items from orders
- **Notes**: View and edit order notes

### 3. Menu Management (`/menu`)
- **Categories**: Organize menu items by categories
- **Item Management**: Add, edit, activate/deactivate menu items
- **Category-based View**: Hide items until category is selected (cleaner mobile UI)
- **Search**: Quick search across all menu items
- **Pricing**: Easy price updates

### 4. Expense Tracking (`/expenses`)
- **Quick Add**: Fast expense entry with date, category, amount, payment method, and notes
- **Category Management**: Common categories plus custom categories
- **Filters**: Filter by date range and category
- **Edit & Delete**: Full CRUD operations for expenses
- **Payment Methods**: Track expenses by Cash or UPI

### 5. Reports (`/reports`)
- **Date Range Options**: 
  - Today
  - Last 7 days
  - This month
  - Custom date range
- **Key Metrics**:
  - Sales total (completed orders)
  - Orders count
  - Average order value
  - COD total
  - UPI total
  - Expenses total
  - Profit estimate (Sales - Expenses)
- **Breakdowns**:
  - Sales by day (daily revenue chart)
  - Expenses by category (category-wise spending)

### 6. Receipt Printing (`/print/order/[id]`)
- **Thermal Receipt**: Optimized for 58mm thermal printers
- **Auto-print**: Automatically triggers print dialog after order creation
- **Complete Information**: Order details, items with individual prices, customer info
- **Business Details**: Logo, address, and contact information
- **Print-friendly**: Clean, monochrome design perfect for thermal printing

### 7. Authentication
- **Secure Login**: Email/password authentication via Supabase
- **Protected Routes**: All pages require authentication
- **Session Management**: Persistent login sessions

## 📁 Project Structure

```
kitchen-express-app/
├── app/                          # Next.js App Router pages
│   ├── (app)/                    # App route group
│   ├── auth/                     # Authentication pages
│   │   ├── login/
│   │   ├── sign-up/
│   │   ├── forgot-password/
│   │   └── ...
│   ├── expenses/                 # Expense management
│   │   ├── page.tsx              # Server component
│   │   ├── expenses-client.tsx  # Client component
│   │   └── actions.ts            # Server actions
│   ├── menu/                     # Menu management
│   │   ├── page.tsx
│   │   ├── menu-client.tsx
│   │   └── actions.ts
│   ├── orders/                   # Order management
│   │   ├── page.tsx              # Order history
│   │   ├── orders-client.tsx
│   │   ├── new/                  # Create new order
│   │   │   ├── page.tsx
│   │   │   ├── order-form.tsx
│   │   │   └── actions.ts
│   │   └── [id]/                 # Order details
│   │       ├── page.tsx
│   │       ├── order-detail-client.tsx
│   │       ├── order-detail-layout.tsx
│   │       └── actions.ts
│   ├── print/                    # Receipt printing
│   │   └── order/[id]/
│   │       ├── page.tsx
│   │       ├── receipt-print.tsx
│   │       └── auto-print.tsx
│   ├── reports/                 # Reports and analytics
│   │   ├── page.tsx
│   │   └── reports-client.tsx
│   ├── today/                    # Today's orders dashboard
│   │   ├── page.tsx
│   │   ├── today-client.tsx
│   │   └── actions.ts
│   ├── layout.tsx                # Root layout
│   ├── globals.css               # Global styles
│   └── page.tsx                  # Home page (redirects)
├── components/                   # Reusable components
│   ├── ui/                       # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   └── ...
│   ├── app-nav.tsx               # Main navigation
│   └── ...
├── lib/                          # Utility libraries
│   ├── supabase/
│   │   ├── client.ts             # Client-side Supabase client
│   │   └── server.ts             # Server-side Supabase client
│   └── utils.ts                  # Utility functions
├── public/                       # Static assets
│   └── logo.jpg                  # Business logo
├── next.config.ts                # Next.js configuration
├── tailwind.config.ts            # Tailwind CSS configuration
├── tsconfig.json                 # TypeScript configuration
└── package.json                  # Dependencies and scripts
```

## 🗄️ Database Schema

The application uses Supabase (PostgreSQL) with the following main tables:

### Core Tables
- **`customers`**: Customer information (name, phone, address)
- **`menu_categories`**: Menu item categories
- **`menu_items`**: Menu items with prices and categories
- **`orders`**: Order records with customer snapshots, totals, payment info
- **`order_items`**: Individual items in each order
- **`expenses`**: Expense records with categories and payment methods

### Key Features
- **Snapshots**: Orders store customer and item snapshots for historical accuracy
- **Daily Order Numbers**: Order numbers reset daily (1, 2, 3... each day)
- **Payment Tracking**: Separate fields for payment method (COD/UPI) and payment status (paid/unpaid)
- **Soft Deletes**: Menu items use `is_active` flag instead of hard deletes

