'use client';

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { attendanceData, chartConfig } from '@/lib/types';

export function AttendanceChart() {
  return (
    <div className="h-[300px] w-full">
      <ChartContainer config={chartConfig} className="h-full w-full">
        <ResponsiveContainer>
          <BarChart
            data={attendanceData}
            margin={{ top: 5, right: 10, left: -10, bottom: 0 }}
          >
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 6)}
            />
            <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <Bar
              dataKey="attendance"
              fill="var(--color-attendance)"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
}
