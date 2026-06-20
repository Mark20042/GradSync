import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const DashboardAreaChart = ({ data }) => {
  return (
    <div className="w-full mt-2">
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis
            dataKey="job"
            tick={{ fontSize: 11, fill: "#64748b" }}
            axisLine={false}
            tickLine={false}
            tickMargin={12}
            interval="preserveStartEnd"
            tickFormatter={(value) => value?.length > 10 ? value.substring(0, 10) + '...' : value}
          />
          <YAxis
            width={30}
            tick={{ fontSize: 11, fill: "#64748b" }}
            axisLine={false}
            tickLine={false}
            tickMargin={4}
          />
          <Tooltip
            cursor={{ stroke: "#94a3b8", strokeWidth: 1, strokeDasharray: "4 4" }}
            contentStyle={{
              borderRadius: "12px",
              border: "1px solid #e2e8f0",
              backgroundColor: "#ffffff",
              boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
              padding: "8px 12px",
            }}
            labelStyle={{ fontWeight: "600", color: "#1e293b", marginBottom: "4px" }}
            itemStyle={{ color: "#4f46e5", fontWeight: "500" }}
            formatter={(value) => [`${value}`, "Applications"]}
          />
          <Area
            type="monotone"
            dataKey="applications"
            stroke="#4f46e5"
            strokeWidth={3}
            fill="url(#colorApps)"
            activeDot={{ r: 6, strokeWidth: 2, stroke: "#ffffff", fill: "#4f46e5" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DashboardAreaChart;
