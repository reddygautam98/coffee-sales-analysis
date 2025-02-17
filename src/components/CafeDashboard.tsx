import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  AreaChart,
  Area,
  ComposedChart,
  LabelList,
  Scatter,
  Treemap,
} from "recharts";
import {
  Coffee,
  Users,
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Activity,
} from "lucide-react";

const CafeDashboard = () => {
  interface Data {
    totalSales: number;
    customerCount: number;
    avgOrderValue: number;
    totalItems: number;
    salesGrowth: number;
    customerSatisfaction: number;
    productMetrics: Array<{ name: string; value: number; satisfaction: number; profit: number; growth: number; }>;
    customerSegments: Array<{ name: string; value: number; }>;
    peakHours: Array<{ hour: number; traffic: number; revenue: number; orders: number; }>;
    productPerformance: Array<{ name: string; size: number; category: string; }>;
    satisfactionMetrics: Array<{ aspect: string; score: number; }>;
  }
  
  const [data, setData] = useState<Data | null>(null);

  // Enhanced vibrant color palette with opacity utilities
  const COLORS = {
    primary: "#4F46E5", // Indigo
    secondary: "#10B981", // Emerald
    accent: "#F59E0B", // Amber
    tertiary: "#EC4899", // Pink
    quaternary: "#8B5CF6", // Purple
    success: "#059669", // Green
    warning: "#DC2626", // Red
    info: "#0EA5E9", // Sky
    neutral: "#6B7280", // Gray
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const CustomLabel = ({ x, y, value, stroke }) => (
    <text
      x={x}
      y={y}
      dy={-10}
      fill={stroke}
      fontSize={12}
      textAnchor="middle"
      fontWeight="600"
    >
      {typeof value === "number" ? formatCurrency(value) : value}
    </text>
  );

  const MetricCard = ({ icon: Icon, title, value, subValue, color }) => (
    <div
      className="bg-white p-4 rounded-lg shadow-md border-l-4 hover:shadow-lg transition-shadow duration-200"
      style={{ borderLeftColor: color }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold" style={{ color }}>
            {value}
          </p>
          {subValue && <p className="text-sm text-gray-600">{subValue}</p>}
        </div>
        <div
          className="p-2 rounded-full"
          style={{ backgroundColor: `${color}15` }}
        >
          <Icon size={24} color={color} />
        </div>
      </div>
    </div>
  );

  useEffect(() => {
    const fetchData = async () => {
      setData({
        totalSales: 125000,
        customerCount: 4500,
        avgOrderValue: 27.78,
        totalItems: 8750,
        salesGrowth: 15.4,
        customerSatisfaction: 4.8,

        productMetrics: [
          {
            name: "Espresso",
            value: 4500,
            satisfaction: 4.8,
            profit: 75,
            growth: 15,
          },
          {
            name: "Latte",
            value: 6200,
            satisfaction: 4.6,
            profit: 82,
            growth: 22,
          },
          {
            name: "Cappuccino",
            value: 5100,
            satisfaction: 4.7,
            profit: 78,
            growth: 18,
          },
          {
            name: "Mocha",
            value: 3800,
            satisfaction: 4.5,
            profit: 70,
            growth: 12,
          },
          {
            name: "Cold Brew",
            value: 4200,
            satisfaction: 4.9,
            profit: 85,
            growth: 25,
          },
        ],

        customerSegments: [
          { name: "Regular", value: 45 },
          { name: "Occasional", value: 30 },
          { name: "New", value: 15 },
          { name: "Lost", value: 10 },
        ],

        peakHours: Array.from({ length: 24 }, (_, i) => ({
          hour: i,
          traffic: Math.floor(Math.random() * 100 + 20),
          revenue: Math.random() * 1000 + 200,
          orders: Math.floor(Math.random() * 50 + 10),
        })),

        productPerformance: [
          { name: "Coffee", size: 400, category: "Beverages" },
          { name: "Tea", size: 300, category: "Beverages" },
          { name: "Pastries", size: 350, category: "Food" },
          { name: "Sandwiches", size: 250, category: "Food" },
          { name: "Desserts", size: 200, category: "Food" },
          { name: "Smoothies", size: 150, category: "Beverages" },
        ],

        satisfactionMetrics: [
          { aspect: "Taste", score: 90 },
          { aspect: "Service", score: 85 },
          { aspect: "Ambience", score: 88 },
          { aspect: "Speed", score: 82 },
          { aspect: "Value", score: 86 },
        ],
      });
    };

    fetchData();
  }, []);

  if (!data) return <div>Loading...</div>;

  return (
    <div className="p-6 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        Advanced Cafe Analytics ☕
      </h1>

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard
          icon={DollarSign}
          title="Total Sales"
          value={formatCurrency(data.totalSales)}
          subValue={`Growth: +${data.salesGrowth}%`}
          color={COLORS.success}
        />
        <MetricCard
          icon={Users}
          title="Total Customers"
          value={data.customerCount.toLocaleString()}
          subValue={`Satisfaction: ⭐ ${data.customerSatisfaction}/5`}
          color={COLORS.primary}
        />
        <MetricCard
          icon={ShoppingCart}
          title="Average Order Value"
          value={formatCurrency(data.avgOrderValue)}
          subValue={null}
          color={COLORS.accent}
        />
        <MetricCard
          icon={Activity}
          title="Total Items Sold"
          value={data.totalItems.toLocaleString()}
          subValue={null}
          color={COLORS.quaternary}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-6">
        {/* 1. Product Performance Radar Chart */}
        <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-200">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            Product Performance 📊
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={data.productMetrics}>
              <PolarGrid stroke={COLORS.neutral} />
              <PolarAngleAxis dataKey="name" tick={{ fill: COLORS.neutral }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} />
              <Radar
                name="Profit"
                dataKey="profit"
                stroke={COLORS.primary}
                fill={COLORS.primary}
                fillOpacity={0.5}
              />
              <Radar
                name="Growth"
                dataKey="growth"
                stroke={COLORS.accent}
                fill={COLORS.accent}
                fillOpacity={0.5}
              />
              <Legend />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* 2. Customer Segments Donut Chart */}
        <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-200">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            Customer Segments 👥
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.customerSegments}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
              >
                {data.customerSegments.map((entry, index) => (
                  <Cell key={index} fill={Object.values(COLORS)[index]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* 3. Peak Hours Analysis */}
        <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-200">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            Peak Hours Analysis 🕒
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={data.peakHours}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="hour" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  borderRadius: "6px",
                  border: "none",
                  boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                }}
              />
              <Legend />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="traffic"
                fill={COLORS.primary}
                stroke={COLORS.primary}
                fillOpacity={0.3}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="revenue"
                stroke={COLORS.accent}
                strokeWidth={2}
              >
                <LabelList
                  content={(props) => (
                    <CustomLabel {...props} stroke={COLORS.accent} />
                  )}
                />
              </Line>
              <Bar yAxisId="left" dataKey="orders" fill={COLORS.tertiary} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* 4. Product Category Treemap */}
        <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-200">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            Product Categories 🎯
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <Treemap
              data={data.productPerformance}
              dataKey="size"
              aspectRatio={4 / 3}
              stroke="#fff"
              fill={COLORS.primary}
            >
              <Tooltip />
            </Treemap>
          </ResponsiveContainer>
        </div>

        {/* 5. Satisfaction Metrics */}
        <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-200">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            Satisfaction Metrics ⭐
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.satisfactionMetrics} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[0, 100]} />
              <YAxis dataKey="aspect" type="category" />
              <Tooltip />
              <Bar dataKey="score" fill={COLORS.quaternary}>
                <LabelList dataKey="score" position="right" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default CafeDashboard;
