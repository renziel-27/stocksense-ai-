import requests
import pandas as pd
import os
from datetime import datetime, timedelta

ALPHA_KEY = os.getenv("ALPHA_VANTAGE_KEY", "demo")
BASE_URL = "https://www.alphavantage.co/query"

def fetch_from_alpha_vantage(symbol: str, period: str = "2y") -> pd.DataFrame:
    """
    Fetch daily OHLCV from Alpha Vantage.
    symbol: for NSE stocks, strip .NS suffix and add market=NSE
    e.g. RELIANCE.NS → symbol=RELIANCE, market=NSE
    """
    # Strip .NS suffix for Alpha Vantage
    av_symbol = symbol.replace('.NS', '').replace('.BSE', '')
    
    params = {
        "function": "TIME_SERIES_DAILY_ADJUSTED",
        "symbol": av_symbol,
        "outputsize": "full",  # full = 20 years of data
        "apikey": ALPHA_KEY,
        "datatype": "json"
    }
    
    # Try with NSE: prefix for Indian stocks
    for sym_variant in [f"NSE:{av_symbol}", av_symbol, f"BSE:{av_symbol}"]:
        try:
            params["symbol"] = sym_variant
            resp = requests.get(BASE_URL, params=params, timeout=30)
            data = resp.json()
            
            if "Time Series (Daily)" not in data:
                continue
            
            ts = data["Time Series (Daily)"]
            records = []
            for date_str, values in ts.items():
                records.append({
                    'Date':   pd.to_datetime(date_str),
                    'Open':   float(values['1. open']),
                    'High':   float(values['2. high']),
                    'Low':    float(values['3. low']),
                    'Close':  float(values['5. adjusted close']),
                    'Volume': int(values['6. volume'])
                })
            
            df = pd.DataFrame(records)
            df = df.set_index('Date').sort_index()
            
            # Filter to requested period
            period_days = {'3mo':90,'6mo':180,'1y':365,'2y':730,'5y':1825}
            days = period_days.get(period, 365)
            cutoff = datetime.now() - timedelta(days=days)
            df = df[df.index >= cutoff]
            
            if len(df) > 50:
                print(f"[alpha_vantage] Success for {sym_variant}: {len(df)} rows")
                return df
                
        except Exception as e:
            print(f"[alpha_vantage] Failed for {sym_variant}: {e}")
            continue
    
    raise ValueError(f"Alpha Vantage: no data for {symbol}")
