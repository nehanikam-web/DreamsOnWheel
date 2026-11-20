// Dependency-free bar chart. Values are scaled to the tallest bar.
export default function BarChart({ data, valueKey, labelKey = 'month', format = (v) => v }) {
  const max = Math.max(...data.map((d) => d[valueKey]), 1);
  return (
    <div className="bar-chart" role="img" aria-label="Bar chart">
      {data.map((d) => (
        <div className="bar-col" key={d[labelKey]}>
          <em>{format(d[valueKey])}</em>
          <div className="bar" style={{ height: `${(d[valueKey] / max) * 78}%` }} title={`${d[labelKey]}: ${format(d[valueKey])}`} />
          <span>{d[labelKey]}</span>
        </div>
      ))}
    </div>
  );
}

export function HBars({ rows }) {
  const max = Math.max(...rows.map((r) => r.value), 1);
  return (
    <div className="h-bars">
      {rows.map((r) => (
        <div className="h-bar-row" key={r.label}>
          <span>{r.label}</span>
          <div className="h-track"><div className="h-fill" style={{ width: `${(r.value / max) * 100}%` }} /></div>
          <span>{r.value}</span>
        </div>
      ))}
    </div>
  );
}
