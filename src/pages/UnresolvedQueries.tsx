import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, HelpCircle, Loader2, RefreshCw, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useToast } from "@/hooks/use-toast";
import {
  getUnresolvedQueries,
  submitQueryAnswers,
  type UnresolvedQuery,
} from "@/lib/botApi";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const UnresolvedQueries = () => {
  const { botId } = useParams<{ botId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [queries, setQueries] = useState<UnresolvedQuery[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [selectedQuery, setSelectedQuery] = useState<UnresolvedQuery | null>(null);
  const [answerDialogOpen, setAnswerDialogOpen] = useState(false);
  const [answerText, setAnswerText] = useState("");
  const [submittingAnswer, setSubmittingAnswer] = useState(false);

  const pageSize = 10;

  const fetchQueries = async (pageNum: number = 0) => {
    if (!botId) return;

    try {
      setLoading(true);
      const response = await getUnresolvedQueries(botId, pageNum, pageSize);
      const data = response.responseStructure?.data;
      setQueries(data?.content || []);
      setTotalPages(data?.totalPages || 0);
      setTotalElements(data?.totalElements || 0);
      setPage(pageNum);
    } catch (error) {
      console.error("Error fetching unresolved queries:", error);
      toast({
        title: "Error",
        description: "Failed to load unresolved queries.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueries();
  }, [botId]);

  const handleAnswerQuery = (query: UnresolvedQuery) => {
    setSelectedQuery(query);
    setAnswerText("");
    setAnswerDialogOpen(true);
  };

  const handleSubmitAnswer = async () => {
    if (!selectedQuery || !answerText.trim()) return;

    setSubmittingAnswer(true);
    try {
      await submitQueryAnswers([
        {
          queryId: selectedQuery.queryId,
          answer: answerText.trim(),
          approve: true,
        },
      ]);

      toast({
        title: "Answer Submitted",
        description: "Your answer has been submitted successfully.",
      });

      setAnswerDialogOpen(false);
      setSelectedQuery(null);
      setAnswerText("");
      fetchQueries(page); // Refresh the list
    } catch (error) {
      console.error("Error submitting answer:", error);
      toast({
        title: "Error",
        description: "Failed to submit answer. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmittingAnswer(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-muted/30 via-background to-primary/5">
        <DashboardSidebar />

        <main className="flex-1 overflow-auto">
          <DashboardHeader />

          <div className="p-6 space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate(-1)}
                    className="rounded-full"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                  <h1 className="text-2xl font-bold text-foreground">
                    Unresolved Queries
                  </h1>
                  {totalElements > 0 && (
                    <Badge variant="destructive">{totalElements}</Badge>
                  )}
                </div>
                <p className="text-muted-foreground ml-12">
                  Questions your bot couldn't answer. Provide answers to improve bot responses.
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => fetchQueries(page)}
                disabled={loading}
                className="rounded-full"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
                  <p className="text-muted-foreground">Loading queries...</p>
                </div>
              </div>
            )}

            {/* Empty State */}
            {!loading && queries.length === 0 && (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                    <HelpCircle className="w-10 h-10 text-green-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    No Unresolved Queries
                  </h3>
                  <p className="text-muted-foreground max-w-sm">
                    Great! Your bot has been able to answer all questions.
                  </p>
                </div>
              </div>
            )}

            {/* Queries List */}
            {!loading && queries.length > 0 && (
              <div className="space-y-4">
                {queries.map((query) => (
                  <Card
                    key={query.queryId}
                    className="border-border/50 hover:border-primary/30 transition-colors cursor-pointer"
                    onClick={() => handleAnswerQuery(query)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <MessageSquare className="w-4 h-4 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {formatDate(query.createdAt)}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {query.status}
                            </Badge>
                          </div>
                          <p className="text-foreground">{query.query}</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-full flex-shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAnswerQuery(query);
                          }}
                        >
                          Answer
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 pt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fetchQueries(page - 1)}
                      disabled={page === 0 || loading}
                      className="rounded-full"
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-muted-foreground px-4">
                      Page {page + 1} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fetchQueries(page + 1)}
                      disabled={page >= totalPages - 1 || loading}
                      className="rounded-full"
                    >
                      Next
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Answer Query Dialog */}
      <Dialog open={answerDialogOpen} onOpenChange={setAnswerDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Answer Query</DialogTitle>
            <DialogDescription>
              Provide an answer to this unresolved query. The bot will learn from your response.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Query</label>
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-sm text-foreground">{selectedQuery?.query}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Asked on {selectedQuery?.createdAt && formatDate(selectedQuery.createdAt)}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Your Answer</label>
              <Textarea
                placeholder="Type your answer here..."
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
                className="min-h-[120px] rounded-xl"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setAnswerDialogOpen(false);
                setSelectedQuery(null);
                setAnswerText("");
              }}
              className="rounded-full"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitAnswer}
              disabled={!answerText.trim() || submittingAnswer}
              className="rounded-full"
            >
              {submittingAnswer ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Answer"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
};

export default UnresolvedQueries;
