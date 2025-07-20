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

type LocationType = 'Campus Residential' | 'Campus Total' | 'Non-Campus' | 'Public Property';

interface CategoryStats {
  [category: string]: {
    [year: string]: {
      [locationType in LocationType]: number;
    };
  };
}

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
  const [categoryStats, setCategoryStats] = useState<CategoryStats>({});
  const [categoryData, setCategoryData] = useState<{ name: string; count: number }[]>([]);
  const [categoryColors, setCategoryColors] = useState<string[]>([]);
  const [startTime, setStartTime] = useState<Date | undefined>();
  const [endTime, setEndTime] = useState<Date | undefined>();
  const { user, session } = useAuth();

  const years = ['2025', '2024', '2023'];


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
    const stats: CategoryStats = {};
    const categoryCount: Record<string, number> = {};

    incidents.forEach(incident => {
      if (incident.status !== IncidentProcessingStatus.COMPLETED) return;
      if (!incident.category) return;
      if (incident.category.toLowerCase().includes("none")) return;
      
      const category = incident.category;
      
      categoryCount[category] = (categoryCount[category] || 0) + 1;
      
      if (!stats[category]) {
        stats[category] = {};
        years.forEach(year => {
          stats[category][year] = {
            'Campus Residential': 0,
            'Campus Total': 0,
            'Non-Campus': 0,
            'Public Property': 0
          };
        });
      }

      const incidentYear = new Date(incident.date).getFullYear().toString();

      console.log(incidentYear);
      
      if (years.includes(incidentYear)) {
        const location = incident.location?.toLowerCase() || '';
        
        let locationType: LocationType = 'Campus Total';
        
        if (location.includes('residential') || location.includes('dorm') || location.includes('housing')) {
          locationType = 'Campus Residential';
        } else if (location.includes('non-campus') || location.includes('off-campus')) {
          locationType = 'Non-Campus';
        } else if (location.includes('public') || location.includes('street') || location.includes('road')) {
          locationType = 'Public Property';
        }
        
        stats[category][incidentYear][locationType]++;
        
        if (locationType !== 'Non-Campus' && locationType !== 'Public Property') {
          stats[category][incidentYear]['Campus Total']++;
        }
      }
    });

    const categoryDataArray = Object.entries(categoryCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    setCategoryData(categoryDataArray);
    setCategoryColors(generateColorPalette(categoryDataArray.length));
    setCategoryStats(stats);
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

  const renderCategoryTable = (category: string) => {
    const tableData = categoryStats[category];
    if (!tableData) return null;

    const categoryIndex = categoryData.findIndex(item => item.name === category);
    const categoryColor = categoryIndex >= 0 ? categoryColors[categoryIndex % categoryColors.length] : '#8B5CF6';

    return (
      <Card key={category} className="bg-card shadow-sm animate-appear" style={{ borderColor: categoryColor, borderWidth: '2px' }}>
        <CardHeader>
          <CardTitle className="text-center">
            {category}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left font-medium text-muted-foreground p-3">Year</th>
                  <th className="text-center font-medium text-muted-foreground p-3">Campus Residential</th>
                  <th className="text-center font-medium text-muted-foreground p-3">Campus Total</th>
                  <th className="text-center font-medium text-muted-foreground p-3">Non-Campus</th>
                  <th className="text-center font-medium text-muted-foreground p-3">Public Property</th>
                </tr>
              </thead>
              <tbody>
                {years.map(year => (
                  <tr key={year} className="border-b border-border last:border-b-0 hover:bg-muted/50 transition-colors">
                    <td className="font-medium p-3">{year}</td>
                    <td className="text-center p-3">
                      {tableData[year]?.['Campus Residential'] || 0}
                    </td>
                    <td className="text-center p-3">
                      {tableData[year]?.['Campus Total'] || 0}
                    </td>
                    <td className="text-center p-3">
                      {tableData[year]?.['Non-Campus'] || 0}
                    </td>
                    <td className="text-center p-3">
                      {tableData[year]?.['Public Property'] || 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    );
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

      <div className="space-y-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" role="loader"></div>
          </div>
        ) : Object.keys(categoryStats).length > 0 ? (
          Object.keys(categoryStats).map(category => renderCategoryTable(category))
        ) : (
          <Card className="bg-card shadow-sm animate-appear">
            <CardContent className="flex items-center justify-center py-12 text-muted-foreground">
              No incident data available
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default IncidentStats;
