import type { GraphData, GraphNode, GraphEdge } from '@/types/graph';

// Mock data simulating a knowledge graph (based on TECU Credit Union example)
const MOCK_NODES: GraphNode[] = [
  // Organizations
  {
    id: 'org-1',
    label: 'TECU Credit Union',
    type: 'Organization',
    properties: {
      name: 'TECU Credit Union',
      founded: '1947',
      type: 'Financial Institution',
      country: 'Trinidad and Tobago',
    },
  },
  {
    id: 'org-2',
    label: 'RHWhite Construction',
    type: 'Organization',
    properties: {
      name: 'RHWhite Construction',
      industry: 'Construction',
      specialization: 'Infrastructure',
    },
  },
  // Locations
  {
    id: 'loc-1',
    label: 'Trinidad and Tobago',
    type: 'Location',
    properties: {
      type: 'Country',
      region: 'Caribbean',
    },
  },
  {
    id: 'loc-2',
    label: 'Couva',
    type: 'Location',
    properties: {
      type: 'City',
      country: 'Trinidad and Tobago',
    },
  },
  {
    id: 'loc-3',
    label: 'Marabella',
    type: 'Location',
    properties: {
      type: 'City',
      country: 'Trinidad and Tobago',
    },
  },
  {
    id: 'loc-4',
    label: 'Point Fortin',
    type: 'Location',
    properties: {
      type: 'City',
      country: 'Trinidad and Tobago',
    },
  },
  // Products
  {
    id: 'prod-1',
    label: 'Loan Products',
    type: 'Product',
    properties: {
      category: 'Financial Products',
      types: ['Personal Loans', 'Home Loans', 'Auto Loans'],
    },
  },
  {
    id: 'prod-2',
    label: 'Savings and Investment',
    type: 'Product',
    properties: {
      category: 'Financial Products',
      types: ['Savings Accounts', 'Fixed Deposits', 'Investment Plans'],
    },
  },
  {
    id: 'prod-3',
    label: 'Fixed Deposit',
    type: 'Product',
    properties: {
      category: 'Investment',
      minimumDeposit: '$1000',
      interestRates: '2.5% - 4.5%',
    },
  },
  {
    id: 'prod-4',
    label: 'LinCU Card',
    type: 'Product',
    properties: {
      category: 'Payment Card',
      type: 'Debit Card',
      features: ['ATM Access', 'POS Transactions', 'Online Payments'],
    },
  },
  // Services
  {
    id: 'svc-1',
    label: 'Insurance Services',
    type: 'Service',
    properties: {
      category: 'Insurance',
      types: ['Life Insurance', 'Property Insurance'],
    },
  },
  {
    id: 'svc-2',
    label: 'Member Services',
    type: 'Service',
    properties: {
      category: 'Customer Service',
      channels: ['Branch', 'Online', 'Phone'],
    },
  },
  {
    id: 'svc-3',
    label: 'TECH-U E-Services',
    type: 'Service',
    properties: {
      category: 'Digital Banking',
      features: ['Online Banking', 'Mobile App', 'Bill Payment'],
    },
  },
  {
    id: 'svc-4',
    label: 'Tech-U E-Services',
    type: 'Service',
    properties: {
      category: 'Technology Services',
      platform: 'Digital',
    },
  },
  // Insurance providers
  {
    id: 'ins-1',
    label: 'Group Health & Life',
    type: 'Service',
    properties: {
      category: 'Insurance',
      type: 'Group Insurance',
    },
  },
  {
    id: 'ins-2',
    label: 'CUNA FIP Insurance',
    type: 'Service',
    properties: {
      category: 'Insurance',
      provider: 'CUNA Mutual Group',
    },
  },
  {
    id: 'ins-3',
    label: 'CUNA FCIP Insurance',
    type: 'Service',
    properties: {
      category: 'Insurance',
      type: 'Family Coverage',
    },
  },
  // Categories for RHWhite
  {
    id: 'cat-1',
    label: 'Energy & Power',
    type: 'Category',
    properties: {
      industry: 'Energy',
      description: 'Power generation and distribution projects',
    },
  },
  {
    id: 'cat-2',
    label: 'Facility Services',
    type: 'Category',
    properties: {
      industry: 'Services',
      description: 'Building maintenance and management',
    },
  },
  {
    id: 'cat-3',
    label: 'Industrial Manufacturing',
    type: 'Category',
    properties: {
      industry: 'Manufacturing',
      description: 'Industrial production facilities',
    },
  },
  {
    id: 'cat-4',
    label: 'Water & Wastewater',
    type: 'Category',
    properties: {
      industry: 'Utilities',
      description: 'Water treatment and distribution',
    },
  },
  {
    id: 'cat-5',
    label: 'WhiteWater',
    type: 'Category',
    properties: {
      industry: 'Water Services',
      subsidiary: true,
    },
  },
];

