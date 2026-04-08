"use client";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from "recharts";

const DATA = [
  { week: "W1", sent: 48, delivered: 45, failed: 3  },
  { week: "W2", sent: 62, delivered: 58, failed: 4  },
  { week: "W3", sent: 55, delivered: 53, failed: 2  },
  { week: "W4", sent: 70, delivered: 66, failed: 4  },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="px-4 py-3 rounded-xl text-xs"
      style={{ background: "rgba(13,18,38,0.95)", border: "1px solid rgba(99,102,241,0.3)", boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }}>
      <p className="font-bold text-white mb-2">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: p.fill }} />
          <span className="text-[--foreground-muted]">{p.name}:</span>
          <span className="font-bold text-white">{p.value}</span>
        </p>
      ))}
    </div>
  );
};

export default function DeliveryChart() {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={DATA} margin={{ top: 4, right: 4, bottom: -8, left: -20 }} barCategoryGap="35%">
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.07)" vertical={false} />
        <XAxis  dataKey="week"  stroke="transparent" tick={{ fill: "#8892b0", fontSize: 11, fontWeight: 600 }} />
        <YAxis  stroke="transparent" tick={{ fill: "#8892b0", fontSize: 11 }} />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(99,102,241,0.05)" }} />
        <Bar dataKey="delivered" name="Delivered" radius={[4, 4, 0, 0]} fill="#34d399" maxBarSize={24} />
        <Bar dataKey="failed"    name="Failed"    radius={[4, 4, 0, 0]} fill="#f87171" maxBarSize={24} />
      </BarChart>
    </ResponsiveContainer>
  );
}
