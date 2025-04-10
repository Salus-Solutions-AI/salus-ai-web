
import { Navbar } from '@/components/Navbar';
import LogTable from '@/components/LogTable';

const Logs = () => {
  return (
    <div className="min-h-screen bg-secondary/20">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">Clery Logs</h1>
            <p className="text-muted-foreground">
              Generate and manage Clery logs for your institution
            </p>
          </div>
        </div>
        <div className="py-4"></div>
        <LogTable />
      </div>
    </div>
  );
};

export default Logs;
