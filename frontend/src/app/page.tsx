import Link from "next/link";
import { ArrowRight, TrendingUp, FileText, BarChart3, Shield } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-5xl font-bold text-foreground mb-6 tracking-tight">
            Financial Risk Assessment
            <br />
            <span className="text-accent">Enhanced with ESG Analysis</span>
          </h1>
          <p className="text-xl text-foreground/70 mb-8 leading-relaxed">
            Comprehensive risk scoring that combines traditional financial metrics with
            environmental, social, and governance factors for a complete picture of company health.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/assess">
              <Button size="lg" className="group">
                Start New Assessment
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/compare">
              <Button variant="outline" size="lg">
                Compare Companies
              </Button>
            </Link>
          </div>
        </div>
      </section>

      
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="p-8 hover:shadow-apple-lg transition-shadow">
            <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-accent" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Altman Z-Score</h3>
            <p className="text-foreground/70">
              Industry-standard financial distress prediction using five key financial ratios.
            </p>
          </Card>

          <Card className="p-8 hover:shadow-apple-lg transition-shadow">
            <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center mb-4">
              <FileText className="w-6 h-6 text-success" />
            </div>
            <h3 className="text-xl font-semibold mb-2">ESG Analysis</h3>
            <p className="text-foreground/70">
              AI-powered analysis of ESG reports to identify environmental, social, and governance factors.
            </p>
          </Card>

          <Card className="p-8 hover:shadow-apple-lg transition-shadow">
            <div className="w-12 h-12 bg-warning/10 rounded-xl flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-warning" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Integrated Risk</h3>
            <p className="text-foreground/70">
              Combined risk score that adjusts financial probability based on ESG performance.
            </p>
          </Card>
        </div>
      </section>

      
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">How It Works</h2>
          <p className="text-foreground/70 max-w-2xl mx-auto">
            Our assessment combines multiple data sources to provide a comprehensive risk analysis.
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          {[
            { step: "1", title: "Company Info", desc: "Enter basic company information" },
            { step: "2", title: "Financial Data", desc: "Input financial ratios or statements" },
            { step: "3", title: "ESG Analysis", desc: "Upload report or paste ESG text" },
            { step: "4", title: "Get Results", desc: "View comprehensive risk assessment" },
          ].map((item) => (
            <div key={item.step} className="text-center">
              <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                {item.step}
              </div>
              <h4 className="font-semibold mb-2">{item.title}</h4>
              <p className="text-sm text-foreground/70">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}



