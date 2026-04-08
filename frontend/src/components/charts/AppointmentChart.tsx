"use client";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";

const DATA = [
  { day: "Mon", scheduled: 12, completed: 9,  noShow: 2 },
  { day: "Tue", scheduled: 18, completed: 14, noShow: 3 },
  { day: "Wed", scheduled: 15, completed: 12, noShow: 1 },
  { day: "Thu", scheduled: 22, completed: 19, noShow: 2 },
  { day: "Fri", scheduled: 20, completed: 16, noShow: 3 },
  { day: "Sat", scheduled: 14, completed: 11, noShow: 1 },
  { day: "Sun", scheduled: 8,  completed: 7,  noShow: 0 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="px-4 py-3 rounded-xl text-xs"
      style={{ background: "rgba(13,18,38,0.95)", border: "1px solid rgba(99,102,241,0.3)", boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }}>
      <p className="font-bold text-white mb-2">{label}</p>
      {payload.map((p: any) => (
        <p key={p.key} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-[--foreground-muted]">{p.name}:</span>
          <span className="font-bold text-white">{p.value}</span>
        </p>
      ))}
    </div>
  );
};

export default function AppointmentChart() {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={DATA} margin={{ top: 4, right: 4, bottom: -8, left: -20 }}>
        <defs>
          <linearGradient id="gradScheduled" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#818cf8" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#818cf8" stopOpacity={0}    />
          </linearGradient>
          <linearGradient id="gradCompleted" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#34d399" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#34d399" stopOpacity={0}    />
          </linearGradient>
          <linearGradient id="gradNoShow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#fbbf24" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#fbbf24" stopOpacity={0}    />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.07)" vertical={false} />
        <XAxis  dataKey="day" stroke="transparent" tick={{ fill: "#8892b0", fontSize: 11, fontWeight: 600 }} />
        <YAxis  stroke="transparent" tick={{ fill: "#8892b0", fontSize: 11 }} />
        <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(99,102,241,0.2)", strokeWidth: 1 }} />
        <Area type="monotone" dataKey="scheduled" name="Scheduled" stroke="#818cf8" strokeWidth={2} fill="url(#gradScheduled)" dot={false} />
        <Area type="monotone" dataKey="completed"  name="Completed" stroke="#34d399" strokeWidth={2} fill="url(#gradCompleted)" dot={false} />
        <Area type="monotone" dataKey="noShow"     name="No-Show"   stroke="#fbbf24" strokeWidth={2} fill="url(#gradNoShow)"   dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
