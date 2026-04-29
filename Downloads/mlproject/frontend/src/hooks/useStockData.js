import { useState, useCallback } from 'react';
import { fetchPrediction as predictStock } from '../services/api';
import toast from 'react-hot-toast';

export const useStockData = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPrediction = useCallback(async (symbol, period) => {
    setLoading(true);
    setError(null);
    try {
      const result = await predictStock(symbol, period);
      
      if (result.error) {
         setError(result.error);
         toast.error(result.error);
         return;
      }

      setData(result.data);
      if (result.data?.trend === 'Bullish') {
          toast.success(`Bullish trend predicted for ${symbol}`);
      } else {
          toast('Bearish trend predicted.', { icon: '📉' });
      }
    } catch (err) {
      const msg = err.message || "Failed to fetch prediction";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, fetchPrediction };
};
