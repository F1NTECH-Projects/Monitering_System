"use client";

import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend,
} from "recharts";

const DATA = [
  { day: "Mon", booked: 14, completed: 11, noShow: 3 },
  { day: "Tue", booked: 18, completed: 16, noShow: 2 },
  { day: "Wed", booked: 22, completed: 18, noShow: 4 },
  { day: "Thu", booked: 16, completed: 14, noShow: 2 },
  { day: "Fri", booked: 24, completed: 20, noShow: 4 },
  { day: "Sat", booked: 12, completed: 10, noShow: 2 },
  { day: "Sun", booked: 8,  completed: 7,  noShow: 1 },
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
          <span className="font-bold text-white">{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

export default function AppointmentChart() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={DATA} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="grad-booked" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#818cf8" stopOpacity={0.0} />
          </linearGradient>
          <linearGradient id="grad-completed" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#34d399" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#34d399" stopOpacity={0.0} />
          </linearGradient>
          <linearGradient id="grad-noShow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#fbbf24" stopOpacity={0.0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.06)" vertical={false} />
        <XAxis
          dataKey="day"
          tick={{ fontSize: 11, fill: "rgba(136,146,176,0.8)", fontFamily: "Inter" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "rgba(136,146,176,0.8)", fontFamily: "Inter" }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(99,102,241,0.1)", strokeWidth: 2 }} />
        <Legend
          wrapperStyle={{ fontSize: "11px", color: "rgba(136,146,176,0.8)", paddingTop: "12px" }}
          iconType="circle"
          iconSize={8}
        />
        <Area type="monotone" dataKey="booked"    name="booked"    stroke="#818cf8" strokeWidth={2} fill="url(#grad-booked)"    dot={false} activeDot={{ r: 4, fill: "#818cf8" }} />
        <Area type="monotone" dataKey="completed" name="completed" stroke="#34d399" strokeWidth={2} fill="url(#grad-completed)" dot={false} activeDot={{ r: 4, fill: "#34d399" }} />
        <Area type="monotone" dataKey="noShow"    name="no-show"   stroke="#fbbf24" strokeWidth={2} fill="url(#grad-noShow)"    dot={false} activeDot={{ r: 4, fill: "#fbbf24" }} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
