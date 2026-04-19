"use client";

import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip,
} from "recharts";

const DATA = [
  { time: "8AM",  delivered: 95, failed: 5 },
  { time: "10AM", delivered: 88, failed: 12 },
  { time: "12PM", delivered: 97, failed: 3 },
  { time: "2PM",  delivered: 92, failed: 8 },
  { time: "4PM",  delivered: 94, failed: 6 },
  { time: "6PM",  delivered: 96, failed: 4 },
  { time: "8PM",  delivered: 99, failed: 1 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-xl p-3 text-xs"
      style={{
        background: "rgba(10,16,32,0.98)",
        border: "1px solid rgba(99,102,241,0.25)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
      }}
    >
      <p className="font-black text-white mb-2" style={{ fontFamily: "Outfit, sans-serif" }}>
        {label}
      </p>
      {payload.map((entry: any) => (
        <div key={entry.name} className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
          <span className="text-[var(--fg-muted)] capitalize">{entry.name}:</span>
          <span className="font-bold text-white">{entry.value}%</span>
        </div>
      ))}
    </div>
  );
};

export default function DeliveryChart() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={DATA} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="grad-delivered" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#22d3ee" stopOpacity={0.0} />
          </linearGradient>
          <linearGradient id="grad-failed" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#f87171" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#f87171" stopOpacity={0.0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.06)" vertical={false} />
        <XAxis
          dataKey="time"
          tick={{ fontSize: 11, fill: "rgba(136,146,176,0.8)", fontFamily: "Inter" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "rgba(136,146,176,0.8)", fontFamily: "Inter" }}
          axisLine={false}
          tickLine={false}
          domain={[0, 100]}
          tickFormatter={(v) => `${v}%`}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(99,102,241,0.1)", strokeWidth: 2 }} />
        <Area type="monotone" dataKey="delivered" name="delivered" stroke="#22d3ee" strokeWidth={2} fill="url(#grad-delivered)" dot={false} activeDot={{ r: 4, fill: "#22d3ee" }} />
        <Area type="monotone" dataKey="failed"    name="failed"    stroke="#f87171" strokeWidth={2} fill="url(#grad-failed)"    dot={false} activeDot={{ r: 4, fill: "#f87171" }} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
