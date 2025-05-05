export interface Profile {
  id: string;
  fullName: string;
  organization: string;
  createdCategories: boolean;
}

export interface Incident {
  id: string;
  title: string;
  date: string;
  timeStr: string;
  category: string;
  location: string;
  explanation: string;
  summary: string;
  status: IncidentProcessingStatus;
  number: string;
  pdfUrl: string;
  preSignedUrl: string;
  filePath: string;
  uploadedAt: string;
  uploadedBy: string;
  uploaderName: string;
  isClery: boolean;
  needsMoreInfo?: boolean;
  requiresTimelyWarning?: boolean;
}

export enum IncidentProcessingStatus {
  QUEUED = "Queued",
  PROCESSING_OCR = "Processing (OCR)",
  PROCESSING_CLASSIFICATION = "Processing (Classification)",
  PENDING = "Pending Review",
  COMPLETED = "Completed",
}

export interface IncidentFilterState {
  categories: string[];
  dateRange: {
    from: Date | null;
    to: Date | null;
  };
  status: IncidentProcessingStatus[];
  searchQuery: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  createdAt: string;
  createdBy: string;
}

export interface DefaultCategory {
  id: string;
  name: string;
  description: string;
  longDescription: string;
}

export interface Log {
  id: string;
  title: string;
  date?: string;
  url?: string;
  filePath?: string;
  numIncidents?: number;
  createdAt: string;
  createdBy: string;
}

export interface LogEntry {
  [key: string]: string | boolean;
  isClery?: boolean;
  'Time Reported'?: string;
  'Nature of Crime'?: string;
  'Case Number'?: string;
  'Date Occured'?: string;
  'Time Occured'?: string;
  'Location'?: string;
}
