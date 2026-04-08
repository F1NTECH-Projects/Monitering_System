"use client";
import {
  RadialBarChart, RadialBar, Tooltip, ResponsiveContainer,
  PolarAngleAxis,
} from "recharts";

const DATA = [
  { name: "Completion", value: 87, fill: "#818cf8" },
];

export default function NoShowChart({ rate = 87 }: { rate?: number }) {
  const data = [{ name: "Rate", value: rate, fill: rate >= 80 ? "#34d399" : rate >= 60 ? "#fbbf24" : "#f87171" }];

  return (
    <div className="relative flex items-center justify-center" style={{ height: 200 }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart
          cx="50%" cy="50%"
          innerRadius="65%" outerRadius="90%"
          startAngle={90} endAngle={-270}
          data={data}
          barSize={12}
        >
          <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
          {/* Background track */}
          <RadialBar
            dataKey="value"
            cornerRadius={6}
            background={{ fill: "rgba(99,102,241,0.07)" }}
            angleAxisId={0}
          />
          <Tooltip
            formatter={(v) => [`${v}%`, "Completion Rate"]}
            contentStyle={{ background: "rgba(13,18,38,0.95)", border: "1px solid rgba(99,102,241,0.3)", borderRadius: 12, fontSize: 12 }}
          />
        </RadialBarChart>
      </ResponsiveContainer>
      {/* Center label */}
      <div className="absolute flex flex-col items-center pointer-events-none">
        <span className="text-3xl font-black text-white" style={{ fontFamily: "Outfit, sans-serif" }}>
          {rate}%
        </span>
        <span className="text-[10px] text-[--foreground-muted] font-bold uppercase tracking-wider">Completion</span>
      </div>
    </div>
  );
}
