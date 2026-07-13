"use client";

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export function BookingsChart({ data }: { data: { month: string; bookings: number }[] }) {
  return (
    <div className="h-64 w-full" dir="ltr">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="bookingsFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#e63e63" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#e63e63" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0e6e9" />
          <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#8b7a7e" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 12, fill: "#8b7a7e" }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ borderRadius: 12, border: "1px solid #f0e0e4", fontSize: 12 }}
            labelStyle={{ fontWeight: 700 }}
          />
          <Area type="monotone" dataKey="bookings" stroke="#e63e63" strokeWidth={2.5} fill="url(#bookingsFill)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
