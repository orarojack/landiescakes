# LandyCakes - Premium Artisan Cake Marketplace

A modern e-commerce platform connecting cake lovers with talented local bakers. Built with Next.js 15, TypeScript, Prisma, and MySQL.

## 🍰 Features

### For Buyers
- **Browse Premium Cakes**: Discover handcrafted cakes from local artisan bakers
- **Advanced Search & Filtering**: Find exactly what you're looking for with powerful filters
- **User Authentication**: Secure login/signup with role-based access
- **Shopping Cart**: Add items and manage your cart seamlessly
- **Wishlist**: Save your favorite cakes for later
- **Order Management**: Track your orders from preparation to delivery
- **Reviews & Ratings**: Share your experience and help others choose

### For Sellers
- **Seller Dashboard**: Manage your bakery business with comprehensive tools
- **Product Management**: Add, edit, and manage your cake listings
- **Order Processing**: Handle incoming orders efficiently
- **Business Profile**: Showcase your bakery with detailed business information
- **Analytics**: Track your sales and performance

### For Admins
- **Admin Dashboard**: Complete platform oversight and management
- **User Management**: Manage buyers, sellers, and their permissions
- **Seller Approval**: Review and approve new bakery applications
- **Platform Analytics**: Monitor platform performance and growth

## 🚀 Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Backend**: Next.js API Routes, Server Actions
- **Database**: MySQL with Prisma ORM
- **Authentication**: NextAuth.js with credentials and Google OAuth
- **State Management**: React Context API
- **Form Handling**: React Hook Form with Zod validation
- **Image Handling**: Next.js Image optimization

## 📋 Prerequisites

Before running this project, make sure you have:

- **Node.js** (v18 or higher)
- **XAMPP** (for MySQL database)
- **Git**

## 🛠️ Installation & Setup

### 1. Clone the Repository
\`\`\`bash
git clone <repository-url>
cd landycakes
\`\`\`

### 2. Install Dependencies
\`\`\`bash
npm install
\`\`\`

### 3. Setup XAMPP MySQL Database

1. **Start XAMPP**:
   - Open XAMPP Control Panel
   - Start **Apache** and **MySQL** services

2. **Create Database**:
   - Open phpMyAdmin (http://localhost/phpmyadmin)
   - Create a new database named `landycakes`

3. **Configure Environment Variables**:
   - Copy `.env.example` to `.env`
   - Update the database connection string:
   \`\`\`env
   DATABASE_URL="mysql://root:@localhost:3306/landycakes"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-here"
   \`\`\`

### 4. Setup Database Schema
\`\`\`bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Seed database with sample data
npx tsx scripts/seed.ts
\`\`\`

### 5. Run the Development Server
\`\`\`bash
npm run dev
\`\`\`

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## 🔑 Test Accounts

After seeding the database, you can use these test accounts:

### Admin Account
- **Email**: admin@landycakes.com
- **Password**: admin123
- **Access**: Full platform management

### Seller Accounts
- **Email**: maria@sweetdreams.com
- **Password**: seller123
- **Business**: Sweet Dreams Bakery

- **Email**: david@artisancakes.com
- **Password**: seller123
- **Business**: Artisan Cake Co.

### Buyer Accounts
- **Email**: john@example.com
- **Password**: buyer123

- **Email**: alice@example.com
- **Password**: buyer123

## 📁 Project Structure

\`\`\`
cakemarket/
├── app/                    # Next.js 15 App Router
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── admin/             # Admin dashboard
│   ├── seller/            # Seller dashboard
│   ├── cakes/             # Product pages
│   └── globals.css        # Global styles
├── components/            # Reusable components
│   ├── ui/               # shadcn/ui components
│   ├── modern/           # Custom modern components
│   └── providers/        # Context providers
├── lib/                  # Utility libraries
├── hooks/                # Custom React hooks
├── types/                # TypeScript type definitions
├── prisma/               # Database schema and migrations
├── scripts/              # Database seeding scripts
└── public/               # Static assets
\`\`\`

## 🎨 Key Features Implementation

### Authentication System
- **NextAuth.js** integration with credentials and Google OAuth
- **Role-based access control** (Admin, Seller, Buyer)
- **Protected routes** and middleware
- **Password hashing** with bcryptjs

### Database Design
- **Relational database** with proper foreign keys
- **User roles and permissions**
- **Product catalog** with categories and sellers
- **Order management** system
- **Reviews and ratings** system
- **Shopping cart** and wishlist functionality

### Modern UI/UX
- **Responsive design** that works on all devices
- **Dark/light mode** support
- **Loading states** and error handling
- **Smooth animations** and transitions
- **Accessible components** following WCAG guidelines

### Performance Optimizations
- **Next.js Image optimization**
- **Server-side rendering** and static generation
- **Database query optimization**
- **Lazy loading** and code splitting

## 🔧 Available Scripts

\`\`\`bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server

# Database
npx prisma generate  # Generate Prisma client
npx prisma db push   # Push schema to database
npx prisma studio    # Open Prisma Studio
npx tsx scripts/seed.ts  # Seed database

# Code Quality
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript checks
\`\`\`

## 🌐 Deployment

### Vercel Deployment (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically on every push

### Environment Variables for Production
\`\`\`env
DATABASE_URL="your-production-mysql-url"
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="your-production-secret"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
\`\`\`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/your-repo/issues) page
2. Create a new issue with detailed information
3. Join our community discussions

## 🙏 Acknowledgments

- **shadcn/ui** for the beautiful component library
- **Vercel** for the amazing deployment platform
- **Prisma** for the excellent database toolkit
- **NextAuth.js** for authentication made simple

---

**Happy Baking! 🍰✨**
