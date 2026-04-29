def compute_recommendation(
    predicted_price, current_price, indicators,
    patterns, support_resistance, model_metrics
) -> dict:

    scores = {}
    reasons = []

    # Signal 1: LSTM Prediction — weight 30%
    chg  = (predicted_price - current_price) / current_price * 100
    mape = model_metrics.get('mape', 10)
    conf = model_metrics.get('confidence', 50)
    trust = 1.0 if mape<3 else 0.75 if mape<6 else 0.5 if mape<10 else 0.25

    if   chg >  2.0: ps=100; reasons.append(f"LSTM predicts +{chg:.1f}% (conf {conf:.0f}%)")
    elif chg >  0.5: ps=65;  reasons.append(f"LSTM predicts modest +{chg:.1f}%")
    elif chg > -0.5: ps=50;  reasons.append("LSTM predicts flat movement")
    elif chg > -2.0: ps=35;  reasons.append(f"LSTM predicts -{abs(chg):.1f}% drop")
    else:            ps=0;   reasons.append(f"LSTM predicts -{abs(chg):.1f}% bearish")
    scores['lstm'] = {'score': round(ps*trust,1), 'weight':0.30, 'label':'LSTM Prediction'}

    # Signal 2: Technical Indicators — weight 30%
    tp=0; tm=0
    rsi = indicators.get('rsi')
    if rsi is not None:
        tm+=20
        if   rsi<30:  tp+=20; reasons.append(f"RSI {rsi:.1f} oversold — potential bounce")
        elif rsi<45:  tp+=15; reasons.append(f"RSI {rsi:.1f} slightly oversold")
        elif rsi<=60: tp+=10; reasons.append(f"RSI {rsi:.1f} neutral zone")
        elif rsi<=70: tp+=5;  reasons.append(f"RSI {rsi:.1f} approaching overbought")
        else:         tp+=0;  reasons.append(f"RSI {rsi:.1f} overbought — caution")

    macd = indicators.get('macd')
    ms   = indicators.get('macd_signal_line')
    if macd is not None and ms is not None:
        tm+=20
        if   macd>ms and macd>0: tp+=20; reasons.append("MACD bullish crossover above zero")
        elif macd>ms:            tp+=15; reasons.append("MACD crossed above signal line")
        elif macd<ms and macd<0: tp+=0;  reasons.append("MACD bearish below zero")
        else:                    tp+=8

    adx = indicators.get('adx')
    dp  = indicators.get('dmi_pos')
    dn  = indicators.get('dmi_neg')
    if adx is not None:
        tm+=15
        if   adx>25 and dp and dn and dp>dn: tp+=15; reasons.append(f"ADX {adx:.1f} strong uptrend")
        elif adx>25 and dp and dn and dn>dp: tp+=0;  reasons.append(f"ADX {adx:.1f} strong downtrend")
        elif adx>20:                          tp+=10; reasons.append(f"ADX {adx:.1f} moderate trend")
        else:                                 tp+=7;  reasons.append(f"ADX {adx:.1f} ranging market")

    s20 = indicators.get('sma20')
    s50 = indicators.get('sma50')
    if s20 and s50:
        tm+=15
        if   current_price>s20>s50: tp+=15; reasons.append("Price > SMA20 > SMA50 uptrend")
        elif current_price>s20:     tp+=10; reasons.append("Price above SMA20 short-term bullish")
        elif current_price<s20<s50: tp+=0;  reasons.append("Price below SMA20 < SMA50 downtrend")
        else:                       tp+=5

    mfi = indicators.get('mfi')
    if mfi is not None:
        tm+=10
        if mfi<20: tp+=10; reasons.append(f"MFI {mfi:.1f} oversold")
        elif mfi>80: tp+=0; reasons.append(f"MFI {mfi:.1f} overbought")
        else: tp+=5

    scores['technical'] = {
        'score': round((tp/tm*100) if tm>0 else 50, 1),
        'weight': 0.30, 'label': 'Technical Indicators'
    }

    # Signal 3: Chart Patterns — weight 20%
    BULL={'Inverse Head and Shoulders','Double Bottom','Triple Bottom',
          'Ascending Triangle','Falling Wedge','Bull Flag','Cup and Handle'}
    BEAR={'Head and Shoulders','Double Top','Triple Top',
          'Descending Triangle','Rising Wedge','Bear Flag'}
    bp=[(p['pattern_name'],p.get('confidence',0.5)) for p in patterns
        if p.get('pattern_name') in BULL]
    rp=[(p['pattern_name'],p.get('confidence',0.5)) for p in patterns
        if p.get('pattern_name') in BEAR]
    if bp:
        best=max(bp,key=lambda x:x[1])
        psc=75+best[1]*25; reasons.append(f"Bullish: {best[0]} ({best[1]*100:.0f}%)")
    elif rp:
        best=max(rp,key=lambda x:x[1])
        psc=25-best[1]*25; reasons.append(f"Bearish: {best[0]} ({best[1]*100:.0f}%)")
    else:
        psc=50; reasons.append("No significant patterns detected")
    scores['patterns']={'score':round(max(0,min(100,psc)),1),'weight':0.20,'label':'Chart Patterns'}

    # Signal 4: Support/Resistance — weight 10%
    srs=50
    sup=support_resistance.get('support',[])
    res=support_resistance.get('resistance',[])
    if sup and res:
        ns=sup[0].get('price',0); nr=res[0].get('price',float('inf'))
        ds=(current_price-ns)/current_price*100
        dr=(nr-current_price)/current_price*100
        rr=dr/ds if ds>0 else 1
        if   rr>=2:   srs=85; reasons.append(f"R/R {rr:.1f}x strong setup")
        elif rr>=1.5: srs=70; reasons.append(f"R/R {rr:.1f}x favourable")
        elif rr>=1:   srs=55; reasons.append(f"R/R {rr:.1f}x balanced")
        else:         srs=30; reasons.append(f"R/R {rr:.1f}x close to resistance")
    scores['sr']={'score':round(srs,1),'weight':0.10,'label':'Support / Resistance'}

    # Signal 5: Model Quality — weight 10%
    r2=model_metrics.get('r_squared',0)
    if   r2>0.9 and mape<3:  qs=100; reasons.append(f"High model quality R²={r2:.2f}")
    elif r2>0.7 and mape<6:  qs=75;  reasons.append(f"Good model quality R²={r2:.2f}")
    elif r2>0.5:              qs=50;  reasons.append(f"Moderate model R²={r2:.2f}")
    else:                     qs=25;  reasons.append(f"Low confidence R²={r2:.2f}")
    scores['quality']={'score':round(qs,1),'weight':0.10,'label':'Model Quality'}

    # Final weighted score
    final = sum(s['score']*s['weight'] for s in scores.values())

    if   final>=68: verdict='BUY';  vc='green';  action='Multiple signals bullish. Consider buying.'
    elif final>=52: verdict='HOLD'; vc='yellow'; action='Mixed signals. Wait for clarity.'
    else:           verdict='SELL'; vc='red';    action='Signals point to downside. Avoid buying.'

    # Risk
    atr=indicators.get('atr',0) or 0
    ap=(atr/current_price*100) if current_price else 0
    if   ap>3 or mape>8: risk='HIGH';   rn='High volatility — strict stop-loss'
    elif ap>1.5 or mape>5: risk='MEDIUM'; rn='Moderate volatility'
    else:                  risk='LOW';    rn='Low volatility — conservative friendly'

    # Targets
    stop=None
    if sup: stop=sup[0].get('price')
    if not stop or stop>=current_price:
        stop=round(current_price*(1-ap/100*2),2)
    target=predicted_price
    for p in patterns:
        if p.get('pattern_type')=='bullish' and p.get('target_price'):
            target=max(target,p['target_price']); break

    return {
        'verdict':          verdict,
        'verdict_color':    vc,
        'final_score':      round(final,1),
        'action':           action,
        'risk_level':       risk,
        'risk_note':        rn,
        'scores':           scores,
        'reasons':          reasons,
        'entry_price':      round(current_price,2),
        'target_price':     round(target,2),
        'stop_loss':        round(stop,2) if stop else None,
        'potential_return': round((target-current_price)/current_price*100,2),
        'potential_loss':   round((current_price-stop)/current_price*100,2) if stop else None,
        'disclaimer':       'AI analysis only. NOT financial advice. Consult SEBI advisor.',
    }
