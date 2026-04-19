"use client";

import { ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface NoShowChartProps {
  rate?: number;
}

export default function NoShowChart({ rate = 87 }: NoShowChartProps) {
  const noShow = 100 - rate;
  const data = [
    { name: "Completed", value: rate },
    { name: "No-Show",   value: noShow },
  ];

  return (
    <ResponsiveContainer width={180} height={180}>
      <PieChart>
        <defs>
          <linearGradient id="grad-ring" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#6246ea" />
            <stop offset="100%" stopColor="#22d3ee" />
          </linearGradient>
        </defs>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          startAngle={90}
          endAngle={-270}
          dataKey="value"
          strokeWidth={0}
        >
          <Cell fill="url(#grad-ring)" />
          <Cell fill="rgba(99,102,241,0.08)" />
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
}
