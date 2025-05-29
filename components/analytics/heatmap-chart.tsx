"use client"

const heatmapData = [
  { page: "Homepage", day: "Mon", score: 85 },
  { page: "Homepage", day: "Tue", score: 87 },
  { page: "Homepage", day: "Wed", score: 82 },
  { page: "Homepage", day: "Thu", score: 90 },
  { page: "Homepage", day: "Fri", score: 88 },
  { page: "Homepage", day: "Sat", score: 86 },
  { page: "Homepage", day: "Sun", score: 84 },
  { page: "Products", day: "Mon", score: 72 },
  { page: "Products", day: "Tue", score: 75 },
  { page: "Products", day: "Wed", score: 78 },
  { page: "Products", day: "Thu", score: 80 },
  { page: "Products", day: "Fri", score: 77 },
  { page: "Products", day: "Sat", score: 74 },
  { page: "Products", day: "Sun", score: 76 },
  { page: "About", day: "Mon", score: 95 },
  { page: "About", day: "Tue", score: 93 },
  { page: "About", day: "Wed", score: 96 },
  { page: "About", day: "Thu", score: 94 },
  { page: "About", day: "Fri", score: 92 },
  { page: "About", day: "Sat", score: 97 },
  { page: "About", day: "Sun", score: 95 },
  { page: "Contact", day: "Mon", score: 88 },
  { page: "Contact", day: "Tue", score: 90 },
  { page: "Contact", day: "Wed", score: 85 },
  { page: "Contact", day: "Thu", score: 87 },
  { page: "Contact", day: "Fri", score: 89 },
  { page: "Contact", day: "Sat", score: 91 },
  { page: "Contact", day: "Sun", score: 86 },
]

const pages = ["Homepage", "Products", "About", "Contact"]
const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

export function HeatmapChart() {
  const getScoreColor = (score: number) => {
    if (score >= 90) return "bg-green-500"
    if (score >= 80) return "bg-yellow-500"
    if (score >= 70) return "bg-orange-500"
    return "bg-red-500"
  }

  const getScoreOpacity = (score: number) => {
    return Math.max(0.3, score / 100)
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-8 gap-2">
        <div></div>
        {days.map((day) => (
          <div key={day} className="text-center text-sm text-gray-400 font-medium">
            {day}
          </div>
        ))}
        {pages.map((page) => (
          <>
            <div key={page} className="text-sm text-gray-300 font-medium flex items-center">
              {page}
            </div>
            {days.map((day) => {
              const dataPoint = heatmapData.find((d) => d.page === page && d.day === day)
              const score = dataPoint?.score || 0
              return (
                <div
                  key={`${page}-${day}`}
                  className={`h-12 rounded-lg flex items-center justify-center text-white text-sm font-semibold ${getScoreColor(
                    score,
                  )}`}
                  style={{ opacity: getScoreOpacity(score) }}
                >
                  {score}
                </div>
              )
            })}
          </>
        ))}
      </div>
      <div className="flex items-center justify-center gap-4 text-sm text-gray-400">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded"></div>
          <span>Poor (0-69)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-orange-500 rounded"></div>
          <span>Fair (70-79)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-500 rounded"></div>
          <span>Good (80-89)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span>Excellent (90+)</span>
        </div>
      </div>
    </div>
  )
}
