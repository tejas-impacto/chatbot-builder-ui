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

// Node colors - Simple two-color scheme
export const NODE_COLORS: Record<string, NodeTypeConfig> = {
  // Primary color for main entities (Organizations, Bots, etc.)
  Organization: { color: '#1E3A5F', label: 'Organization' },  // Dark blue
  Bot: { color: '#1E3A5F', label: 'Bot' },
  Tenant: { color: '#1E3A5F', label: 'Tenant' },

  // Secondary color for related entities (Products, Services, Locations, etc.)
  Product: { color: '#475569', label: 'Product' },            // Slate gray
  Location: { color: '#475569', label: 'Location' },
  Service: { color: '#475569', label: 'Service' },
  Person: { color: '#475569', label: 'Person' },
  Category: { color: '#475569', label: 'Category' },
  Entity: { color: '#475569', label: 'Entity' },
  Concept: { color: '#475569', label: 'Concept' },
  default: { color: '#475569', label: 'Other' },
};

// Graph theme constants - Clean, light theme
export const GRAPH_THEME = {
  background: '#FFFFFF',
  edgeColor: '#64748B',
  edgeHighlight: '#6366F1',
  nodeHighlight: '#4F46E5',
  fontColor: '#000000',
  fontColorLight: '#000000',
};
