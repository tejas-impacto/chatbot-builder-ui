import { X, Expand, EyeOff, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { GraphNode, GraphEdge, SelectedElement } from '@/types/graph';
import { NODE_COLORS } from '@/types/graph';
import { useState } from 'react';

interface NodeDetailPanelProps {
  selection: SelectedElement | null;
  onClose: () => void;
  onExpand?: (nodeId: string) => void;
  onHide?: (nodeId: string) => void;
  onFocus?: (nodeId: string) => void;
}

export const NodeDetailPanel = ({
  selection,
  onClose,
  onExpand,
  onHide,
  onFocus,
}: NodeDetailPanelProps) => {
  const [copied, setCopied] = useState(false);

  if (!selection) return null;

  const isNode = selection.type === 'node';
  const data = selection.data as GraphNode | GraphEdge;

  const handleCopy = () => {
    const text = JSON.stringify(data, null, 2);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getNodeColor = () => {
    if (isNode) {
      const node = data as GraphNode;
      return NODE_COLORS[node.type]?.color || NODE_COLORS.default.color;
    }
    return '#94A3B8';
  };

  const renderProperties = (props: Record<string, unknown>) => {
    return Object.entries(props).map(([key, value]) => (
      <div key={key} className="py-2">
        <dt className="text-xs text-muted-foreground uppercase tracking-wide">{key}</dt>
        <dd className="mt-1 text-sm text-foreground">
          {Array.isArray(value) ? (
            <div className="flex flex-wrap gap-1 mt-1">
              {value.map((v, i) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  {String(v)}
                </Badge>
              ))}
            </div>
          ) : typeof value === 'object' && value !== null ? (
            <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-auto">
              {JSON.stringify(value, null, 2)}
            </pre>
          ) : (
            String(value)
          )}
        </dd>
      </div>
    ));
  };

  return (
    <div className="w-80 h-full bg-background border-l border-border flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-4 h-4 rounded-full flex-shrink-0"
              style={{ backgroundColor: getNodeColor() }}
            />
            <div className="min-w-0">
              <h3 className="font-semibold text-foreground truncate">
                {isNode ? (data as GraphNode).label : (data as GraphEdge).label}
              </h3>
              <p className="text-xs text-muted-foreground">
                {isNode ? (data as GraphNode).type : 'Relationship'}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 flex-shrink-0"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Actions (for nodes only) */}
      {isNode && (
        <div className="p-3 border-b border-border">
          <div className="flex gap-2">
            {onExpand && (
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-xs"
                onClick={() => onExpand(selection.id)}
              >
                <Expand className="h-3 w-3 mr-1" />
                Expand
              </Button>
            )}
            {onFocus && (
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-xs"
                onClick={() => onFocus(selection.id)}
              >
                Focus
              </Button>
            )}
            {onHide && (
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-xs"
                onClick={() => onHide(selection.id)}
              >
                <EyeOff className="h-3 w-3 mr-1" />
                Hide
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Properties */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-foreground">Properties</h4>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={handleCopy}
            >
              {copied ? (
                <>
                  <Check className="h-3 w-3 mr-1" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3 mr-1" />
                  Copy
                </>
              )}
            </Button>
          </div>

          <dl className="divide-y divide-border">
            {/* ID */}
            <div className="py-2">
              <dt className="text-xs text-muted-foreground uppercase tracking-wide">ID</dt>
              <dd className="mt-1 text-sm text-foreground font-mono">{selection.id}</dd>
            </div>

            {/* Type-specific fields */}
            {isNode ? (
              <>
                <div className="py-2">
                  <dt className="text-xs text-muted-foreground uppercase tracking-wide">Type</dt>
                  <dd className="mt-1">
                    <Badge
                      style={{ backgroundColor: getNodeColor() }}
                      className="text-white"
                    >
                      {(data as GraphNode).type}
                    </Badge>
                  </dd>
                </div>
                {(data as GraphNode).properties && renderProperties((data as GraphNode).properties)}
              </>
            ) : (
              <>
                <div className="py-2">
                  <dt className="text-xs text-muted-foreground uppercase tracking-wide">
                    Relationship Type
                  </dt>
                  <dd className="mt-1 text-sm text-foreground font-mono">
                    {(data as GraphEdge).type}
                  </dd>
                </div>
                <div className="py-2">
                  <dt className="text-xs text-muted-foreground uppercase tracking-wide">From</dt>
                  <dd className="mt-1 text-sm text-foreground font-mono">
                    {(data as GraphEdge).from}
                  </dd>
                </div>
                <div className="py-2">
                  <dt className="text-xs text-muted-foreground uppercase tracking-wide">To</dt>
                  <dd className="mt-1 text-sm text-foreground font-mono">
                    {(data as GraphEdge).to}
                  </dd>
                </div>
                {(data as GraphEdge).properties &&
                  renderProperties((data as GraphEdge).properties)}
              </>
            )}
          </dl>
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-3 border-t border-border bg-muted/50">
        <p className="text-xs text-muted-foreground text-center">
          {isNode ? 'Double-click to expand connections' : 'Click edges to see details'}
        </p>
      </div>
    </div>
  );
};

export default NodeDetailPanel;
