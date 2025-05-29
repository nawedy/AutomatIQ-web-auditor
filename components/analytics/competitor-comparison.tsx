"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend } from "recharts"
import { Trophy, Target, TrendingUp } from "lucide-react"

const competitorData = [
  {
    subject: "SEO",
    yourSite: 87,
    competitor1: 82,
    competitor2: 79,
    industryAvg: 75,
  },
  {
    subject: "Performance",
    yourSite: 76,
    competitor1: 85,
    competitor2: 71,
    industryAvg: 68,
  },
  {
    subject: "Security",
    yourSite: 91,
    competitor1: 88,
    competitor2: 84,
    industryAvg: 78,
  },
  {
    subject: "UX",
    yourSite: 83,
    competitor1: 79,
    competitor2: 86,
    industryAvg: 72,
  },
  {
    subject: "Accessibility",
    yourSite: 89,
    competitor1: 74,
    competitor2: 81,
    industryAvg: 69,
  },
]

const benchmarkData = [
  {
    metric: "Overall Score",
    yourScore: 84.2,
    industryAvg: 73.5,
    topPerformer: 92.1,
    percentile: 85,
  },
  {
    metric: "Page Load Time",
    yourScore: 2.1,
    industryAvg: 3.2,
    topPerformer: 1.4,
    percentile: 78,
    unit: "s",
    lowerIsBetter: true,
  },
  {
    metric: "SEO Score",
    yourScore: 87.5,
    industryAvg: 75.2,
    topPerformer: 94.8,
    percentile: 82,
  },
  {
    metric: "Security Score",
    yourScore: 91.3,
    industryAvg: 78.1,
    topPerformer: 96.2,
    percentile: 91,
  },
]

export function CompetitorComparison() {
  const getPerformanceColor = (percentile: number) => {
    if (percentile >= 90) return "text-green-400"
    if (percentile >= 75) return "text-blue-400"
    if (percentile >= 50) return "text-yellow-400"
    return "text-red-400"
  }

  const getPerformanceBadge = (percentile: number) => {
    if (percentile >= 90) return { text: "Top 10%", color: "bg-green-500/20 text-green-400 border-green-500/30" }
    if (percentile >= 75) return { text: "Top 25%", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" }
    if (percentile >= 50)
      return { text: "Above Average", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" }
    return { text: "Below Average", color: "bg-red-500/20 text-red-400 border-red-500/30" }
  }

  return (
    <div className="space-y-6">
      {/* Competitive Radar Chart */}
      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-400" />
            Competitive Analysis
          </CardTitle>
          <CardDescription className="text-gray-300">
            Compare your website performance against competitors and industry averages
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={competitorData}>
                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 12 }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 10 }} />
                <Radar
                  name="Your Site"
                  dataKey="yourSite"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
                <Radar
                  name="Competitor A"
                  dataKey="competitor1"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.1}
                  strokeWidth={2}
                />
                <Radar
                  name="Competitor B"
                  dataKey="competitor2"
                  stroke="#f59e0b"
                  fill="#f59e0b"
                  fillOpacity={0.1}
                  strokeWidth={2}
                />
                <Radar
                  name="Industry Avg"
                  dataKey="industryAvg"
                  stroke="#6b7280"
                  fill="#6b7280"
                  fillOpacity={0.1}
                  strokeWidth={1}
                  strokeDasharray="5 5"
                />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Industry Benchmarks */}
      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            Industry Benchmarks
          </CardTitle>
          <CardDescription className="text-gray-300">
            See how you rank against industry standards and top performers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {benchmarkData.map((benchmark, index) => {
              const badge = getPerformanceBadge(benchmark.percentile)
              return (
                <div key={index} className="neomorphism p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-white font-semibold">{benchmark.metric}</h3>
                    <Badge className={badge.color}>{badge.text}</Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
                    <div className="text-center">
                      <div className="text-sm text-gray-400 mb-1">Your Score</div>
                      <div className={`text-lg font-bold ${getPerformanceColor(benchmark.percentile)}`}>
                        {benchmark.yourScore}
                        {benchmark.unit || ""}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-400 mb-1">Industry Avg</div>
                      <div className="text-lg font-bold text-gray-300">
                        {benchmark.industryAvg}
                        {benchmark.unit || ""}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-400 mb-1">Top Performer</div>
                      <div className="text-lg font-bold text-green-400">
                        {benchmark.topPerformer}
                        {benchmark.unit || ""}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-400 mb-1">Percentile</div>
                      <div className={`text-lg font-bold ${getPerformanceColor(benchmark.percentile)}`}>
                        {benchmark.percentile}th
                      </div>
                    </div>
                  </div>
                  <Progress value={benchmark.percentile} className="h-2" />
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Competitive Insights */}
      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            Competitive Insights
          </CardTitle>
          <CardDescription className="text-gray-300">
            Strategic recommendations based on competitive analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="neomorphism p-4 rounded-lg border-l-4 border-green-500">
              <div className="flex items-start gap-3">
                <Trophy className="w-5 h-5 text-green-400 mt-0.5" />
                <div>
                  <h3 className="text-white font-semibold mb-1">SEO Leadership</h3>
                  <p className="text-gray-300 text-sm">
                    You're outperforming both competitors in SEO (87 vs 82 and 79). Maintain this advantage by
                    continuing to optimize for emerging search trends and voice search.
                  </p>
                </div>
              </div>
            </div>

            <div className="neomorphism p-4 rounded-lg border-l-4 border-yellow-500">
              <div className="flex items-start gap-3">
                <Target className="w-5 h-5 text-yellow-400 mt-0.5" />
                <div>
                  <h3 className="text-white font-semibold mb-1">Performance Opportunity</h3>
                  <p className="text-gray-300 text-sm">
                    Competitor A has a higher performance score (85 vs 76). Focus on Core Web Vitals optimization to
                    close this gap and gain a competitive edge.
                  </p>
                </div>
              </div>
            </div>

            <div className="neomorphism p-4 rounded-lg border-l-4 border-blue-500">
              <div className="flex items-start gap-3">
                <TrendingUp className="w-5 h-5 text-blue-400 mt-0.5" />
                <div>
                  <h3 className="text-white font-semibold mb-1">Security Excellence</h3>
                  <p className="text-gray-300 text-sm">
                    Your security score (91) significantly exceeds both competitors and industry average. Use this as a
                    competitive differentiator in your marketing.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
