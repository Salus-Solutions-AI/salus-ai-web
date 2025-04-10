
import { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import IncidentGrid from '@/components/IncidentGrid';
import IncidentUploader from '@/components/IncidentUploader';
import QueuedIncidentsBanner from '@/components/QueuedIncidentsBanner';
import { Incident } from '@/types';

const Incidents = () => {
  const [refreshGrid, setRefreshGrid] = useState(false);
  const [refreshQueuedOnly, setRefreshQueuedOnly] = useState(false);
  const [queuedIncidents, setQueuedIncidents] = useState<Incident[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleUploadSuccess = () => {
    setRefreshGrid(!refreshGrid);
  };

  const handleRefreshQueuedOnly = () => {
    setIsRefreshing(true);
    setRefreshQueuedOnly(!refreshQueuedOnly);
    setTimeout(() => setIsRefreshing(false), 800);
  };

  return (
    <div className="min-h-screen bg-secondary/20">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">Incidents</h1>
            <p className="text-muted-foreground">
              Upload and manage incidents for your institution
            </p>
          </div>
        </div>
        <div className="py-4"></div>
        <IncidentUploader onUploadSuccess={handleUploadSuccess} />
        <div className="py-4"></div>
        
        <QueuedIncidentsBanner 
          queuedIncidents={queuedIncidents} 
          onRefresh={handleRefreshQueuedOnly} 
          isLoading={isRefreshing} 
        />
        
        <IncidentGrid 
          refresh={refreshGrid} 
          refreshQueuedOnly={refreshQueuedOnly}
          queuedIncidents={queuedIncidents}
          setQueuedIncidents={setQueuedIncidents}
        />
      </div>
    </div>
  );
};

export default Incidents;
