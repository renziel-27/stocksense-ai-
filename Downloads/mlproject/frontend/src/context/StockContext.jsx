import React, { createContext, useContext, useState, useEffect } from 'react';

const StockContext = createContext();

export const StockProvider = ({ children }) => {
  const [symbol, setSymbol] = useState(() => {
    return localStorage.getItem('lastStockSymbol') || 'RELIANCE.NS';
  });
  const [period, setPeriod] = useState('1y');

  useEffect(() => {
    localStorage.setItem('lastStockSymbol', symbol);
  }, [symbol]);

  return (
    <StockContext.Provider value={{
      symbol, setSymbol,
      period, setPeriod
    }}>
      {children}
    </StockContext.Provider>
  );
};

export const useStockContext = () => useContext(StockContext);
