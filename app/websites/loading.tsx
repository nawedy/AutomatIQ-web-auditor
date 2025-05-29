export default function WebsitesLoading() {
  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="flex-1 space-y-6 p-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 bg-white/10 rounded animate-pulse"></div>
          <div className="h-10 w-32 bg-white/10 rounded animate-pulse"></div>
        </div>

        {/* Stats Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="glass-card border-white/10 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="h-4 w-24 bg-white/10 rounded animate-pulse"></div>
                <div className="h-4 w-4 bg-white/10 rounded animate-pulse"></div>
              </div>
              <div className="h-8 w-16 bg-white/10 rounded animate-pulse mb-2"></div>
              <div className="h-3 w-20 bg-white/10 rounded animate-pulse"></div>
            </div>
          ))}
        </div>

        {/* Filters Skeleton */}
        <div className="glass-card border-white/10 p-6">
          <div className="flex gap-4">
            <div className="h-10 flex-1 bg-white/10 rounded animate-pulse"></div>
            <div className="h-10 w-48 bg-white/10 rounded animate-pulse"></div>
          </div>
        </div>

        {/* Websites Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="glass-card border-white/10 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/10 rounded-lg animate-pulse"></div>
                  <div>
                    <div className="h-5 w-32 bg-white/10 rounded animate-pulse mb-2"></div>
                    <div className="h-4 w-48 bg-white/10 rounded animate-pulse"></div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="h-6 w-16 bg-white/10 rounded animate-pulse"></div>
                  <div className="h-8 w-8 bg-white/10 rounded animate-pulse"></div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <div className="h-8 w-12 bg-white/10 rounded animate-pulse"></div>
                  <div className="h-6 w-20 bg-white/10 rounded animate-pulse"></div>
                </div>
                <div className="flex gap-4">
                  {Array.from({ length: 3 }).map((_, j) => (
                    <div key={j} className="h-4 w-16 bg-white/10 rounded animate-pulse"></div>
                  ))}
                </div>
                <div className="flex justify-between">
                  <div className="h-4 w-24 bg-white/10 rounded animate-pulse"></div>
                  <div className="h-4 w-24 bg-white/10 rounded animate-pulse"></div>
                </div>
                <div className="flex gap-2">
                  {Array.from({ length: 3 }).map((_, j) => (
                    <div key={j} className="h-6 w-16 bg-white/10 rounded animate-pulse"></div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
