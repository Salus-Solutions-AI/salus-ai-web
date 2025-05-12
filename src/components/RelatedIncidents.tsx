import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { incidentsApi } from '@/api/resources/incidents';
import { Incident } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

interface RelatedIncidentsProps {
  incidentId: string;
}

const RelatedIncidents = ({ incidentId }: RelatedIncidentsProps) => {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [relatedIncidents, setRelatedIncidents] = useState<Incident[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRelatedIncidents = async () => {
      if (!incidentId) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const data = await incidentsApi.getDuplicates(session, incidentId);
        setRelatedIncidents(data);
      } catch (err) {
        console.error('Error fetching related incidents:', err);
        setError('Failed to load related incidents');
      } finally {
        setIsLoading(false);
      }
    };
    fetchRelatedIncidents();
  }, [incidentId, session]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center">
          <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      );
    }

    if (error) {
      return <div className="text-center py-4 text-muted-foreground">{error}</div>;
    }

    if (relatedIncidents.length === 0) {
      return <div className="text-center py-4 text-muted-foreground">No related incidents found</div>;
    }

    return (
      <div className="divide-y">
        {relatedIncidents.map((incident) => (
          <div 
            key={incident.id} 
            className="p-4 hover:bg-muted/50 transition-colors cursor-pointer"
            onClick={() => navigate(`/incidents/${incident.id}`)}
          >
            <div className="flex justify-between items-start mb-1">
              <div className="font-medium">{incident.number}</div>
              <div className="text-sm text-muted-foreground">{incident.category}</div>
            </div>
            
            <div className="flex items-center text-sm text-muted-foreground mb-2">
              <CalendarIcon className="h-3.5 w-3.5 mr-1" />
              {incident.date ? format(new Date(incident.date), 'MMM d, yyyy') : 'Unknown date'}
            </div>
            
            <div className="text-sm line-clamp-2">
              {incident.summary || 'No summary available'}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const contentClassName = !isLoading && !error && relatedIncidents.length > 0 ? "p-0" : "";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Related Incidents</CardTitle>
      </CardHeader>
      <CardContent className={contentClassName}>
        {renderContent()}
      </CardContent>
    </Card>
  );
};

export default RelatedIncidents;
