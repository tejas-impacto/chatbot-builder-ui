import type { GraphData, GraphNode, GraphEdge } from '@/types/graph';
import { getKnowledgeGraph, getBotsByTenant } from './botApi';
import { NODE_COLORS } from '@/types/graph';

/**
 * Normalize entity type to match NODE_COLORS keys
 * Handles case differences (e.g., "ORGANIZATION" -> "Organization")
 */
const normalizeEntityType = (entityType: string): string => {
  if (!entityType) return 'Entity';

  // Get all valid type keys from NODE_COLORS
  const validTypes = Object.keys(NODE_COLORS).filter(k => k !== 'default');

  // Find matching type (case-insensitive)
  const matchedType = validTypes.find(
    t => t.toLowerCase() === entityType.toLowerCase()
  );

  if (matchedType) return matchedType;

  // If no match, capitalize first letter of each word
  return entityType
    .toLowerCase()
    .split(/[_\s]+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
};

/**
 * Map API response to internal graph format
 */
const mapApiResponseToGraphData = (apiData: {
  nodes: Array<{
    id: string;
    label: string;
    entityType: string;
    description: string;
    source: string;
    properties: Record<string, string>;
  }>;
  edges: Array<{
    id: string;
    source: string;
    target: string;
    label: string;
    properties: Record<string, string>;
  }>;
}): GraphData => {
  const nodes: GraphNode[] = apiData.nodes.map(node => ({
    id: node.id,
    label: node.label,
    type: normalizeEntityType(node.entityType),
    properties: {
      ...node.properties,
      description: node.description,
      source: node.source,
    },
  }));

  const edges: GraphEdge[] = apiData.edges.map(edge => ({
    id: edge.id,
    from: edge.source,
    to: edge.target,
    type: edge.label,
    label: edge.label,
    properties: edge.properties,
  }));

  return { nodes, edges };
};

/**
 * Merge multiple graph data into one, avoiding duplicates
 */
const mergeGraphData = (graphs: GraphData[]): GraphData => {
  const nodeMap = new Map<string, GraphNode>();
  const edgeMap = new Map<string, GraphEdge>();

  for (const graph of graphs) {
    for (const node of graph.nodes) {
      nodeMap.set(node.id, node);
    }
    for (const edge of graph.edges) {
      edgeMap.set(edge.id, edge);
    }
  }

  return {
    nodes: Array.from(nodeMap.values()),
    edges: Array.from(edgeMap.values()),
  };
};

/**
 * Get knowledge graph data - either for a specific bot or entire tenant
 * @param tenantId - The tenant identifier
 * @param botId - Optional bot identifier. If 'all' or undefined, fetches all bots' graphs
 */
export const getInitialGraph = async (
  tenantId: string,
  botId?: string
): Promise<GraphData> => {
  if (!tenantId) {
    return { nodes: [], edges: [] };
  }

  try {
    // If 'all' is selected, fetch graphs from all bots and merge them
    if (!botId || botId === 'all') {
      const botsResponse = await getBotsByTenant(tenantId);
      const bots = botsResponse.responseStructure?.data || [];

      if (bots.length === 0) {
        return { nodes: [], edges: [] };
      }

      // Fetch all bot graphs in parallel
      const graphPromises = bots.map(async (bot) => {
        try {
          const response = await getKnowledgeGraph(tenantId, bot.botId);
          const graphData = response.responseStructure?.data;
          if (graphData?.nodes && graphData?.edges) {
            return mapApiResponseToGraphData(graphData);
          }
          return { nodes: [], edges: [] };
        } catch {
          // Individual bot graph fetch failed, return empty
          return { nodes: [], edges: [] };
        }
      });

      const allGraphs = await Promise.all(graphPromises);
      return mergeGraphData(allGraphs);
    }

    // Fetch specific bot graph
    const response = await getKnowledgeGraph(tenantId, botId);
    const graphData = response.responseStructure?.data;

    if (!graphData || !graphData.nodes || !graphData.edges) {
      return { nodes: [], edges: [] };
    }

    return mapApiResponseToGraphData(graphData);
  } catch (error) {
    console.error('Failed to fetch knowledge graph:', error);
    throw error;
  }
};

/**
 * Expand a node to get its connected nodes and edges
 * For now, this is handled client-side from existing data
 */
export const expandNode = async (nodeId: string): Promise<GraphData> => {
  // In a real implementation, this would call an API endpoint
  // For now, return empty data as expansion is handled in the parent component
  console.log('Expanding node:', nodeId);
  return { nodes: [], edges: [] };
};

/**
 * Get detailed information about a node
 */
export const getNodeDetails = async (nodeId: string): Promise<GraphNode | null> => {
  console.log('Getting details for node:', nodeId);
  return null;
};

/**
 * Search nodes by query string
 * This filters from the currently loaded graph data
 */
export const searchNodes = async (
  query: string,
  _tenantId: string,
  currentNodes: GraphNode[] = []
): Promise<GraphNode[]> => {
  const lowerQuery = query.toLowerCase();
  return currentNodes.filter(
    n =>
      n.label.toLowerCase().includes(lowerQuery) ||
      n.type.toLowerCase().includes(lowerQuery)
  );
};

/**
 * Get nodes by type from currently loaded data
 */
export const getNodesByType = async (
  type: string,
  currentNodes: GraphNode[] = []
): Promise<GraphNode[]> => {
  return currentNodes.filter(n => n.type === type);
};

/**
 * Get all unique node types from currently loaded data
 */
export const getNodeTypes = async (currentNodes: GraphNode[] = []): Promise<string[]> => {
  const types = new Set(currentNodes.map(n => n.type));
  return Array.from(types);
};
