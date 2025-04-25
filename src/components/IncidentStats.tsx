
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Incident } from '@/types';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { toast } from '@/components/ui/use-toast';
import { incidentsApi } from '@/api/resources/incidents';

// Updated cohesive color scheme that matches the website's aesthetic
const CLERY_COLORS = ['#8B5CF6', '#222222']; // Purple for Clery, Dark grey for non-Clery

// Generate a color palette based on the primary colors with enough variations for up to 25 categories
const generateColorPalette = (count: number) => {
  // Base colors aligned with the site's theme
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
    // Add lighter variation (decrease saturation, increase lightness)
    palette.push(baseColors[i] + '99'); // 60% opacity version
    
    // Add darker variation (increase saturation, decrease lightness)
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
  const [cleryData, setCleryData] = useState<{ name: string; value: number }[]>([]);
  const [categoryColors, setCategoryColors] = useState<string[]>([]);
  const { user, session } = useAuth();

  useEffect(() => {
    const fetchIncidents = async () => {
      setIsLoading(true);
      
      try {
        if (user) {
          const incidents = await incidentsApi.getAll(session);
          
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
  }, [user?.id]);

  const processData = (incidents: Incident[]) => {
    // Process category data
    const categoryCount: Record<string, number> = {};
    incidents.forEach(incident => {
      const category = incident.category || 'Uncategorized';
      categoryCount[category] = (categoryCount[category] || 0) + 1;
    });

    const categoryDataArray = Object.entries(categoryCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    setCategoryData(categoryDataArray);
    
    // Generate colors for categories dynamically
    setCategoryColors(generateColorPalette(categoryDataArray.length));

    // Process Clery data
    const cleryCount = incidents.filter(incident => incident.isClery).length;
    const nonCleryCount = incidents.length - cleryCount;

    setCleryData([
      { name: 'Clery Incidents', value: cleryCount },
      { name: 'Non-Clery Incidents', value: nonCleryCount }
    ]);
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
    <div className="grid grid-cols-1 gap-6 mt-6">
      {/* Moved the statistics card to the top */}
      <Card className="bg-card shadow-sm animate-appear">
        <CardHeader>
          <CardTitle>Incident Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-secondary/30 rounded-lg p-6 text-center">
              <h3 className="text-lg font-medium mb-2">Total Incidents</h3>
              <p className="text-4xl font-bold text-primary">{incidents.length}</p>
            </div>
            <div className="bg-secondary/30 rounded-lg p-6 text-center">
              <h3 className="text-lg font-medium mb-2">Clery Incidents</h3>
              <p className="text-4xl font-bold text-[#8B5CF6]">
                {incidents.filter(incident => incident.isClery).length}
              </p>
            </div>
            <div className="bg-secondary/30 rounded-lg p-6 text-center">
              <h3 className="text-lg font-medium mb-2">Non-Clery Incidents</h3>
              <p className="text-4xl font-bold text-foreground">
                {incidents.filter(incident => !incident.isClery).length}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-card shadow-sm animate-appear">
          <CardHeader>
            <CardTitle>Incidents by Category</CardTitle>
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
            <CardTitle>Clery vs. Non-Clery Incidents</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-80 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" role="loader"></div>
              </div>
            ) : incidents.length > 0 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={cleryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      fill="#8B5CF6"
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      labelLine={false}
                    >
                      {cleryData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={CLERY_COLORS[index % CLERY_COLORS.length]} 
                          className="stroke-background" 
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={renderCustomTooltip} />
                    <Legend 
                      formatter={(value, entry, index) => (
                        <span className="text-foreground">{value}</span>
                      )}
                    />
                  </PieChart>
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
