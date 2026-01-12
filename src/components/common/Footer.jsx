import React from 'react';

export default function Footer() {
    return (
        <footer className="bg-gray-800 text-white py-8 mt-auto">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                        <h3 className="text-xl font-bold mb-4">ISDN</h3>
                        <p className="text-gray-400">
                            IslandLink Sales Distribution Network Management System
                        </p>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold mb-4">Quick Links</h3>
                        <ul className="space-y-2 text-gray-400">
                            <li><a href="/products" className="hover:text-white">Products</a></li>
                            <li><a href="/orders" className="hover:text-white">Orders</a></li>
                            <li><a href="/cart" className="hover:text-white">Cart</a></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold mb-4">Contact</h3>
                        <ul className="space-y-2 text-gray-400">
                            <li>Email: info@isdn.lk</li>
                            <li>Phone: +94 11 234 5678</li>
                            <li>Address: Colombo, Sri Lanka</li>
                        </ul>
                    </div>
                </div>
                <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
                    <p>&copy; 2024 ISDN. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
