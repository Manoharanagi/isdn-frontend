import React, { useState } from 'react';
import paymentService from '../../services/paymentService';

const PayHerePayment = ({ orderId, onError }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handlePayment = async () => {
    setLoading(true);
    setError(null);

    try {
      // Step 1: Initiate payment from backend
      const response = await paymentService.initiatePayment(orderId);

      const { paymentUrl, payhereFormData, paymentReference } = response;

      // Step 2: Store payment reference for later verification
      localStorage.setItem('pendingPaymentRef', paymentReference);

      // Step 3: Create and submit form to PayHere
      submitToPayHere(paymentUrl, payhereFormData);

    } catch (err) {
      setError(err.response?.data?.message || 'Failed to initiate payment');
      setLoading(false);
      if (onError) onError(err);
    }
  };

  const submitToPayHere = (paymentUrl, formData) => {
    // Create a hidden form
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = paymentUrl;

    // Add all form fields
    Object.entries(formData).forEach(([key, value]) => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = value;
      form.appendChild(input);
    });

    // Append to body and submit
    document.body.appendChild(form);
    form.submit();
  };

  return (
    <div className="payhere-payment">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <button
        onClick={handlePayment}
        disabled={loading}
        className="w-full px-6 py-3 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 transition disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </>
        ) : (
          <>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            Pay with PayHere
          </>
        )}
      </button>

      <p className="text-gray-500 text-sm mt-2 text-center">
        You will be redirected to PayHere secure payment page
      </p>
    </div>
  );
};

export default PayHerePayment;
