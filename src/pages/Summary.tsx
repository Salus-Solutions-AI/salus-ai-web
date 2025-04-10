
import { Navbar } from "@/components/Navbar";
import IncidentStats from "@/components/IncidentStats";

const Summary = () => {
  return (
    <div className="min-h-screen bg-secondary/20">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">Summary</h1>
            <p className="text-muted-foreground">
              Overview of incident data and statistics
            </p>
          </div>
        </div>
        <IncidentStats />
      </div>
    </div>
  );
};

export default Summary;
