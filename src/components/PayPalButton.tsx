import React from 'react';
import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js';
import { Currency } from '../types';

interface PayPalButtonProps {
  amount: number;
  currency: Currency;
  onSuccess: (details: any) => void;
  onError: (error: any) => void;
  disabled?: boolean;
}

const PayPalButton: React.FC<PayPalButtonProps> = ({ 
  amount, 
  currency, 
  onSuccess, 
  onError, 
  disabled = false 
}) => {
  const paypalOptions = {
    "client-id": import.meta.env.VITE_PAYPAL_CLIENT_ID || "",
    currency: currency.code === 'XOF' ? 'EUR' : currency.code, // PayPal doesn't support XOF directly
    intent: "capture"
  };

  if (!import.meta.env.VITE_PAYPAL_CLIENT_ID) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-800 text-sm">PayPal is not configured. Please contact support.</p>
      </div>
    );
  }

  // Convert XOF to EUR for PayPal if needed
  const paypalAmount = currency.code === 'XOF' ? (amount / currency.rate).toFixed(2) : amount.toFixed(2);
  const paypalCurrency = currency.code === 'XOF' ? 'EUR' : currency.code;

  return (
    <PayPalScriptProvider options={paypalOptions}>
      <PayPalButtons
        disabled={disabled}
        style={{
          layout: "vertical",
          color: "purple",
          shape: "rect",
          label: "paypal"
        }}
        createOrder={(data, actions) => {
          return actions.order.create({
            purchase_units: [{
              amount: {
                currency_code: paypalCurrency,
                value: paypalAmount
              },
              description: "Axoxia Shipping Service"
            }]
          });
        }}
        onApprove={async (data, actions) => {
          try {
            const details = await actions.order?.capture();
            onSuccess(details);
          } catch (error) {
            onError(error);
          }
        }}
        onError={onError}
      />
    </PayPalScriptProvider>
  );
};

export default PayPalButton;