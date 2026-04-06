import React, { useState, useMemo } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// DEMO DATA — 8 accounts across a fictional utility district
// ─────────────────────────────────────────────────────────────────────────────
const ACCOUNTS = [
  {
    id: "WTR-004821", name: "Sarah Mitchell",  address: "1247 Maple Creek Dr",
    meter: "MET-88234", usage: 4820, avgUsage: 4100, bill: 42.18, billStatus: "due",
    flags: ["CONTINUOUS_FLOW", "BACKFLOW"], lastRead: "Today, 6:00 AM",
    history: [3940, 3760, 4010, 4420, 4580, 4820],
  },
  {
    id: "WTR-003214", name: "James Thornton",  address: "842 Ridgeline Blvd",
    meter: "MET-77120", usage: 2840, avgUsage: 3100, bill: 24.90, billStatus: "paid",
    flags: [], lastRead: "Today, 6:00 AM",
    flowRate: 0, durationHrs: 0, zone: "South",
    history: [3200, 3100, 2900, 3050, 2980, 2840],
  },
  {
    id: "WTR-005502", name: "Maria Patel",     address: "319 Sundown Ave",
    meter: "MET-91043", usage: 5910, avgUsage: 4200, bill: 51.82, billStatus: "overdue",
    flags: ["CONTINUOUS_FLOW"], lastRead: "Today, 6:00 AM",
    flowRate: 1.5, durationHrs: 5, zone: "East",
    history: [3800, 4100, 4300, 4600, 5200, 5910],
  },
  {
    id: "WTR-002187", name: "Carlos Williams", address: "5501 Oak Hollow Rd",
    meter: "MET-65509", usage: 3490, avgUsage: 3400, bill: 30.62, billStatus: "paid",
    flags: [], lastRead: "Today, 6:00 AM",
    flowRate: 0, durationHrs: 0, zone: "West",
    history: [3300, 3400, 3350, 3420, 3380, 3490],
  },
  {
    id: "WTR-006740", name: "Linda Nguyen",    address: "728 Clearwater Ln",
    meter: "MET-44312", usage: 6200, avgUsage: 3800, bill: 54.41, billStatus: "overdue",
    flags: ["CONTINUOUS_FLOW", "BACKFLOW"], lastRead: "Today, 6:00 AM",
    flowRate: 2.1, durationHrs: 4, zone: "North",
    history: [3600, 3700, 3900, 4800, 5500, 6200],
  },
  {
    id: "WTR-001093", name: "Tom Garcia",      address: "90 Prairie Wind Ct",
    meter: "MET-33201", usage: 5010, avgUsage: 4600, bill: 43.94, billStatus: "due",
    flags: ["BACKFLOW"], lastRead: "Today, 6:00 AM",
    history: [4400, 4500, 4600, 4700, 4800, 5010],
  },
  {
    id: "WTR-007831", name: "Angela Brooks",   address: "2214 Fernwood Dr",
    meter: "MET-28840", usage: 3120, avgUsage: 3200, bill: 27.36, billStatus: "paid",
    flags: [], lastRead: "Today, 6:00 AM",
    flowRate: 0, durationHrs: 0, zone: "East",
    history: [3300, 3250, 3180, 3200, 3150, 3120],
  },
  {
    id: "WTR-008904", name: "Derek Kim",       address: "476 Juniper Pass",
    meter: "MET-19977", usage: 7340, avgUsage: 4000, bill: 64.38, billStatus: "overdue",
    flags: ["CONTINUOUS_FLOW", "BACKFLOW"], lastRead: "Today, 6:00 AM",
    flowRate: 2.8, durationHrs: 6, zone: "West",
    history: [3800, 4100, 4600, 5200, 6100, 7340],
  },
];

