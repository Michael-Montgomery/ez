// Shared styled tooltip for Recharts.
export function ChartTooltip({ active, payload, label, formatter, labelFormatter }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div
      style={{
        background: 'rgba(12,16,30,0.96)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 12,
        padding: '10px 13px',
        boxShadow: '0 18px 40px rgba(0,0,0,0.5)',
        fontSize: 13,
      }}
    >
      {label != null && (
        <div style={{ fontWeight: 700, marginBottom: 6, color: '#eef2ff' }}>
          {labelFormatter ? labelFormatter(label) : label}
        </div>
      )}
      {payload.map((p, i) => (
        <div key={i} style={{ display: 'flex', gap: 10, justifyContent: 'space-between', color: '#9aa4c4' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span
              style={{ width: 9, height: 9, borderRadius: '50%', background: p.color || p.fill || p.stroke }}
            />
            {p.name}
          </span>
          <span style={{ color: '#eef2ff', fontWeight: 600 }}>
            {formatter ? formatter(p.value, p) : p.value}
          </span>
        </div>
      ))}
    </div>
  );
}
