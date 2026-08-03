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
            <stop offset="0%" stopColor="#B6893F" stopOpacity={0.45} />
            <stop offset="100%" stopColor="#B6893F" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="debitGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3C5670" stopOpacity={0.45} />
            <stop offset="100%" stopColor="#3C5670" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(241,231,211,0.06)" vertical={false} />
        <XAxis dataKey="label" stroke="#A0937C" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#A0937C" fontSize={12} tickLine={false} axisLine={false} />
        <Tooltip
          contentStyle={{
            background: "#211810",
            border: "1px solid rgba(241,231,211,0.1)",
            borderRadius: 8,
            fontSize: 12,
            fontFamily: "var(--font-body)",
          }}
          labelStyle={{ color: "#F1E7D3" }}
        />
        <Area
          type="monotone"
          dataKey="credits"
          name="Sakalekas concedidas"
          stroke="#B6893F"
          fill="url(#creditGradient)"
          strokeWidth={2}
        />
        <Area
          type="monotone"
          dataKey="debits"
          name="Sakalekas gastas"
          stroke="#3C5670"
          fill="url(#debitGradient)"
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