const MOCK_EDGES: GraphEdge[] = [
  // TECU relationships
  { id: 'e1', from: 'org-1', to: 'loc-1', type: 'LOCATED_IN', label: 'LOCATED_IN' },
  { id: 'e2', from: 'org-1', to: 'prod-1', type: 'OFFERS', label: 'OFFERS' },
  { id: 'e3', from: 'org-1', to: 'prod-2', type: 'OFFERS', label: 'OFFERS' },
  { id: 'e4', from: 'org-1', to: 'svc-1', type: 'OFFERS', label: 'OFFERS' },
  { id: 'e5', from: 'org-1', to: 'svc-2', type: 'PROVIDES', label: 'PROVIDES' },
  { id: 'e6', from: 'org-1', to: 'loc-2', type: 'HAS_BRANCH', label: 'HAS_BRANCH' },
  { id: 'e7', from: 'org-1', to: 'loc-3', type: 'HAS_BRANCH', label: 'HAS_BRANCH' },
  { id: 'e8', from: 'org-1', to: 'loc-4', type: 'HAS_BRANCH', label: 'HAS_BRANCH' },
  { id: 'e9', from: 'org-1', to: 'svc-3', type: 'PROVIDED_BY', label: 'PROVIDED_BY' },
  { id: 'e10', from: 'org-1', to: 'svc-4', type: 'OFFERED_BY', label: 'OFFERED_BY' },
  { id: 'e11', from: 'org-1', to: 'prod-4', type: 'OFFERED_BY', label: 'OFFERED_BY' },
  { id: 'e12', from: 'org-1', to: 'ins-1', type: 'PROVIDED_BY', label: 'PROVIDED_BY' },
  { id: 'e13', from: 'org-1', to: 'ins-2', type: 'PROVIDED_BY', label: 'PROVIDED_BY' },
  { id: 'e14', from: 'org-1', to: 'ins-3', type: 'PROVIDED_BY', label: 'PROVIDED_BY' },
  { id: 'e15', from: 'org-1', to: 'prod-3', type: 'OFFERS', label: 'OFFERS' },
  // RHWhite relationships
  { id: 'e16', from: 'org-2', to: 'cat-1', type: 'SERVES_CATEGORY', label: 'SERVES_CATEGORY' },
  { id: 'e17', from: 'org-2', to: 'cat-2', type: 'OFFERS', label: 'OFFERS' },
  { id: 'e18', from: 'org-2', to: 'cat-3', type: 'SERVES_CATEGORY', label: 'SERVES_CATEGORY' },
  { id: 'e19', from: 'org-2', to: 'cat-4', type: 'SERVES_CATEGORY', label: 'SERVES_CATEGORY' },
  { id: 'e20', from: 'org-2', to: 'cat-5', type: 'SERVES_CATEGORY', label: 'SERVES_CATEGORY' },
];

// Simulated delay for API calls
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Get initial graph data
 */
export const getInitialGraph = async (
  _tenantId: string,
  botId?: string
): Promise<GraphData> => {
  await delay(500); // Simulate network latency

  // If botId provided, filter to relevant subset (mock behavior)
  if (botId) {
    // For demo, return TECU-related nodes only
    const tecuNodes = MOCK_NODES.filter(n =>
      ['org-1', 'loc-1', 'prod-1', 'prod-2', 'svc-1', 'svc-2'].includes(n.id)
    );
    const tecuEdges = MOCK_EDGES.filter(e =>
      tecuNodes.some(n => n.id === e.from) && tecuNodes.some(n => n.id === e.to)
    );
    return { nodes: tecuNodes, edges: tecuEdges };
  }

  // Return all mock data
  return { nodes: MOCK_NODES, edges: MOCK_EDGES };
};

/**
 * Expand a node to get its connected nodes and edges
 */
export const expandNode = async (nodeId: string): Promise<GraphData> => {
  await delay(300);

  // Find edges connected to this node
  const connectedEdges = MOCK_EDGES.filter(
    e => e.from === nodeId || e.to === nodeId
  );

  // Find nodes connected by those edges
  const connectedNodeIds = new Set<string>();
  connectedEdges.forEach(e => {
    connectedNodeIds.add(e.from);
    connectedNodeIds.add(e.to);
  });

  const connectedNodes = MOCK_NODES.filter(n => connectedNodeIds.has(n.id));

  return { nodes: connectedNodes, edges: connectedEdges };
};

/**
 * Get detailed information about a node
 */
export const getNodeDetails = async (nodeId: string): Promise<GraphNode | null> => {
  await delay(200);
  return MOCK_NODES.find(n => n.id === nodeId) || null;
};

/**
 * Search nodes by query string
 */
export const searchNodes = async (
  query: string,
  _tenantId: string
): Promise<GraphNode[]> => {
  await delay(300);

  const lowerQuery = query.toLowerCase();
  return MOCK_NODES.filter(
    n =>
      n.label.toLowerCase().includes(lowerQuery) ||
      n.type.toLowerCase().includes(lowerQuery)
  );
};

/**
 * Get nodes by type
 */
export const getNodesByType = async (type: string): Promise<GraphNode[]> => {
  await delay(200);
  return MOCK_NODES.filter(n => n.type === type);
};

/**
 * Get all unique node types in the graph
 */
export const getNodeTypes = async (): Promise<string[]> => {
  await delay(100);
  const types = new Set(MOCK_NODES.map(n => n.type));
  return Array.from(types);
};
