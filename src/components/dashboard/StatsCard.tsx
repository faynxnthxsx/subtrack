// src/components/dashboard/StatsCard.tsx

type Props = {
  label: string;
  value: string | number;
  unit?: string;
  sub?: string;
};

export default function StatsCard({ label, value, unit, sub }: Props) {
  return (
    <div style={{
      background: "var(--bg-card)",
      border: "1px solid var(--border)",
      boxShadow: "var(--card-shadow)",
      borderRadius: 16,
      padding: "24px",
      transition: "all 0.3s ease",
      display: "flex",
      flexDirection: "column",
      gap: 12,
    }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.02em" }}>
        {label}
      </div>
      <div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
          <span style={{ fontSize: 28, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em", lineHeight: 1 }}>
            {value}
          </span>
          {unit && (
            <span style={{ fontSize: 14, fontWeight: 500, color: "var(--text-secondary)" }}>
              {unit}
            </span>
          )}
        </div>
        {sub && (
          <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 8 }}>
            {sub}
          </div>
        )}
      </div>
    </div>
  );
}