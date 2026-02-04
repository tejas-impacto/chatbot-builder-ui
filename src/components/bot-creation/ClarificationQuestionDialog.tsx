import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, MessageCircleQuestion } from 'lucide-react';
import type { ClarificationRequest } from '@/hooks/useBotCreationWebSocket';

interface ClarificationQuestionDialogProps {
  open: boolean;
  clarificationRequest: ClarificationRequest | null;
  onSubmit: (answers: Record<string, string>) => void;
  isSubmitting: boolean;
}

export const ClarificationQuestionDialog = ({
  open,
  clarificationRequest,
  onSubmit,
  isSubmitting,
}: ClarificationQuestionDialogProps) => {
  const [answers, setAnswers] = useState<Record<string, string>>({});

  // Reset answers when a new clarification request comes in
  useEffect(() => {
    if (clarificationRequest?.questions) {
      const initialAnswers: Record<string, string> = {};
      clarificationRequest.questions.forEach((_, index) => {
        initialAnswers[String(index)] = '';
      });
      setAnswers(initialAnswers);
    }
  }, [clarificationRequest]);

  const handleAnswerChange = (index: number, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [String(index)]: value,
    }));
  };

  const handleSubmit = () => {
    // Filter out empty answers
    const filledAnswers: Record<string, string> = {};
    Object.entries(answers).forEach(([key, value]) => {
      if (value.trim()) {
        filledAnswers[key] = value.trim();
      }
    });
    onSubmit(filledAnswers);
  };

  // Check if at least one answer is provided
  const hasAtLeastOneAnswer = Object.values(answers).some(a => a.trim().length > 0);

  if (!clarificationRequest) return null;

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        className="sm:max-w-lg"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <MessageCircleQuestion className="w-5 h-5 text-primary" />
            </div>
            <DialogTitle className="text-xl">Clarification Needed</DialogTitle>
          </div>
          {clarificationRequest.context && (
            <DialogDescription className="text-sm text-muted-foreground">
              {clarificationRequest.context}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="space-y-6 py-4">
          {clarificationRequest.questions.map((question, index) => (
            <div key={index} className="space-y-2">
              <Label htmlFor={`answer-${index}`} className="text-sm font-medium">
                {clarificationRequest.questions.length > 1 && (
                  <span className="text-muted-foreground mr-2">Q{index + 1}.</span>
                )}
                {question}
              </Label>
              <Textarea
                id={`answer-${index}`}
                placeholder="Type your answer here..."
                value={answers[String(index)] || ''}
                onChange={(e) => handleAnswerChange(index, e.target.value)}
                disabled={isSubmitting}
                className="min-h-[80px] resize-none"
              />
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !hasAtLeastOneAnswer}
            className="min-w-[140px]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Answers'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ClarificationQuestionDialog;
