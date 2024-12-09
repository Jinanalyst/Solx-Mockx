'use client';

import { Line, LineChart as RechartsLineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card } from '@/components/ui/card';

interface LineChartProps {
  data: Array<{
    date: Date;
    value: number;
  }>;
  xField?: string;
  yField?: string;
  title?: string;
}

export function LineChart({ 
  data, 
  xField = 'date', 
  yField = 'value',
  title 
}: LineChartProps) {
  const formattedData = data.map(item => ({
    ...item,
    [xField]: item[xField] instanceof Date 
      ? item[xField].toLocaleString('en-US', { 
          month: 'short', 
          day: 'numeric', 
          hour: '2-digit', 
          minute: '2-digit' 
        })
      : item[xField],
  }));

  return (
    <Card className="p-4">
      {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsLineChart data={formattedData}>
            <XAxis
              dataKey={xField}
              tickLine={false}
              axisLine={false}
              dy={10}
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              dx={-10}
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
              tickFormatter={(value) => `$${value.toLocaleString()}`}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex flex-col">
                          <span className="text-[0.70rem] uppercase text-muted-foreground">
                            Time
                          </span>
                          <span className="font-bold text-muted-foreground">
                            {payload[0].payload[xField]}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[0.70rem] uppercase text-muted-foreground">
                            Value
                          </span>
                          <span className="font-bold">
                            ${payload[0].value.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Line
              type="monotone"
              dataKey={yField}
              strokeWidth={2}
              dot={false}
              activeDot={{
                r: 4,
                style: { fill: 'hsl(var(--primary))', opacity: 0.8 },
              }}
              stroke="hsl(var(--primary))"
            />
          </RechartsLineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
