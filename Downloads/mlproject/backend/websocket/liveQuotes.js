const WebSocket = require('ws');
const axios = require('axios');

function initWebSocket(server) {
  const wss = new WebSocket.Server({ server, path: '/ws/quotes' });
  const activeSymbols = new Set(['RELIANCE.NS']); // Default

  wss.on('connection', (ws) => {
    console.log('Client connected to live quotes WebSocket');

    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message);
        if (data.action === 'subscribe' && data.symbol) {
          activeSymbols.add(data.symbol.toUpperCase());
        } else if (data.action === 'unsubscribe' && data.symbol) {
          activeSymbols.delete(data.symbol.toUpperCase());
        }
      } catch (err) {
        console.error('WebSocket msg error:', err.message);
      }
    });

    ws.on('close', () => {
      console.log('Client disconnected from WebSockets');
    });
  });

  // Broadcast loop every 5 seconds (simulated live walk)
  // In a real app we'd fetch real-time APIs, but to avoid rate limits
  // we simulate a +/- 0.5% random walk based on last known prices
  let mockPrices = {};

  setInterval(async () => {
    if (wss.clients.size === 0) return;
    
    const payload = [];
    for (let sym of activeSymbols) {
      if (!mockPrices[sym]) {
          // Initialize mock base price to 1000 temporarily
          mockPrices[sym] = 1000.0;
      }
      
      const changePct = (Math.random() - 0.5) * 0.01; // +/- 0.5%
      const changeAmount = mockPrices[sym] * changePct;
      mockPrices[sym] += changeAmount;
      
      payload.push({
        symbol: sym,
        price: parseFloat(mockPrices[sym].toFixed(2)),
        change: parseFloat(changeAmount.toFixed(2)),
        changePct: parseFloat((changePct * 100).toFixed(2)),
        timestamp: new Date().toISOString()
      });
    }

    const msg = JSON.stringify(payload);
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(msg);
      }
    });
  }, 5000);
}

module.exports = initWebSocket;
