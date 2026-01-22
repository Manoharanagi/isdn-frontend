import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import paymentService from '../services/paymentService';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying');
  const [payment, setPayment] = useState(null);
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    verifyPayment();
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const verifyPayment = async () => {
    const paymentRef = localStorage.getItem('pendingPaymentRef');

    if (!paymentRef) {
      setStatus('error');
      setError('No pending payment found');
      return;
    }

    try {
      let attempts = 0;
      const maxAttempts = 10;

      const checkStatus = async () => {
        try {
          const response = await paymentService.getPaymentStatus(paymentRef);
          setPayment(response);

          if (response.status === 'SUCCESS') {
            setStatus('success');
            localStorage.removeItem('pendingPaymentRef');
            return true;
          } else if (response.status === 'FAILED' || response.status === 'CANCELLED') {
            setStatus('failed');
            localStorage.removeItem('pendingPaymentRef');
            return true;
          }
          return false;
        } catch (err) {
          console.error('Error checking payment status:', err);
          return false;
        }
      };

      // Initial check
      if (await checkStatus()) return;

      // Poll every 2 seconds
      intervalRef.current = setInterval(async () => {
        attempts++;
        const done = await checkStatus();
        if (done || attempts >= maxAttempts) {
          clearInterval(intervalRef.current);
          if (attempts >= maxAttempts && status === 'verifying') {
            setStatus('pending');
          }
        }
      }, 2000);

    } catch (err) {
      setStatus('error');
      setError(err.response?.data?.message || 'Failed to verify payment');
    }
  };

  const renderContent = () => {
    switch (status) {
      case 'verifying':
        return (
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <svg className="animate-spin h-12 w-12 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <h4 className="text-xl font-semibold text-gray-900 mb-2">Verifying Payment...</h4>
            <p className="text-gray-500">Please wait while we confirm your payment</p>
          </div>
        );

      case 'success':
        return (
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <svg className="h-16 w-16 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h4 className="text-xl font-semibold text-green-600 mb-2">Payment Successful!</h4>
            <p className="text-gray-500 mb-4">Your order has been confirmed</p>
            {payment && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                <p className="mb-2"><span className="font-medium">Payment Reference:</span> {payment.paymentReference}</p>
                <p className="mb-2"><span className="font-medium">Amount:</span> {payment.currency} {payment.amount?.toFixed(2)}</p>
                <p><span className="font-medium">Order:</span> {payment.orderNumber}</p>
              </div>
            )}
            <button
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
              onClick={() => navigate('/orders')}
            >
              View My Orders
            </button>
          </div>
        );

      case 'failed':
        return (
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <svg className="h-16 w-16 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h4 className="text-xl font-semibold text-red-600 mb-2">Payment Failed</h4>
            <p className="text-gray-500 mb-6">Your payment could not be processed</p>
            <button
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
              onClick={() => navigate('/orders')}
            >
              Try Again
            </button>
          </div>
        );

      case 'pending':
        return (
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <svg className="h-16 w-16 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h4 className="text-xl font-semibold text-yellow-600 mb-2">Payment Processing</h4>
            <p className="text-gray-500 mb-6">Your payment is being processed. You will receive confirmation shortly.</p>
            <button
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
              onClick={() => navigate('/orders')}
            >
              View My Orders
            </button>
          </div>
        );

      case 'error':
        return (
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <svg className="h-16 w-16 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h4 className="text-xl font-semibold text-red-600 mb-2">Error</h4>
            <p className="text-gray-500 mb-6">{error}</p>
            <button
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
              onClick={() => navigate('/')}
            >
              Go Home
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
