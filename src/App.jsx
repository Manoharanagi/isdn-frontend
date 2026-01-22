import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ProductList from './components/products/ProductList';
import ProductDetails from './components/products/ProductDetails';
import Cart from './components/cart/Cart';
import Checkout from './components/orders/Checkout';
import OrderList from './components/orders/OrderList';
import OrderDetails from './components/orders/OrderDetails';
import OrderManagement from './components/orders/OrderManagement';
import InventoryList from './components/inventory/InventoryList';
import DeliveryDashboard from './components/delivery/DeliveryDashboard';
import DriverManagement from './components/drivers/DriverManagement';
import DriverDashboard from './components/driver/DriverDashboard';
import DeliveryDetailView from './components/driver/DeliveryDetailView';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentCancel from './pages/PaymentCancel';

function App() {
    return (
        <Router>
            <AuthProvider>
                <CartProvider>
                    <div className="flex flex-col min-h-screen">
                        <Navbar />
                        <main className="flex-grow">
                            <ToastContainer
                                position="top-right"
                                autoClose={3000}
                                hideProgressBar={false}
                                newestOnTop={false}
                                closeOnClick
                                rtl={false}
                                pauseOnFocusLoss
                                draggable
                                pauseOnHover
                                theme="light"
                            />
                            <Routes>
                                <Route path="/" element={<Navigate to="/products" replace />} />
                                <Route path="/login" element={<Login />} />
                                <Route path="/register" element={<Register />} />

                                <Route path="/products" element={
                                    <ProtectedRoute>
                                        <ProductList />
                                    </ProtectedRoute>
                                } />

                                <Route path="/products/:id" element={
                                    <ProtectedRoute>
                                        <ProductDetails />
                                    </ProtectedRoute>
                                } />

                                <Route path="/cart" element={
                                    <ProtectedRoute>
                                        <Cart />
                                    </ProtectedRoute>
                                } />

                                <Route path="/checkout" element={
                                    <ProtectedRoute>
                                        <Checkout />
                                    </ProtectedRoute>
                                } />

                                <Route path="/orders" element={
                                    <ProtectedRoute>
                                        <OrderList />
                                    </ProtectedRoute>
                                } />

                                <Route path="/orders/:id" element={
                                    <ProtectedRoute>
                                        <OrderDetails />
                                    </ProtectedRoute>
                                } />

                                <Route path="/inventory" element={
                                    <ProtectedRoute>
                                        <InventoryList />
                                    </ProtectedRoute>
                                } />

                                <Route path="/deliveries" element={
                                    <ProtectedRoute>
                                        <DeliveryDashboard />
                                    </ProtectedRoute>
                                } />

                                <Route path="/order-management" element={
                                    <ProtectedRoute>
                                        <OrderManagement />
                                    </ProtectedRoute>
                                } />

                                <Route path="/drivers" element={
                                    <ProtectedRoute>
                                        <DriverManagement />
                                    </ProtectedRoute>
                                } />

                                <Route path="/driver/dashboard" element={
                                    <ProtectedRoute>
                                        <DriverDashboard />
                                    </ProtectedRoute>
                                } />

                                <Route path="/driver/delivery/:deliveryId" element={
                                    <ProtectedRoute>
                                        <DeliveryDetailView />
                                    </ProtectedRoute>
                                } />

                                <Route path="/payment/success" element={<PaymentSuccess />} />
                                <Route path="/payment/cancel" element={<PaymentCancel />} />
                            </Routes>
                        </main>
                        <Footer />
                    </div>
                </CartProvider>
            </AuthProvider>
        </Router>
    );
}

export default App;
