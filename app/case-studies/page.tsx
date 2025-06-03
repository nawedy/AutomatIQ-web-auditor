"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, TrendingUp, Users, ArrowRight, Search, Filter } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Header } from "@/components/header";
import { DoubleFooter } from "@/components/double-footer";
import Link from "next/link";

interface CaseStudy {
  id: string;
  title: string;
  company: string;
  industry: string;
  challenge: string;
  solution: string;
  results: {
    metric: string;
    improvement: string;
    period: string;
  }[];
  publishDate: string;
  readTime: string;
  image: string;
  featured?: boolean;
}

const caseStudies: CaseStudy[] = [
  {
    id: "techstart-seo-optimization",
    title: "How TechStart Inc. Increased Organic Traffic by 137%",
    company: "TechStart Inc.",
    industry: "Technology",
    challenge: "Low organic search visibility and poor website performance affecting lead generation.",
    solution: "Comprehensive SEO audit, technical optimization, and content strategy implementation.",
    results: [
      { metric: "Organic Traffic", improvement: "+137%", period: "3 months" },
      { metric: "Search Rankings", improvement: "+89%", period: "3 months" },
      { metric: "Lead Generation", improvement: "+156%", period: "3 months" },
    ],
    publishDate: "2024-01-15",
    readTime: "8 min read",
    image: "/images/placeholders/placeholder-600x400.svg",
    featured: true,
  },
  {
    id: "ecommerce-performance-boost",
    title: "E-commerce Solutions: 3x Performance Improvement",
    company: "E-commerce Solutions",
    industry: "E-commerce",
    challenge: "Slow website performance leading to high bounce rates and lost sales.",
    solution: "Core Web Vitals optimization, CDN implementation, and code optimization.",
    results: [
      { metric: "Page Load Speed", improvement: "+300%", period: "2 months" },
      { metric: "Conversion Rate", improvement: "+45%", period: "2 months" },
      { metric: "Bounce Rate", improvement: "-67%", period: "2 months" },
    ],
    publishDate: "2024-01-10",
    readTime: "6 min read",
    image: "/images/placeholders/placeholder-600x400.svg",
  },
  {
    id: "boutique-designs-accessibility",
    title: "Boutique Designs: Creating an Inclusive Digital Experience",
    company: "Boutique Designs",
    industry: "Fashion",
    challenge: "Poor accessibility compliance and limited mobile user experience.",
    solution: "UX/UI redesign with accessibility-first approach and mobile optimization.",
    results: [
      { metric: "Accessibility Score", improvement: "+180%", period: "4 months" },
      { metric: "Mobile Conversions", improvement: "+92%", period: "4 months" },
      { metric: "User Engagement", improvement: "+78%", period: "4 months" },
    ],
    publishDate: "2024-01-05",
    readTime: "7 min read",
    image: "/images/placeholders/placeholder-600x400.svg",
  },
  {
    id: "fintech-security-enhancement",
    title: "FinTech Pro: Advanced Security Implementation",
    company: "FinTech Pro",
    industry: "Financial Services",
    challenge: "Security vulnerabilities and compliance issues threatening customer trust.",
    solution: "Comprehensive security audit, implementation of advanced security measures, and compliance optimization.",
    results: [
      { metric: "Security Score", improvement: "+245%", period: "3 months" },
      { metric: "Customer Trust", improvement: "+120%", period: "3 months" },
      { metric: "Compliance Rate", improvement: "+100%", period: "3 months" },
    ],
    publishDate: "2024-01-01",
    readTime: "9 min read",
    image: "/images/placeholders/placeholder-600x400.svg",
  },
];

const industries = ["All", "Technology", "E-commerce", "Fashion", "Financial Services"];

