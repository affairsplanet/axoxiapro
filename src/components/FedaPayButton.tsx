import React, { useState } from 'react';
import { CreditCard, Loader } from 'lucide-react';
import { Currency } from '../types';
import { createFedaPayTransaction, isFedaPayAvailable } from '../services/fedapayService';

interface FedaPayButtonProps {
  amount: number;
  currency: Currency;
  customer: {
    firstname: string;
    lastname: string;
    email: string;
    phone?: string;
  };
  description: string;
  onSuccess: (transactionId: string) => void;
  onError: (error: any) => void;
  disabled?: boolean;
}

const FedaPayButton: React.FC<FedaPayButtonProps> = ({
  amount,
  currency,
  customer,
  description,
  onSuccess,
  onError,
  disabled = false
}) => {
  const [loading, setLoading] = useState(false);

  if (!isFedaPayAvailable()) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-800 text-sm">FedaPay is not available in this region.</p>
      </div>
    );
  }

  const handlePayment = async () => {
    setLoading(true);
    
    try {
      const transaction = await createFedaPayTransaction(
        amount,
        currency,
        customer,
        description,
        `${window.location.origin}/payment/success`,
        `${window.location.origin}/payment/cancel`
      );

      if (transaction) {
        // Redirect to FedaPay payment page
        window.location.href = transaction.url;
      } else {
        throw new Error('Failed to create FedaPay transaction');
      }
    } catch (error) {
      console.error('FedaPay payment error:', error);
      onError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={disabled || loading}
      className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? (
        <Loader size={20} className="animate-spin" />
      ) : (
        <CreditCard size={20} />
      )}
      <span>
        {loading ? 'Processing...' : `Pay with FedaPay (${currency.symbol}${amount.toFixed(2)})`}
      </span>
    </button>
  );
};

export default FedaPayButton;