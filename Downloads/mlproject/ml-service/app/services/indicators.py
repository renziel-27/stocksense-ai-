import pandas as pd
import numpy as np
import ta


def safe_float(series, idx=-1):
    """Safely get last float from a pandas Series."""
    try:
        val = series.iloc[idx]
        if pd.isna(val):
            return None
        return round(float(val), 4)
    except Exception:
        return None


def safe_list(series):
    """Convert Series to list of rounded floats, NaN → None."""
    try:
        return [
            round(float(v), 4) if not pd.isna(v) else None
            for v in series
        ]
    except Exception:
        return []


def compute_all(df: pd.DataFrame) -> dict:
    """
    Compute all indicators on df.
    Returns both scalar (last value) and series (full array) for each.
    """
    close  = df['Close']
    high   = df['High']
    low    = df['Low']
    volume = df['Volume']

    result = {}

    # ── RSI ──────────────────────────────────────────────────────
    try:
        rsi_obj = ta.momentum.RSIIndicator(close, window=14)
        rsi_series = rsi_obj.rsi()
        result['rsi']        = safe_float(rsi_series)
        result['rsi_series'] = safe_list(rsi_series)
        v = result['rsi'] or 50
        result['rsi_signal'] = 'SELL' if v > 70 else 'BUY' if v < 30 else 'NEUTRAL'
    except Exception:
        result.update(rsi=50.0, rsi_series=[], rsi_signal='NEUTRAL')

    # ── MACD ─────────────────────────────────────────────────────
    try:
        macd_obj    = ta.trend.MACD(close)
        macd_line   = macd_obj.macd()
        signal_line = macd_obj.macd_signal()
        hist        = macd_obj.macd_diff()
        result['macd']          = safe_float(macd_line)
        result['macd_signal_line'] = safe_float(signal_line)
        result['macd_hist']     = safe_float(hist)
        result['macd_series']   = safe_list(macd_line)
        result['signal_series'] = safe_list(signal_line)
        result['hist_series']   = safe_list(hist)
        mv = result['macd'] or 0
        sv = result['macd_signal_line'] or 0
        result['macd_signal'] = 'BUY' if mv > sv else 'SELL'
    except Exception:
        result.update(macd=0, macd_signal_line=0, macd_hist=0,
                      macd_series=[], signal_series=[], hist_series=[],
                      macd_signal='NEUTRAL')

    # ── SMA ──────────────────────────────────────────────────────
    for w in [20, 50, 200]:
        try:
            s = close.rolling(window=w).mean()
            result[f'sma{w}']        = safe_float(s)
            result[f'sma{w}_series'] = safe_list(s)
        except Exception:
            result[f'sma{w}'] = None
            result[f'sma{w}_series'] = []

    # ── EMA ──────────────────────────────────────────────────────
    for w in [12, 26]:
        try:
            e = ta.trend.EMAIndicator(close, window=w).ema_indicator()
            result[f'ema{w}']        = safe_float(e)
            result[f'ema{w}_series'] = safe_list(e)
        except Exception:
            result[f'ema{w}'] = None
            result[f'ema{w}_series'] = []

    # ── Bollinger Bands ──────────────────────────────────────────
    try:
        bb = ta.volatility.BollingerBands(close, window=20)
        result['bollinger_upper']        = safe_float(bb.bollinger_hband())
        result['bollinger_lower']        = safe_float(bb.bollinger_lband())
        result['bollinger_mid']          = safe_float(bb.bollinger_mavg())
        result['bollinger_pct']          = safe_float(bb.bollinger_pband())
        result['bollinger_upper_series'] = safe_list(bb.bollinger_hband())
        result['bollinger_lower_series'] = safe_list(bb.bollinger_lband())
        result['bollinger_mid_series']   = safe_list(bb.bollinger_mavg())
    except Exception:
        for k in ['bollinger_upper','bollinger_lower','bollinger_mid',
                  'bollinger_pct']:
            result[k] = None
        for k in ['bollinger_upper_series','bollinger_lower_series',
                  'bollinger_mid_series']:
            result[k] = []

    # ── ADX / DMI ────────────────────────────────────────────────
    try:
        adx_obj = ta.trend.ADXIndicator(high, low, close, window=14)
        result['adx']    = safe_float(adx_obj.adx())
        result['dmi_pos'] = safe_float(adx_obj.adx_pos())
        result['dmi_neg'] = safe_float(adx_obj.adx_neg())
        adx_val = result['adx'] or 0
        result['adx_signal'] = (
            'Strong trend' if adx_val > 25 else 'Weak/ranging'
        )
    except Exception:
        result.update(adx=None, dmi_pos=None, dmi_neg=None,
                      adx_signal='Unknown')

    # ── ATR ──────────────────────────────────────────────────────
    try:
        result['atr'] = safe_float(
            ta.volatility.AverageTrueRange(high, low, close, window=14).average_true_range()
        )
    except Exception:
        result['atr'] = None

    # ── Stochastic ───────────────────────────────────────────────
    try:
        stoch = ta.momentum.StochasticOscillator(high, low, close)
        result['stoch_k'] = safe_float(stoch.stoch())
        result['stoch_d'] = safe_float(stoch.stoch_signal())
    except Exception:
        result.update(stoch_k=None, stoch_d=None)

    # ── Williams %R ──────────────────────────────────────────────
    try:
        result['williams_r'] = safe_float(
            ta.momentum.WilliamsRIndicator(high, low, close, lbp=14).williams_r()
        )
    except Exception:
        result['williams_r'] = None

    # ── CCI ──────────────────────────────────────────────────────
    try:
        result['cci'] = safe_float(
            ta.trend.CCIIndicator(high, low, close, window=20).cci()
        )
    except Exception:
        result['cci'] = None

    # ── MFI ──────────────────────────────────────────────────────
    try:
        result['mfi'] = safe_float(
            ta.volume.MFIIndicator(high, low, close, volume, window=14).money_flow_index()
        )
    except Exception:
        result['mfi'] = None

    # ── OBV ──────────────────────────────────────────────────────
    try:
        obv = ta.volume.OnBalanceVolumeIndicator(close, volume).on_balance_volume()
        result['obv']        = safe_float(obv)
        result['obv_series'] = safe_list(obv)
    except Exception:
        result.update(obv=None, obv_series=[])

    # ── VWAP ─────────────────────────────────────────────────────
    try:
        result['vwap'] = safe_float(
            ta.volume.VolumeWeightedAveragePrice(
                high, low, close, volume, window=14
            ).volume_weighted_average_price()
        )
    except Exception:
        result['vwap'] = None

    # ── Signals Summary ──────────────────────────────────────────
    signals_summary = []
    signal_map = [
        ('RSI(14)',       result.get('rsi'),       result.get('rsi_signal')),
        ('MACD',         result.get('macd'),       result.get('macd_signal')),
        ('ADX(14)',       result.get('adx'),        result.get('adx_signal')),
        ('Stoch %K',     result.get('stoch_k'),    None),
        ('CCI(20)',       result.get('cci'),        None),
        ('Williams %R',  result.get('williams_r'), None),
        ('MFI(14)',       result.get('mfi'),        None),
    ]
    for name, val, sig in signal_map:
        if val is None:
            continue
        if sig is None:
            # Auto-derive for momentum oscillators
            if name == 'Stoch %K':
                sig = 'SELL' if val > 80 else 'BUY' if val < 20 else 'NEUTRAL'
            elif name == 'CCI(20)':
                sig = 'SELL' if val > 100 else 'BUY' if val < -100 else 'NEUTRAL'
            elif name == 'Williams %R':
                sig = 'SELL' if val > -20 else 'BUY' if val < -80 else 'NEUTRAL'
            elif name == 'MFI(14)':
                sig = 'SELL' if val > 80 else 'BUY' if val < 20 else 'NEUTRAL'
            else:
                sig = 'NEUTRAL'
        signals_summary.append({
            'name': name, 'value': round(val, 2), 'signal': sig
        })

    result['signals_summary'] = signals_summary
    result['volume_series']   = safe_list(volume)
    result['close_series']    = safe_list(close)
    result['dates']           = [str(d.date()) for d in df.index]

    return result
