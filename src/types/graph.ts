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

// Node colors - Monochromatic purple palette
export const NODE_COLORS: Record<string, NodeTypeConfig> = {
  // Darkest purple - core entities
  Organization: { color: '#1A0533', label: 'Organization' },
  Tenant: { color: '#1A0533', label: 'Tenant' },

  // Dark purple - bots
  Bot: { color: '#3C1A6E', label: 'Bot' },

  // Medium purple - services
  Service: { color: '#5E35A0', label: 'Service' },
  Category: { color: '#5E35A0', label: 'Category' },

  // Medium-light purple - products & locations
  Product: { color: '#7E57C2', label: 'Product' },
  Location: { color: '#7E57C2', label: 'Location' },

  // Light purple - other entities
  Person: { color: '#9575CD', label: 'Person' },
  Entity: { color: '#9575CD', label: 'Entity' },
  Concept: { color: '#9575CD', label: 'Concept' },
  default: { color: '#9575CD', label: 'Other' },
};

// Graph theme constants - Purple-tinted theme
export const GRAPH_THEME = {
  background: '#FFFFFF',
  edgeColor: '#7C6FAB',
  edgeHighlight: '#9C27B0',
  nodeHighlight: '#9C27B0',
  fontColor: '#2D1B4E',
  fontColorLight: '#FFFFFF',
};
