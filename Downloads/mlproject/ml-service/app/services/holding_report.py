import numpy as np
from datetime import datetime, timedelta

def generate_holding_report(
    symbol, current_price, predicted_price,
    indicators, recommendation,
    buy_price, quantity, holding_days, buy_date=None
) -> dict:

    start = datetime.strptime(buy_date,'%Y-%m-%d') if buy_date else datetime.now()
    end   = start + timedelta(days=holding_days)
    td    = max(1, int(holding_days * 5 / 7))

    daily = (predicted_price - current_price) / current_price
    bull_d = max(min(daily*1.5,  0.03), -0.03)
    base_d = max(min(daily*1.0,  0.02), -0.02)
    bear_d = max(min(-abs(daily)*0.8, 0.01), -0.03)

    np.random.seed(42)
    def project(sp, dr, days):
        p=[sp]
        for _ in range(days):
            p.append(round(p[-1]*(1+dr+np.random.normal(0,0.005)),2))
        return p

    bull_p = project(current_price, bull_d, td)
    base_p = project(current_price, base_d, td)
    bear_p = project(current_price, bear_d, td)

    def scen(prices, label, prob, desc):
        fp=prices[-1]; ret=(fp-buy_price)/buy_price*100
        step=max(1,td//30)
        return {'label':label,'final_price':round(fp,2),
                'return_pct':round(ret,2),
                'final_value':round(fp*quantity,2),
                'profit_loss':round((fp-buy_price)*quantity,2),
                'price_series':prices[::step],
                'probability':prob,'description':desc}

    scenarios = {
        'bull': scen(bull_p,'Optimistic',30,'Strong momentum, bullish macro'),
        'base': scen(base_p,'Most Likely',50,'LSTM model prediction path'),
        'bear': scen(bear_p,'Pessimistic',20,'Adverse market conditions'),
    }

    milestones=[]
    for w in range(1, min(holding_days//7+1, 13)):
        dt=start+timedelta(weeks=w); di=min(w*5,len(base_p)-1)
        bp_=base_p[di]; ret=(bp_-buy_price)/buy_price*100
        rem=holding_days//7-w
        if   ret>=10: act='Consider booking partial profits'
        elif ret>=5:  act='Hold — on track, tighten stop-loss'
        elif ret>=0:  act='Hold — monitor closely'
        elif ret>=-5: act='Caution — review thesis' if rem>2 else 'Consider exiting'
        else:         act='Stop-loss triggered — exit position'
        milestones.append({'week':w,'date':dt.strftime('%d %b %Y'),
            'base_price':round(bp_,2),'bull_price':round(bull_p[di],2),
            'bear_price':round(bear_p[di],2),'return_pct':round(ret,2),
            'pnl':round((bp_-buy_price)*quantity,2),'action':act})

    atr=indicators.get('atr', current_price*0.02) or current_price*0.02
    ap=(atr/current_price*100) if current_price else 2
    t1=round(current_price*1.05,2)
    t2=round(current_price*1.10,2)
    t3=round(max(base_p[-1], recommendation.get('target_price', current_price*1.12)),2)
    sl=recommendation.get('stop_loss') or round(current_price*(1-ap/100*2),2)
    if sl>=current_price: sl=round(current_price*0.95,2)

    exit_strategy={
        'target_1':{'price':t1,'return_pct':5.0,'action':'Book 30% of position'},
        'target_2':{'price':t2,'return_pct':10.0,'action':'Book another 40%'},
        'target_3':{'price':t3,'return_pct':round((t3-buy_price)/buy_price*100,1),'action':'Exit remaining position'},
        'stop_loss':{'price':sl,'loss_pct':round((buy_price-sl)/buy_price*100,1),'action':'Cut losses immediately'},
        'time_stop':{'date':end.strftime('%d %b %Y'),'action':'Review — exit if thesis not played out'},
    }

    key_dates=[]
    cur=start
    for _ in range(holding_days//30+1):
        nm=(cur.replace(day=28)+timedelta(days=4)).replace(day=1)
        ld=nm-timedelta(days=1)
        exp=ld-timedelta(days=(ld.weekday()-3)%7)
        if start<=exp<=end:
            key_dates.append({'date':exp.strftime('%d %b %Y'),
                'event':'NSE F&O Monthly Expiry',
                'note':'Increased volatility near expiry'})
        cur=nm
    for m,lbl in {3:'Q4 Results',6:'Q1 Results',9:'Q2 Results',12:'Q3 Results'}.items():
        try:
            rd=start.replace(month=m,day=15)
            if start<=rd<=end:
                key_dates.append({'date':rd.strftime('%d %b %Y'),
                    'event':lbl+' Season','note':'Stock may react to earnings'})
        except ValueError: pass
    key_dates=sorted(key_dates,key=lambda x:x['date'])[:6]

    bf=base_p[-1]; br=(bf-buy_price)/buy_price*100
    if   holding_days<=7:   hor='swing trade'
    elif holding_days<=30:  hor='1 month hold'
    elif holding_days<=90:  hor='3 month hold'
    elif holding_days<=180: hor='6 month hold'
    else:                   hor='long-term hold'
    vrd=recommendation.get('verdict','HOLD')
    vl=(f"For a {hor}, model projects {'gain' if br>=0 else 'loss'} of "
        f"{abs(br):.1f}% base scenario. ")
    if vrd=='BUY' and br>0:
        vl+=f"Entry at ₹{buy_price:.2f} looks favourable."
    elif vrd=='SELL' or br<-3:
        vl+="Signals suggest caution — wait for better entry."
    else:
        vl+=f"Use stop-loss at ₹{sl:.2f}."

    rets=np.diff(base_p)/np.array(base_p[:-1])
    vol=float(np.std(rets)*np.sqrt(252)*100) if len(rets)>0 else 0
    sharpe=float(np.mean(rets)/np.std(rets)*np.sqrt(252)) if np.std(rets)>0 else 0
    mdd=float((np.min(base_p)-buy_price)/buy_price*100)

    return {
        'symbol':symbol,'buy_price':round(buy_price,2),
        'quantity':quantity,'holding_days':holding_days,
        'start_date':start.strftime('%d %b %Y'),
        'exit_date':end.strftime('%d %b %Y'),
        'investment_value':round(buy_price*quantity,2),
        'scenarios':scenarios,'milestones':milestones,
        'exit_strategy':exit_strategy,'key_dates':key_dates,
        'holding_verdict':vl,
        'risk_metrics':{'annual_volatility':round(vol,2),
                        'sharpe_ratio':round(sharpe,2),
                        'max_drawdown_pct':round(mdd,2)},
        'disclaimer':('AI-generated for educational purposes only. '
                      'NOT financial advice. Consult SEBI-registered advisor.'),
    }
