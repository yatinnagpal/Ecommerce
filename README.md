# Full Stack E-commerce App

A modern, full-stack e-commerce application built with Django REST Framework (backend) and React (frontend).

## 🚀 Features

- User Authentication & Authorization
  - User registration and login
  - Password reset functionality (token-based, no email sending)
  - Protected routes and user sessions

- Product Management
  - Browse products with pagination
  - Product details with image gallery
  - Search and filter functionality
  - Featured products carousel

- Shopping Cart & Checkout
  - Add/remove items from cart
  - Update quantities
  - Secure checkout process
  - Order management

- Payment Integration
  - Stripe payment processing
  - Secure payment handling
  - Order confirmation

- User Dashboard
  - Order history
  - Profile management
  - Billing address management

## 🛠️ Tech Stack

### Backend
- **Django 4.x** - Web framework
- **Django REST Framework** - API development
- **SQLite** - Database (development)
- **Stripe** - Payment processing
- **Python 3.12** - Programming language

### Frontend
- **React 18** - Frontend framework
- **Material-UI (MUI)** - UI component library
- **Redux** - State management
- **Axios** - HTTP client
- **React Router** - Client-side routing

## 📁 Project Structure

```
FullStack_Ecommerce_App-main/
├── backend/                 # Django backend
│   ├── account/            # User authentication & management
│   ├── product/            # Product models & APIs
│   ├── payments/           # Payment processing
│   ├── my_project/         # Django project settings
│   ├── static/             # Static files (images)
│   └── requirements.txt    # Python dependencies
├── frontend/               # React frontend
│   ├── public/            # Public assets
│   ├── src/               # Source code
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── actions/       # Redux actions
│   │   ├── reducers/      # Redux reducers
│   │   └── store.js       # Redux store
│   └── package.json       # Node.js dependencies
└── README.md              # This file
```

## 🚀 Getting Started

### Prerequisites

- Python 3.12+
- Node.js 16+
- npm or yarn
- Git

### Backend Setup

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Create virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Run migrations:
   ```bash
   python manage.py migrate
   ```

5. Create superuser (optional):
   ```bash
   python manage.py createsuperuser
   ```

6. Start development server:
   ```bash
   python manage.py runserver
   ```

   Backend will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start development server:
   ```bash
   npm start
   ```

   Frontend will be available at `http://localhost:3000`

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the backend directory for sensitive configuration:

```env
# Django Settings
SECRET_KEY=your-secret-key-here
DEBUG=True

# Stripe Configuration
STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
STRIPE_SECRET_KEY=your-stripe-secret-key
```

### Stripe Setup

1. Create a Stripe account at [stripe.com](https://stripe.com)
2. Get your API keys from the Stripe dashboard
3. Add them to your environment variables
4. Update the frontend `stripeConfig.js` with your publishable key

## 📱 API Endpoints

### Authentication
- `POST /api/account/register/` - User registration
- `POST /api/account/login/` - User login
- `POST /api/account/password-reset/` - Password reset request
- `POST /api/account/password-reset-confirm/` - Password reset confirmation

### Products
- `GET /api/product/` - List all products
- `GET /api/product/{id}/` - Get product details

### Cart & Orders
- `GET /api/account/orders/` - Get user orders
- `POST /api/payments/create-payment-intent/` - Create payment intent

## 🎨 Features Overview

### User Authentication
- Secure user registration and login
- JWT-based authentication
- Password reset with token validation (no email sending)

### Product Catalog
- Responsive product grid
- Product search and filtering
- Detailed product pages with image galleries
- Featured products carousel

### Shopping Experience
- Persistent shopping cart
- Real-time cart updates
- Secure checkout process
- Order confirmation and history

### Payment Processing
- Stripe integration for secure payments
- Payment intent creation
- Order confirmation

## 🚀 Deployment

### Backend Deployment
1. Set up a production database (PostgreSQL recommended)
2. Configure environment variables
3. Set `DEBUG=False` in production
4. Deploy to platforms like Heroku, DigitalOcean, or AWS

### Frontend Deployment
1. Build the production bundle:
   ```bash
   npm run build
   ```
2. Deploy to platforms like Netlify, Vercel, or AWS S3

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🐛 Troubleshooting

### Common Issues

1. Module not found errors: Make sure all dependencies are installed
2. Database errors: Run migrations with `python manage.py migrate`
3. CORS issues: Ensure Django CORS settings are configured
4. Stripe errors: Verify your Stripe API keys are correct




Happy Shopping! 🛒

