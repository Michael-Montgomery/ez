import { RAW_CSV } from './raw.js';
import { AGENCY_INFO, coordFor, haversineMiles, labelFor, parseMilepost } from './geo.js';

// ---------------------------------------------------------------------------
// CSV parsing
// ---------------------------------------------------------------------------

// Quote-aware split of a single CSV line into cells.
function splitCsvLine(line) {
  const out = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (inQuotes) {
      if (c === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cur += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ',') {
      out.push(cur);
      cur = '';
    } else {
      cur += c;
    }
  }
  out.push(cur);
  return out.map((s) => s.trim());
}

// Map an EZ-Pass header row to canonical field keys, matched loosely so
// small differences in column naming / ordering / extra columns are tolerated.
const HEADER_MATCHERS = {
  postingDate: (h) => h.includes('posting') && h.includes('date'),
  transactionDate: (h) => h.includes('transaction') && h.includes('date'),
  plate: (h) => h.includes('transponder') || h.includes('plate'),
  agency: (h) => h === 'agency' || h.includes('agency'),
  type: (h) => h === 'type' || h.includes('activity') || h.includes('description'),
  entryTime: (h) => h.includes('entry') && h.includes('time'),
  entryPlaza: (h) => h.includes('entry') && (h.includes('plaza') || h.includes('location')),
  exitTime: (h) => h.includes('exit') && h.includes('time'),
  exitPlaza: (h) => h.includes('exit') && (h.includes('plaza') || h.includes('location')),
  vehicleClass: (h) => h.includes('vehicle') || h.includes('class'),
  amount: (h) => h.includes('amount') || h.includes('charge') || h.includes('toll'),
  balance: (h) => h.includes('balance'),
};

function buildHeaderMap(headerCells) {
  const norm = headerCells.map((h) => h.toLowerCase().trim());
  const map = {};
  for (const [field, matcher] of Object.entries(HEADER_MATCHERS)) {
    const idx = norm.findIndex((h) => matcher(h));
    if (idx !== -1) map[field] = idx;
  }
  return map;
}

