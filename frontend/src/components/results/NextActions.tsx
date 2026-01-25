"use client";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ArrowRight, Upload, FileText, BarChart3 } from "lucide-react";
import Link from "next/link";

export function NextActions() {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Recommended Next Steps</h3>
      <div className="space-y-3">
        <Link href="/assess">
          <Button variant="outline" className="w-full justify-between group">
            <div className="flex items-center gap-3">
              <Upload className="w-4 h-4" />
              <span>Run Another Assessment</span>
            </div>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>

        <Link href="/compare">
          <Button variant="outline" className="w-full justify-between group">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-4 h-4" />
              <span>Compare with Other Companies</span>
            </div>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>

        <div className="pt-3 border-t border-border">
          <p className="text-xs text-foreground/60 mb-2">Tips for better results:</p>
          <ul className="text-xs text-foreground/60 space-y-1 list-disc list-inside">
            <li>Upload complete annual reports for comprehensive ESG analysis</li>
            <li>Verify financial ratios match the fiscal year</li>
            <li>Compare results year-over-year to track trends</li>
          </ul>
        </div>
      </div>
    </Card>
  );
}



