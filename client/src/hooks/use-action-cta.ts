import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

export function useActionCTA() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const currentPath = typeof window !== "undefined" ? window.location.pathname : "/";

  const requireAuth = (callback: () => void, message = "Please log in to continue.") => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: message,
      });
      navigate(`/auth?next=${encodeURIComponent(currentPath)}`);
      return;
    }
    callback();
  };

  const joinSession = (sessionTitle: string) => {
    requireAuth(() => {
      toast({
        title: "Joining Session!",
        description: `You've successfully joined "${sessionTitle}". Welcome!`,
      });
      navigate("/dashboard");
    }, "Please log in to join a live session.");
  };

  const registerTournament = (tournamentTitle: string) => {
    requireAuth(() => {
      toast({
        title: "Registered!",
        description: `You're registered for "${tournamentTitle}". Good luck!`,
      });
      navigate("/dashboard");
    }, "Please log in to register for tournaments.");
  };

  const startActivity = (activityTitle: string) => {
    requireAuth(() => {
      toast({
        title: "Activity Started!",
        description: `"${activityTitle}" has begun. Enjoy your session!`,
      });
      navigate("/dashboard");
    }, "Please log in to start activities.");
  };

  const explore = (label: string) => {
    toast({
      title: "Exploring " + label,
      description: `Browsing available ${label.toLowerCase()} sessions and resources.`,
    });
  };

  const goTo = (path: string) => {
    navigate(path);
  };

  const joinCommunity = () => {
    if (!isAuthenticated) {
      navigate(`/auth?next=${encodeURIComponent("/dashboard")}`);
    } else {
      navigate("/dashboard");
    }
  };

  return { joinSession, registerTournament, startActivity, explore, goTo, requireAuth, joinCommunity };
}
