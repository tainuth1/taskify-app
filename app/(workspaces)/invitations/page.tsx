"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Check, X, Loader2, Calendar, Clock } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { apiClient } from "@/services/apiClient";
import { useToast } from "@/contexts/toast-context";

interface Project {
  name: string;
  description: string;
  type: string;
  id: string;
  owner_id: string;
  created_at: string;
  updated_at: string | null;
}

interface InvitedBy {
  email: string;
  username: string;
  id: string;
  full_name: string;
  profile: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface Invitation {
  id: string;
  token: string;
  project: Project;
  invited_by: InvitedBy;
  status: string;
  expired_at: string;
  created_at: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: Invitation[];
}

const Invitations = () => {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingTokens, setProcessingTokens] = useState<Set<string>>(
    new Set()
  );
  const { success, error: showError } = useToast();

  useEffect(() => {
    const fetchInvitations = async () => {
      try {
        const response: ApiResponse = await apiClient(
          "/api/invitations/pending"
        );
        if (response.success) {
          setInvitations(response.data);
        } else {
          setError(response.message || "Failed to load invitations");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchInvitations();
  }, []);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleAccept = async (token: string, projectName: string) => {
    setProcessingTokens((prev) => new Set(prev).add(token));
    try {
      const response = await apiClient<{ success: boolean; message: string }>(
        `/api/invites/${token}/accept`,
        {
          method: "POST",
        }
      );

      if (response.success) {
        setInvitations((prev) => prev.filter((inv) => inv.token !== token));
        success(`Successfully accepted invitation to ${projectName}`);
      } else {
        showError(response.message || "Failed to accept invitation");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to accept invitation";
      showError(errorMessage);
    } finally {
      setProcessingTokens((prev) => {
        const next = new Set(prev);
        next.delete(token);
        return next;
      });
    }
  };

  const handleReject = async (token: string, projectName: string) => {
    setProcessingTokens((prev) => new Set(prev).add(token));
    try {
      const response = await apiClient<{ success: boolean; message: string }>(
        `/api/invites/${token}/reject`,
        {
          method: "POST",
        }
      );

      if (response.success) {
        setInvitations((prev) => prev.filter((inv) => inv.token !== token));
        success(`Successfully rejected invitation to ${projectName}`);
      } else {
        showError(response.message || "Failed to reject invitation");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to reject invitation";
      showError(errorMessage);
    } finally {
      setProcessingTokens((prev) => {
        const next = new Set(prev);
        next.delete(token);
        return next;
      });
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-gray-900">
            All your pending invitations
          </h1>
          <p className="text-sm text-gray-500">
            Here you can see all your pending invitations and accept or reject
            them.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="space-y-4 p-6 border rounded-md shadow-none"
            >
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <div className="flex gap-4 pt-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-destructive/15 text-destructive p-4 rounded-md">
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-gray-900">
            All your pending invitations
          </h1>
          <p className="text-sm text-gray-500">
            Here you can see all your pending invitations and accept or reject
            them.
          </p>
        </div>
        <span className="bg-secondary px-3 py-1 rounded-full text-sm font-medium">
          {invitations.length} Pending
        </span>
      </div>

      {invitations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center bg-muted/20 rounded-md border border-dashed border-gray-200">
          <div className="rounded-full bg-muted/30 p-3 mb-4">
            <Calendar className="h-6 w-6 text-muted-foreground/50" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            No pending invitations
          </h3>
          <p className="text-sm text-gray-500 max-w-sm mt-1">
            You don't have any pending invitations at the moment. When you're
            invited to a project, it will show up here.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {invitations.map((invitation) => (
            <Card
              key={invitation.id}
              className="flex flex-col rounded-md shadow-none border border-gray-200"
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <CardTitle>{invitation.project.name}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {invitation.project.description}
                    </CardDescription>
                  </div>
                  <div className="shrink-0">
                    <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 capitalize">
                      {invitation.project.type} Project
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 space-y-4">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={invitation.invited_by.profile} />
                      <AvatarFallback>
                        {getInitials(invitation.invited_by.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid gap-0.5">
                      <span className="font-medium text-foreground">
                        {invitation.invited_by.full_name}
                      </span>
                      <span className="text-xs">invited you</span>
                    </div>
                  </div>
                </div>

                <div className="grid gap-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>
                      Invited{" "}
                      {format(new Date(invitation.created_at), "MMM d, yyyy")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-orange-600/80">
                    <Clock className="h-3.5 w-3.5" />
                    <span>
                      Expires{" "}
                      {format(new Date(invitation.expired_at), "MMM d, yyyy")}
                    </span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="grid grid-cols-2 gap-3 ">
                <Button
                  variant="outline"
                  className="w-full gap-2 shadow-none cursor-pointer hover:bg-slate-100"
                  onClick={() =>
                    handleReject(invitation.token, invitation.project.name)
                  }
                  disabled={processingTokens.has(invitation.token)}
                >
                  {processingTokens.has(invitation.token) ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <X className="h-4 w-4" />
                  )}
                  Reject
                </Button>
                <Button
                  className="w-full gap-2 shadow-none cursor-pointer"
                  onClick={() =>
                    handleAccept(invitation.token, invitation.project.name)
                  }
                  disabled={processingTokens.has(invitation.token)}
                >
                  {processingTokens.has(invitation.token) ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4 cursor-pointer" />
                  )}
                  Accept
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Invitations;
