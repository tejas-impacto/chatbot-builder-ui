import { cn } from '@/lib/utils';

interface GraphLegendProps {
  className?: string;
}

// Monochromatic purple legend
const LEGEND_ITEMS = [
  { label: 'Organization / Tenant', color: '#1A0533' },
  { label: 'Bot', color: '#3C1A6E' },
  { label: 'Service / Category', color: '#5E35A0' },
  { label: 'Product / Location', color: '#7E57C2' },
  { label: 'Other', color: '#9575CD' },
];

export const GraphLegend = ({ className }: GraphLegendProps) => {
  return (
    <div
      className={cn(
        'bg-background/90 backdrop-blur-sm rounded-lg border border-border p-3 shadow-sm',
        className
      )}
    >
      <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
        Legend
      </h4>
      <div className="flex gap-4">
        {LEGEND_ITEMS.map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-xs font-medium text-foreground">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GraphLegend;
