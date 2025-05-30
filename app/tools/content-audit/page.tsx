"use client"

import { Header } from "@/components/header"
import { DoubleFooter } from "@/components/double-footer"
import { Badge } from "@/components/ui/badge"

export default function ContentAuditPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 pt-24">
        <section className="py-12 md:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <Badge className="mb-4 bg-gold/20 text-gold border-gold/30">Content Audit</Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white">
                Content Quality <span className="text-gold">Analysis</span>
              </h1>
              <p className="text-xl text-silver mb-8">
                Evaluate your website's content quality and identify opportunities for improvement.
              </p>
            </div>
          </div>
        </section>
      </main>

      <DoubleFooter />
    </div>
  )
}
