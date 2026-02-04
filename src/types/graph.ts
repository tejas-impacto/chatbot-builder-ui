// Graph node representing an entity in the knowledge graph
export interface GraphNode {
  id: string;
  label: string;
  type: string; // Node label type (e.g., "Organization", "Product", "Location")
  properties: Record<string, unknown>;
  expanded?: boolean;
}

// Graph edge representing a relationship between nodes
export interface GraphEdge {
  id: string;
  from: string;
  to: string;
  type: string; // Relationship type (e.g., "OFFERS", "LOCATED_IN", "HAS_BRANCH")
  label: string;
  properties?: Record<string, unknown>;
}

// Complete graph data structure
export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

// Context menu action for nodes
export interface NodeContextMenuAction {
  label: string;
  icon?: string;
  action: 'expand' | 'hide' | 'focus' | 'collapse' | 'copy';
}

// Node type color configuration
export interface NodeTypeConfig {
  color: string;
  label: string;
}

// Graph visualization options
export interface GraphOptions {
  physics: boolean;
  hierarchical: boolean;
}

// Selected element info
export interface SelectedElement {
  type: 'node' | 'edge';
  id: string;
  data: GraphNode | GraphEdge;
}

// Node colors for different types
export const NODE_COLORS: Record<string, NodeTypeConfig> = {
  Organization: { color: '#E8744F', label: 'Organization' },
  Product: { color: '#2196F3', label: 'Product' },
  Location: { color: '#4CAF50', label: 'Location' },
  Service: { color: '#9C27B0', label: 'Service' },
  Person: { color: '#FF9800', label: 'Person' },
  Category: { color: '#00BCD4', label: 'Category' },
  default: { color: '#607D8B', label: 'Unknown' },
};

// Graph theme constants
export const GRAPH_THEME = {
  background: '#F8FAFC',
  edgeColor: '#94A3B8',
  edgeHighlight: '#3B82F6',
  nodeHighlight: '#1E40AF',
  fontColor: '#1E293B',
  fontColorLight: '#64748B',
};
