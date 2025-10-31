"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, FileText, Calendar, User } from "lucide-react";
import { trpc } from "@/trpc/client";
import { LoadingState } from "@/components/loading-state";
import { format } from "date-fns";
import { useRouter } from "next/navigation";

export function TranscriptSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: results, isLoading } = trpc.transcripts.search.useQuery(
    { query: searchQuery, limit: 20 },
    { enabled: searchQuery.length > 0 }
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim().length > 0) {
      setSearchQuery(query.trim());
    }
  };

  return (
    <div className="space-y-4">
      <Card className="dashboard-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Search Transcripts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              placeholder="Search in transcripts..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" disabled={!query.trim() || isLoading}>
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
          </form>
        </CardContent>
      </Card>

      {searchQuery && (
        <Card className="dashboard-card">
          <CardHeader>
            <CardTitle>
              Search Results {results && `(${results.length})`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <LoadingState title="Searching..." description="Please wait" />
            ) : results && results.length > 0 ? (
              <ScrollArea className="h-[600px]">
                <div className="space-y-4">
                  {results.map((result) => (
                    <Card key={result.transcript.id} className="dashboard-surface">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg">
                              {result.meeting.title}
                            </CardTitle>
                            <div className="flex items-center gap-4 mt-2 text-sm text-muted-strong">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {format(
                                  new Date(result.meeting.createdAt),
                                  "MMM d, yyyy"
                                )}
                              </div>
                              <Badge variant="outline">
                                {result.transcript.wordCount || 0} words
                              </Badge>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              router.push(
                                `/dashboard/meetings/${result.meeting.id}`
                              )
                            }
                          >
                            <FileText className="w-4 h-4 mr-2" />
                            View
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-strong line-clamp-3">
                          {result.transcript.content.substring(0, 300)}...
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="text-center py-8 text-muted-strong">
                No transcripts found matching "{searchQuery}"
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

