import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface MetricsChartProps {
  title: string;
  data: Array<{
    timestamp: number | Date;
    cpuPercent?: number;
    memoryPercent?: number;
    diskPercent?: number;
    [key: string]: any;
  }>;
  lines?: Array<{
    key: string;
    name: string;
    color: string;
  }>;
  height?: number;
}

/**
 * Metrics chart component using Recharts
 */
export function MetricsChart({
  title,
  data,
  lines = [
    { key: "cpuPercent", name: "CPU (%)", color: "#8b5cf6" },
    { key: "memoryPercent", name: "Memória (%)", color: "#ec4899" },
    { key: "diskPercent", name: "Disco (%)", color: "#06b6d4" },
  ],
  height = 300,
}: MetricsChartProps) {
  // Format data for chart
  const chartData = data.map((item) => ({
    ...item,
    timestamp:
      item.timestamp instanceof Date
        ? item.timestamp.toLocaleTimeString()
        : new Date(item.timestamp).toLocaleTimeString(),
  }));

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            Nenhum dado disponível
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={height}>
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="timestamp"
                stroke="hsl(var(--muted-foreground))"
                style={{ fontSize: "12px" }}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                style={{ fontSize: "12px" }}
                domain={[0, 100]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "hsl(var(--foreground))" }}
              />
              <Legend wrapperStyle={{ paddingTop: "20px" }} />
              {lines.map((line) => (
                <Line
                  key={line.key}
                  type="monotone"
                  dataKey={line.key}
                  name={line.name}
                  stroke={line.color}
                  dot={false}
                  isAnimationActive={false}
                  strokeWidth={2}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
