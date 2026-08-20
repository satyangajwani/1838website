export function Masthead() {
  return <div className="masthead" aria-label="1838 Reserve partners">
    <div className="masthead-band">
      <div className="toi-lockup">
        <img src="/brands/toi-gold.png" alt="The Times of India" />
        <span>Established in 1838</span>
      </div>
      <img src="/brands/icici-bank-gold.svg" alt="ICICI Bank" className="icici-lockup" />
    </div>
    <div className="reserve-wordmark" aria-label="1838 Reserve">
      <span className="reserve-wordmark-year">1838</span>
      <span className="reserve-wordmark-name">RESERVE</span>
    </div>
  </div>;
}
