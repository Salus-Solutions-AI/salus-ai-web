import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Eye, Trash, Download, Search, RefreshCw, LayoutGrid, List, Flag, AlertTriangle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import IncidentCard from './IncidentCard';
import { Incident, IncidentProcessingStatus } from '@/types';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { getAttributeIcon, getStatusColor, getStatusIcon } from '@/utils/statusUtils';
import { formatDate } from '@/utils/dateUtils';
import { incidentsApi } from '@/api/resources/incidents';

interface IncidentGridProps {
  refresh?: boolean;
  refreshQueuedOnly?: boolean;
  queuedIncidents: Incident[];
  setQueuedIncidents: (incidents: Incident[]) => void;
}

const IncidentGrid = ({ refresh, refreshQueuedOnly, queuedIncidents, setQueuedIncidents }: IncidentGridProps) => {
  const navigate = useNavigate();

  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');
  const [showCleryOnly, setShowCleryOnly] = useState(false);
  const { session, user } = useAuth();

  const fetchAllIncidents = async () => {
    setIsLoading(true);
    
    try {
      if (user) {
        const fetchedIncidents = await incidentsApi.getAll(session);
        const queued = fetchedIncidents.filter(
          incident => incident.status !== IncidentProcessingStatus.PENDING && incident.status !== IncidentProcessingStatus.COMPLETED
        );
        const nonQueued = fetchedIncidents.filter(
          incident => incident.status === IncidentProcessingStatus.PENDING || incident.status === IncidentProcessingStatus.COMPLETED
        );
        
        setQueuedIncidents(queued);
        setIncidents(nonQueued);
      }
    } catch (error) {
      console.error('Error fetching incidents:', error);
      toast({
        title: "Error fetching incidents",
        description: "Failed to load incidents. Please try again later.",
        variant: "destructive",
      });
      setIncidents([]);
      setQueuedIncidents([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchQueuedIncidentsOnly = async () => {
    try {
      if (user) {
        const fetchedIncidents = await incidentsApi.getAll(session);
        const queued = fetchedIncidents.filter(
          incident => incident.status !== IncidentProcessingStatus.PENDING && incident.status !== IncidentProcessingStatus.COMPLETED
        );
        
        setQueuedIncidents(queued);
        
        const hasNewlyCompleted = queuedIncidents.some(oldQueuedIncident => 
          !queued.some(newQueuedIncident => 
            newQueuedIncident.id === oldQueuedIncident.id
          )
        );
        
        if (hasNewlyCompleted) {
          fetchAllIncidents();
        }
      }
    } catch (error) {
      console.error('Error refreshing queued incidents:', error);
      toast({
        title: "Error refreshing queued incidents",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchAllIncidents();
  }, [user?.id, refresh]);

  useEffect(() => {
    if (refreshQueuedOnly !== undefined) {
      fetchQueuedIncidentsOnly();
    }
  }, [refreshQueuedOnly]);

  const handleViewIncident = (url: string) => {
    if (url) {
      window.open(url, '_blank');
    } else {
      toast({
        title: "No PDF available",
        description: "This incident doesn't have a viewable PDF.",
        variant: "destructive",
      });
    }
  };

  const handleDownloadIncident = async (incident: Incident) => {
    try {
      if (!incident.preSignedUrl) {
        throw new Error("No pre-signed URL available for this incident");
      }
      
      const response = await fetch(incident.preSignedUrl);
      
      if (!response.ok) {
        throw new Error(`Failed to download: ${response.status} ${response.statusText}`);
      }
      
      const fileBlob = await response.blob();
      
      const url = URL.createObjectURL(fileBlob);
      const a = document.createElement('a');
      a.href = url;
      
      a.download = `${incident.title}.pdf`
      document.body.appendChild(a);
      a.click();
      
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Download Successful",
        description: `${incident.title} has been downloaded.`,
        variant: "success",
      });
    } catch (error) {
      console.error("Download error:", error);
      toast({
        title: "Download Failed",
        description: error instanceof Error ? error.message : "There was an error downloading the file. Please try again later.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteIncident = async (id: string) => {
    try {
      await incidentsApi.delete(session, id);

      setIncidents(incidents.filter(incident => incident.id !== id));
      toast({
        title: "Incident deleted",
        description: "The incident has been successfully deleted.",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete incident. Please try again later.",
        variant: "destructive",
      });
    }
  };

  const handleRowClick = (incident: Incident) => {
    navigate(`/incidents/${incident.id}`);
  };

  const filteredIncidents = incidents
    .filter(incident => 
      (searchQuery === '' || 
        incident.title.toLowerCase().includes(searchQuery.toLowerCase())
      ) && 
      (!showCleryOnly || incident.isClery)
    );

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search incidents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <Button
            onClick={() => navigate('/logs')} 
          >
            Generate Log
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          
          <Button
            variant={showCleryOnly ? "default" : "outline"}
            onClick={() => setShowCleryOnly(!showCleryOnly)}
            className={showCleryOnly ? "bg-[#9b87f5] hover:bg-[#8B5CF6]" : ""}
          >
            <Flag className="h-4 w-4 mr-2" />
            Clery Only
          </Button>
          
          <Button variant="outline" size="sm" className="h-10" onClick={fetchAllIncidents}>
            <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
            Refresh
          </Button>

          <div className="flex items-center border rounded-md overflow-hidden">
            <Button
              variant={viewMode === 'card' ? 'secondary' : 'ghost'}
              size="sm"
              className="rounded-none border-r h-10 px-3"
              onClick={() => setViewMode('card')}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="sm"
              className="rounded-none h-10 px-3"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      
      {isLoading ? (
        <div className="w-full h-96 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" role="status" aria-label="Loading incidents"></div>
        </div>
      ) : viewMode === 'card' ? (
        filteredIncidents.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredIncidents.map((incident, index) => (
              <div 
                key={incident.id}
                style={{ animationDelay: `${index * 50}ms` }}
                className="animate-scale-in"
              >
                <IncidentCard 
                  incident={incident} 
                  onView={handleViewIncident}
                  onDownload={handleDownloadIncident}
                  onDelete={handleDeleteIncident}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-secondary/30 rounded-lg">
            <div className="w-16 h-16 rounded-full bg-secondary mx-auto flex items-center justify-center mb-4">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-1">No Incidents Found</h3>
            <p className="text-muted-foreground">
              {incidents.length === 0 
                ? "You haven't uploaded any incidents yet. Try uploading one above."
                : showCleryOnly 
                  ? "No Clery incidents found. Try disabling the Clery filter."
                  : "Try adjusting your search or filter criteria"}
            </p>
            {incidents.length > 0 && (
              <Button
                variant="link"
                onClick={() => {
                  setSearchQuery('');
                  setShowCleryOnly(false);
                }}
              >
                Clear all filters
              </Button>
            )}
          </div>
        )
      ) : (
        filteredIncidents.length > 0 ? (
          <div className="animate-fade-in">
            <Table>
              <TableHeader className="bg-[#F1F0FB] dark:bg-slate-800">
                <TableRow className="hover:bg-[#F1F0FB]/80 dark:hover:bg-slate-800/90 border-b border-[#E5DEFF]">
                  <TableHead className="font-semibold text-[#6E59A5] dark:text-[#D6BCFA] text-sm py-4">Number</TableHead>
                  <TableHead className="font-semibold text-[#6E59A5] dark:text-[#D6BCFA] text-sm py-4">Category</TableHead>
                  <TableHead className="font-semibold text-[#6E59A5] dark:text-[#D6BCFA] text-sm py-4">Date</TableHead>
                  <TableHead className="font-semibold text-[#6E59A5] dark:text-[#D6BCFA] text-sm py-4">Source</TableHead>
                  <TableHead className="font-semibold text-[#6E59A5] dark:text-[#D6BCFA] text-sm py-4">Status</TableHead>
                  <TableHead className="font-semibold text-[#6E59A5] dark:text-[#D6BCFA] text-sm py-4 text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredIncidents.map((incident, index) => (
                  <TableRow 
                    key={incident.id}
                    className={cn(
                      "cursor-pointer",
                      incident.isClery && "bg-[#FEF7CD]/20 hover:bg-[#FEF7CD]/30",
                      incident.needsMoreInfo && "bg-[#FFEBEB]/40 hover:bg-[#FFEBEB]/60 border-l-4 border-amber-500"
                    )}
                    onClick={() => handleRowClick(incident)}
                  >
                    <TableCell className="font-medium">
                      {incident.needsMoreInfo && <AlertTriangle className="inline-block mr-2 h-4 w-4 text-amber-500" />}
                      {getAttributeIcon(incident.status)}
                      {incident.number}
                      {incident.isClery && <Flag className="inline-block ml-2 h-4 w-4 text-[#8B5CF6]" />}
                    </TableCell>
                    <TableCell>
                      {getAttributeIcon(incident.status)}
                      {incident.category}
                    </TableCell>
                    <TableCell>
                      {getAttributeIcon(incident.status)}
                      {formatDate(incident.date)}
                    </TableCell>
                    <TableCell>{incident.title}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(incident.status)}
                        <Badge variant="outline" className={getStatusColor(incident.status)}>
                          {incident.status}
                        </Badge>
                        {incident.isClery ? (
                          <Badge variant="outline" className="bg-[#8B5CF6]/10 text-[#8B5CF6] border-[#8B5CF6]/20">
                            Clery
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-gray-100 text-gray-600 border-gray-200">
                            Non-Clery
                          </Badge>
                        )}
                        {incident.needsMoreInfo && (
                          <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">
                            <AlertTriangle className="mr-1 h-3 w-3" />
                            Needs Info
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center"> 
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewIncident(incident.preSignedUrl);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <span className="px-1"></span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownloadIncident(incident);
                        }}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <span className="px-1"></span>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteIncident(incident.id);
                        }}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-16 bg-secondary/30 rounded-lg">
            <div className="w-16 h-16 rounded-full bg-secondary mx-auto flex items-center justify-center mb-4">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-1">No Incidents Found</h3>
            <p className="text-muted-foreground">
              {incidents.length === 0 
                ? "You haven't uploaded any incidents yet. Try uploading one above."
                : showCleryOnly 
                  ? "No Clery incidents found. Try disabling the Clery filter."
                  : "Try adjusting your search or filter criteria"}
            </p>
            {incidents.length > 0 && (
              <Button
                variant="link"
                onClick={() => {
                  setSearchQuery('');
                  setShowCleryOnly(false);
                }}
              >
                Clear all filters
              </Button>
            )}
          </div>
        )
      )}
    </div>
  );
};

export default IncidentGrid;
