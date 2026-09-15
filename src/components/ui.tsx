import React from 'react';

export function Chip({ children, kind }: { children: React.ReactNode; kind?: 'accent' | 'success' | 'warning' | 'danger' | 'info' }) {
  return <span className={`chip${kind ? ` ${kind}` : ''}`}>{children}</span>;
}

export function ProgressBar({ value, max = 100, label }: { value: number; max?: number; label?: string }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100} aria-label={label ?? 'progress'}>
      <div className="progress-track"><div className="progress-fill" style={{ width: `${pct}%` }} /></div>
    </div>
  );
}

export function ReadinessRing({ score, size = 120 }: { score: number; size?: number }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  const off = c - (score / 100) * c;
  return (
    <div role="img" aria-label={`Readiness ${score} out of 100`}>
      <svg width={size} height={size} viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={r} fill="none" strokeWidth="12" stroke="var(--surface-muted)" />
        <circle cx="60" cy="60" r={r} fill="none" strokeWidth="12" strokeLinecap="round"
          stroke="url(#rg)" strokeDasharray={c} strokeDashoffset={off} transform="rotate(-90 60 60)"
          style={{ transition: 'stroke-dashoffset 600ms ease' }} />
        <defs><linearGradient id="rg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#2563eb" /><stop offset="100%" stopColor="#0e7490" /></linearGradient></defs>
        <text x="60" y="58" textAnchor="middle" fontWeight={800} fontSize="24" fill="var(--text-primary)">{score}</text>
        <text x="60" y="76" textAnchor="middle" fontSize="11" fill="var(--text-muted)">/ 100</text>
      </svg>
    </div>
  );
}

export function Empty({ title, body, action }: { title: string; body: string; action?: React.ReactNode }) {
  return (
    <div className="card" role="status">
      <h3>{title}</h3>
      <p>{body}</p>
      {action}
    </div>
  );
}

export function FlowDiagram({ title, caption, nodes }: { title: string; caption?: string; nodes: string[] }) {
  // Custom SVG vertical flow — responsive, scroll-free, labelled
  const h = nodes.length * 64 + 30;
  return (
    <figure style={{ margin: '14px 0' }}>
      <figcaption className="small" style={{ fontWeight: 700, marginBottom: 8 }}>{title}</figcaption>
      <svg className="flow-svg" viewBox={`0 0 560 ${h}`} role="img" aria-label={`${title}: ${nodes.join(' then ')}`}>
        {nodes.map((n, i) => {
          const y = 16 + i * 64;
          return (
            <g key={i}>
              <rect x="60" y={y} width="440" height="42" rx="10" fill="var(--surface-muted)" stroke="var(--border-strong)" />
              <text x="280" y={y + 26} textAnchor="middle" fontSize="13" fontWeight={600} fill="var(--text-primary)">{n.length > 52 ? n.slice(0, 52) + '…' : n}</text>
              {i < nodes.length - 1 && (
                <g stroke="var(--accent)" strokeWidth="2" fill="none">
                  <line x1="280" y1={y + 42} x2="280" y2={y + 60} />
                  <polygon points="274,54 286,54 280,62" fill="var(--accent)" stroke="none" transform={`translate(0,${y})`} />
                </g>
              )}
            </g>
          );
        })}
      </svg>
      {caption && <figcaption className="caption muted" style={{ marginTop: 6 }}>{caption}</figcaption>}
    </figure>
  );
}

export function ArchitectureDiagram({ components, links }: { components: { id: string; label: string; x: number; y: number }[]; links: [string, string][] }) {
  const byId = Object.fromEntries(components.map((c) => [c.id, c]));
  return (
    <svg className="flow-svg" viewBox="0 0 640 360" role="img" aria-label={`Architecture with ${components.map((c) => c.label).join(', ')}`}>
      {links.map(([a, b], i) => {
        const A = byId[a]; const B = byId[b];
        if (!A || !B) return null;
        return <line key={i} x1={A.x} y1={A.y} x2={B.x} y2={B.y} stroke="var(--accent)" strokeWidth="1.6" strokeDasharray="5 4" />;
      })}
      {components.map((c) => (
        <g key={c.id}>
          <rect x={c.x - 62} y={c.y - 20} width="124" height="40" rx="10" fill="var(--surface-muted)" stroke="var(--border-strong)" />
          <text x={c.x} y={c.y + 5} textAnchor="middle" fontSize="12" fontWeight={700} fill="var(--text-primary)">{c.label}</text>
        </g>
      ))}
    </svg>
  );
}

export function ChartSummary({ text }: { text: string }) {
  return <p className="sr-only">{text}</p>;
}