function parseDate(s) {
  if (!s) return null;
  const str = s.trim();
  if (!str) return null;
  // Preferred format: M/D/YYYY h:mm:ss AM/PM
  const m = /^(\d{1,2})\/(\d{1,2})\/(\d{2,4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?)?$/i.exec(
    str
  );
  if (m) {
    let [, mo, d, y, hh, mm, ss, ap] = m;
    mo = +mo;
    d = +d;
    y = +y;
    if (y < 100) y += 2000;
    hh = hh ? +hh : 0;
    mm = mm ? +mm : 0;
    ss = ss ? +ss : 0;
    if (ap) {
      const upper = ap.toUpperCase();
      if (upper === 'PM' && hh !== 12) hh += 12;
      if (upper === 'AM' && hh === 12) hh = 0;
    }
    return new Date(y, mo - 1, d, hh, mm, ss);
  }
  // Fallback: let the engine try (handles ISO and other locale formats).
  const t = Date.parse(str);
  return Number.isNaN(t) ? null : new Date(t);
}

function parseMoney(s) {
  if (!s) return 0;
  const neg = /\(|-/.test(s);
  const n = parseFloat(s.replace(/[^0-9.]/g, '')) || 0;
  return neg ? -n : n;
}

// Parse raw CSV text into an array of raw field-keyed rows. Throws on obviously
// unusable input so the UI can show a helpful message.
export function parseCsv(text) {
  if (!text || !text.trim()) throw new Error('The file is empty.');
  const lines = text
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .filter((l) => l.trim().length);
  if (lines.length < 2) throw new Error('No data rows found beneath the header.');

  const header = buildHeaderMap(splitCsvLine(lines[0]));
  const hasDate = header.transactionDate != null || header.postingDate != null;
  if (header.amount == null || !hasDate) {
    throw new Error(
      "This doesn't look like an EZ-Pass export — expected at least an amount column and a date column."
    );
  }

  const get = (cells, field) => (header[field] != null ? cells[header[field]] ?? '' : '');
  return lines.slice(1).map((line) => {
    const cells = splitCsvLine(line);
    return {
      postingDate: get(cells, 'postingDate'),
      transactionDate: get(cells, 'transactionDate'),
      plate: get(cells, 'plate'),
      agency: get(cells, 'agency'),
      type: get(cells, 'type'),
      entryPlaza: get(cells, 'entryPlaza'),
      exitPlaza: get(cells, 'exitPlaza'),
      vehicleClass: get(cells, 'vehicleClass'),
      amount: get(cells, 'amount'),
      balance: get(cells, 'balance'),
    };
  });
}

// ---------------------------------------------------------------------------
// Analysis — turns raw rows into every derived dataset the UI renders.
// ---------------------------------------------------------------------------

const GAP_HOURS = 5;

export function processCsv(text) {
  const rawRows = parseCsv(text);

  const records = rawRows
    .map((r, idx) => {
      const type = r.type || '';
      const isPayment = /payment|credit card|replenish|top ?up/i.test(type);
      const agency = r.agency && r.agency !== '***' ? r.agency : null;
      const exitPlaza = r.exitPlaza && r.exitPlaza !== '***' ? r.exitPlaza : null;
      const entryPlaza = r.entryPlaza && r.entryPlaza !== '***' ? r.entryPlaza : null;
      const exitCoord = coordFor(r.exitPlaza, agency);
      const entryCoord = coordFor(r.entryPlaza, agency);
      const transactionDate = parseDate(r.transactionDate) || parseDate(r.postingDate);
      return {
        id: idx,
        postingDate: parseDate(r.postingDate) || transactionDate,
        transactionDate,
        plate: r.plate || null,
        agency,
        type: type || (isPayment ? 'Payment' : 'Toll'),
        isPayment,
        isToll: !isPayment,
        entryPlaza,
        exitPlaza,
        entryCoord,
        exitCoord,
        coord: exitCoord || entryCoord,
        vehicleClass: r.vehicleClass ? Number(r.vehicleClass) : null,
        amount: parseMoney(r.amount),
        balance: parseMoney(r.balance),
        milepost: agency === 'PTC' ? parseMilepost(r.exitPlaza) : null,
      };
    })
    .filter((r) => r.transactionDate); // drop rows we couldn't date

  const tolls = records.filter((r) => r.isToll);
  const payments = records.filter((r) => r.isPayment);

  if (!tolls.length) {
    throw new Error('No toll transactions were found in this file.');
  }

  const totalTollSpend = tolls.reduce((s, r) => s + r.amount, 0);
  const totalPayments = payments.reduce((s, r) => s + r.amount, 0);
  const tollCount = tolls.length;
  const avgToll = totalTollSpend / tollCount;
  const maxToll = tolls.reduce((m, r) => (r.amount > m.amount ? r : m), tolls[0]);
  const paidTolls = tolls.filter((r) => r.amount > 0);
  const minPaidToll = paidTolls.length
    ? paidTolls.reduce((m, r) => (r.amount < m.amount ? r : m), paidTolls[0])
    : null;

  const travelDates = tolls.map((r) => r.transactionDate).sort((a, b) => a - b);
  const firstTrip = travelDates[0];
  const lastTrip = travelDates[travelDates.length - 1];
  const daysCovered = Math.round((lastTrip - firstTrip) / 86400000) + 1;

  // Spend by agency
  const byAgency = Object.entries(
    tolls.reduce((acc, r) => {
      const key = r.agency || 'Unknown';
      acc[key] = acc[key] || { agency: key, spend: 0, count: 0 };
      acc[key].spend += r.amount;
      acc[key].count += 1;
      return acc;
    }, {})
  )
    .map(([, v]) => ({
      ...v,
      name: AGENCY_INFO[v.agency]?.short || v.agency,
      fullName: AGENCY_INFO[v.agency]?.name || v.agency,
      color: AGENCY_INFO[v.agency]?.color || '#7f8bb0',
      avg: v.spend / v.count,
    }))
    .sort((a, b) => b.spend - a.spend);

  // Spend by plaza
  const byPlaza = Object.entries(
    tolls.reduce((acc, r) => {
      const key = r.exitPlaza || r.entryPlaza || 'Unknown';
      acc[key] = acc[key] || { plaza: key, spend: 0, count: 0, agency: r.agency };
      acc[key].spend += r.amount;
      acc[key].count += 1;
      return acc;
    }, {})
  )
    .map(([, v]) => ({ ...v, label: labelFor(v.plaza), avg: v.spend / v.count }))
    .sort((a, b) => b.count - a.count);

  // Daily cumulative spend
  const dailySpend = (() => {
    const map = {};
    tolls.forEach((r) => {
      const key = r.transactionDate.toISOString().slice(0, 10);
      map[key] = (map[key] || 0) + r.amount;
    });
    return Object.entries(map)
      .map(([date, spend]) => ({ date, spend }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .reduce((acc, d) => {
        const prev = acc.length ? acc[acc.length - 1].cumulative : 0;
        acc.push({ ...d, cumulative: prev + d.spend });
        return acc;
      }, []);
  })();

  // Balance over time
  const balanceSeries = records
    .filter((r) => r.balance)
    .slice()
    .sort((a, b) => a.postingDate - b.postingDate)
    .map((r) => ({
      date: r.postingDate.toISOString().slice(0, 10),
      ts: r.postingDate.getTime(),
      balance: r.balance,
      isPayment: r.isPayment,
    }));
  const hasBalance = balanceSeries.length > 1;

  // Journey segments
  const located = tolls
    .filter((r) => r.coord)
    .slice()
    .sort((a, b) => a.transactionDate - b.transactionDate);

  const segments = [];
  for (let i = 1; i < located.length; i++) {
    const a = located[i - 1];
    const b = located[i];
    const hours = (b.transactionDate - a.transactionDate) / 3600000;
    const miles = haversineMiles(a.coord, b.coord);
    const mph = hours > 0 ? miles / hours : Infinity;
    const sameTrip = hours <= GAP_HOURS && miles > 0.3 && mph <= 90;
    segments.push({
      from: a,
      to: b,
      fromCoord: a.coord,
      toCoord: b.coord,
      miles,
      hours,
      mph: hours > 0 ? mph : null,
      sameTrip,
    });
  }

  const explicitSegments = tolls
    .filter((r) => r.entryCoord && r.exitCoord && r.entryPlaza !== r.exitPlaza)
    .map((r) => ({
      record: r,
      fromCoord: r.entryCoord,
      toCoord: r.exitCoord,
      miles: haversineMiles(r.entryCoord, r.exitCoord),
      label: `${labelFor(r.entryPlaza)} → ${labelFor(r.exitPlaza)}`,
      amount: r.amount,
    }));

  const totalMiles = segments.filter((s) => s.sameTrip).reduce((s, x) => s + x.miles, 0);

  const speedSamples = segments
    .filter((s) => s.sameTrip && s.mph != null && s.mph > 5 && s.mph < 95 && s.miles > 1)
    .map((s) => ({
      label: `${labelFor(s.from.exitPlaza || s.from.entryPlaza)} → ${labelFor(
        s.to.exitPlaza || s.to.entryPlaza
      )}`,
      mph: s.mph,
      miles: s.miles,
      minutes: s.hours * 60,
      date: s.to.transactionDate,
    }))
    .sort((a, b) => b.mph - a.mph);

  const avgSpeed = speedSamples.length
    ? speedSamples.reduce((s, x) => s + x.mph, 0) / speedSamples.length
    : 0;

  // Cost per mile, aggregated by unique route
  const costPerMile = (() => {
    const known = explicitSegments.filter((s) => s.miles > 0.5);
    const byRoute = {};
    known.forEach((s) => {
      const key = s.label;
      if (!byRoute[key]) {
        byRoute[key] = {
          label: key,
          agency: s.record.agency,
          color: AGENCY_INFO[s.record.agency]?.color || '#7f8bb0',
          miles: s.miles,
          amount: 0,
          trips: 0,
        };
      }
      byRoute[key].amount += s.amount;
      byRoute[key].trips += 1;
    });
    return Object.values(byRoute)
      .map((r) => ({ ...r, perMile: r.amount / r.trips / r.miles }))
      .sort((a, b) => b.perMile - a.perMile);
  })();

  // Hour-of-day histogram
  const hourHistogram = Array.from({ length: 24 }, (_, h) => ({
    hour: h,
    label: `${((h + 11) % 12) + 1}${h < 12 ? 'a' : 'p'}`,
    count: tolls.filter((r) => r.transactionDate.getHours() === h).length,
  }));
  const busiestHour = hourHistogram.reduce(
    (m, x) => (x.count > m.count ? x : m),
    hourHistogram[0]
  );

  // Map points
  const mapPoints = (() => {
    const seen = {};
    tolls.forEach((r) => {
      [
        [r.entryPlaza, r.entryCoord],
        [r.exitPlaza, r.exitCoord],
      ].forEach(([plaza, coord]) => {
        if (!plaza || !coord) return;
        if (!seen[plaza]) seen[plaza] = { plaza, coord, count: 0, spend: 0, agency: r.agency };
        seen[plaza].count += 1;
        seen[plaza].spend += r.amount;
      });
    });
    return Object.values(seen).map((p) => ({ ...p, label: labelFor(p.plaza) }));
  })();

  // ---- Billing lag: travel date -> posting date ----
  const billingLag = (() => {
    const samples = tolls
      .filter((r) => r.postingDate && r.transactionDate)
      .map((r) => ({
        agency: r.agency,
        isAway: /away/i.test(r.type),
        lagDays: (r.postingDate - r.transactionDate) / 86400000,
        amount: r.amount,
      }))
      .filter((r) => r.lagDays >= 0);
    const mean = (arr) => (arr.length ? arr.reduce((s, x) => s + x.lagDays, 0) / arr.length : 0);
    const away = samples.filter((s) => s.isAway);
    const inNet = samples.filter((s) => !s.isAway);
    const bucketDefs = [
      ['< 1 day', 0, 1],
      ['1–3 days', 1, 3],
      ['3–7 days', 3, 7],
      ['1–2 weeks', 7, 14],
      ['2–3 weeks', 14, 21],
      ['3 weeks+', 21, Infinity],
    ];
    const buckets = bucketDefs.map(([label, lo, hi]) => ({
      label,
      count: samples.filter((s) => s.lagDays >= lo && s.lagDays < hi).length,
    }));
    return {
      samples,
      avgAway: mean(away),
      avgInNetwork: mean(inNet),
      maxLag: samples.reduce((m, s) => Math.max(m, s.lagDays), 0),
      awayCount: away.length,
      inNetworkCount: inNet.length,
      buckets,
    };
  })();

  // ---- Reconstructed trips: cluster tolls by travel-time gaps ----
  const trips = (() => {
    const sorted = tolls.slice().sort((a, b) => a.transactionDate - b.transactionDate);
    const groups = [];
    let cur = null;
    sorted.forEach((t) => {
      if (!cur || (t.transactionDate - cur.end) / 3600000 > GAP_HOURS) {
        cur = { items: [], start: t.transactionDate, end: t.transactionDate };
        groups.push(cur);
      }
      cur.items.push(t);
      cur.end = t.transactionDate;
    });
    return groups
      .map((g, i) => {
        const items = g.items;
        const cost = items.reduce((s, r) => s + r.amount, 0);
        const agencies = [...new Set(items.map((r) => r.agency).filter(Boolean))];
        let miles = 0;
        for (let j = 1; j < items.length; j++) {
          if (items[j - 1].coord && items[j].coord) {
            miles += haversineMiles(items[j - 1].coord, items[j].coord);
          }
        }
        const startPlaza = items[0].entryPlaza || items[0].exitPlaza;
        const last = items[items.length - 1];
        const endPlaza = last.exitPlaza || last.entryPlaza;
        return {
          id: i,
          start: g.start,
          end: g.end,
          durationH: (g.end - g.start) / 3600000,
          cost,
          count: items.length,
          agencies,
          miles,
          startPlaza,
          endPlaza,
          startLabel: labelFor(startPlaza),
          endLabel: labelFor(endPlaza),
          items,
        };
      })
      .sort((a, b) => b.start - a.start);
  })();

  // ---- Origin -> destination flows (from trips) ----
  const odFlows = (() => {
    const map = {};
    trips.forEach((t) => {
      const from = t.startLabel;
      const to = t.endLabel;
      if (!from || !to || from === to) return;
      const key = `${from}|||${to}`;
      map[key] = map[key] || { from, to, count: 0, spend: 0, miles: 0 };
      map[key].count += 1;
      map[key].spend += t.cost;
      map[key].miles += t.miles;
    });
    return Object.values(map).sort((a, b) => b.count - a.count || b.spend - a.spend);
  })();

  // ---- Activity heatmap: day-of-week x hour ----
  const dowHour = Array.from({ length: 7 }, () => Array(24).fill(0));
  tolls.forEach((r) => {
    dowHour[r.transactionDate.getDay()][r.transactionDate.getHours()] += 1;
  });
  const dowHourMax = Math.max(1, ...dowHour.flat());
  const byDayOfWeek = dowHour.map((row, d) => ({
    day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d],
    count: row.reduce((s, x) => s + x, 0),
  }));

  // ---- Cost projection & balance runway ----
  const projection = (() => {
    const perDay = totalTollSpend / Math.max(daysCovered, 1);
    const currentBalance = balanceSeries.length
      ? balanceSeries[balanceSeries.length - 1].balance
      : null;
    return {
      perDay,
      perMonth: perDay * 30.44,
      perYear: perDay * 365,
      currentBalance,
      runwayDays: currentBalance != null && perDay > 0 ? currentBalance / perDay : null,
    };
  })();

  // ---- Spend by infrastructure type ----
  const byInfrastructure = (() => {
    const colors = {
      Bridge: '#f56565',
      Tunnel: '#9f7aea',
      'Express lane': '#63b3ed',
      Highway: '#4fd1c5',
    };
    const classify = (plaza) => {
      if (!plaza) return 'Highway';
      if (/tunnel/i.test(plaza)) return 'Tunnel';
      if (/\bbr\b|bridge|verrazano|goethals|narrows/i.test(plaza)) return 'Bridge';
      if (/etl|express/i.test(plaza)) return 'Express lane';
      return 'Highway';
    };
    const acc = {};
    tolls.forEach((r) => {
      const type = classify(r.exitPlaza || r.entryPlaza);
      acc[type] = acc[type] || { type, spend: 0, count: 0, color: colors[type] };
      acc[type].spend += r.amount;
      acc[type].count += 1;
    });
    return Object.values(acc)
      .map((x) => ({ ...x, avg: x.spend / x.count }))
      .sort((a, b) => b.spend - a.spend);
  })();

  // ---- Records & superlatives ----
  const superlatives = (() => {
    const dayMap = {};
    tolls.forEach((r) => {
      const k = r.transactionDate.toISOString().slice(0, 10);
      dayMap[k] = dayMap[k] || { date: k, spend: 0, count: 0 };
      dayMap[k].spend += r.amount;
      dayMap[k].count += 1;
    });
    const days = Object.values(dayMap).sort((a, b) => a.date.localeCompare(b.date));
    let longestStreak = days.length ? 1 : 0;
    let streak = longestStreak;
    let longestGap = 0;
    for (let i = 1; i < days.length; i++) {
      const diff = Math.round((new Date(days[i].date) - new Date(days[i - 1].date)) / 86400000);
      if (diff === 1) {
        streak += 1;
        longestStreak = Math.max(longestStreak, streak);
      } else {
        streak = 1;
      }
      longestGap = Math.max(longestGap, diff - 1);
    }
    return {
      mostExpensiveDay: days.reduce((m, d) => (d.spend > m.spend ? d : m), days[0]),
      busiestDay: days.reduce((m, d) => (d.count > m.count ? d : m), days[0]),
      drivingDays: days.length,
      longestStreak,
      longestGap,
      maxToll,
      minPaidToll,
      longestTrip: trips.reduce((m, t) => (t.miles > (m?.miles || 0) ? t : m), null),
    };
  })();

  // ---- Repeat routes + timing ----
  const weekdayWeekend = (() => {
    const wk = { weekday: { spend: 0, count: 0 }, weekend: { spend: 0, count: 0 } };
    tolls.forEach((r) => {
      const d = r.transactionDate.getDay();
      const key = d === 0 || d === 6 ? 'weekend' : 'weekday';
      wk[key].spend += r.amount;
      wk[key].count += 1;
    });
    return wk;
  })();

  const byDaypart = (() => {
    const parts = [
      ['Overnight', 0, 5],
      ['Morning', 5, 11],
      ['Midday', 11, 15],
      ['Afternoon', 15, 19],
      ['Evening', 19, 24],
    ];
    return parts.map(([part, lo, hi]) => {
      const rs = tolls.filter((r) => {
        const h = r.transactionDate.getHours();
        return h >= lo && h < hi;
      });
      const spend = rs.reduce((s, r) => s + r.amount, 0);
      return { part, count: rs.length, spend, avgAmount: rs.length ? spend / rs.length : 0 };
    });
  })();

  const repeatRoutes = odFlows.slice(0, 8);

  return {
    records,
    tolls,
    payments,
    totalTollSpend,
    totalPayments,
    tollCount,
    avgToll,
    maxToll,
    minPaidToll,
    firstTrip,
    lastTrip,
    daysCovered,
    byAgency,
    byPlaza,
    dailySpend,
    balanceSeries,
    hasBalance,
    segments,
    explicitSegments,
    totalMiles,
    speedSamples,
    avgSpeed,
    costPerMile,
    hourHistogram,
    busiestHour,
    mapPoints,
    billingLag,
    trips,
    odFlows,
    dowHour,
    dowHourMax,
    byDayOfWeek,
    projection,
    byInfrastructure,
    superlatives,
    weekdayWeekend,
    byDaypart,
    repeatRoutes,
  };
}

// The bundled sample dataset (the original account export).
export const SAMPLE_CSV = RAW_CSV;

export { AGENCY_INFO, labelFor };
