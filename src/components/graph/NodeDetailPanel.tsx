import { X, Expand, EyeOff, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
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

// Fields to hide from the display (technical/internal fields)
const HIDDEN_FIELDS = [
  'embedding',
  'vector',
  'embeddings',
  'vectors',
  '__typename',
  '_id',
  '_Date_ordinal',
  '_Date_year',
  '_Date_month',
  '_Date_day',
  '_Date__year',
  '_Date__month',
  '_Date__day',
  '_Time_ticks',
  '_Time_hour',
  '_Time_minute',
  '_Time_second',
  '_Time__hour',
  '_Time__minute',
  '_Time__second',
];

// Format a label from camelCase or snake_case to readable text
const formatLabel = (key: string): string => {
  return key
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

// Format datetime values from Neo4j
const formatDateTime = (value: unknown): string | null => {
  if (!value || typeof value !== 'object') return null;

  const obj = value as Record<string, unknown>;

  // Handle direct Neo4j datetime format {year, month, day, hour, minute, ...}
  if ('year' in obj && 'month' in obj && 'day' in obj) {
    const year = obj.year as number;
    const month = String(obj.month).padStart(2, '0');
    const day = String(obj.day).padStart(2, '0');

    if ('hour' in obj) {
      const hour = String(obj.hour).padStart(2, '0');
      const minute = String(obj.minute || 0).padStart(2, '0');
      return `${year}-${month}-${day} ${hour}:${minute}`;
    }
    return `${year}-${month}-${day}`;
  }

  return null;
};

// Check if a key represents a datetime field
const isDateTimeKey = (key: string): boolean => {
  const lowerKey = key.toLowerCase();
  return lowerKey.includes('created') ||
         lowerKey.includes('updated') ||
         lowerKey.includes('date') ||
         lowerKey.includes('time') ||
         lowerKey.includes('_at');
};

// Deep extract datetime from nested Neo4j/Python structure
const extractDateTime = (value: unknown): string | null => {
  if (!value || typeof value !== 'object') return null;

  const obj = value as Record<string, unknown>;

  // Direct datetime object
  const direct = formatDateTime(obj);
  if (direct) return direct;

  // Handle Python datetime serialization format with _Date_year, _Time_hour, etc.
  // Structure like: { "_Date_year": 2025, "_Date_month": 12, "_Date_day": 15 }
  if ('_Date_year' in obj || '_Date__year' in obj) {
    const year = (obj._Date_year || obj._Date__year) as number;
    const month = String((obj._Date_month || obj._Date__month || 1) as number).padStart(2, '0');
    const day = String((obj._Date_day || obj._Date__day || 1) as number).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Handle Python time serialization format
  if ('_Time_hour' in obj || '_Time__hour' in obj) {
    const hour = String((obj._Time_hour || obj._Time__hour || 0) as number).padStart(2, '0');
    const minute = String((obj._Time_minute || obj._Time__minute || 0) as number).padStart(2, '0');
    return `${hour}:${minute}`;
  }

  // Handle combined datetime with "Date Time Date" and "Date Time Time" sub-objects
  const dateKey = Object.keys(obj).find(k => k.toLowerCase().includes('date') && !k.toLowerCase().includes('time'));
  const timeKey = Object.keys(obj).find(k => k.toLowerCase().includes('time') && !k.toLowerCase().includes('date'));

  if (dateKey && typeof obj[dateKey] === 'object' && obj[dateKey] !== null) {
    const dateObj = obj[dateKey] as Record<string, unknown>;
    let datePart = '';

    if ('_Date_year' in dateObj || '_Date__year' in dateObj) {
      const year = (dateObj._Date_year || dateObj._Date__year) as number;
      const month = String((dateObj._Date_month || dateObj._Date__month || 1) as number).padStart(2, '0');
      const day = String((dateObj._Date_day || dateObj._Date__day || 1) as number).padStart(2, '0');
      datePart = `${year}-${month}-${day}`;
    }

    if (timeKey && typeof obj[timeKey] === 'object' && obj[timeKey] !== null && datePart) {
      const timeObj = obj[timeKey] as Record<string, unknown>;
      if ('_Time_hour' in timeObj || '_Time__hour' in timeObj) {
        const hour = String((timeObj._Time_hour || timeObj._Time__hour || 0) as number).padStart(2, '0');
        const minute = String((timeObj._Time_minute || timeObj._Time__minute || 0) as number).padStart(2, '0');
        return `${datePart} ${hour}:${minute}`;
      }
    }

    if (datePart) return datePart;
  }

  // Check for nested structures like {year: {low: 2024}, month: {low: 1}, ...}
  if ('year' in obj && typeof obj.year === 'object' && obj.year !== null) {
    const yearObj = obj.year as Record<string, unknown>;
    if ('low' in yearObj) {
      const year = yearObj.low as number;
      const month = String(((obj.month as Record<string, unknown>)?.low as number) || 1).padStart(2, '0');
      const day = String(((obj.day as Record<string, unknown>)?.low as number) || 1).padStart(2, '0');

      if ('hour' in obj && typeof obj.hour === 'object') {
        const hour = String(((obj.hour as Record<string, unknown>)?.low as number) || 0).padStart(2, '0');
        const minute = String(((obj.minute as Record<string, unknown>)?.low as number) || 0).padStart(2, '0');
        return `${year}-${month}-${day} ${hour}:${minute}`;
      }
      return `${year}-${month}-${day}`;
    }
  }

  return null;
};

// Try to parse JSON string
const tryParseJson = (value: string): Record<string, unknown> | null => {
  try {
    const parsed = JSON.parse(value);
    if (typeof parsed === 'object' && parsed !== null) {
      return parsed;
    }
  } catch {
    // Not valid JSON
  }
  return null;
};

// Process and clean properties for display
const processProperties = (props: Record<string, unknown>): Record<string, unknown> => {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(props)) {
    // Skip hidden fields
    if (HIDDEN_FIELDS.some(f => key.toLowerCase().includes(f.toLowerCase()))) {
      continue;
    }

    // Skip null/undefined values
    if (value === null || value === undefined) {
      continue;
    }

    // Skip empty strings
    if (value === '') {
      continue;
    }

    // Handle properties_json field - parse and flatten
    if (key === 'properties_json' && typeof value === 'string') {
      const parsed = tryParseJson(value);
      if (parsed) {
        // Merge parsed properties into result
        for (const [pKey, pValue] of Object.entries(parsed)) {
          if (!HIDDEN_FIELDS.some(f => pKey.toLowerCase().includes(f.toLowerCase()))) {
            result[pKey] = pValue;
          }
        }
      }
      continue;
    }

    // Handle arrays - skip if it's an embedding (lots of numbers)
    if (Array.isArray(value)) {
      if (value.length > 10 && typeof value[0] === 'number') {
        // Likely an embedding array, skip
        continue;
      }
      result[key] = value;
      continue;
    }

    // Try to format datetime (check key name and try to extract)
    if (isDateTimeKey(key) && typeof value === 'object') {
      const dateStr = extractDateTime(value);
      if (dateStr) {
        result[key] = dateStr;
        continue;
      }
    }

    // Try direct datetime format
    const dateStr = formatDateTime(value);
    if (dateStr) {
      result[key] = dateStr;
      continue;
    }

    // Handle nested JSON strings
    if (typeof value === 'string') {
      const parsed = tryParseJson(value);
      if (parsed) {
        result[key] = parsed;
        continue;
      }
    }

    result[key] = value;
  }

  return result;
};

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

  // Helper to convert any value to displayable string
  const valueToString = (v: unknown): string => {
    if (v === null || v === undefined) return '—';
    if (typeof v === 'boolean') return v ? 'Yes' : 'No';
    if (typeof v === 'object') {
      // Try datetime extraction first
      const dateStr = extractDateTime(v);
      if (dateStr) return dateStr;
      // Otherwise stringify
      return JSON.stringify(v);
    }
    return String(v);
  };

  const renderValue = (value: unknown): React.ReactNode => {
    if (value === null || value === undefined) {
      return <span className="text-muted-foreground italic">—</span>;
    }

    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }

    if (Array.isArray(value)) {
      if (value.length === 0) {
        return <span className="text-muted-foreground italic">None</span>;
      }
      return (
        <div className="flex flex-wrap gap-1 mt-1">
          {value.slice(0, 10).map((v, i) => (
            <Badge key={i} variant="secondary" className="text-xs">
              {valueToString(v)}
            </Badge>
          ))}
          {value.length > 10 && (
            <Badge variant="outline" className="text-xs">
              +{value.length - 10} more
            </Badge>
          )}
        </div>
      );
    }

    if (typeof value === 'object') {
      // Try to extract as datetime first
      const dateStr = extractDateTime(value);
      if (dateStr) return dateStr;

      // Render nested object as key-value pairs
      const entries = Object.entries(value as Record<string, unknown>);
      if (entries.length === 0) {
        return <span className="text-muted-foreground italic">—</span>;
      }

      // Filter out technical Neo4j/Python datetime fields
      const technicalFields = [
        'low', 'high', 'timeZoneOffsetSeconds', 'nanosecond',
        '_Date_ordinal', '_Date_year', '_Date_month', '_Date_day',
        '_Date__year', '_Date__month', '_Date__day',
        '_Time_ticks', '_Time_hour', '_Time_minute', '_Time_second',
        '_Time__hour', '_Time__minute', '_Time__second',
      ];
      const meaningfulEntries = entries.filter(([k]) =>
        !technicalFields.includes(k) && !k.startsWith('_')
      );

      if (meaningfulEntries.length === 0) {
        return <span className="text-muted-foreground italic">—</span>;
      }

      return (
        <div className="mt-1 pl-2 border-l-2 border-border space-y-1">
          {meaningfulEntries.map(([k, v]) => (
            <div key={k} className="text-xs">
              <span className="text-muted-foreground">{formatLabel(k)}:</span>{' '}
              <span>{valueToString(v)}</span>
            </div>
          ))}
        </div>
      );
    }

    return String(value);
  };

  const renderProperties = (props: Record<string, unknown>) => {
    const processed = processProperties(props);
    const entries = Object.entries(processed);

    if (entries.length === 0) {
      return (
        <div className="py-4 text-center text-sm text-muted-foreground">
          No additional properties
        </div>
      );
    }

    return entries.map(([key, value]) => (
      <div key={key} className="py-2">
        <dt className="text-xs text-muted-foreground uppercase tracking-wide">
          {formatLabel(key)}
        </dt>
        <dd className="mt-1 text-sm text-foreground">
          {renderValue(value)}
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
