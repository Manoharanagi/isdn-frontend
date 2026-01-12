import React from 'react';
import { Link } from 'react-router-dom';

export default function ProductCard({ product }) {
    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
            <div className="relative h-48 bg-gray-200">
                <img
                    src={product.imageUrl || '/placeholder-product.png'}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        e.target.src = '/placeholder-product.png';
                    }}
                />

                <div className="absolute top-2 right-2">
                    {product.available ? (
                        <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                            In Stock
                        </span>
                    ) : (
                        <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                            Out of Stock
                        </span>
                    )}
                </div>

                {product.promotion && (
                    <div className="absolute top-2 left-2">
                        <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">
                            {product.promotion.discountPercentage}% OFF
                        </span>
                    </div>
                )}
            </div>

            <div className="p-4">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                    {product.category.replace('_', ' ')}
                </p>

                <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
                    {product.name}
                </h3>

                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {product.description}
                </p>

                <div className="flex justify-between items-center mb-4">
                    <div>
                        <span className="text-2xl font-bold text-blue-600">
                            Rs. {product.unitPrice.toFixed(2)}
                        </span>
                    </div>
                    {product.available && (
                        <div className="text-sm text-gray-500">
                            {product.totalStock} units
                        </div>
                    )}
                </div>

                <Link
                    to={`/products/${product.productId}`}
                    className="block w-full text-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                    View Details
                </Link>
            </div>
        </div>
    );
}
