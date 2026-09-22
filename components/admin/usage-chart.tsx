"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

interface DataPoint {
  label: string;
  credits: number;
  debits: number;
}

export function UsageChart({ data }: { data: DataPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="creditGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0E8A3E" stopOpacity={0.45} />
            <stop offset="100%" stopColor="#0E8A3E" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="debitGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2F80ED" stopOpacity={0.45} />
            <stop offset="100%" stopColor="#2F80ED" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(240,244,242,0.06)" vertical={false} />
        <XAxis dataKey="label" stroke="#7E938A" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#7E938A" fontSize={12} tickLine={false} axisLine={false} />
        <Tooltip
          contentStyle={{
            background: "#0E1815",
            border: "1px solid rgba(240,244,242,0.1)",
            borderRadius: 8,
            fontSize: 12,
            fontFamily: "var(--font-body)",
          }}
          labelStyle={{ color: "#F0F4F2" }}
        />
        <Area
          type="monotone"
          dataKey="credits"
          name="Sakalekas concedidas"
          stroke="#0E8A3E"
          fill="url(#creditGradient)"
          strokeWidth={2}
        />
        <Area
          type="monotone"
          dataKey="debits"
          name="Sakalekas gastas"
          stroke="#2F80ED"
          fill="url(#debitGradient)"
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
