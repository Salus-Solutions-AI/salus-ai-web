import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Incident, IncidentProcessingStatus } from '@/types';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { toast } from '@/components/ui/use-toast';
import { incidentsApi } from '@/api/resources/incidents';
import { Calendar, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from '@/lib/utils';

const generateColorPalette = (count: number) => {
  const baseColors = [
    '#8B5CF6', // Primary purple (from Clery color)
    '#6366F1', // Indigo
    '#0EA5E9', // Sky blue
    '#10B981', // Emerald
    '#F97316', // Orange
    '#EC4899', // Pink
    '#D946EF', // Fuchsia
    '#F43F5E', // Rose
    '#14B8A6', // Teal
  ];
  
  // For more than 9 categories, create lighter and darker variations
  if (count <= baseColors.length) {
    return baseColors.slice(0, count);
  }
  
  const palette = [...baseColors];
  
  // Generate lighter and darker variations of base colors
  for (let i = 0; i < baseColors.length && palette.length < count; i++) {
    palette.push(baseColors[i] + '99'); // 60% opacity version
    
    if (palette.length < count) {
      palette.push(baseColors[i] + 'cc'); // 80% opacity version
    }
  }
  
  return palette.slice(0, count);
};

const IncidentStats = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categoryData, setCategoryData] = useState<{ name: string; count: number }[]>([]);
  const [statusData, setStatusData] = useState<{ name: string; count: number }[]>([]);
  const [categoryColors, setCategoryColors] = useState<string[]>([]);
  const [statusColors, setStatusColors] = useState<string[]>([]);
  const [startTime, setStartTime] = useState<Date | undefined>();
  const [endTime, setEndTime] = useState<Date | undefined>();
  const { user, session } = useAuth();

  useEffect(() => {
    const fetchIncidents = async () => {
      setIsLoading(true);
      
      try {
        if (user) {
          const startDateStr = startTime ? startTime.toISOString() : undefined;
          const endDateStr = endTime ? endTime.toISOString() : undefined;
          const incidents = await incidentsApi.getAll(session, startDateStr, endDateStr);
          
          setIncidents(incidents);
          processData(incidents);
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

    fetchIncidents();
  }, [user?.id, startTime, endTime]);

  const processData = (incidents: Incident[]) => {
    const categoryCount: Record<string, number> = {};
    incidents.forEach(incident => {
      if (incident.status !== IncidentProcessingStatus.COMPLETED) return;
      if (!incident.category) return;
      if (incident.category.toLowerCase().includes("none")) return;
      
      categoryCount[incident.category] = (categoryCount[incident.category] || 0) + 1;
    });

    const categoryDataArray = Object.entries(categoryCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    setCategoryData(categoryDataArray);
    setCategoryColors(generateColorPalette(categoryDataArray.length));

    const statusCount: Record<string, number> = {};
    incidents.forEach(incident => {
      if (!incident.status) return;
      statusCount[incident.status] = (statusCount[incident.status] || 0) + 1;
    });

    const statusDataArray = Object.entries(statusCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    setStatusData(statusDataArray);
    setStatusColors(generateColorPalette(statusDataArray.length));
  };

  const renderCustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border p-2 rounded shadow-sm">
          <p className="font-medium">{payload[0].payload.name}</p>
          <p className="text-sm text-muted-foreground">
            Count: {payload[0].value}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 gap-6 -mt-6">
      <div className="flex justify-end">
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
              <PopoverContent className="w-auto p-0" align="end">
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
              <PopoverContent className="w-auto p-0" align="end">
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
      </div>

      <Card className="bg-card shadow-sm animate-appear">
        <CardHeader>
          <CardTitle>Incident Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="bg-secondary/30 rounded-lg p-6 text-center">
              <h3 className="text-lg font-medium mb-2">Total</h3>
              <p className="text-4xl font-bold">{incidents.length}</p>
            </div>
            <div className="bg-secondary/30 rounded-lg p-6 text-center">
              <h3 className="text-lg font-medium mb-2">Pending</h3>
              <p className="text-4xl font-bold">
                {incidents.filter(incident => incident.status !== IncidentProcessingStatus.COMPLETED).length}
              </p>
            </div>
            <div className="bg-secondary/30 rounded-lg p-6 text-center">
              <h3 className="text-lg font-medium mb-2">Clery</h3>
              <p className="text-4xl font-bold">
                {incidents.filter(incident => incident.status === IncidentProcessingStatus.COMPLETED && incident.isClery).length}
              </p>
            </div>
            <div className="bg-secondary/30 rounded-lg p-6 text-center">
              <h3 className="text-lg font-medium mb-2">Non-Clery</h3>
              <p className="text-4xl font-bold text-foreground">
                {incidents.filter(incident => incident.status === IncidentProcessingStatus.COMPLETED && !incident.isClery).length}
              </p>
            </div>
            <div className="bg-secondary/30 rounded-lg p-6 text-center">
              <h3 className="text-lg font-medium mb-2">Timely-Warning</h3>
              <p className="text-4xl font-bold text-foreground">
                {incidents.filter(incident => incident.status === IncidentProcessingStatus.COMPLETED && incident.requiresTimelyWarning).length}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-card shadow-sm animate-appear">
          <CardHeader>
            <CardTitle>Clery Incidents by Category</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-80 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" role="loader"></div>
              </div>
            ) : incidents.length > 0 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={categoryData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis 
                      dataKey="name" 
                      angle={-45} 
                      textAnchor="end" 
                      height={70} 
                      interval={0}
                      tick={{ fontSize: 12, fill: 'var(--foreground)' }}
                    />
                    <YAxis tick={{ fill: 'var(--foreground)' }} />
                    <Tooltip content={renderCustomTooltip} />
                    <Bar 
                      dataKey="count" 
                      radius={[4, 4, 0, 0]}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={categoryColors[index % categoryColors.length]} 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-80 flex items-center justify-center text-muted-foreground">
                No incident data available
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card shadow-sm animate-appear">
          <CardHeader>
            <CardTitle>Incidents by Status</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-80 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" role="loader"></div>
              </div>
            ) : incidents.length > 0 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={statusData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis 
                      dataKey="name" 
                      angle={-45} 
                      textAnchor="end" 
                      height={70} 
                      interval={0}
                      tick={{ fontSize: 12, fill: 'var(--foreground)' }}
                    />
                    <YAxis tick={{ fill: 'var(--foreground)' }} />
                    <Tooltip content={renderCustomTooltip} />
                    <Bar 
                      dataKey="count" 
                      radius={[4, 4, 0, 0]}
                    >
                      {statusData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={statusColors[index % statusColors.length]} 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-80 flex items-center justify-center text-muted-foreground">
                No incident data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default IncidentStats;
