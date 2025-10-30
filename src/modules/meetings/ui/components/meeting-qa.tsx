"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Send, Loader2, Bot } from "lucide-react";
import { trpc } from "@/trpc/client";
import { LoadingState } from "@/components/loading-state";

interface MeetingQAProps {
  transcriptId: string;
  meetingId: string;
}

interface QAPair {
  question: string;
  answer: string;
  timestamp: Date;
}

export function MeetingQA({ transcriptId, meetingId }: MeetingQAProps) {
  const [question, setQuestion] = useState("");
  const [qaHistory, setQaHistory] = useState<QAPair[]>([]);

  const askQuestionMutation = trpc.transcripts.askQuestion.useMutation({
    onSuccess: (data) => {
      setQaHistory((prev) => [
        ...prev,
        {
          question: data.question,
          answer: data.answer,
          timestamp: new Date(),
        },
      ]);
      setQuestion("");
    },
    onError: (error) => {
      console.error("Failed to get answer:", error);
    },
  });

  const handleAsk = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || askQuestionMutation.isPending) return;

    askQuestionMutation.mutate({
      transcriptId,
      question: question.trim(),
    });
  };

  return (
    <Card className="dashboard-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="w-5 h-5" />
          AI Meeting Q&A
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Q&A History */}
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {qaHistory.length === 0 ? (
              <div className="text-center py-8 text-muted-strong">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Ask a question about this meeting</p>
                <p className="text-sm mt-2">
                  The AI will answer based on the meeting transcript
                </p>
              </div>
            ) : (
              qaHistory.map((qa, index) => (
                <div key={index} className="space-y-2">
                  {/* Question */}
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <MessageSquare className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-high-contrast">
                        {qa.question}
                      </p>
                      <p className="text-xs text-muted-strong mt-1">
                        {qa.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  {/* Answer */}
                  <div className="flex items-start gap-3 ml-11">
                    <div className="w-8 h-8 rounded-full bg-dashboard-accent/20 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-dashboard-accent" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-muted-strong whitespace-pre-wrap">
                        {qa.answer}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
            {askQuestionMutation.isPending && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Loader2 className="w-4 h-4 text-primary animate-spin" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-strong">
                    AI is thinking...
                  </p>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Question Input */}
        <form onSubmit={handleAsk} className="flex gap-2">
          <Input
            placeholder="Ask a question about this meeting..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={askQuestionMutation.isPending}
            className="flex-1"
          />
          <Button
            type="submit"
            disabled={!question.trim() || askQuestionMutation.isPending}
          >
            {askQuestionMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

