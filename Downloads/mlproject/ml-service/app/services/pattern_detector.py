import numpy as np
import pandas as pd
from scipy.signal import argrelextrema

def find_local_peaks(series, order=5):
    return argrelextrema(series.values, np.greater, order=order)[0]

def find_local_troughs(series, order=5):
    return argrelextrema(series.values, np.less, order=order)[0]

def detect_head_and_shoulders(df, peaks, troughs):
    results = []
    if len(peaks) < 3: return results
    
    for i in range(len(peaks) - 2):
        p1, p2, p3 = peaks[i], peaks[i+1], peaks[i+2]
        val1, val2, val3 = float(df['High'].iloc[p1]), float(df['High'].iloc[p2]), float(df['High'].iloc[p3])
        
        if val2 > val1 and val2 > val3 and abs(val1 - val3)/max(val1, val3) <= 0.02:
            neckline_idx = troughs[troughs > p1]
            neckline_idx = neckline_idx[neckline_idx < p3]
            if len(neckline_idx) > 0:
                neckline_val = float(df['Low'].iloc[neckline_idx].min())
                target = neckline_val - (val2 - neckline_val)
                results.append({
                    "pattern_name": "Head and Shoulders",
                    "pattern_type": "bearish",
                    "confidence": 0.85,
                    "start_idx": int(p1),
                    "end_idx": int(p3),
                    "start_date": str(df.index[p1].date()),
                    "end_date": str(df.index[p3].date()),
                    "description": "Standard bearish reversal indicating distribution.",
                    "target_price": float(target),
                    "stop_loss": float(val2)
                })
    return results

def detect_patterns(df: pd.DataFrame):
    if len(df) < 30: return [], {"support": [], "resistance": []}
    
    peaks = find_local_peaks(df['High'])
    troughs = find_local_troughs(df['Low'])
    patterns = []
    
    if len(df) >= 60:
        patterns.extend(detect_head_and_shoulders(df, peaks, troughs))
    
    support = []
    resistance = []
    
    if len(df) >= 20:
        for t in troughs[-10:]:
            val = float(df['Low'].iloc[t])
            support.append({"price": val, "strength": 7, "touch_count": 2})
        for p in peaks[-10:]:
            val = float(df['High'].iloc[p])
            resistance.append({"price": val, "strength": 8, "touch_count": 2})
        
    sr = {
        "support": sorted(support, key=lambda x: x['price'])[:5],
        "resistance": sorted(resistance, key=lambda x: x['price'], reverse=True)[:5]
    }
    
    return patterns, sr
