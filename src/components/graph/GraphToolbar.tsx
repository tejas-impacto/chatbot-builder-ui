import { ZoomIn, ZoomOut, Maximize, RotateCcw, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface GraphToolbarProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitToScreen: () => void;
  onReset?: () => void;
  onExport?: () => void;
  className?: string;
}

export const GraphToolbar = ({
  onZoomIn,
  onZoomOut,
  onFitToScreen,
  onReset,
  onExport,
  className,
}: GraphToolbarProps) => {
  const tools = [
    { icon: ZoomIn, label: 'Zoom In', onClick: onZoomIn, shortcut: '+' },
    { icon: ZoomOut, label: 'Zoom Out', onClick: onZoomOut, shortcut: '-' },
    { icon: Maximize, label: 'Fit to Screen', onClick: onFitToScreen, shortcut: 'F' },
    ...(onReset ? [{ icon: RotateCcw, label: 'Reset View', onClick: onReset, shortcut: 'R' }] : []),
    ...(onExport ? [{ icon: Download, label: 'Export Image', onClick: onExport }] : []),
  ];

  return (
    <div
      className={cn(
        'bg-background/90 backdrop-blur-sm rounded-lg border border-border p-1 shadow-sm flex gap-1',
        className
      )}
    >
      {tools.map((tool, index) => (
        <Tooltip key={index}>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={tool.onClick}
            >
              <tool.icon className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>
              {tool.label}
              {tool.shortcut && (
                <span className="ml-2 text-muted-foreground">({tool.shortcut})</span>
              )}
            </p>
          </TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
};

export default GraphToolbar;
