import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

export default function Navbar() {
    const { user, isAuthenticated, logout } = useAuth();
    const { cartCount } = useCart();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="bg-blue-600 text-white shadow-lg">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    <Link to="/" className="text-2xl font-bold">
                        ISDN
                    </Link>

                    <div className="flex items-center space-x-6">
                        {isAuthenticated ? (
                            <>
                                {user?.role === 'DRIVER' ? (
                                    <Link to="/driver/dashboard" className="hover:text-blue-200 transition">
                                        Dashboard
                                    </Link>
                                ) : (
                                    <>
                                        <Link to="/products" className="hover:text-blue-200 transition">
                                            Products
                                        </Link>
                                        <Link to="/orders" className="hover:text-blue-200 transition">
                                            My Orders
                                        </Link>
                                    </>
                                )}
                                {(user?.role === 'RDC_STAFF' || user?.role === 'HO_MANAGER' || user?.role === 'ADMIN') && (
                                    <Link to="/order-management" className="hover:text-blue-200 transition">
                                        Order Management
                                    </Link>
                                )}
                                {(user?.role === 'RDC_STAFF' || user?.role === 'HO_MANAGER' || user?.role === 'ADMIN') && (
                                    <Link to="/inventory" className="hover:text-blue-200 transition">
                                        Inventory
                                    </Link>
                                )}
                                {(user?.role === 'LOGISTICS_OFFICER' || user?.role === 'DRIVER' || user?.role === 'HO_MANAGER' || user?.role === 'ADMIN') && (
                                    <Link to="/deliveries" className="hover:text-blue-200 transition">
                                        Deliveries
                                    </Link>
                                )}
                                {(user?.role === 'HO_MANAGER' || user?.role === 'ADMIN') && (
                                    <Link to="/drivers" className="hover:text-blue-200 transition">
                                        Drivers
                                    </Link>
                                )}
                                {user?.role !== 'DRIVER' && (
                                    <Link to="/cart" className="relative hover:text-blue-200 transition">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                        {cartCount > 0 && (
                                            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                                {cartCount}
                                            </span>
                                        )}
                                    </Link>
                                )}
                                <div className="flex items-center space-x-4">
                                    <span className="text-sm">
                                        {user?.username}
                                    </span>
                                    <button
                                        onClick={handleLogout}
                                        className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded transition"
                                    >
                                        Logout
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="hover:text-blue-200 transition">
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    className="bg-white text-blue-600 px-4 py-2 rounded hover:bg-blue-50 transition"
                                >
                                    Register
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
