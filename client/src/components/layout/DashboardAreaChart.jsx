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
    <div className="bg-white rounded-2xl   p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4"></div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={320}>
        <AreaChart
          data={data}
          margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="job" // 👈 job title on x-axis
            tick={{ fontSize: 12, fill: "#6b7280" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 12, fill: "#6b7280" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            cursor={{ strokeDasharray: "3 3" }}
            contentStyle={{
              borderRadius: "0.5rem",
              border: "1px solid #e5e7eb",
              backgroundColor: "#fff",
              boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
            }}
            labelStyle={{ fontWeight: "600", color: "#374151" }}
            formatter={(value) => [`${value}`, "Applications"]}
          />
          <Area
            type="monotone"
            dataKey="applications" // 👈 use applications count
            stroke="#4f46e5"
            fill="#4f46e5"
            fillOpacity={0.2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DashboardAreaChart;
