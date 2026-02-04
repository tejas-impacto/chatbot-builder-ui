import { useState, useEffect, useCallback, useRef } from 'react';
import { Search, Loader2, Network, ChevronRight, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { SidebarProvider } from '@/components/ui/sidebar';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { KnowledgeGraphCanvas } from '@/components/graph/KnowledgeGraphCanvas';
import { NodeDetailPanel } from '@/components/graph/NodeDetailPanel';
import { GraphLegend } from '@/components/graph/GraphLegend';
import { GraphToolbar } from '@/components/graph/GraphToolbar';
import { getInitialGraph, expandNode, searchNodes } from '@/lib/graphApi';
import type { GraphNode, GraphEdge, SelectedElement } from '@/types/graph';
import { useToast } from '@/hooks/use-toast';

const KnowledgeGraphPage = () => {
  const { toast } = useToast();
  const graphContainerRef = useRef<HTMLDivElement>(null);

  // Graph data state
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [edges, setEdges] = useState<GraphEdge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExpanding, setIsExpanding] = useState(false);

  // Selection state
  const [selection, setSelection] = useState<SelectedElement | null>(null);
  const [showDetailPanel, setShowDetailPanel] = useState(false);

  // Filter state
  const [selectedBotId, setSelectedBotId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GraphNode[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Context menu state
  const [contextMenuNode, setContextMenuNode] = useState<string | null>(null);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });

  // Hidden nodes
  const [hiddenNodes, setHiddenNodes] = useState<Set<string>>(new Set());

  // Get tenantId from localStorage
  const tenantId = localStorage.getItem('tenantId') || '';

  // Load initial graph data
  useEffect(() => {
    const loadGraph = async () => {
      setIsLoading(true);
      try {
        const botId = selectedBotId === 'all' ? undefined : selectedBotId;
        const data = await getInitialGraph(tenantId, botId);
        setNodes(data.nodes);
        setEdges(data.edges);
      } catch (error) {
        console.error('Failed to load graph:', error);
        toast({
          title: 'Error',
          description: 'Failed to load knowledge graph',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadGraph();
  }, [tenantId, selectedBotId, toast]);

  // Handle node expansion
  const handleExpandNode = useCallback(async (nodeId: string) => {
    setIsExpanding(true);
    try {
      const data = await expandNode(nodeId);

      // Merge new nodes (avoid duplicates)
      setNodes(prev => {
        const existingIds = new Set(prev.map(n => n.id));
        const newNodes = data.nodes.filter(n => !existingIds.has(n.id));
        return [...prev, ...newNodes];
      });

      // Merge new edges (avoid duplicates)
      setEdges(prev => {
        const existingIds = new Set(prev.map(e => e.id));
        const newEdges = data.edges.filter(e => !existingIds.has(e.id));
        return [...prev, ...newEdges];
      });

      // Mark node as expanded
      setNodes(prev =>
        prev.map(n => (n.id === nodeId ? { ...n, expanded: true } : n))
      );

      toast({
        title: 'Expanded',
        description: `Loaded ${data.nodes.length} connected nodes`,
      });
    } catch (error) {
      console.error('Failed to expand node:', error);
      toast({
        title: 'Error',
        description: 'Failed to expand node connections',
        variant: 'destructive',
      });
    } finally {
      setIsExpanding(false);
    }
  }, [toast]);

  // Handle search
  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const results = await searchNodes(searchQuery, tenantId);
      setSearchResults(results);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery, tenantId]);

  // Handle node click
  const handleNodeClick = useCallback((node: GraphNode) => {
    setSelection({ type: 'node', id: node.id, data: node });
    setShowDetailPanel(true);
  }, []);

  // Handle node double-click (expand)
  const handleNodeDoubleClick = useCallback((nodeId: string) => {
    handleExpandNode(nodeId);
  }, [handleExpandNode]);

  // Handle node right-click
  const handleNodeRightClick = useCallback((nodeId: string, position: { x: number; y: number }) => {
    setContextMenuNode(nodeId);
    setContextMenuPosition(position);
  }, []);

  // Handle edge click
  const handleEdgeClick = useCallback((edge: GraphEdge) => {
    setSelection({ type: 'edge', id: edge.id, data: edge });
    setShowDetailPanel(true);
  }, []);

  // Handle selection change
  const handleSelectionChange = useCallback((sel: SelectedElement | null) => {
    setSelection(sel);
    if (sel) {
      setShowDetailPanel(true);
    }
  }, []);

  // Handle hide node
  const handleHideNode = useCallback((nodeId: string) => {
    setHiddenNodes(prev => new Set([...prev, nodeId]));
    if (selection?.id === nodeId) {
      setSelection(null);
      setShowDetailPanel(false);
    }
  }, [selection]);

  // Handle focus on node
  const handleFocusNode = useCallback((nodeId: string) => {
    const container = graphContainerRef.current;
    if (container) {
      const methods = (container.querySelector('[class*="h-full"]') as any)?.graphMethods;
      if (methods?.focusNode) {
        methods.focusNode(nodeId);
      }
    }
  }, []);

  // Graph control methods
  const handleZoomIn = useCallback(() => {
    const container = graphContainerRef.current;
    if (container) {
      const canvas = container.querySelector('[class*="h-full"]') as any;
      canvas?.graphMethods?.zoomIn?.();
    }
  }, []);

  const handleZoomOut = useCallback(() => {
    const container = graphContainerRef.current;
    if (container) {
      const canvas = container.querySelector('[class*="h-full"]') as any;
      canvas?.graphMethods?.zoomOut?.();
    }
  }, []);

  const handleFitToScreen = useCallback(() => {
    const container = graphContainerRef.current;
    if (container) {
      const canvas = container.querySelector('[class*="h-full"]') as any;
      canvas?.graphMethods?.fitToScreen?.();
    }
  }, []);

  const handleReset = useCallback(() => {
    setHiddenNodes(new Set());
    setSelection(null);
    setShowDetailPanel(false);
    setSearchQuery('');
    setSearchResults([]);
  }, []);

  // Filter visible nodes
  const visibleNodes = nodes.filter(n => !hiddenNodes.has(n.id));
  const visibleEdges = edges.filter(
    e => !hiddenNodes.has(e.from) && !hiddenNodes.has(e.to)
  );

  return (
    <SidebarProvider>
      <div className="h-screen flex w-full bg-gradient-to-br from-muted/30 via-background to-primary/5 overflow-hidden">
        <DashboardSidebar />

        <main className="flex-1 flex flex-col h-full overflow-hidden">
          <DashboardHeader />

          <div className="flex-1 flex flex-col min-h-0">
            {/* Page Header */}
            <div className="px-6 py-4 border-b border-border bg-background">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Network className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-foreground">Knowledge Graph</h1>
                    <p className="text-sm text-muted-foreground">
                      {visibleNodes.length} nodes, {visibleEdges.length} relationships
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search nodes..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSearch()}
                      className="pl-9 w-64"
                    />
                    {isSearching && (
                      <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                    )}
                  </div>

                  {/* Bot Filter */}
                  <Select value={selectedBotId} onValueChange={setSelectedBotId}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by bot" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Bots</SelectItem>
                      <SelectItem value="bot-1">TECU Assistant</SelectItem>
                      <SelectItem value="bot-2">RHWhite Bot</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Refresh */}
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleReset}
                    disabled={isLoading}
                  >
                    <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="mt-3 flex items-center gap-2 flex-wrap">
                  <span className="text-sm text-muted-foreground">Results:</span>
                  {searchResults.slice(0, 5).map(node => (
                    <Button
                      key={node.id}
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        handleNodeClick(node);
                        handleFocusNode(node.id);
                      }}
                    >
                      {node.label}
                      <ChevronRight className="ml-1 h-3 w-3" />
                    </Button>
                  ))}
                  {searchResults.length > 5 && (
                    <span className="text-sm text-muted-foreground">
                      +{searchResults.length - 5} more
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Graph Container */}
            <div className="flex-1 flex min-h-0 overflow-hidden">
              <div ref={graphContainerRef} className="flex-1 relative min-h-0">
                {isLoading ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-background">
                    <div className="text-center">
                      <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-3" />
                      <p className="text-muted-foreground">Loading knowledge graph...</p>
                    </div>
                  </div>
                ) : (
                  <ContextMenu>
                    <ContextMenuTrigger asChild>
                      <div className="w-full h-full">
                        <KnowledgeGraphCanvas
                          nodes={visibleNodes}
                          edges={visibleEdges}
                          onNodeClick={handleNodeClick}
                          onNodeDoubleClick={handleNodeDoubleClick}
                          onNodeRightClick={handleNodeRightClick}
                          onEdgeClick={handleEdgeClick}
                          onSelectionChange={handleSelectionChange}
                          selectedNodeId={selection?.type === 'node' ? selection.id : null}
                        />
                      </div>
                    </ContextMenuTrigger>
                    <ContextMenuContent>
                      {contextMenuNode && (
                        <>
                          <ContextMenuItem onClick={() => handleExpandNode(contextMenuNode)}>
                            Expand Connections
                          </ContextMenuItem>
                          <ContextMenuItem onClick={() => handleFocusNode(contextMenuNode)}>
                            Focus on Node
                          </ContextMenuItem>
                          <ContextMenuSeparator />
                          <ContextMenuItem onClick={() => handleHideNode(contextMenuNode)}>
                            Hide Node
                          </ContextMenuItem>
                        </>
                      )}
                    </ContextMenuContent>
                  </ContextMenu>
                )}

                {/* Legend Overlay */}
                <GraphLegend className="absolute bottom-4 left-4" />

                {/* Toolbar Overlay */}
                <GraphToolbar
                  className="absolute bottom-4 right-4"
                  onZoomIn={handleZoomIn}
                  onZoomOut={handleZoomOut}
                  onFitToScreen={handleFitToScreen}
                  onReset={handleReset}
                />

                {/* Expanding Indicator */}
                {isExpanding && (
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-background/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm border border-border flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    <span className="text-sm">Loading connections...</span>
                  </div>
                )}

                {/* Hidden nodes indicator */}
                {hiddenNodes.size > 0 && (
                  <div className="absolute top-4 left-4 bg-background/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm text-muted-foreground">
                    {hiddenNodes.size} node{hiddenNodes.size > 1 ? 's' : ''} hidden
                    <Button
                      variant="link"
                      size="sm"
                      className="ml-2 h-auto p-0 text-primary"
                      onClick={() => setHiddenNodes(new Set())}
                    >
                      Show all
                    </Button>
                  </div>
                )}
              </div>

              {/* Detail Panel */}
              {showDetailPanel && (
                <NodeDetailPanel
                  selection={selection}
                  onClose={() => {
                    setShowDetailPanel(false);
                    setSelection(null);
                  }}
                  onExpand={handleExpandNode}
                  onHide={handleHideNode}
                  onFocus={handleFocusNode}
                />
              )}
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default KnowledgeGraphPage;
