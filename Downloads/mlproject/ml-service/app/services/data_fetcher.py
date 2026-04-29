import yfinance as yf
import pandas as pd
import time

def fetch_stock_data(symbol: str, period: str = "1y", retries: int = 3, delay: float = 2.0) -> pd.DataFrame:
    for attempt in range(retries):
        try:
            ticker = yf.Ticker(symbol)
            data = ticker.history(period=period, interval="1d")
            if not data.empty:
                return data
        except Exception as e:
            print(f"Error fetching data attempt {attempt+1}: {e}")
        time.sleep(delay)
    return pd.DataFrame()
