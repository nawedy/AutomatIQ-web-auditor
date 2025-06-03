"use client";

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Cell } from "recharts";

const metricsData = [
  {
    range: "0-40",
    count: 12,
    percentage: 8.5,
    color: "#ef4444",
    label: "Poor"
  },
  {
    range: "40-60",
    count: 25,
    percentage: 17.7,
    color: "#f59e0b",
    label: "Needs Improvement"
  },
  {
    range: "60-80",
    count: 68,
    percentage: 48.2,
    color: "#10b981",
    label: "Good"
  },
  {
    range: "80-100",
    count: 36,
    percentage: 25.5,
    color: "#06b6d4",
    label: "Excellent"
  }
];

export function MetricsDistribution() {
  return (
    <div className="space-y-6">
      {/* Distribution Chart */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={metricsData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis 
              dataKey="range" 
              stroke="rgba(255,255,255,0.6)" 
              fontSize={12}
              label={{ value: 'Performance Score Range', position: 'insideBottom', offset: -10, style: { textAnchor: 'middle', fill: 'rgba(255,255,255,0.6)' } }}
            />
            <YAxis 
              stroke="rgba(255,255,255,0.6)" 
              fontSize={12}
              label={{ value: 'Number of Pages', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: 'rgba(255,255,255,0.6)' } }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(0,0,0,0.8)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "8px",
                color: "white",
              }}
              formatter={(value, name) => [
                `${value} pages (${metricsData.find(d => d.count === value)?.percentage}%)`,
                metricsData.find(d => d.count === value)?.label
              ]}
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {metricsData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metricsData.map((metric, index) => (
          <div key={index} className="neomorphism p-4 rounded-lg text-center">
            <div 
              className="w-4 h-4 rounded-full mx-auto mb-2"
              style={{ backgroundColor: metric.color }}
            />
            <div className="text-lg font-bold text-white mb-1">{metric.count}</div>
            <div className="text-sm text-gray-300 mb-1">{metric.label}</div>
            <div className="text-xs text-gray-400">{metric.percentage}% of pages</div>
          </div>
        ))}
      </div>

      {/* Performance Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="neomorphism p-4 rounded-lg">
          <h3 className="text-white font-semibold mb-3">Top Performing Pages</h3>
          <div className="space-y-2">
            {[
              { url: "/landing-page", score: 95, improvement: "Excellent" },
              { url: "/about", score: 88, improvement: "Very Good" },
              { url: "/contact", score: 84, improvement: "Good" }
            ].map((page, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-gray-700 last:border-b-0">
                <span className="text-sm text-gray-300 truncate flex-1 mr-2">{page.url}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-green-400">{page.score}</span>
                  <span className="text-xs text-gray-400">{page.improvement}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="neomorphism p-4 rounded-lg">
          <h3 className="text-white font-semibold mb-3">Pages Needing Attention</h3>
          <div className="space-y-2">
            {[
              { url: "/product-catalog", score: 45, improvement: "Critical" },
              { url: "/checkout", score: 52, improvement: "Needs Work" },
              { url: "/search-results", score: 38, improvement: "Critical" }
            ].map((page, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-gray-700 last:border-b-0">
                <span className="text-sm text-gray-300 truncate flex-1 mr-2">{page.url}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-red-400">{page.score}</span>
                  <span className="text-xs text-gray-400">{page.improvement}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 