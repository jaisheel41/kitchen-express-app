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

## 🛠️ Setup Instructions

### Prerequisites
- **Node.js** 18+ and **pnpm** (or npm/yarn)
- **Supabase Account** (free tier works fine)
- **Git** (for cloning the repository)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd kitchen-express-app
```

### 2. Install Dependencies
```bash
pnpm install
# or
npm install
# or
yarn install
```

### 3. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Project Settings → API
3. Copy your project URL and anon key

### 4. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 5. Set Up Database Schema

Run the following SQL in your Supabase SQL Editor:

```sql
-- Create customers table
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT UNIQUE,
  address TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create menu_categories table
CREATE TABLE menu_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create menu_items table
CREATE TABLE menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  category_id UUID REFERENCES menu_categories(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create orders table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number INTEGER NOT NULL,
  order_type TEXT NOT NULL CHECK (order_type IN ('asap', 'scheduled', 'prebook')),
  due_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'preparing', 'completed', 'cancelled')),
  customer_id UUID REFERENCES customers(id),
  customer_name_snapshot TEXT NOT NULL,
  customer_phone_snapshot TEXT,
  customer_address_snapshot TEXT,
  notes TEXT,
  subtotal DECIMAL(10, 2) NOT NULL,
  delivery_fee DECIMAL(10, 2) DEFAULT 0,
  discount DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL,
  payment_method TEXT CHECK (payment_method IN ('cod', 'upi')),
  payment_status TEXT NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('paid', 'unpaid')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create order_items table
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES menu_items(id),
  item_name_snapshot TEXT NOT NULL,
  unit_price_snapshot DECIMAL(10, 2) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  line_total DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create expenses table
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_date DATE NOT NULL,
  category TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'upi')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_orders_due_at ON orders(due_at);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_expenses_expense_date ON expenses(expense_date);
```

### 6. Set Up Row Level Security (RLS)

Enable RLS and create policies in Supabase SQL Editor:

```sql
-- Enable RLS on all tables
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- Create policies (adjust based on your auth setup)
-- For authenticated users, allow all operations
CREATE POLICY "Allow authenticated users full access" ON customers
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users full access" ON menu_categories
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users full access" ON menu_items
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users full access" ON orders
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users full access" ON order_items
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users full access" ON expenses
  FOR ALL USING (auth.role() = 'authenticated');
```

## 🚀 Running the Application

### Development Mode
```bash
pnpm dev
# or
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:3000`

### Production Build
```bash
pnpm build
pnpm start
# or
npm run build
npm start
```

## 📱 Usage Guide

### First Time Setup
1. Sign up for an account at `/auth/sign-up`
2. Log in at `/auth/login`
3. Set up your menu:
   - Go to `/menu`
   - Create categories (e.g., "Main Course", "Desserts")
   - Add menu items with prices

### Daily Workflow
1. **Start the Day**: Open `/today` to see today's orders
2. **Create Orders**: Use `/orders/new` to add new orders
   - Enter customer address (primary identifier)
   - Select items from menu or add custom items
   - Set delivery time and fees
   - Receipt will auto-print after creation
3. **Track Orders**: On `/today` page:
   - Update order status as you prepare
   - Mark payments when received (COD/UPI)
   - View completed orders in collapsible section
4. **Record Expenses**: Use `/expenses` to track daily costs
5. **Review Reports**: Check `/reports` for daily/weekly/monthly insights

### Key Features to Know
- **Order Numbers**: Reset daily (starts from 1 each day)
- **Customer Search**: Search by address first, then phone
- **Payment Tracking**: Set payment method when payment is received, not during order creation
- **Receipt Printing**: Automatically opens after order creation
- **Mobile Optimized**: All features work seamlessly on mobile devices

## 🎨 Design Philosophy

- **Mobile-First**: Every screen is designed for mobile use first
- **Touch-Friendly**: Large buttons, easy-to-tap areas
- **Fast**: Minimal clicks to complete common tasks
- **Visual**: Color-coded statuses, clear badges, intuitive icons
- **Simple**: No unnecessary complexity, focus on essential features

## 🔒 Security

- All routes are protected by authentication
- Row Level Security (RLS) enabled on all database tables
- Server-side data fetching for sensitive operations
- Client-side validation with server-side verification

## 📝 License

[Add your license here]

## 🤝 Contributing

[Add contribution guidelines if applicable]

## 📧 Support

[Add support contact information]

---

Built with ❤️ for cloud kitchen operators who need a simple, fast, and effective management system.
