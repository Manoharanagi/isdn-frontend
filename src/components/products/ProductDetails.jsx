import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import * as productService from '../../services/productService';
import { useCart } from '../../context/CartContext';
import { BACKEND_URL } from '../../services/api';
import Loader from '../common/Loader';

export default function ProductDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [addingToCart, setAddingToCart] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        loadProduct();
    }, [id]);

    const loadProduct = async () => {
        try {
            setLoading(true);
            const data = await productService.getProductById(id);
            setProduct(data);
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to load product' });
            console.error('Error loading product:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = async () => {
        try {
            setAddingToCart(true);
            await addToCart(product.productId, quantity);
            toast.success(`Added ${quantity} ${product.name} to cart!`);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to add to cart');
        } finally {
            setAddingToCart(false);
        }
    };

    if (loading) return <Loader />;
    if (!product) return <div>Product not found</div>;

    return (
        <div className="container mx-auto px-4 py-8">
            <nav className="flex mb-8 text-sm text-gray-600">
                <button onClick={() => navigate('/products')} className="hover:text-blue-600">
                    Products
                </button>
                <span className="mx-2">/</span>
                <span className="text-gray-900">{product.name}</span>
            </nav>

            {message.text && (
                <div className={`mb-6 p-4 rounded border ${
                    message.type === 'success'
                        ? 'bg-green-100 border-green-400 text-green-700'
                        : 'bg-red-100 border-red-400 text-red-700'
                }`}>
                    {message.text}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-gray-50 rounded-xl p-6 flex items-center justify-center">
                    <img
                        src={product.imageUrl ? `${BACKEND_URL}${product.imageUrl}` : '/placeholder-product.png'}
                        alt={product.name}
                        className="max-w-full max-h-96 object-contain rounded-lg"
                        onError={(e) => e.target.src = '/placeholder-product.png'}
                    />
                </div>

                <div>
                    <span className="inline-block bg-gray-200 text-gray-700 text-sm px-3 py-1 rounded-full mb-4">
                        {product.category.replace('_', ' ')}
                    </span>

                    <h1 className="text-3xl font-bold text-gray-900 mb-4">
                        {product.name}
                    </h1>

                    <p className="text-sm text-gray-500 mb-4">
                        SKU: {product.sku}
                    </p>

                    <div className="mb-6">
                        <span className="text-4xl font-bold text-blue-600">
                            Rs. {product.unitPrice.toFixed(2)}
                        </span>
                        <span className="text-gray-500 ml-2">per unit</span>
                    </div>

                    <div className="mb-6">
                        {product.available ? (
                            <div className="flex items-center text-green-600">
                                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <span className="font-semibold">In Stock</span>
                                <span className="ml-2 text-gray-600">
                                    ({product.totalStock} units available)
                                </span>
                            </div>
                        ) : (
                            <div className="flex items-center text-red-600">
                                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                                <span className="font-semibold">Out of Stock</span>
                            </div>
                        )}
                    </div>

                    <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-2">Description</h3>
                        <p className="text-gray-700 leading-relaxed">
                            {product.description}
                        </p>
                    </div>

                    {product.available && (
                        <div className="border-t pt-6">
                            <div className="flex items-center gap-4 mb-4">
                                <label className="font-semibold text-gray-700">
                                    Quantity:
                                </label>
                                <div className="flex items-center border border-gray-300 rounded">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="px-4 py-2 hover:bg-gray-100"
                                    >
                                        -
                                    </button>
                                    <input
                                        type="number"
                                        min="1"
                                        max={product.totalStock}
                                        value={quantity}
                                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                        className="w-20 text-center border-l border-r border-gray-300 py-2"
                                    />
                                    <button
                                        onClick={() => setQuantity(Math.min(product.totalStock, quantity + 1))}
                                        className="px-4 py-2 hover:bg-gray-100"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            <button
                                onClick={handleAddToCart}
                                disabled={addingToCart}
                                className="w-full px-6 py-3 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                {addingToCart ? 'Adding...' : 'Add to Cart'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
