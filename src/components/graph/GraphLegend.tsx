import { NODE_COLORS } from '@/types/graph';
import { cn } from '@/lib/utils';

interface GraphLegendProps {
  activeTypes?: string[];
  onTypeClick?: (type: string) => void;
  className?: string;
}

export const GraphLegend = ({
  activeTypes,
  onTypeClick,
  className,
}: GraphLegendProps) => {
  const types = Object.entries(NODE_COLORS).filter(([key]) => key !== 'default');

  return (
    <div
      className={cn(
        'bg-background/90 backdrop-blur-sm rounded-lg border border-border p-3 shadow-sm',
        className
      )}
    >
      <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
        Node Types
      </h4>
      <div className="flex flex-wrap gap-2">
        {types.map(([type, config]) => {
          const isActive = !activeTypes || activeTypes.includes(type);
          return (
            <button
              key={type}
              onClick={() => onTypeClick?.(type)}
              className={cn(
                'flex items-center gap-1.5 px-2 py-1 rounded-full text-xs transition-all',
                'hover:ring-2 hover:ring-offset-1 hover:ring-primary/20',
                isActive ? 'opacity-100' : 'opacity-40',
                onTypeClick && 'cursor-pointer'
              )}
              style={{
                backgroundColor: `${config.color}20`,
                color: config.color,
              }}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: config.color }}
              />
              <span className="font-medium">{config.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default GraphLegend;
