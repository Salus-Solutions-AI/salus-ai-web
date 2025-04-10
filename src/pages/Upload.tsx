
import { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import IncidentGrid from '@/components/IncidentGrid';
import IncidentUploader from '@/components/IncidentUploader';
import { Incident } from '@/types';

const Incidents = () => {
  const [refreshGrid, setRefreshGrid] = useState(false);
  const [queuedIncidents, setQueuedIncidents] = useState<Incident[]>([]);

  const handleUploadSuccess = () => {
    setRefreshGrid(!refreshGrid);
  };

  return (
    <div className="min-h-screen bg-secondary/20">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16">
        <IncidentUploader onUploadSuccess={handleUploadSuccess} />
        <div className="py-4"></div>
        <IncidentGrid 
          refresh={refreshGrid} 
          queuedIncidents={queuedIncidents}
          setQueuedIncidents={setQueuedIncidents}
        />
      </div>
    </div>
  );
};

export default Incidents;
