export function StepConfirmed({ reference, onClose }: { reference: string; onClose: () => void }) {
  return <section className="confirmed" data-step="confirmed">
    <p className="eyebrow">1838 Reserve Private Office</p>
    <h2 id="interest-title">Interest recorded</h2>
    <p>Your reference</p>
    <output className="reference">{reference}</output>
    <p>Placeholder pending OQ6 sign-off: The Private Office will write to you regarding October 2026 availability.</p>
    <button type="button" onClick={onClose}>Close</button>
  </section>;
}
