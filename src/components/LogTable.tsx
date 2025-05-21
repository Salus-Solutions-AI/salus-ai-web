import { useState, useEffect } from 'react';
import { Search, Flag, FileSpreadsheet, Calendar, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Incident, IncidentProcessingStatus } from '@/types';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { createLogExcel, downloadFile } from '@/utils/exportUtils';
import { cn } from '@/lib/utils';
import { incidentsApi } from '@/api/resources/incidents';
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";

const LogTable = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCleryOnly, setShowCleryOnly] = useState(false);
  const [startTime, setStartTime] = useState<Date | undefined>();
  const [endTime, setEndTime] = useState<Date | undefined>();
  const { session, user } = useAuth();

  const fetchIncidents = async () => {
    setIsLoading(true);
    
    try {
      if (user) {
        const startDateStr = startTime ? startTime.toISOString() : undefined;
        const endDateStr = endTime ? endTime.toISOString() : undefined;
        const incidents = await incidentsApi.getAll(session, startDateStr, endDateStr);

        const filteredIncidents = incidents.filter(incident => 
          incident.status === IncidentProcessingStatus.COMPLETED
        );

        setIncidents(filteredIncidents);
      }
    } catch (error) {
      console.error('Error fetching incidents:', error);
      toast({
        title: "Error fetching incidents",
        description: "Failed to load incidents. Please try again later.",
        variant: "destructive",
      });
      setIncidents([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, [user?.id, startTime, endTime]);

  const handleDownloadExcel = async () => {
    if (incidents.length === 0) {
      toast({
        title: "No incidents to export",
        description: "There are no incidents available to export.",
        variant: "destructive",
      });
      return;
    }
    
    setIsDownloading(true);
    
    try {
      const filteredIncidents = incidents.filter(incident => {
        const matchesSearch = searchQuery === '' || 
          Object.values(incident).some(value => 
            typeof value === 'string' && value.toLowerCase().includes(searchQuery.toLowerCase())
          );
        
        const matchesClery = !showCleryOnly || incident.isClery;
        
        return matchesSearch && matchesClery;
      });
      
      const excelBuffer = await createLogExcel(filteredIncidents);
      
      downloadFile(
        excelBuffer, 
        `Clery_Logs_${new Date().toLocaleDateString().replace(/\//g, '-')}.xlsx`, 
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      
      toast({
        title: "Download Successful",
        description: "The log has been downloaded as an Excel file.",
        variant: "success",
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Download Failed",
        description: "There was an error downloading the file. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const filteredIncidents = incidents.filter(incident => {
    const matchesSearch = searchQuery === '' || 
      Object.values(incident).some(value => 
        typeof value === 'string' && value.toLowerCase().includes(searchQuery.toLowerCase())
      );
    
    const matchesClery = !showCleryOnly || incident.isClery;
    
    return matchesSearch && matchesClery;
  });

  const columns = [
    { key: 'timeReported', label: 'Time Reported' },
    { key: 'category', label: 'Nature of Crime' },
    { key: 'number', label: 'Case Number' },
    { key: 'date', label: 'Date Occurred' },
    { key: 'time', label: 'Time Occurred' },
    { key: 'location', label: 'Location' },
  ];

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search logs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      "w-[180px] justify-start text-left font-normal",
                      !startTime && "text-muted-foreground"
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {startTime ? format(startTime, "MMM d, yyyy") : "Start date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={startTime}
                    onSelect={setStartTime}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              {startTime && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => setStartTime(undefined)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      "w-[180px] justify-start text-left font-normal",
                      !endTime && "text-muted-foreground"
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {endTime ? format(endTime, "MMM d, yyyy") : "End date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={endTime}
                    onSelect={setEndTime}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              {endTime && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => setEndTime(undefined)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          <Button 
            variant={showCleryOnly ? "default" : "outline"} 
            onClick={() => setShowCleryOnly(!showCleryOnly)}
            className={showCleryOnly ? "bg-[#9b87f5] hover:bg-[#8B5CF6]" : ""}
          >
            <Flag className="h-4 w-4 mr-2" />
            Clery Only
          </Button>

          <Button
            type="button"
            disabled={isDownloading || incidents.length === 0}
            onClick={handleDownloadExcel} 
            className="bg-[#22c55e] hover:bg-[#16a34a]"
          >
            {isDownloading ? (
                <div className="flex items-center">
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                    Downloading...
                </div>
            ) : (
                <div className="flex items-center gap-2">
                    <FileSpreadsheet className="h-4 w-4" />
                    Download Logs
                </div>
            )}
          </Button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="w-full h-96 bg-secondary/30 animate-pulse rounded-lg" role="status" aria-label="Loading incidents" />
      ) : (
        <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
          {filteredIncidents.length > 0 ? (
            <div className="overflow-auto">
              <Table>
                <TableHeader className="bg-[#F1F0FB] dark:bg-slate-800">
                  <TableRow className="hover:bg-[#F1F0FB]/80 dark:hover:bg-slate-800/90 border-b border-[#E5DEFF]">
                    {columns.map((column) => (
                      <TableHead 
                        key={column.key}
                        className="font-semibold text-[#6E59A5] dark:text-[#D6BCFA] text-sm py-4"
                      >
                        {column.label}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredIncidents.map((incident, index) => {
                    const incidentDate = new Date(incident.date);
                    const formattedDate = incidentDate.toLocaleDateString();
                    const formattedTime = incidentDate.toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true
                    });
                    
                    return (
                      <TableRow 
                        key={index}
                        className={cn(
                          incident.isClery && "bg-[#FEF7CD]/20 hover:bg-[#FEF7CD]/30"
                        )}
                      >
                        <TableCell>
                          {`${formattedDate} ${formattedTime}`}
                        </TableCell>
                        <TableCell>
                          {incident.isClery && <Flag className="inline-block mr-2 h-4 w-4 text-[#8B5CF6]" />}
                          {incident.category}
                        </TableCell>
                        <TableCell>{incident.number}</TableCell>
                        <TableCell>{formattedDate}</TableCell>
                        <TableCell>{formattedTime}</TableCell>
                        <TableCell>{incident.location}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-full bg-secondary mx-auto flex items-center justify-center mb-4">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-1">No Completed Incidents Found</h3>
              <p className="text-muted-foreground">
                {incidents.length === 0 
                  ? "No incidents reported in the selected date range. Try adjusting your date range or filters."
                  : "Try adjusting your search or filter criteria"}
              </p>
              {incidents.length > 0 && (
                <Button
                  variant="link"
                  onClick={() => {
                    setSearchQuery('');
                    setShowCleryOnly(false);
                    setStartTime(undefined);
                    setEndTime(undefined);
                  }}
                >
                  Clear all filters
                </Button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LogTable;
