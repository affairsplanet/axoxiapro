import React, { useState } from 'react';
import { CreditCard, Smartphone } from 'lucide-react';
import PayPalButton from './PayPalButton';
import FedaPayButton from './FedaPayButton';
import { Currency } from '../types';
import { isFedaPayAvailable } from '../services/fedapayService';

interface PaymentOptionsProps {
  amount: number;
  currency: Currency;
  customer: {
    firstname: string;
    lastname: string;
    email: string;
    phone?: string;
  };
  description: string;
  onSuccess: (details: any, method: string) => void;
  onError: (error: any) => void;
  disabled?: boolean;
}

const PaymentOptions: React.FC<PaymentOptionsProps> = ({
  amount,
  currency,
  customer,
  description,
  onSuccess,
  onError,
  disabled = false
}) => {
  const [selectedMethod, setSelectedMethod] = useState<'paypal' | 'fedapay' | null>(null);

  const showFedaPay = isFedaPayAvailable() && (currency.code === 'XOF' || currency.code === 'EUR');
  const showPayPal = currency.code !== 'XOF'; // PayPal doesn't support XOF directly

  if (!showFedaPay && !showPayPal) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-800 text-sm">No payment methods available for this currency.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Choose Payment Method</h3>
      
      {!selectedMethod && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {showPayPal && (
            <button
              onClick={() => setSelectedMethod('paypal')}
              disabled={disabled}
              className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <h4 className="font-medium text-gray-900">PayPal</h4>
                <p className="text-sm text-gray-600">Pay with PayPal or credit card</p>
              </div>
            </button>
          )}

          {showFedaPay && (
            <button
              onClick={() => setSelectedMethod('fedapay')}
              disabled={disabled}
              className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center">
                <Smartphone className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <h4 className="font-medium text-gray-900">FedaPay</h4>
                <p className="text-sm text-gray-600">Mobile money & local payments</p>
              </div>
            </button>
          )}
        </div>
      )}

      {selectedMethod === 'paypal' && (
        <div className="space-y-4">
          <button
            onClick={() => setSelectedMethod(null)}
            className="text-sm text-gray-600 hover:text-gray-800"
          >
            ← Back to payment methods
          </button>
          <PayPalButton
            amount={amount}
            currency={currency}
            onSuccess={(details) => onSuccess(details, 'paypal')}
            onError={onError}
            disabled={disabled}
          />
        </div>
      )}

      {selectedMethod === 'fedapay' && (
        <div className="space-y-4">
          <button
            onClick={() => setSelectedMethod(null)}
            className="text-sm text-gray-600 hover:text-gray-800"
          >
            ← Back to payment methods
          </button>
          <FedaPayButton
            amount={amount}
            currency={currency}
            customer={customer}
            description={description}
            onSuccess={(transactionId) => onSuccess({ transactionId }, 'fedapay')}
            onError={onError}
            disabled={disabled}
          />
        </div>
      )}
    </div>
  );
};

export default PaymentOptions;