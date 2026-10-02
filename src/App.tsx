import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CartProvider } from './features/cart/CartContext';
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

export default function App() {
  return (
    <BrowserRouter>
      {/* 
        CartProvider wraps the entire app so the cart state 
        is accessible from any page or component (like the Navbar).
      */}
      <CartProvider>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          
          <div className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/shop" element={<ShopPage />} />
              <Route path="/shop/:slug" element={<ProductPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/account" element={<AccountPage />} />
              <Route path="/account/orders/:id" element={<OrderDetailsPage />} />
              <Route path="/about" element={<AboutPage />} />
            </Routes>
          </div>
          
          <Footer />
        </div>
      </CartProvider>
    </BrowserRouter>
  );
}
