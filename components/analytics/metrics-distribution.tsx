"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"

const data = [
  { name: "Good (0-1.8s)", value: 65, color: "#10b981" },
  { name: "Needs Improvement (1.8-3.0s)", value: 25, color: "#f59e0b" },
  { name: "Poor (3.0s+)", value: 10, color: "#ef4444" },
]

export function MetricsDistribution() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* First Contentful Paint */}
      <div className="neomorphism p-4 rounded-lg">
        <h3 className="text-white font-semibold mb-4 text-center">First Contentful Paint</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} cx="50%" cy="50%" innerRadius={40} outerRadius={80} paddingAngle={5} dataKey="value">
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(0,0,0,0.8)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                  color: "white",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-2 mt-2">
          {data.map((item, index) => (
            <div key={index} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                <span className="text-gray-300">{item.name}</span>
              </div>
              <span className="text-white font-semibold">{item.value}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Largest Contentful Paint */}
      <div className="neomorphism p-4 rounded-lg">
        <h3 className="text-white font-semibold mb-4 text-center">Largest Contentful Paint</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={[
                  { name: "Good (0-2.5s)", value: 45, color: "#10b981" },
                  { name: "Needs Improvement (2.5-4.0s)", value: 35, color: "#f59e0b" },
                  { name: "Poor (4.0s+)", value: 20, color: "#ef4444" },
                ]}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {[
                  { name: "Good (0-2.5s)", value: 45, color: "#10b981" },
                  { name: "Needs Improvement (2.5-4.0s)", value: 35, color: "#f59e0b" },
                  { name: "Poor (4.0s+)", value: 20, color: "#ef4444" },
                ].map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(0,0,0,0.8)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                  color: "white",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-2 mt-2">
          {[
            { name: "Good (0-2.5s)", value: 45, color: "#10b981" },
            { name: "Needs Improvement (2.5-4.0s)", value: 35, color: "#f59e0b" },
            { name: "Poor (4.0s+)", value: 20, color: "#ef4444" },
          ].map((item, index) => (
            <div key={index} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                <span className="text-gray-300">{item.name}</span>
              </div>
              <span className="text-white font-semibold">{item.value}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Cumulative Layout Shift */}
      <div className="neomorphism p-4 rounded-lg">
        <h3 className="text-white font-semibold mb-4 text-center">Cumulative Layout Shift</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={[
                  { name: "Good (0-0.1)", value: 30, color: "#10b981" },
                  { name: "Needs Improvement (0.1-0.25)", value: 40, color: "#f59e0b" },
                  { name: "Poor (0.25+)", value: 30, color: "#ef4444" },
                ]}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {[
                  { name: "Good (0-0.1)", value: 30, color: "#10b981" },
                  { name: "Needs Improvement (0.1-0.25)", value: 40, color: "#f59e0b" },
                  { name: "Poor (0.25+)", value: 30, color: "#ef4444" },
                ].map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(0,0,0,0.8)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                  color: "white",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-2 mt-2">
          {[
            { name: "Good (0-0.1)", value: 30, color: "#10b981" },
            { name: "Needs Improvement (0.1-0.25)", value: 40, color: "#f59e0b" },
            { name: "Poor (0.25+)", value: 30, color: "#ef4444" },
          ].map((item, index) => (
            <div key={index} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                <span className="text-gray-300">{item.name}</span>
              </div>
              <span className="text-white font-semibold">{item.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