export default function CaseStudiesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("All");
  const [filteredCaseStudies, setFilteredCaseStudies] = useState(caseStudies);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    filterCaseStudies(query, selectedIndustry);
  };

  const handleIndustryFilter = (industry: string) => {
    setSelectedIndustry(industry);
    filterCaseStudies(searchQuery, industry);
  };

  const filterCaseStudies = (query: string, industry: string) => {
    let filtered = caseStudies;

    if (industry !== "All") {
      filtered = filtered.filter((study) => study.industry === industry);
    }

    if (query) {
      filtered = filtered.filter(
        (study) =>
          study.title.toLowerCase().includes(query.toLowerCase()) ||
          study.company.toLowerCase().includes(query.toLowerCase()) ||
          study.challenge.toLowerCase().includes(query.toLowerCase())
      );
    }

    setFilteredCaseStudies(filtered);
  };

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <section className="relative section-padding pt-20 sm:pt-24 lg:pt-32 bg-gradient-to-br from-midnight-navy to-deep-azure">
        <div className="absolute inset-0 bg-grid-white/5 bg-[size:30px_30px] opacity-20"></div>
        <div className="container">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="mb-4 bg-gold/20 text-gold border-gold/30">Success Stories</Badge>
            <motion.h1
              className="mb-6 responsive-text-3xl font-extrabold tracking-tight text-white"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Real Results from Real Businesses
            </motion.h1>
            <motion.p
              className="mb-8 responsive-text-base text-silver"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Discover how businesses like yours have transformed their digital presence and achieved remarkable results with AutomatIQ.AI
            </motion.p>
          </div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="py-8 border-b border-gold/10">
        <div className="container">
          <div className="responsive-flex items-center justify-between max-w-4xl mx-auto">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-silver h-4 w-4" />
              <Input
                placeholder="Search case studies..."
                className="pl-10 border-gold/20 bg-black/50 text-white placeholder-silver/50"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-silver" />
              <div className="flex gap-2 flex-wrap">
                {industries.map((industry) => (
                  <Button
                    key={industry}
                    variant={selectedIndustry === industry ? "default" : "outline"}
                    size="sm"
                    className={
                      selectedIndustry === industry
                        ? "gold-shimmer text-navy"
                        : "border-gold/30 text-gold hover:bg-gold/10"
                    }
                    onClick={() => handleIndustryFilter(industry)}
                  >
                    {industry}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Case Studies Grid */}
      <section className="section-padding">
        <div className="container">
          <div className="responsive-grid-2 lg:grid-cols-3">
            {filteredCaseStudies.map((study, index) => (
              <motion.div
                key={study.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="glass-card border-gold/10 overflow-hidden h-full hover:border-gold/30 transition-all duration-300 group">
                  <div className="relative h-48 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-gold/20 to-silver/20"></div>
                    <div className="absolute top-3 left-3 z-10">
                      <Badge className="bg-deep-azure/90 text-white font-medium">
                        {study.industry}
                      </Badge>
                    </div>
                    {study.featured && (
                      <div className="absolute top-3 right-3 z-10">
                        <Badge className="bg-electric-cyan/90 text-navy font-medium">
                          Featured
                        </Badge>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-6 flex flex-col justify-between h-auto">
                    <div>
                      <h3 className="font-bold text-white mb-2 line-clamp-2 group-hover:text-gold transition-colors responsive-text-lg">
                        {study.title}
                      </h3>
                      <p className="text-gold font-medium mb-2">{study.company}</p>
                      <p className="text-silver text-sm line-clamp-3 mb-4">
                        {study.challenge}
                      </p>
                      
                      <div className="space-y-3 mb-6">
                        <h4 className="text-gold font-semibold text-sm">Key Results:</h4>
                        <div className="grid grid-cols-1 gap-2">
                          {study.results.slice(0, 2).map((result, idx) => (
                            <div key={idx} className="flex items-center justify-between bg-black/20 rounded p-2">
                              <span className="text-silver text-xs">{result.metric}</span>
                              <div className="flex items-center gap-1">
                                <TrendingUp className="h-3 w-3 text-green-400" />
                                <span className="text-green-400 font-bold text-sm">{result.improvement}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-xs text-silver/80">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(study.publishDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{study.readTime}</span>
                        </div>
                      </div>
                      
                      <Link href={`/case-studies/${study.id}`}>
                        <Button className="w-full gold-shimmer text-navy font-semibold group-hover:scale-105 transition-transform">
                          Read Full Story
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {filteredCaseStudies.length === 0 && (
            <div className="text-center py-12">
              <p className="text-silver text-lg">No case studies found matching your criteria.</p>
              <Button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedIndustry("All");
                  setFilteredCaseStudies(caseStudies);
                }}
                variant="outline"
                className="mt-4 border-gold/30 text-gold hover:bg-gold/10"
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-gradient-to-br from-black to-black/80 border-y border-gold/10">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="mb-6 responsive-text-2xl font-bold text-white">Ready to Join Our Success Stories?</h2>
            <p className="mb-8 responsive-text-lg text-silver">
              Start your journey to digital excellence with AutomatIQ.AI and achieve results like these businesses.
            </p>
            <div className="responsive-flex-center">
              <Link href="/signup">
                <Button size="lg" className="gold-shimmer text-navy font-semibold w-full sm:w-auto">
                  Start Your Free Trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="border-gold/30 text-gold hover:bg-gold/10 w-full sm:w-auto">
                  Get a Custom Demo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <DoubleFooter />
    </div>
  );
} 