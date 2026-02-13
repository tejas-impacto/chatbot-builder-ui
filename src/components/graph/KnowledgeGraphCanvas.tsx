import { useEffect, useRef, useCallback, useState } from 'react';
import { Network, Options, Data } from 'vis-network';
import { DataSet } from 'vis-data';
import type { GraphNode, GraphEdge, SelectedElement } from '@/types/graph';
import { NODE_COLORS, GRAPH_THEME } from '@/types/graph';

interface KnowledgeGraphCanvasProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  onNodeClick?: (node: GraphNode) => void;
  onNodeDoubleClick?: (nodeId: string) => void;
  onNodeRightClick?: (nodeId: string, position: { x: number; y: number }) => void;
  onEdgeClick?: (edge: GraphEdge) => void;
  onSelectionChange?: (selection: SelectedElement | null) => void;
  selectedNodeId?: string | null;
  className?: string;
}

export const KnowledgeGraphCanvas = ({
  nodes,
  edges,
  onNodeClick,
  onNodeDoubleClick,
  onNodeRightClick,
  onEdgeClick,
  onSelectionChange,
  selectedNodeId,
  className,
}: KnowledgeGraphCanvasProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const networkRef = useRef<Network | null>(null);
  const nodesDataSetRef = useRef<DataSet<any> | null>(null);
  const edgesDataSetRef = useRef<DataSet<any> | null>(null);
  const [isStabilizing, setIsStabilizing] = useState(true);

  // Convert our nodes to vis-network format
  // Using 'box' shape so text appears inside the node
  const convertNodes = useCallback((graphNodes: GraphNode[]) => {
    return graphNodes.map(node => {
      const colorConfig = NODE_COLORS[node.type] || NODE_COLORS.default;
      return {
        id: node.id,
        label: node.label,
        title: `${node.type}: ${node.label}`,
        color: {
          background: colorConfig.color,
          border: colorConfig.color,
          highlight: {
            background: GRAPH_THEME.nodeHighlight,
            border: GRAPH_THEME.nodeHighlight,
          },
          hover: {
            background: colorConfig.color,
            border: GRAPH_THEME.nodeHighlight,
          },
        },
        font: {
          color: '#FFFFFF',
          size: 12,
          face: 'Inter, sans-serif',
          multi: false,
        },
        // Use 'box' shape so text is inside the node
        shape: 'box',
        margin: { top: 10, right: 10, bottom: 10, left: 10 },
        borderWidth: 2,
        borderWidthSelected: 3,
        shadow: {
          enabled: true,
          color: 'rgba(0,0,0,0.15)',
          size: 10,
          x: 2,
          y: 2,
        },
        // Store original data for retrieval
        originalData: node,
      };
    });
  }, []);

  // Convert our edges to vis-network format
  // Using straight lines with labels positioned above/below
  const convertEdges = useCallback((graphEdges: GraphEdge[]) => {
    return graphEdges.map((edge, index) => ({
      id: edge.id,
      from: edge.from,
      to: edge.to,
      label: edge.label,
      title: edge.type,
      color: {
        color: GRAPH_THEME.edgeColor,
        highlight: GRAPH_THEME.edgeHighlight,
        hover: GRAPH_THEME.edgeHighlight,
      },
      font: {
        color: GRAPH_THEME.fontColor,
        size: 10,
        face: 'Inter, sans-serif',
        strokeWidth: 3,
        strokeColor: '#FFFFFF',
        align: 'horizontal',
        // Position labels above or below the line, not on it
        vadjust: index % 2 === 0 ? -12 : 12,
        background: 'rgba(255,255,255,0.9)',
      },
      arrows: {
        to: {
          enabled: true,
          scaleFactor: 0.5,
          type: 'arrow',
        },
      },
      // Use straight lines, not curved
      smooth: false,
      width: 1.5,
      selectionWidth: 2,
      hoverWidth: 2,
      // Store original data for retrieval
      originalData: edge,
    }));
  }, []);

  // Network options
  const getNetworkOptions = useCallback((): Options => ({
    physics: {
      enabled: true,
      solver: 'forceAtlas2Based',
      forceAtlas2Based: {
        gravitationalConstant: -80,
        centralGravity: 0.002,        // Very low - lets separate clusters drift apart
        springLength: 200,
        springConstant: 0.08,
        damping: 0.4,
        avoidOverlap: 0.8,
      },
      stabilization: {
        enabled: true,
        iterations: 200,
        updateInterval: 25,
        fit: true,
      },
      maxVelocity: 50,
      minVelocity: 0.1,
    },
    interaction: {
      hover: true,
      hoverConnectedEdges: true,
      selectConnectedEdges: true,
      multiselect: false,
      dragNodes: true,
      dragView: true,
      zoomView: true,
      navigationButtons: false,
      keyboard: {
        enabled: true,
        speed: { x: 10, y: 10, zoom: 0.02 },
      },
    },
    nodes: {
      // Box shape with text inside
      shape: 'box',
      margin: { top: 10, right: 10, bottom: 10, left: 10 },
      font: {
        color: '#FFFFFF',
        size: 12,
      },
    },
    edges: {
      // Disable smooth curves - use straight lines
      smooth: false,
      font: {
        align: 'horizontal',
      },
    },
    layout: {
      improvedLayout: true,
      randomSeed: 42,
    },
  }), []);

  // Initialize network once on mount
  useEffect(() => {
    if (!containerRef.current) return;

    // Create empty datasets - will be populated by the data sync effect
    const nodesDataSet = new DataSet<any>([]);
    const edgesDataSet = new DataSet<any>([]);

    nodesDataSetRef.current = nodesDataSet;
    edgesDataSetRef.current = edgesDataSet;

    const data: Data = {
      nodes: nodesDataSet,
      edges: edgesDataSet,
    };

    // Create network
    const network = new Network(containerRef.current, data, getNetworkOptions());
    networkRef.current = network;

    // Event handlers
    network.on('click', (params) => {
      if (params.nodes.length > 0) {
        const nodeId = params.nodes[0];
        const nodeData = nodesDataSet.get(nodeId) as any;
        if (nodeData?.originalData && onNodeClick) {
          onNodeClick(nodeData.originalData);
        }
        if (onSelectionChange && nodeData?.originalData) {
          onSelectionChange({ type: 'node', id: nodeId, data: nodeData.originalData });
        }
      } else if (params.edges.length > 0) {
        const edgeId = params.edges[0];
        const edgeData = edgesDataSet.get(edgeId) as any;
        if (edgeData?.originalData && onEdgeClick) {
          onEdgeClick(edgeData.originalData);
        }
        if (onSelectionChange && edgeData?.originalData) {
          onSelectionChange({ type: 'edge', id: edgeId, data: edgeData.originalData });
        }
      } else {
        if (onSelectionChange) {
          onSelectionChange(null);
        }
      }
    });

    network.on('doubleClick', (params) => {
      if (params.nodes.length > 0 && onNodeDoubleClick) {
        onNodeDoubleClick(params.nodes[0]);
      }
    });

    network.on('oncontext', (params) => {
      params.event.preventDefault();
      const nodeId = network.getNodeAt(params.pointer.DOM);
      if (nodeId && onNodeRightClick) {
        onNodeRightClick(nodeId as string, {
          x: params.pointer.DOM.x,
          y: params.pointer.DOM.y,
        });
      }
    });

    network.on('stabilizationProgress', () => {
      setIsStabilizing(true);
    });

    network.on('stabilizationIterationsDone', () => {
      setIsStabilizing(false);
      // Disable physics so nodes stay fixed in place after layout
      network.setOptions({ physics: { enabled: false } });
      // Fit to screen after stabilization
      network.fit({
        animation: {
          duration: 300,
          easingFunction: 'easeInOutQuad',
        },
      });
    });

    // Elastic drag: re-enable physics while dragging so connected nodes
    // follow naturally via spring forces, then freeze everything on release.
    network.on('dragStart', (params) => {
      if (params.nodes.length > 0) {
        // Unfix all nodes so the spring simulation can move them
        const allIds = nodesDataSet.getIds();
        nodesDataSet.update(allIds.map(id => ({ id, fixed: false })));
        // Re-enable physics with soft spring settings for an elastic feel
        network.setOptions({
          physics: {
            enabled: true,
            solver: 'forceAtlas2Based',
            forceAtlas2Based: {
              gravitationalConstant: -30,
              centralGravity: 0.001,
              springLength: 200,
              springConstant: 0.04,
              damping: 0.5,
            },
            maxVelocity: 30,
          },
        });
      }
    });

    network.on('dragEnd', () => {
      // Disable physics and pin every node where it is
      network.setOptions({ physics: { enabled: false } });
      const allIds = nodesDataSet.getIds();
      const positions = network.getPositions(allIds as string[]);
      nodesDataSet.update(
        (allIds as string[]).map(id => ({
          id,
          x: positions[id]?.x,
          y: positions[id]?.y,
          fixed: { x: true, y: true },
        }))
      );
    });

    // Cleanup
    return () => {
      network.destroy();
      networkRef.current = null;
      nodesDataSetRef.current = null;
      edgesDataSetRef.current = null;
    };
  }, []); // Only run on mount

  // Sync data when props change
  useEffect(() => {
    if (!nodesDataSetRef.current || !edgesDataSetRef.current || !networkRef.current) return;

    const nodesDataSet = nodesDataSetRef.current;
    const edgesDataSet = edgesDataSetRef.current;
    const network = networkRef.current;

    const currentNodeIds = new Set(nodesDataSet.getIds());
    const currentEdgeIds = new Set(edgesDataSet.getIds());

    const newNodeIds = new Set(nodes.map(n => n.id));
    const newEdgeIds = new Set(edges.map(e => e.id));

    // Remove edges first (to avoid orphan edge errors)
    const edgeIdsToRemove = Array.from(currentEdgeIds).filter(id => !newEdgeIds.has(id as string));
    if (edgeIdsToRemove.length > 0) {
      edgesDataSet.remove(edgeIdsToRemove);
    }

    // Remove old nodes
    const nodeIdsToRemove = Array.from(currentNodeIds).filter(id => !newNodeIds.has(id as string));
    if (nodeIdsToRemove.length > 0) {
      nodesDataSet.remove(nodeIdsToRemove);
    }

    // Add new nodes
    const nodesToAdd = nodes.filter(n => !currentNodeIds.has(n.id));
    if (nodesToAdd.length > 0) {
      nodesDataSet.add(convertNodes(nodesToAdd));
    }

    // Add new edges
    const edgesToAdd = edges.filter(e => !currentEdgeIds.has(e.id));
    if (edgesToAdd.length > 0) {
      edgesDataSet.add(convertEdges(edgesToAdd));
    }

    // If significant data change, re-stabilize and fit
    const hasSignificantChange = nodesToAdd.length > 0 || nodeIdsToRemove.length > 0;
    if (hasSignificantChange && nodes.length > 0) {
      setIsStabilizing(true);
      network.setOptions({ physics: { enabled: true } });
      network.stabilize(150);
    }
  }, [nodes, edges, convertNodes, convertEdges]);

  // Handle selected node highlighting
  useEffect(() => {
    if (!networkRef.current) return;

    if (selectedNodeId) {
      networkRef.current.selectNodes([selectedNodeId]);
      networkRef.current.focus(selectedNodeId, {
        scale: 1,
        animation: {
          duration: 500,
          easingFunction: 'easeInOutQuad',
        },
      });
    } else {
      networkRef.current.unselectAll();
    }
  }, [selectedNodeId]);

  // Public methods exposed via ref
  const zoomIn = useCallback(() => {
    if (networkRef.current) {
      const scale = networkRef.current.getScale();
      networkRef.current.moveTo({ scale: scale * 1.2 });
    }
  }, []);

  const zoomOut = useCallback(() => {
    if (networkRef.current) {
      const scale = networkRef.current.getScale();
      networkRef.current.moveTo({ scale: scale / 1.2 });
    }
  }, []);

  const fitToScreen = useCallback(() => {
    if (networkRef.current) {
      networkRef.current.fit({
        animation: {
          duration: 500,
          easingFunction: 'easeInOutQuad',
        },
      });
    }
  }, []);

  const focusNode = useCallback((nodeId: string) => {
    if (networkRef.current) {
      networkRef.current.focus(nodeId, {
        scale: 1.5,
        animation: {
          duration: 500,
          easingFunction: 'easeInOutQuad',
        },
      });
    }
  }, []);

  // Expose methods for parent component
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      (container as any).graphMethods = {
        zoomIn,
        zoomOut,
        fitToScreen,
        focusNode,
      };
    }
  }, [zoomIn, zoomOut, fitToScreen, focusNode]);

  return (
    <div className={`relative w-full h-full ${className || ''}`}>
      <div
        ref={containerRef}
        className="w-full h-full"
        style={{ backgroundColor: GRAPH_THEME.background }}
      />
      {isStabilizing && (
        <div className="absolute bottom-4 left-4 bg-background/80 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm text-muted-foreground flex items-center gap-2">
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
          Arranging nodes...
        </div>
      )}
    </div>
  );
};

export default KnowledgeGraphCanvas;
