export default function Section({ id, eyebrow, title, sub, children }) {
  return (
    <section id={id} className="section">
      <div className="reveal">
        {eyebrow && <div className="section-eyebrow">{eyebrow}</div>}
        <h2 className="section-title">{title}</h2>
        {sub && <p className="section-sub">{sub}</p>}
      </div>
      {children}
    </section>
  );
}
