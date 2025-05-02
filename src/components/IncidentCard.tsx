import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, MoreHorizontal, Download, Eye, Trash2, Tag, MapPin, Calendar, Flag, AlertTriangle, Shield } from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Incident } from '@/types';
import { cn } from '@/lib/utils';
import { getAttributeIcon, getStatusColor, getStatusIcon } from '@/utils/statusUtils';
import { formatDate, formatDatetime } from '@/utils/dateUtils';

interface IncidentCardProps {
  incident: Incident;
  onView: (url: string) => void;
  onDownload: (incident: Incident) => void;
  onDelete: (id: string) => void;
}

const IncidentCard = ({ incident, onView, onDownload, onDelete }: IncidentCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const navigate = useNavigate();
  
  const handleCardClick = () => {
    navigate(`/incidents/${incident.id}`);
  };
  
  return (
    <div 
      className={cn(
        "bg-white border rounded-lg overflow-hidden transition-all duration-300 card-hover cursor-pointer",
        isHovered ? "shadow-elevated" : "shadow-sm",
        incident.isClery && "border-2 border-[#8B5CF6] bg-[#FEF7CD]/20",
        incident.needsMoreInfo && "border-l-4 border-amber-500 bg-[#FFEBEB]/40",
        incident.requiresTimelyWarning && "border-l-4 border-red-500 bg-red-50/40"
      )}
      role="incident-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
    >
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center">
            <div className={`rounded-full w-10 h-10 flex items-center justify-center ${isHovered ? 'bg-primary/10' : 'bg-secondary'}`}>
              {incident.needsMoreInfo ? 
                <AlertTriangle className={`h-5 w-5 ${isHovered ? 'text-amber-500' : 'text-amber-400'}`} /> :
                <FileText className={`h-5 w-5 ${isHovered ? 'text-primary' : 'text-muted-foreground'}`} />
              }
            </div>
            <div className="pl-2">
              <h3 className="font-medium text-lg truncate">
                {getAttributeIcon(incident.status)}
                {incident.number}
                {incident.isClery && (
                  <Flag className="inline-block ml-2 h-4 w-4 text-[#8B5CF6]" />
                )}
              </h3>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                onView(incident.preSignedUrl);
              }} disabled={!incident.preSignedUrl}>
                <Eye className="mr-2 h-4 w-4" />
                <span>View Document</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                onDownload(incident);
              }} disabled={!incident.preSignedUrl || isDownloading}>
                {isDownloading ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    <span>Downloading...</span>
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    <span>Download PDF</span>
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                onDelete(incident.id);
              }} className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Delete Incident</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
         
        <div className="flex items-center gap-2 mb-3">
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
          {incident.requiresTimelyWarning && (
            <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
              <Shield className="mr-1 h-3 w-3" />
              Timely Warning
            </Badge>
          )}
        </div>

        <div className="space-y-3 text-sm">
          <div className="flex items-center text-muted-foreground">
            {incident.title}
          </div>
          <div className="flex items-center text-muted-foreground">
            <Tag className="h-4 w-4 mr-2" />
            {getAttributeIcon(incident.status)}
            {incident.category}
          </div>
          <div className="flex items-center text-muted-foreground">
            <MapPin className="h-4 w-4 mr-2" />
            {getAttributeIcon(incident.status)}
            {incident.location}
          </div>
          <div className="flex items-center text-muted-foreground">
            <Calendar className="h-4 w-4 mr-2" />
            {getAttributeIcon(incident.status)}
            {formatDate(incident.date)}
          </div>
        </div>
      </div>
      
      <div className={cn(
        "px-5 py-3 border-t flex justify-between items-center text-xs text-muted-foreground",
        isHovered ? "bg-secondary/50" : "bg-secondary/20"
      )}>
        <span>Uploaded by {incident.uploaderName}</span>
        <span>{formatDatetime(incident.uploadedAt)}</span>
      </div>
    </div>
  );
};

export default IncidentCard;
