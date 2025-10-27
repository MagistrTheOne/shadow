"use client";

import { trpc } from "@/trpc/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SearchIcon, MessageSquareIcon } from "lucide-react";
import { LoadingState } from "@/components/loading-state";
import { ErrorState } from "@/components/error-state";
import { useState } from "react";
import { toast } from "sonner";
import type { Transcript } from "@/trpc/types";

interface TranscriptViewerProps {
  meetingId: string;
}

export const TranscriptViewer = ({ meetingId }: TranscriptViewerProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [question, setQuestion] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);

  const { data: transcript, isLoading, isError, error } = trpc.transcripts.getByMeeting.useQuery({ meetingId });
  
  const askQuestionMutation = trpc.transcripts.askQuestion.useMutation({
    onSuccess: (response) => {
      setAiAnswer(response.answer);
    },
    onError: (error) => {
      toast.error("Failed to get AI answer", {
        description: error.message || "An unexpected error occurred.",
      });
    },
  });

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      // Используем прямой вызов клиента для поиска
      const client = trpc.useUtils();
      const results = await client.transcripts.search.fetch({ query: searchQuery });
      setSearchResults(results.map((r: any) => r.transcript.content));
    } catch (error: any) {
      toast.error("Search failed", {
        description: error.message || "An unexpected error occurred.",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleAskQuestion = async () => {
    if (!question.trim() || !transcript) return;
    
    askQuestionMutation.mutate({ 
      transcriptId: transcript.id, 
      question 
    });
  };

  if (isLoading) return <LoadingState title="Loading transcript..." description="Fetching meeting transcript." />;
  if (isError) return <ErrorState title="Error loading transcript" description={error?.message || "Something went wrong."} />;

  if (!transcript) {
    return (
      <div className="text-center py-12 text-gray-500">
        <MessageSquareIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
        <p className="text-lg">No transcript available</p>
        <p className="text-sm">Transcript will appear here after the meeting ends.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle>Search Transcript</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Search in transcript..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button onClick={handleSearch} disabled={isSearching}>
              <SearchIcon className="w-4 h-4 mr-1" />
              Search
            </Button>
          </div>
          {searchResults.length > 0 && (
            <div className="mt-4">
              <h4 className="font-medium mb-2">Search Results:</h4>
              <div className="space-y-2">
                {searchResults.map((result, index) => (
                  <div key={index} className="p-2 bg-muted rounded text-sm">
                    {result}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Q&A Section */}
      <Card>
        <CardHeader>
          <CardTitle>Ask AI About This Meeting</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Ask a question about the meeting..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAskQuestion()}
              />
              <Button onClick={handleAskQuestion} disabled={askQuestionMutation.isPending}>
                Ask AI
              </Button>
            </div>
            {aiAnswer && (
              <div className="p-4 bg-muted rounded">
                <h4 className="font-medium mb-2">AI Answer:</h4>
                <p className="text-sm">{aiAnswer}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Full Transcript */}
      <Card>
        <CardHeader>
          <CardTitle>Full Transcript</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none">
            <pre className="whitespace-pre-wrap text-sm">{transcript.content}</pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
