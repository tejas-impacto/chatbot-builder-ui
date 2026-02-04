import { cn } from '@/lib/utils';

interface GraphLegendProps {
  className?: string;
}

// Simple two-color legend
const LEGEND_ITEMS = [
  { label: 'Organization / Bot', color: '#1E3A5F' },
  { label: 'Related Entities', color: '#475569' },
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
