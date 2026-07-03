"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  CartesianGrid,
} from "recharts";
import type { DashboardStats } from "@/types/database.types";

const TOOLTIP_STYLE = {
  background: "rgba(20,20,30,0.9)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 10,
  fontSize: 12,
  color: "#fff",
};

export function TrendChart({ data }: { data: DashboardStats["trend"] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="positiveFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10B981" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="negativeFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F43F5E" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#F43F5E" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.08} vertical={false} />
        <XAxis dataKey="date" tick={{ fontSize: 11, fill: "var(--muted)" }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
        <YAxis tick={{ fontSize: 11, fill: "var(--muted)" }} axisLine={false} tickLine={false} width={28} />
        <Tooltip contentStyle={TOOLTIP_STYLE} />
        <Area type="monotone" dataKey="positive" stroke="#10B981" fill="url(#positiveFill)" strokeWidth={2} />
        <Area type="monotone" dataKey="negative" stroke="#F43F5E" fill="url(#negativeFill)" strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function SentimentPie({ positive, negative, neutral }: { positive: number; negative: number; neutral: number }) {
  const data = [
    { name: "Positive", value: positive, color: "#10B981" },
    { name: "Negative", value: negative, color: "#F43F5E" },
    { name: "Neutral", value: neutral, color: "#F59E0B" },
  ];
  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={3}>
          {data.map((d) => (
            <Cell key={d.name} fill={d.color} stroke="none" />
          ))}
        </Pie>
        <Tooltip contentStyle={TOOLTIP_STYLE} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function DepartmentBarChart({ data }: { data: DashboardStats["department_performance"] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} layout="vertical" margin={{ left: 12 }}>
        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.08} horizontal={false} />
        <XAxis type="number" domain={[0, 5]} tick={{ fontSize: 11, fill: "var(--muted)" }} axisLine={false} tickLine={false} />
        <YAxis dataKey="department" type="category" width={100} tick={{ fontSize: 11, fill: "var(--muted)" }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={TOOLTIP_STYLE} />
        <Bar dataKey="avg_rating" radius={[0, 6, 6, 0]} fill="#6E5CF6" />
      </BarChart>
    </ResponsiveContainer>
  );
}
