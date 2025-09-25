"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, Phone } from "lucide-react";
import { format } from "date-fns";
import { AgentwithName, CallExecution, CallHistoryResponse } from "@/lib/types";
import { getAgentExecutions, getAllAgents } from "@/app/actions/agents";

export default function CallHistory() {
  const [agents, setAgents] = useState<AgentwithName[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string>("");
  const [executions, setExecutions] = useState<CallExecution[]>([]);
  const [loading, setLoading] = useState(true);
  const [executionsLoading, setExecutionsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Load agents on component mount
  useEffect(() => {
    async function loadAgents() {
      try {
        const agentsList = await getAllAgents();
        setAgents(agentsList);
        if (agentsList.length > 0 && !selectedAgentId) {
          setSelectedAgentId(agentsList[0].id);
        }
      } catch (error) {
        console.error("Error loading agents:", error);
      } finally {
        setLoading(false);
      }
    }
    loadAgents();
  }, []);

  // Load executions when agent is selected
  useEffect(() => {
    if (selectedAgentId) {
      loadExecutions(selectedAgentId, 1);
    }
  }, [selectedAgentId]);

  // Cleanup audio when component unmounts
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const loadExecutions = async (
    agentId: string,
    page: number = 1,
    append: boolean = false
  ) => {
    setExecutionsLoading(true);
    try {
      const response: CallHistoryResponse = await getAgentExecutions(
        agentId,
        page,
        20
      );

      if (append) {
        setExecutions((prev) => [...prev, ...response.data]);
      } else {
        setExecutions(response.data);
      }

      setHasMore(response.has_more);
      setTotal(response.total);
      setCurrentPage(page);
    } catch (error) {
      console.error("Error loading executions:", error);
    } finally {
      setExecutionsLoading(false);
    }
  };

  const loadMore = () => {
    if (selectedAgentId && hasMore) {
      loadExecutions(selectedAgentId, currentPage + 1, true);
    }
  };

  const formatUTCToLocal = (utcTimeString: string) => {
    // Ensure the UTC string has 'Z' suffix if it doesn't already
    const utcString = utcTimeString.endsWith("Z")
      ? utcTimeString
      : utcTimeString + "Z";
    return new Date(utcString);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "completed":
        return "default";
      case "failed":
        return "destructive";
      case "in_progress":
        return "secondary";
      default:
        return "outline";
    }
  };

  const handlePlayRecording = (recordingUrl: string, executionId: string) => {
    if (currentlyPlaying === executionId) {
      // Pause current audio
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setCurrentlyPlaying(null);
    } else {
      // Stop any currently playing audio
      if (audioRef.current) {
        audioRef.current.pause();
      }

      // Create new audio element
      const audio = new Audio(recordingUrl);
      audioRef.current = audio;

      audio.onplay = () => {
        setCurrentlyPlaying(executionId);
      };

      audio.onpause = () => {
        setCurrentlyPlaying(null);
      };

      audio.onended = () => {
        setCurrentlyPlaying(null);
      };

      audio.onerror = () => {
        console.error("Error playing audio");
        setCurrentlyPlaying(null);
      };

      audio.play().catch((error) => {
        console.error("Error playing audio:", error);
        setCurrentlyPlaying(null);
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <Skeleton className="h-8 w-64 mb-4" />
          <Skeleton className="h-10 w-64" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-4">Call History</h1>

        {/* Agent Filter */}
        <div className="flex items-center gap-4 mb-4">
          <label htmlFor="agent-select" className="text-sm font-medium">
            Filter by Agent:
          </label>
          <Select value={selectedAgentId} onValueChange={setSelectedAgentId}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Select an agent" />
            </SelectTrigger>
            <SelectContent>
              {agents.map((agent) => (
                <SelectItem key={agent.id} value={agent.id}>
                  {agent.name || `Agent ${agent.id.slice(0, 8)}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedAgentId && (
          <p className="text-sm text-muted-foreground">
            Showing {executions.length} of {total} calls
          </p>
        )}
      </div>

      {/* Call History Table */}
      {executionsLoading && executions.length === 0 ? (
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : executions.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <Phone className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No calls found</h3>
              <p className="text-muted-foreground">
                {selectedAgentId
                  ? "This agent has no call history yet."
                  : "Select an agent to view call history."}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Call Records</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Phone Number</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-32">Recording</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {executions.map((execution) => (
                  <TableRow key={execution.id}>
                    <TableCell className="font-medium">
                      {execution.telephony_data.to_number}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {format(
                          formatUTCToLocal(execution.created_at),
                          "MMM dd, yyyy"
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {format(
                          formatUTCToLocal(execution.created_at),
                          "HH:mm"
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(execution.status)}>
                        {execution.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {execution.status === "completed" &&
                      execution.telephony_data.recording_url ? (
                        <Button
                          variant={
                            currentlyPlaying === execution.id
                              ? "default"
                              : "outline"
                          }
                          size="sm"
                          onClick={() =>
                            handlePlayRecording(
                              execution.telephony_data.recording_url!,
                              execution.id
                            )
                          }
                          className={`flex items-center gap-2 ${
                            currentlyPlaying === execution.id
                              ? "bg-green-600 hover:bg-green-700 text-white border-green-600"
                              : ""
                          }`}
                        >
                          {currentlyPlaying === execution.id ? (
                            <Pause className="h-4 w-4" />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                          {currentlyPlaying === execution.id ? "Pause" : "Play"}
                        </Button>
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          {execution.status !== "completed"
                            ? "Not available"
                            : "No recording"}
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Load More Button */}
            {hasMore && (
              <div className="text-center pt-4 border-t mt-4">
                <Button
                  onClick={loadMore}
                  disabled={executionsLoading}
                  variant="outline"
                >
                  {executionsLoading ? "Loading..." : "Load More"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
