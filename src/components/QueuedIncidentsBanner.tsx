import { RefreshCw, X } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Incident, IncidentProcessingStatus } from '@/types';
import { cn } from '@/lib/utils';
import { useEffect, useRef } from 'react';
import { incidentsApi } from '@/api/resources/incidents';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';

interface QueuedIncidentsBannerProps {
  queuedIncidents: Incident[];
  onRefresh: () => void;
  isLoading: boolean;
}

const QueuedIncidentsBanner = ({ queuedIncidents, onRefresh, isLoading }: QueuedIncidentsBannerProps) => {
  const { session } = useAuth();

  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastRefreshTimeRef = useRef<number>(Date.now());
  
  const calculateProgress = (status: string): number => {
    switch (status) {
      case IncidentProcessingStatus.QUEUED:
        return 25;
      case IncidentProcessingStatus.PROCESSING_OCR:
        return 50;
      case IncidentProcessingStatus.PROCESSING_CLASSIFICATION:
        return 75;
      default:
        return 10;
    }
  };
  
  useEffect(() => {
    if (queuedIncidents.length === 0) return;
    
    const refreshWithThrottle = () => {
      const now = Date.now();
      if (now - lastRefreshTimeRef.current >= 2000) {
        onRefresh();
        lastRefreshTimeRef.current = now;
      }
    };
    
    refreshTimerRef.current = setInterval(refreshWithThrottle, 2000);
    
    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
    };
  }, [queuedIncidents.length, onRefresh]);
  
  if (queuedIncidents.length === 0) {
    return null;
  }

  const handleDelete = async (incident: Incident, e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      await incidentsApi.delete(session, incident.id);
      toast({
        title: "Incident deleted",
        description: "The incident has been deleted.",
        variant: "success",
      });
    } catch (error) {
      console.error('Error deleting incident:', error);
      toast({
        title: "Error deleting incident",
        description: "Could not delete the incident. Please try again.",
        variant: "destructive",
      });
    } finally {
      onRefresh();
    }
  };

  return (
    <Alert variant="default" className="mb-6 shadow-md border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/20">
      <div className="flex items-center justify-between">
        <div>
          <AlertTitle className="text-blue-800 dark:text-blue-300 flex items-center">
            <div className="h-4 w-4 mr-2 rounded-full bg-blue-500 animate-pulse" />
            Processing {queuedIncidents.length} incident{queuedIncidents.length > 1 ? 's' : ''}
          </AlertTitle>
          <AlertDescription className="text-sm text-blue-700/70 dark:text-blue-400/70 mt-1">
            Your incidents are being analyzed by AI. This may take a few minutes.
          </AlertDescription>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          className="border-blue-300 text-blue-700 hover:bg-blue-100 dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-900/30"
          onClick={() => {
            // Prevent multiple rapid clicks
            if (Date.now() - lastRefreshTimeRef.current >= 1000) {
              onRefresh();
              lastRefreshTimeRef.current = Date.now();
            }
          }}
          disabled={isLoading}
        >
          <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
          Refresh
        </Button>
      </div>
      
      {queuedIncidents.length > 0 && (
        <div className="mt-4 space-y-2 max-h-96 overflow-y-auto pr-1">
          {queuedIncidents.map(incident => (
            <Card key={incident.id} className="bg-white dark:bg-slate-900 border-blue-200 dark:border-blue-900">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse mr-2" />
                    <span className="font-medium text-sm">{incident.title}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Uploaded {new Date(incident.uploadedAt).toLocaleTimeString()}
                  </div>
                </div>
                <div className="flex items-center mt-2">
                  <div className="w-full">
                    <Progress 
                      value={calculateProgress(incident.status)} 
                      className="h-1.5 w-full bg-blue-100 dark:bg-blue-800/30"
                    />
                  </div>
                  <div className="mt-2 ml-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 rounded-full hover:bg-primary-foreground/30"
                      onClick={(e) => handleDelete(incident, e)}
                      disabled={false}
                      title="Remove from queue"
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Remove</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </Alert>
  );
};

export default QueuedIncidentsBanner;
