import { useMemo, useState } from 'react';
import Section from './Section.jsx';
import { AGENCY_INFO, labelFor } from '../data/process.js';
import { useData } from '../data/DataContext.jsx';

const fmtDateTime = (d) =>
  d
    ? d.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      })
    : '—';

export default function TransactionsTable() {
  const { records } = useData();
  const [filter, setFilter] = useState('ALL');
  const [sort, setSort] = useState({ key: 'transactionDate', dir: -1 });

  // Build the filter bar from agencies actually present in the data.
  const presentAgencies = useMemo(
    () => [...new Set(records.filter((r) => r.agency).map((r) => r.agency))],
    [records]
  );
  const hasPayments = useMemo(() => records.some((r) => r.isPayment), [records]);
  const agencies = ['ALL', ...presentAgencies, ...(hasPayments ? ['PAYMENT'] : [])];

  const rows = useMemo(() => {
    let r = records.slice();
    if (filter === 'PAYMENT') r = r.filter((x) => x.isPayment);
    else if (filter !== 'ALL') r = r.filter((x) => x.agency === filter);
    r.sort((a, b) => {
      const av = a[sort.key];
      const bv = b[sort.key];
      if (av == null) return 1;
      if (bv == null) return -1;
      return (av > bv ? 1 : av < bv ? -1 : 0) * sort.dir;
    });
    return r;
  }, [records, filter, sort]);

  const toggleSort = (key) =>
    setSort((s) => (s.key === key ? { key, dir: -s.dir } : { key, dir: -1 }));

  return (
    <Section
      id="ledger"
      eyebrow="The full record"
      title="Every transaction"
      sub="The complete ledger behind the charts. Filter by authority or sort any column."
    >
      <div className="reveal">
        <div className="filter-bar">
          {agencies.map((a) => (
            <button
              key={a}
              className={`fbtn ${filter === a ? 'active' : ''}`}
              onClick={() => setFilter(a)}
            >
              {a === 'ALL' ? 'All' : a === 'PAYMENT' ? 'Payments' : AGENCY_INFO[a]?.short || a}
            </button>
          ))}
        </div>

        <div className="table-wrap panel">
          <table>
            <thead>
              <tr>
                <Th onClick={() => toggleSort('transactionDate')} active={sort.key === 'transactionDate'} dir={sort.dir}>
                  Travel date
                </Th>
                <th>Agency</th>
                <th>Type</th>
                <th>Location</th>
                <Th onClick={() => toggleSort('amount')} active={sort.key === 'amount'} dir={sort.dir} right>
                  Amount
                </Th>
                <Th onClick={() => toggleSort('balance')} active={sort.key === 'balance'} dir={sort.dir} right>
                  Balance
                </Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="mono">{fmtDateTime(r.transactionDate)}</td>
                  <td>
                    {r.agency ? (
                      <span className="agency-tag">
                        <span className="dot" style={{ background: AGENCY_INFO[r.agency]?.color }} />
                        {AGENCY_INFO[r.agency]?.short || r.agency}
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-faint)' }}>—</span>
                    )}
                  </td>
                  <td style={{ color: 'var(--text-dim)' }}>
                    {r.isPayment ? 'Payment' : 'Toll'}
                  </td>
                  <td>
                    {r.isPayment
                      ? 'Credit card top-up'
                      : r.entryPlaza && r.exitPlaza && r.entryPlaza !== r.exitPlaza
                      ? `${labelFor(r.entryPlaza)} → ${labelFor(r.exitPlaza)}`
                      : labelFor(r.exitPlaza || r.entryPlaza || '—')}
                  </td>
                  <td className={`mono right ${r.isPayment ? 'credit' : ''}`}>
                    {r.isPayment ? '+' : ''}${r.amount.toFixed(2)}
                  </td>
                  <td className="mono right dim">${r.balance.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        .filter-bar { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px; }
        .fbtn {
          background: var(--panel);
          border: 1px solid var(--panel-border);
          color: var(--text-dim);
          padding: 7px 14px;
          border-radius: 999px;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s;
          font-family: inherit;
        }
        .fbtn:hover { color: var(--text); border-color: rgba(255,255,255,0.2); }
        .fbtn.active { background: var(--accent); color: #04201d; border-color: var(--accent); font-weight: 600; }
        .table-wrap { overflow-x: auto; }
        table { width: 100%; border-collapse: collapse; font-size: 13.5px; }
        thead th {
          text-align: left;
          padding: 14px 16px;
          color: var(--text-faint);
          font-weight: 600;
          font-size: 11.5px;
          text-transform: uppercase;
          letter-spacing: 0.07em;
          border-bottom: 1px solid var(--panel-border);
          white-space: nowrap;
        }
        thead th.sortable { cursor: pointer; user-select: none; }
        thead th.sortable:hover { color: var(--text); }
        tbody td { padding: 12px 16px; border-bottom: 1px solid rgba(255,255,255,0.04); }
        tbody tr:hover { background: rgba(255,255,255,0.025); }
        .mono { font-variant-numeric: tabular-nums; }
        .right { text-align: right; }
        .dim { color: var(--text-faint); }
        .credit { color: var(--accent); font-weight: 600; }
        .agency-tag { display: inline-flex; align-items: center; gap: 7px; white-space: nowrap; }
      `}</style>
    </Section>
  );
}

function Th({ children, onClick, active, dir, right }) {
  return (
    <th className="sortable" onClick={onClick} style={{ textAlign: right ? 'right' : 'left' }}>
      {children}
      <span style={{ opacity: active ? 1 : 0.25, marginLeft: 5 }}>{active && dir === 1 ? '▲' : '▼'}</span>
    </th>
  );
}
