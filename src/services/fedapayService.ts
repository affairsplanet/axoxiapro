import axios from 'axios';
import { Currency } from '../types';

const FEDAPAY_PUBLIC_KEY = import.meta.env.VITE_FEDAPAY_PUBLIC_KEY;
const FEDAPAY_API_URL = 'https://api.fedapay.com/v1';

export interface FedaPayTransaction {
  id: string;
  amount: number;
  currency: string;
  status: string;
  reference: string;
  description: string;
  customer: {
    firstname: string;
    lastname: string;
    email: string;
    phone?: string;
  };
  callback_url?: string;
  cancel_url?: string;
}

export interface FedaPayResponse {
  transaction: FedaPayTransaction;
  token: string;
  url: string;
}

export const createFedaPayTransaction = async (
  amount: number,
  currency: Currency,
  customer: {
    firstname: string;
    lastname: string;
    email: string;
    phone?: string;
  },
  description: string,
  callbackUrl?: string,
  cancelUrl?: string
): Promise<FedaPayResponse | null> => {
  if (!FEDAPAY_PUBLIC_KEY) {
    console.error('FedaPay public key is not configured');
    return null;
  }

  try {
    // Convert amount to the smallest currency unit (cents for XOF)
    const amountInCents = Math.round(amount * 100);
    
    const response = await axios.post(
      `${FEDAPAY_API_URL}/transactions`,
      {
        description,
        amount: amountInCents,
        currency: currency.code === 'XOF' ? 'XOF' : 'EUR',
        callback_url: callbackUrl,
        cancel_url: cancelUrl,
        customer: {
          firstname: customer.firstname,
          lastname: customer.lastname,
          email: customer.email,
          phone_number: customer.phone
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${FEDAPAY_PUBLIC_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('FedaPay transaction creation failed:', error);
    return null;
  }
};

export const getFedaPayTransaction = async (transactionId: string): Promise<FedaPayTransaction | null> => {
  if (!FEDAPAY_PUBLIC_KEY) {
    console.error('FedaPay public key is not configured');
    return null;
  }

  try {
    const response = await axios.get(
      `${FEDAPAY_API_URL}/transactions/${transactionId}`,
      {
        headers: {
          'Authorization': `Bearer ${FEDAPAY_PUBLIC_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.transaction;
  } catch (error) {
    console.error('FedaPay transaction fetch failed:', error);
    return null;
  }
};

export const isFedaPayAvailable = (): boolean => {
  return !!FEDAPAY_PUBLIC_KEY;
};