"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

export function ExecutiveChartsFromData({
  healthTrend,
  certByDept,
}: {
  healthTrend: { month: string; score: number }[];
  certByDept: { dept: string; certified: number; total: number }[];
}) {
  const grid = "var(--border)";
  const tickStyle = { fontSize: 12, fill: "var(--muted-foreground)" };
  const tooltipStyle = {
    borderRadius: "var(--radius-lg)",
    border: "1px solid var(--border)",
    background: "var(--popover)",
    color: "var(--popover-foreground)",
    fontSize: 12,
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="mb-4 font-heading text-base font-semibold text-foreground">
          Agent Health (by cohort)
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={healthTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke={grid} />
              <XAxis dataKey="month" tick={tickStyle} stroke={grid} />
              <YAxis domain={[0, 100]} tick={tickStyle} stroke={grid} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: grid }} />
              <Line
                type="monotone"
                dataKey="score"
                stroke="var(--chart-1)"
                strokeWidth={2}
                dot={{ r: 4, fill: "var(--chart-1)" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="mb-4 font-heading text-base font-semibold text-foreground">
          Certification by Department
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={certByDept}>
              <CartesianGrid strokeDasharray="3 3" stroke={grid} />
              <XAxis dataKey="dept" tick={{ ...tickStyle, fontSize: 11 }} stroke={grid} />
              <YAxis tick={tickStyle} stroke={grid} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--muted)" }} />
              <Bar dataKey="certified" fill="var(--chart-1)" name="Certified" radius={[4, 4, 0, 0]} />
              <Bar dataKey="total" fill="var(--border)" name="Total" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