const FLAG_LABELS = {
  CONTINUOUS_FLOW: { label: "Leak",     color: "#B91C1C", bg: "#FEF2F2", border: "#FCA5A5" },
  BACKFLOW:        { label: "Backflow", color: "#1E3A8A", bg: "#EFF6FF", border: "#BFDBFE" },
};

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --ink:        #0A1628;
    --ink-2:      #1E3048;
    --ink-3:      #4A6180;
    --ink-4:      #8AA4BF;
    --rule:       #1E3048;
    --rule-light: #D8E6F0;
    --surface:    #0D1F35;
    --surface-2:  #0A1628;
    --surface-3:  #162844;
    --teal:       #0B7EA3;
    --teal-light: #0D2F3F;
    --teal-mid:   #1A5570;
    --green:      #0F7B52;
    --green-bg:   #0A2520;
    --red:        #B91C1C;
    --red-bg:     #2D0A0A;
    --amber:      #92480A;
    --amber-bg:   #2D1A06;
    --display:    'Plus Jakarta Sans', sans-serif;
    --mono:       'DM Mono', monospace;
  }
  body { font-family: var(--display); background: var(--surface-2); color: #E2EBF0; margin: 0; }
  input, button, select { font-family: var(--display); }
  button { cursor: pointer; }
  @keyframes fadeUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
  @keyframes ripple { 0% { box-shadow:0 0 0 0 rgba(185,28,28,0.5); } 70% { box-shadow:0 0 0 8px rgba(185,28,28,0); } 100% { box-shadow:0 0 0 0 rgba(185,28,28,0); } }
  .fade-up { animation: fadeUp 0.25s ease both; }
  input:focus, select:focus { outline: none; }
`;

// ─────────────────────────────────────────────────────────────────────────────
// SHARED COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────
function FlagBadge({ code }) {
  const f = FLAG_LABELS[code];
  if (!f) return null;
  return (
    <span style={{
      fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 99,
      background: f.bg, color: f.color, border: `1px solid ${f.border}`,
      whiteSpace: "nowrap",
    }}>{f.label}</span>
  );
}

function StatusBadge({ status }) {
  const map = {
    paid:    { label: "Paid",    bg: "#0A2520", color: "#34D399", border: "#065F46" },
    due:     { label: "Due",     bg: "#1C1A06", color: "#FCD34D", border: "#78350F" },
    overdue: { label: "Overdue", bg: "#2D0A0A", color: "#F87171", border: "#7F1D1D" },
  };
  const s = map[status] || map.due;
  return (
    <span style={{
      fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 99,
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
    }}>{s.label}</span>
  );
}

function MiniSparkline({ data, flagged }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 64, h = 28;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 4) - 2;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg width={w} height={h} style={{ display: "block" }}>
      <polyline points={pts} fill="none" stroke={flagged ? "#EF4444" : "#0B7EA3"} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round"/>
      <circle cx={pts.split(" ").pop().split(",")[0]} cy={pts.split(" ").pop().split(",")[1]} r="2.5" fill={flagged ? "#EF4444" : "#0B7EA3"}/>
    </svg>
  );
}

function KPICard({ label, value, sub, accent }) {
  const colors = {
    red:   { bg: "#2D0A0A", border: "#7F1D1D", label: "#F87171", value: "#FCA5A5" },
    teal:  { bg: "#0D2A3A", border: "#1A5570", label: "#38BDF8", value: "#7DD3FC" },
    green: { bg: "#0A2520", border: "#065F46", label: "#34D399", value: "#6EE7B7" },
    amber: { bg: "#1C1206", border: "#78350F", label: "#FCD34D", value: "#FDE68A" },
    plain: { bg: "#162844", border: "#1E3048", label: "#8AA4BF", value: "#E2EBF0" },
  };
  const c = colors[accent] || colors.plain;
  return (
    <div style={{ background: c.bg, border: `1px solid ${c.border}`, borderRadius: 12, padding: "16px 18px" }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: c.label, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 800, color: c.value, lineHeight: 1, letterSpacing: "-0.02em" }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: "#4A6180", marginTop: 6 }}>{sub}</div>}
    </div>
  );
}

function MiniBarChart({ data }) {
  const max = Math.max(...data);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 40 }}>
      {data.map((v, i) => (
        <div key={i} style={{
          flex: 1, borderRadius: "2px 2px 0 0",
          height: `${Math.max(4, Math.round((v / max) * 38))}px`,
          background: i === data.length - 1 ? "#0B7EA3" : "#1E3048",
        }}/>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ACCOUNT DETAIL PANEL
// ─────────────────────────────────────────────────────────────────────────────
function AccountDetail({ account, onClose }) {
  const flagged = account.flags.length > 0;
  const months = ["Oct '25", "Nov '25", "Dec '25", "Jan '26", "Feb '26", "Mar '26"];
  const overAvg = Math.round(((account.usage - account.avgUsage) / account.avgUsage) * 100);

  return (
    <div className="fade-up" style={{
      background: "#0D1F35", border: "1px solid #1E3048",
      borderRadius: 16, overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{ padding: "20px 24px", borderBottom: "1px solid #1E3048", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#E2EBF0" }}>{account.name}</div>
            {account.flags.map(f => <FlagBadge key={f} code={f}/>)}
          </div>
          <div style={{ fontSize: 12, color: "#4A6180", fontFamily: "var(--mono)" }}>{account.id} · {account.address} · {account.zone} Zone</div>
        </div>
        <button onClick={onClose} style={{ background: "#162844", border: "1px solid #1E3048", color: "#8AA4BF", borderRadius: 8, padding: "6px 14px", fontSize: 13 }}>← Back</button>
      </div>

      <div style={{ padding: "20px 24px" }}>
        {/* KPIs */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 20 }}>
          <KPICard label="March usage" value={`${account.usage.toLocaleString()}`} sub="gallons" accent={overAvg > 15 ? "red" : "plain"}/>
          <KPICard label="vs. avg" value={`${overAvg > 0 ? "+" : ""}${overAvg}%`} sub={`Avg ${account.avgUsage.toLocaleString()} gal`} accent={overAvg > 15 ? "red" : overAvg < 0 ? "green" : "plain"}/>
          <KPICard label="Current bill" value={`$${account.bill.toFixed(2)}`} sub={account.billStatus} accent={account.billStatus === "overdue" ? "red" : account.billStatus === "due" ? "amber" : "green"}/>
          <KPICard label="Active flags" value={account.flags.length} sub={account.flags.length > 0 ? "Needs attention" : "All clear"} accent={account.flags.length > 0 ? "red" : "green"}/>
        </div>

        {/* Leak detection */}
        {account.flags.includes("CONTINUOUS_FLOW") && (
          <div style={{ background: "#2D0A0A", border: "1px solid #7F1D1D", borderRadius: 12, padding: "16px 20px", marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#EF4444", animation: "ripple 2s infinite" }}/>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#FCA5A5" }}>Active leak detected</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
              {[
                { label: "Flow rate",  value: `${account.flowRate} GPM` },
                { label: "Duration",   value: `${account.durationHrs} hrs` },
                { label: "Est. waste", value: `${Math.round(account.flowRate * 60 * account.durationHrs)} gal` },
              ].map(k => (
                <div key={k.label} style={{ background: "rgba(0,0,0,0.3)", border: "1px solid #7F1D1D", borderRadius: 8, padding: "10px 12px" }}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: "#F87171", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>{k.label}</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: "#FCA5A5" }}>{k.value}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Usage history */}
        <div style={{ background: "#162844", border: "1px solid #1E3048", borderRadius: 12, padding: "16px 20px", marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#8AA4BF", marginBottom: 14 }}>6-month usage history</div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 80, marginBottom: 10 }}>
            {account.history.map((v, i) => {
              const max = Math.max(...account.history);
              const h = Math.max(4, Math.round((v / max) * 76));
              const isCurrent = i === account.history.length - 1;
              return (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <div style={{ width: "100%", height: h, borderRadius: "3px 3px 0 0", background: isCurrent ? (flagged ? "#EF4444" : "#0B7EA3") : "#1E3048" }}/>
                  <div style={{ fontSize: 9, color: "#4A6180" }}>{months[i].split(" ")[0]}</div>
                </div>
              );
            })}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 6 }}>
            {account.history.map((v, i) => (
              <div key={i} style={{ background: "#0A1628", borderRadius: 6, padding: "6px 8px", textAlign: "center" }}>
                <div style={{ fontSize: 9, color: "#4A6180", marginBottom: 2 }}>{months[i]}</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: i === account.history.length - 1 ? "#38BDF8" : "#8AA4BF" }}>{v.toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Meter info */}
        <div style={{ background: "#162844", border: "1px solid #1E3048", borderRadius: 12, padding: "16px 20px" }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#8AA4BF", marginBottom: 12 }}>Meter details</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {[
              ["Meter serial",   account.meter],
              ["Last read",      account.lastRead],
              ["Read interval",  "Hourly"],
              ["Zone",           `${account.zone} District`],
              ["Meter type",     "AMI Smart Meter"],
              ["Signal status",  "Strong"],
            ].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid #1E3048" }}>
                <span style={{ fontSize: 12, color: "#4A6180" }}>{k}</span>
                <span style={{ fontSize: 12, fontWeight: 500, color: "#8AA4BF", fontFamily: "var(--mono)" }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN ADMIN APP
// ─────────────────────────────────────────────────────────────────────────────
export default function AdminApp() {
  const [search, setSearch] = useState("");
  const [filterFlag, setFilterFlag] = useState("all");
  const [filterZone, setFilterZone] = useState("all");
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [tab, setTab] = useState("dashboard");

  const flaggedAccounts  = ACCOUNTS.filter(a => a.flags.length > 0);
  const overdueAccounts  = ACCOUNTS.filter(a => a.billStatus === "overdue");
  const leakAccounts     = ACCOUNTS.filter(a => a.flags.includes("CONTINUOUS_FLOW"));
  const totalUsage       = ACCOUNTS.reduce((s, a) => s + a.usage, 0);
  const totalRevenue     = ACCOUNTS.reduce((s, a) => s + a.bill, 0);

  const filtered = useMemo(() => {
    return ACCOUNTS.filter(a => {
      const matchSearch = !search ||
        a.name.toLowerCase().includes(search.toLowerCase()) ||
        a.id.toLowerCase().includes(search.toLowerCase()) ||
        a.address.toLowerCase().includes(search.toLowerCase());
      const matchFlag = filterFlag === "all" ||
        (filterFlag === "flagged" && a.flags.length > 0) ||
        (filterFlag === "leak" && a.flags.includes("CONTINUOUS_FLOW")) ||
        (filterFlag === "backflow" && a.flags.includes("BACKFLOW")) ||
        (filterFlag === "clean" && a.flags.length === 0);
      const matchZone = filterZone === "all" || a.zone === filterZone;
      return matchSearch && matchFlag && matchZone;
    });
  }, [search, filterFlag, filterZone]);

  const TABS = [
    { id: "dashboard", label: "Dashboard" },
    { id: "accounts",  label: `Accounts (${ACCOUNTS.length})` },
    { id: "flags",     label: `Active Flags (${flaggedAccounts.length})` },
  ];

  return (
    <>
      <style>{STYLES}</style>
      <div style={{ minHeight: "100vh", background: "#0A1628" }}>

        {/* ── TOP NAV ── */}
        <div style={{ background: "#0D1F35", borderBottom: "1px solid #1E3048", padding: "0 28px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: "#162844", border: "1px solid #1E3048", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="26" height="16" viewBox="0 0 26 16" fill="none">
                <text x="0"  y="13" fontFamily="Plus Jakarta Sans,sans-serif" fontWeight="800" fontSize="14" fill="white">H</text>
                <text x="9"  y="15" fontFamily="Plus Jakarta Sans,sans-serif" fontWeight="700" fontSize="8"  fill="#38BDF8">2</text>
                <text x="14" y="13" fontFamily="Plus Jakarta Sans,sans-serif" fontWeight="800" fontSize="14" fill="white">Q</text>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: "#E2EBF0", letterSpacing: "-0.02em", lineHeight: 1 }}>
                H<sub style={{ fontSize: 9, color: "#38BDF8" }}>2</sub>Q Admin
              </div>
              <div style={{ fontSize: 10, color: "#4A6180", marginTop: 1, letterSpacing: "0.04em" }}>UTILITY OPERATIONS PORTAL</div>
            </div>
          </div>

          {/* Global search */}
          <div style={{ position: "relative", width: 320 }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}>
              <circle cx="6" cy="6" r="4.5" stroke="#4A6180" strokeWidth="1.5"/>
              <path d="M9.5 9.5L12 12" stroke="#4A6180" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setTab("accounts"); setSelectedAccount(null); }}
              placeholder="Search accounts, addresses, IDs…"
              style={{
                width: "100%", background: "#162844", border: "1px solid #1E3048",
                borderRadius: 8, padding: "8px 12px 8px 34px", fontSize: 13,
                color: "#E2EBF0", transition: "border-color 0.15s",
              }}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#34D399" }}/>
            <span style={{ fontSize: 12, color: "#4A6180" }}>Live · Last sync 6:00 AM</span>
          </div>
        </div>

        {/* ── TAB BAR ── */}
        <div style={{ background: "#0D1F35", borderBottom: "1px solid #1E3048", padding: "0 28px", display: "flex", gap: 4 }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => { setTab(t.id); setSelectedAccount(null); }} style={{
              background: "none", border: "none",
              borderBottom: tab === t.id ? "2px solid #0B7EA3" : "2px solid transparent",
              padding: "12px 16px", marginBottom: -1,
              fontSize: 13, fontWeight: tab === t.id ? 700 : 400,
              color: tab === t.id ? "#38BDF8" : "#4A6180",
              transition: "color 0.15s",
            }}>{t.label}</button>
          ))}
        </div>

        {/* ── CONTENT ── */}
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 28px 48px" }}>

          {/* ── DASHBOARD TAB ── */}
          {tab === "dashboard" && !selectedAccount && (
            <div className="fade-up">
              {/* KPI row */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
                <KPICard label="Total accounts"   value={ACCOUNTS.length}                    sub="Active meters"              accent="teal"/>
                <KPICard label="Active flags"      value={flaggedAccounts.length}             sub={`${leakAccounts.length} leak · ${overdueAccounts.length} overdue bills`} accent="red"/>
                <KPICard label="Total usage"       value={`${(totalUsage/1000).toFixed(1)}k`} sub="Gallons · March 2026"       accent="plain"/>
                <KPICard label="Monthly revenue"   value={`$${totalRevenue.toFixed(0)}`}      sub={`${overdueAccounts.length} overdue`} accent={overdueAccounts.length > 0 ? "amber" : "green"}/>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>

                {/* Flagged accounts */}
                <div style={{ background: "#0D1F35", border: "1px solid #1E3048", borderRadius: 14, overflow: "hidden" }}>
                  <div style={{ padding: "14px 20px", borderBottom: "1px solid #1E3048", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#E2EBF0" }}>Flagged accounts</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#EF4444", animation: "ripple 2s infinite" }}/>
                      <span style={{ fontSize: 12, color: "#F87171" }}>{flaggedAccounts.length} active</span>
                    </div>
                  </div>
                  <div>
                    {flaggedAccounts.map((a, i) => (
                      <div key={a.id} onClick={() => { setSelectedAccount(a); setTab("accounts"); }}
                        style={{
                          display: "flex", alignItems: "center", gap: 12, padding: "12px 20px",
                          borderBottom: i < flaggedAccounts.length - 1 ? "1px solid #1E3048" : "none",
                          cursor: "pointer", transition: "background 0.15s",
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = "#162844"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                      >
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: "#E2EBF0", marginBottom: 2 }}>{a.name}</div>
                          <div style={{ fontSize: 11, color: "#4A6180", fontFamily: "var(--mono)" }}>{a.id} · {a.address}</div>
                        </div>
                        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", justifyContent: "flex-end" }}>
                          {a.flags.map(f => <FlagBadge key={f} code={f}/>)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Usage overview */}
                <div style={{ background: "#0D1F35", border: "1px solid #1E3048", borderRadius: 14, overflow: "hidden" }}>
                  <div style={{ padding: "14px 20px", borderBottom: "1px solid #1E3048" }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#E2EBF0" }}>Usage overview</div>
                    <div style={{ fontSize: 12, color: "#4A6180", marginTop: 2 }}>March 2026 · all accounts ranked by usage</div>
                  </div>
                  <div>
                    {[...ACCOUNTS].sort((a, b) => b.usage - a.usage).map((a, i) => {
                      const pct = Math.round((a.usage / Math.max(...ACCOUNTS.map(x => x.usage))) * 100);
                      const flagged = a.flags.length > 0;
                      return (
                        <div key={a.id} onClick={() => { setSelectedAccount(a); setTab("accounts"); }}
                          style={{
                            display: "flex", alignItems: "center", gap: 10, padding: "10px 20px",
                            borderBottom: i < ACCOUNTS.length - 1 ? "1px solid #162844" : "none",
                            cursor: "pointer",
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = "#162844"}
                          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                        >
                          <div style={{ fontSize: 11, color: "#4A6180", width: 16, textAlign: "right", fontFamily: "var(--mono)" }}>{i + 1}</div>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                              <span style={{ fontSize: 12, fontWeight: 600, color: "#E2EBF0" }}>{a.name}</span>
                              <span style={{ fontSize: 12, fontFamily: "var(--mono)", color: flagged ? "#F87171" : "#8AA4BF" }}>{a.usage.toLocaleString()} gal</span>
                            </div>
                            <div style={{ height: 4, background: "#162844", borderRadius: 2, overflow: "hidden" }}>
                              <div style={{ height: "100%", width: `${pct}%`, background: flagged ? "#EF4444" : "#0B7EA3", borderRadius: 2 }}/>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Billing summary — overdue only */}
              <div style={{ background: "#0D1F35", border: "1px solid #7F1D1D", borderRadius: 14, overflow: "hidden" }}>
                <div style={{ padding: "14px 20px", borderBottom: "1px solid #7F1D1D", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#E2EBF0" }}>Overdue billing — March 2026</div>
                  <div style={{ fontSize: 12, color: "#F87171" }}>{overdueAccounts.length} accounts past due</div>
                </div>
                {overdueAccounts.length === 0 ? (
                  <div style={{ padding: "24px 20px", textAlign: "center", fontSize: 13, color: "#4A6180" }}>No overdue accounts this cycle.</div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: `repeat(${overdueAccounts.length}, 1fr)` }}>
                    {overdueAccounts.map((a, i) => (
                      <div key={a.id} onClick={() => { setSelectedAccount(a); setTab("accounts"); }}
                        style={{
                          padding: "18px 20px", borderRight: i < overdueAccounts.length - 1 ? "1px solid #7F1D1D" : "none",
                          cursor: "pointer", textAlign: "center", background: "#1A0A0A",
                          transition: "background 0.15s",
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = "#2D0A0A"}
                        onMouseLeave={e => e.currentTarget.style.background = "#1A0A0A"}
                      >
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#F87171", marginBottom: 6 }}>{a.name}</div>
                        <div style={{ fontSize: 22, fontWeight: 800, color: "#FCA5A5", fontFamily: "var(--mono)", marginBottom: 8 }}>${a.bill.toFixed(2)}</div>
                        <StatusBadge status={a.billStatus}/>
                        <div style={{ fontSize: 11, color: "#7F1D1D", marginTop: 8, fontFamily: "var(--mono)" }}>{a.id}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── ACCOUNTS TAB ── */}
          {tab === "accounts" && !selectedAccount && (
            <div className="fade-up">
              {/* Filters */}
              <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
                <select value={filterFlag} onChange={e => setFilterFlag(e.target.value)} style={{
                  background: "#162844", border: "1px solid #1E3048", borderRadius: 8,
                  padding: "8px 14px", fontSize: 13, color: "#E2EBF0",
                }}>
                  <option value="all">All flags</option>
                  <option value="flagged">Has flags</option>
                  <option value="leak">Leak only</option>
                  <option value="backflow">Backflow only</option>
                  <option value="clean">No flags</option>
                </select>
                <select value={filterZone} onChange={e => setFilterZone(e.target.value)} style={{
                  background: "#162844", border: "1px solid #1E3048", borderRadius: 8,
                  padding: "8px 14px", fontSize: 13, color: "#E2EBF0",
                }}>
                  <option value="all">All zones</option>
                  {["North","South","East","West"].map(z => <option key={z} value={z}>{z} Zone</option>)}
                </select>
                <div style={{ fontSize: 12, color: "#4A6180", display: "flex", alignItems: "center" }}>
                  {filtered.length} of {ACCOUNTS.length} accounts
                </div>
              </div>

              {/* Account table */}
              <div style={{ background: "#0D1F35", border: "1px solid #1E3048", borderRadius: 14, overflow: "hidden" }}>
                {/* Table header */}
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1.5fr 1fr 1fr 1fr 1.5fr", gap: 0, padding: "10px 20px", borderBottom: "1px solid #1E3048", background: "#162844" }}>
                  {["Account", "Address", "Usage", "Bill", "Status", "Flags"].map(h => (
                    <div key={h} style={{ fontSize: 11, fontWeight: 600, color: "#4A6180", textTransform: "uppercase", letterSpacing: "0.07em" }}>{h}</div>
                  ))}
                </div>
                {filtered.length === 0 && (
                  <div style={{ padding: "32px", textAlign: "center", color: "#4A6180", fontSize: 13 }}>No accounts match your filters.</div>
                )}
                {filtered.map((a, i) => (
                  <div key={a.id} onClick={() => setSelectedAccount(a)}
                    style={{
                      display: "grid", gridTemplateColumns: "2fr 1.5fr 1fr 1fr 1fr 1.5fr",
                      gap: 0, padding: "13px 20px", alignItems: "center",
                      borderBottom: i < filtered.length - 1 ? "1px solid #162844" : "none",
                      cursor: "pointer", transition: "background 0.12s",
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = "#162844"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#E2EBF0" }}>{a.name}</div>
                      <div style={{ fontSize: 11, color: "#4A6180", fontFamily: "var(--mono)", marginTop: 2 }}>{a.id}</div>
                    </div>
                    <div style={{ fontSize: 12, color: "#8AA4BF" }}>{a.address}</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: a.flags.includes("CONTINUOUS_FLOW") ? "#F87171" : "#E2EBF0", fontFamily: "var(--mono)" }}>{a.usage.toLocaleString()}</span>
                      <MiniSparkline data={a.history} flagged={a.flags.length > 0}/>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#E2EBF0", fontFamily: "var(--mono)" }}>${a.bill.toFixed(2)}</div>
                    <StatusBadge status={a.billStatus}/>
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                      {a.flags.length === 0
                        ? <span style={{ fontSize: 11, color: "#4A6180" }}>—</span>
                        : a.flags.map(f => <FlagBadge key={f} code={f}/>)
                      }
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── FLAGS TAB ── */}
          {tab === "flags" && !selectedAccount && (
            <div className="fade-up">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 20 }}>
                <KPICard label="Leak / continuous flow" value={leakAccounts.length}  sub="Accounts flagged" accent="red"/>
                <KPICard label="Backflow events"        value={ACCOUNTS.filter(a => a.flags.includes("BACKFLOW")).length} sub="Accounts flagged" accent="teal"/>
                <KPICard label="Backflow events"        value={ACCOUNTS.filter(a => a.flags.includes("BACKFLOW")).length} sub="Accounts flagged" accent="teal"/>
              </div>

              {flaggedAccounts.map((a, i) => (
                <div key={a.id} onClick={() => setSelectedAccount(a)}
                  style={{
                    background: "#0D1F35", border: "1px solid #1E3048", borderRadius: 12,
                    padding: "16px 20px", marginBottom: 10, cursor: "pointer",
                    display: "flex", alignItems: "center", gap: 16, transition: "border-color 0.15s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = "#0B7EA3"}
                  onMouseLeave={e => e.currentTarget.style.borderColor = "#1E3048"}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: "#E2EBF0" }}>{a.name}</span>
                      {a.flags.map(f => <FlagBadge key={f} code={f}/>)}
                    </div>
                    <div style={{ fontSize: 12, color: "#4A6180", fontFamily: "var(--mono)" }}>{a.id} · {a.address} · {a.zone} Zone</div>
                  </div>
                  {a.flags.includes("CONTINUOUS_FLOW") && (
                    <div style={{ display: "flex", gap: 10 }}>
                      {[
                        { label: "Flow",     value: `${a.flowRate} GPM` },
                        { label: "Duration", value: `${a.durationHrs} hrs` },
                        { label: "Waste",    value: `${Math.round(a.flowRate * 60 * a.durationHrs)} gal` },
                      ].map(k => (
                        <div key={k.label} style={{ background: "#2D0A0A", border: "1px solid #7F1D1D", borderRadius: 8, padding: "8px 12px", textAlign: "center" }}>
                          <div style={{ fontSize: 9, color: "#F87171", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 3 }}>{k.label}</div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: "#FCA5A5", fontFamily: "var(--mono)" }}>{k.value}</div>
                        </div>
                      ))}
                    </div>
                  )}
                  <MiniBarChart data={a.history}/>
                  <div style={{ fontSize: 12, color: "#4A6180" }}>→</div>
                </div>
              ))}
            </div>
          )}

          {/* ── ACCOUNT DETAIL ── */}
          {selectedAccount && (
            <AccountDetail account={selectedAccount} onClose={() => setSelectedAccount(null)}/>
          )}

        </div>

        {/* Footer */}
        <div style={{ borderTop: "1px solid #1E3048", padding: "12px 28px", display: "flex", justifyContent: "space-between", fontSize: 11, color: "#4A6180" }}>
          <span>H<sub style={{ fontSize: 8 }}>2</sub>Q Admin · {ACCOUNTS.length} accounts · Metro Water District</span>
          <span>AMI hourly reads · Last sync: Mar 27, 2026, 6:00 AM</span>
        </div>
      </div>
    </>
  );
}
