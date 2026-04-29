import { useEffect, useState } from 'react';
import wsService from '../services/websocket';

export const useWebSocket = (symbol) => {
  const [livePrice, setLivePrice] = useState(null);

  useEffect(() => {
    wsService.connect();
    
    if (symbol) {
      wsService.subscribe(symbol);
    }

    const unsubscribe = wsService.onMessage((dataArray) => {
      const myStock = dataArray.find(d => d.symbol === symbol);
      if (myStock) {
        setLivePrice(myStock);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [symbol]);

  return livePrice;
};
