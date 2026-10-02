import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CartProvider } from './features/cart/CartContext';
import { AuthProvider } from './features/auth/AuthContext';
import ProtectedRoute from './features/auth/ProtectedRoute';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Pages
import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import ProductPage from './pages/ProductPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import AccountPage from './pages/AccountPage';
import OrderDetailsPage from './pages/OrderDetailsPage';
import AboutPage from './pages/AboutPage';
import LoginPage from './pages/LoginPage';

export default function App() {
  return (
    <BrowserRouter>
      {/* 
        AuthProvider and CartProvider wrap the entire app so the signed-in
        user and cart state are accessible from any page or component (like the Navbar).
      */}
      <AuthProvider>
      <CartProvider>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          
          <div className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/shop" element={<ShopPage />} />
              <Route path="/shop/:slug" element={<ProductPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/login" element={<LoginPage />} />

              {/* Pages below require sign-in */}
              <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
              <Route path="/account" element={<ProtectedRoute><AccountPage /></ProtectedRoute>} />
              <Route path="/account/orders/:id" element={<ProtectedRoute><OrderDetailsPage /></ProtectedRoute>} />
              <Route path="/about" element={<AboutPage />} />
            </Routes>
          </div>
          
          <Footer />
        </div>
      </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
