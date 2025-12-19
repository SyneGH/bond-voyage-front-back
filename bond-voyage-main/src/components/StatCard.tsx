import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  change?: number;
  trend?: "up" | "down";
  gradientFrom: string;
  gradientTo: string;
  selected?: boolean;
}

export function StatCard({ icon: Icon, label, value, change, trend = "up", gradientFrom, gradientTo, selected = false }: StatCardProps) {
  const isPositive = trend === "up";
  
  return (
    <div className={`bg-card rounded-2xl p-4 sm:p-5 lg:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.12),0_1px_2px_rgba(0,0,0,0.08)] transition-all duration-200 hover:shadow-[0_4px_6px_rgba(0,0,0,0.07),0_2px_4px_rgba(0,0,0,0.06)] hover:-translate-y-1 cursor-pointer border ${selected ? 'border-[#0A7AFF] border-2 shadow-[0_0_0_3px_rgba(10,122,255,0.1)]' : 'border-border'}`}>
      <div className="flex items-start justify-between mb-3 sm:mb-4">
        <div 
          className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center"
          style={{ background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})` }}
        >
          <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" strokeWidth={2} />
        </div>
      </div>
      
      <div className="mb-1">
        <p className="text-xs sm:text-sm text-muted-foreground font-medium uppercase tracking-wide">{label}</p>
      </div>
      
      <div className="mb-2 sm:mb-3">
        <p className="text-2xl sm:text-[28px] lg:text-[32px] text-card-foreground font-bold leading-tight">{value}</p>
      </div>
      
      {change !== undefined && (
        <div className={`inline-flex items-center gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-medium ${isPositive ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
          {isPositive ? <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" /> : <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4" />}
          {change > 0 ? '+' : ''}{change}%
        </div>
      )}
    </div>
  );
}
