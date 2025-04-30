import React from 'react';
import { IncidentProcessingStatus } from "@/types";
import { Check, Clock } from 'lucide-react';

export const getStatusColor = (status: string) => {
  switch (status) {
    case IncidentProcessingStatus.QUEUED:
      return 'bg-blue-100 text-blue-800';
    case IncidentProcessingStatus.PROCESSING_OCR:
    case IncidentProcessingStatus.PROCESSING_CLASSIFICATION:
      return 'bg-orange-100 text-orange-800';
    case IncidentProcessingStatus.PENDING:
      return 'bg-purple-100 text-purple-800';
    case IncidentProcessingStatus.COMPLETED:
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const getStatusIcon = (status: string) => {
  switch (status) {
    case IncidentProcessingStatus.QUEUED:
    case IncidentProcessingStatus.PROCESSING_OCR:
    case IncidentProcessingStatus.PROCESSING_CLASSIFICATION:
      return <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full" />;
    case IncidentProcessingStatus.PENDING:
      return <Clock className="mr-2 h-4 w-4 text-purple-500" />;
    case IncidentProcessingStatus.COMPLETED:
      return <Check className="mr-2 h-4 w-4 text-green-500" />;
    default:
      return null;
  }
};

export const getAttributeIcon = (status: string) => {
  switch (status) {
    case IncidentProcessingStatus.QUEUED:
    case IncidentProcessingStatus.PROCESSING_OCR:
    case IncidentProcessingStatus.PROCESSING_CLASSIFICATION:
      return <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full" />;
    default:
      return null;
  }
};
