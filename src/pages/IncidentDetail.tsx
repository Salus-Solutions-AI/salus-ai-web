import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  Save, 
  FileText, 
  CheckCircle2, 
  Download,
  Flag,
  AlertTriangle,
  Mail,
  Clipboard,
  ClipboardCheck,
  Shield
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Incident, IncidentProcessingStatus } from '@/types';
import { formatDate } from '@/utils/dateUtils';
import { getStatusColor, getStatusIcon } from '@/utils/statusUtils';
import { downloadIncident } from '@/integrations/supabase/storageUtils';
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { incidentsApi } from '@/api/resources/incidents';
import { useAuth } from '@/contexts/AuthContext';

const IncidentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { session } = useAuth();
  const navigate = useNavigate();
  
  const [incident, setIncident] = useState<Incident | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [completingReview, setCompletingReview] = useState(false);
  const [editedFields, setEditedFields] = useState<Partial<Incident>>({});
  const [downloadingFile, setDownloadingFile] = useState(false);
  const [isEmailTemplateOpen, setIsEmailTemplateOpen] = useState(false);

  const [subjectCopied, setSubjectCopied] = useState(false);
  const [bodyCopied, setBodyCopied] = useState(false);
  
  useEffect(() => {
    const fetchIncident = async () => {
      if (!id) return;
      
      try {
        const incident = await incidentsApi.getById(session, id);
        setIncident(incident);
      } catch (error) {
        console.error('Error fetching incident:', error);
        toast({
          title: "Error",
          description: "Failed to load incident details",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchIncident();
  }, [id]);

  const handleChange = (field: keyof Incident, value: any) => {
    if (field === 'needsMoreInfo' && value === true) {
      setEditedFields(prev => ({
        ...prev,
        [field]: value,
        requiresTimelyWarning: false
      }));
    }
    else if (field === 'requiresTimelyWarning' && value === true) {
      setEditedFields(prev => ({
        ...prev,
        [field]: value,
        needsMoreInfo: false
      }));
    }
    else {
      setEditedFields(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const getValue = (field: keyof Incident): any => {
    if (field in editedFields) {
      return editedFields[field];
    }
    return incident ? incident[field] : '';
  };

  const getStringValue = (field: keyof Incident): string => {
    const value = getValue(field);
    if (field === 'date') {
      return value ? value.split('T')[0] : ''
    }

    return value === null || value === undefined ? '' : String(value);
  };

  const getBooleanValue = (field: keyof Incident): boolean => {
    const value = getValue(field);
    return Boolean(value);
  };

  const handleSave = async () => {
    if (!incident) return;
    
    setSaving(true);
    
    try {
      await incidentsApi.update(session, incident.id, editedFields);
      setIncident(prev => prev ? { ...prev, ...editedFields } : null);
      setEditedFields({});
      
      toast({
        title: "Success",
        description: "Incident details updated successfully",
        variant: "success",
      });
    } catch (error) {
      console.error('Error updating incident:', error);
      toast({
        title: "Error",
        description: "Failed to update incident details",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCompleteReview = async () => {
    if (!incident) return;

    if (incident.needsMoreInfo) {
      toast({
        title: "Error",
        description: "Cannot mark incident as Completed. Additional information is required.",
        variant: "destructive",
      });
      return;
    }
    
    setCompletingReview(true);
    
    try {
      await incidentsApi.update(session, incident.id, { status: IncidentProcessingStatus.COMPLETED });
      setIncident(prev => 
        prev ? { ...prev, status: IncidentProcessingStatus.COMPLETED } : null
      );
      
      toast({
        title: "Success",
        description: "Review completed",
        variant: "success",
      });
    } catch (error) {
      console.error('Error marking incident as Completed:', error);
      toast({
        title: "Error",
        description: "Failed to mark incident as Completed",
        variant: "destructive",
      });
    } finally {
      setCompletingReview(false);
    }
  };

  const handleDownload = async () => {
    if (!incident) return;

    setDownloadingFile(true);

    try {
      const { data, error } = await downloadIncident(incident)
      if (error) throw error;
      
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = incident.title;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Download Successful",
        description: `${incident.title} has been downloaded.`,
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "There was an error downloading the file. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setDownloadingFile(false);
    }
  };

  const generateEmailTemplateHeader = () => {
    if (!incident) return "";

    if (incident.requiresTimelyWarning) {
      return 'Timely Warning Notification';
    }

    return 'Request Additional Information';
  };

  const generateEmailTemplateDescription = () => {
    if (!incident) return "";

    if (incident.requiresTimelyWarning) {
      return 'Copy this email template to send a timely warning notification to the campus community.';
    }

    return 'Copy this email template to request more information about this incident.';
  };


  const generateEmailSubject = () => {
    if (!incident) return "";

    if (incident.requiresTimelyWarning) {
      return `Timely Warning: ${incident.category} Near ${incident.location}`;
    }
    
    return `Additional Information Needed for Incident #${incident.number}`;
  };

  const generateEmailBody = () => {
    if (!incident) return "";
    
    if (incident.requiresTimelyWarning) {
      return `**Timely Warning Notification**
      
**Incident:** ${incident.category}
**Date/Time Reported:** ${formatDate(incident.uploadedAt)}
**Date/Time Occurred:** ${formatDate(incident.date)} ${incident.timeStr}
**Location:** ${incident.location}

**Incident Summary:**
${incident.summary}

**Description of Reported Suspect:**
[Physical description: gender, height, build, complexion, clothing, distinguishing features, direction of travel, if known.]
(If no description available: "At this time, no suspect description is available.")

**Safety Tips:**
- Stay alert to your surroundings, especially when walking alone.
- Avoid distractions like phones and earbuds when walking in public spaces.
- Walk with others whenever possible, especially at night. 
- Report any suspicious behavior to Campus Safety immediately.`;
    }

    return `Hello,

We are reviewing incident #${incident.number} "${incident.title}" that occurred on ${formatDate(incident.date)} at ${incident.location}.

We need additional information to properly process this incident. Specifically, we need:

1. More detailed explanation of the events
2. Names of any witnesses
3. Any additional documentation or evidence

Please reply to this email with the requested information at your earliest convenience.

Thank you,
Campus Safety Team`;
  };

  const handleCopySubject = () => {
    navigator.clipboard.writeText(generateEmailSubject());
    setSubjectCopied(true);
    setTimeout(() => setSubjectCopied(false), 2000);
    
    toast({
      title: "Copied to clipboard",
      description: "Email subject has been copied to your clipboard",
      variant: "success",
    });
  };

  const handleCopyBody = () => {
    navigator.clipboard.writeText(generateEmailBody());
    setBodyCopied(true);
    setTimeout(() => setBodyCopied(false), 2000);
    
    toast({
      title: "Copied to clipboard",
      description: "Email body has been copied to your clipboard",
      variant: "success",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary/20">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-8">
          <div className="animate-pulse bg-white p-8 rounded-lg shadow">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-6 bg-gray-200 rounded w-full mb-4"></div>
            <div className="h-6 bg-gray-200 rounded w-2/3 mb-4"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="min-h-screen bg-secondary/20">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-8">
          <Card className="mx-auto max-w-2xl">
            <CardHeader>
              <CardTitle className="text-center">Incident Not Found</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground">
                The incident you are looking for could not be found.
              </p>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button onClick={() => navigate('/incidents')}>
                <ChevronLeft className="mr-2 h-4 w-4" />
                Return to Incidents
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  const canMarkAsCompleted = incident?.status === IncidentProcessingStatus.PENDING;
  const isCompleted = incident?.status === IncidentProcessingStatus.COMPLETED;
  const hasChanges = Object.keys(editedFields).length > 0;

  return (
    <div className="min-h-screen bg-secondary/20">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-8">
        <div className="mb-6 flex items-center justify-between">
          <Button 
            variant="outline" 
            onClick={() => navigate('/incidents')}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Incidents
          </Button>
          
          <div className="flex items-center gap-2">
            {incident?.needsMoreInfo && (
              <Button
                onClick={() => setIsEmailTemplateOpen(true)}
                className="bg-amber-100 text-amber-800 hover:bg-amber-200 border border-amber-300"
              >
                <Mail className="mr-2 h-4 w-4" />
                Generate Email Template
              </Button>
            )}
            {incident?.requiresTimelyWarning && (
              <Button
                onClick={() => setIsEmailTemplateOpen(true)}
                className="bg-red-100 text-red-800 hover:bg-red-200 border border-red-300"
              >
                <Mail className="mr-2 h-4 w-4" />
                Generate Email Template
              </Button>
            )}
            
            {isCompleted ? (
              <Badge variant="outline" className="bg-green-100 text-green-800">
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Review Completed
              </Badge>
            ) : (
              <>
                {hasChanges && (
                  <Button 
                    onClick={handleSave} 
                    disabled={!hasChanges || saving}
                  >
                    {saving ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                )}
                
                {canMarkAsCompleted && (
                  <Button 
                    variant="outline" 
                    className="bg-green-100 text-green-800 hover:bg-green-200"
                    onClick={handleCompleteReview}
                    disabled={completingReview}
                  >
                    {completingReview ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Completing Review...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Complete Review
                      </>
                    )}
                  </Button>
                )}
              </>
            )}
            
            <Button
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                handleDownload();
              }}
              disabled={downloadingFile || !incident?.filePath}
            >
              {downloadingFile ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Downloading...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </>
              )}
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className={cn(
            "lg:col-span-2",
            incident?.isClery ? "border-2 border-[#8B5CF6] bg-[#FEF7CD]/20" : "",
            incident?.needsMoreInfo ? "border-l-4 border-amber-500 bg-[#FFEBEB]/40" : "",
            incident?.requiresTimelyWarning ? "border-l-4 border-red-500 bg-red-50/40" : ""
          )}>
            <CardHeader>
              <div className="flex items-center mb-2">
                {incident?.needsMoreInfo ? (
                  <AlertTriangle className="h-5 w-5 mr-2 text-amber-500" />
                ) : incident?.requiresTimelyWarning ? (
                  <AlertTriangle className="h-5 w-5 mr-2 text-red-500" />
                ) : (
                  <FileText className="h-5 w-5 mr-2 text-primary" />
                )}
                <CardTitle>
                  Incident Details
                  {incident?.isClery && (
                    <Flag className="inline-block ml-2 h-4 w-4 text-[#8B5CF6]" />
                  )}
                </CardTitle>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {incident?.requiresTimelyWarning && (
                <div className="bg-red-50 p-4 rounded-md border border-red-200 mb-4">
                  <div className="flex items-center gap-2 text-red-800 font-medium mb-2">
                    <AlertTriangle className="h-5 w-5" />
                    <p className="text-red-700 text-sm">
                      This incident requires a timely warning.
                      Use the "Generate Email Template" button to generate the timely warning email.
                    </p>
                  </div>
                </div>
              )}
              {incident?.needsMoreInfo && (
                <div className="bg-amber-50 p-4 rounded-md border border-amber-200 mb-4">
                  <div className="flex items-center gap-2 text-amber-800 font-medium mb-2">
                    <AlertTriangle className="h-5 w-5" />
                    <span>This incident needs more information</span>
                  </div>
                  <p className="text-amber-700 text-sm">
                    Additional details are required to process this incident.
                    Use the "Generate Email Template" button to request more information.
                  </p>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="number">Incident Number</Label>
                  <Input
                    id="number"
                    value={getStringValue('number')}
                    onChange={(e) => handleChange('number', e.target.value)}
                    className="mt-1"
                    disabled={isCompleted}
                  />
                </div>
                
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={getStringValue('date')}
                    onChange={(e) => handleChange('date', e.target.value)}
                    className="mt-1"
                    disabled={isCompleted}
                  />
                </div>
                
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={getStringValue('category')}
                    onChange={(e) => handleChange('category', e.target.value)}
                    className="mt-1"
                    disabled={isCompleted}
                  />
                </div>
              </div>
                
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={getStringValue('location')}
                  onChange={(e) => handleChange('location', e.target.value)}
                  className="mt-1"
                  disabled={isCompleted}
                />
              </div>
              
              <div className="flex items-center gap-6">
                <Label htmlFor="isClery" className="flex items-center gap-2 cursor-pointer">
                  <input
                    id="isClery"
                    type="checkbox"
                    checked={getBooleanValue('isClery')}
                    onChange={(e) => handleChange('isClery', e.target.checked)}
                    className="w-4 h-4 text-[#8B5CF6] border-gray-300 rounded focus:ring-[#8B5CF6]"
                    disabled={isCompleted}
                  />
                  <span className="flex items-center">
                    Clery Act Incident
                    <Flag className="ml-1 h-4 w-4 text-[#8B5CF6]" />
                  </span>
                </Label>
                
                <Label htmlFor="requiresTimelyWarning" className="flex items-center gap-2 cursor-pointer">
                  <input
                    id="requiresTimelyWarning"
                    type="checkbox"
                    checked={getBooleanValue('requiresTimelyWarning')}
                    onChange={(e) => handleChange('requiresTimelyWarning', e.target.checked)}
                    className="w-4 h-4 text-red-500 border-gray-300 rounded focus:ring-red-500"
                    disabled={isCompleted}
                  />
                  <span className="flex items-center">
                    Requires Timely Warning
                    <Shield className="ml-1 h-4 w-4 text-red-500" />
                  </span>
                </Label>
                
                <Label htmlFor="needsMoreInfo" className="flex items-center gap-2 cursor-pointer">
                  <input
                    id="needsMoreInfo"
                    type="checkbox"
                    checked={getBooleanValue('needsMoreInfo')}
                    onChange={(e) => handleChange('needsMoreInfo', e.target.checked)}
                    className="w-4 h-4 text-amber-500 border-gray-300 rounded focus:ring-amber-500"
                    disabled={isCompleted}
                  />
                  <span className="flex items-center">
                    Needs More Information
                    <AlertTriangle className="ml-1 h-4 w-4 text-amber-500" />
                  </span>
                </Label>
              </div>
              
              <div>
                <Label htmlFor="summary">Summary</Label>
                <Textarea
                  id="summary"
                  value={getStringValue('summary')}
                  onChange={(e) => handleChange('summary', e.target.value)}
                  className="mt-1 min-h-[150px]"
                  disabled={isCompleted}
                />
              </div>
              
              <div>
                <Label htmlFor="explanation">Explanation</Label>
                <Textarea
                  id="explanation"
                  value={getStringValue('explanation')}
                  onChange={(e) => handleChange('explanation', e.target.value)}
                  className="mt-1 min-h-[150px]"
                  disabled={isCompleted}
                />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              <div>
                <p className="text-sm font-medium">Status</p>
                <div className="flex items-center mt-1">
                  {incident && getStatusIcon(incident.status)}
                  <Badge variant="outline" className={incident ? getStatusColor(incident.status) : ''}>
                    {incident?.status}
                  </Badge>
                </div>
              </div>

              {incident?.needsMoreInfo && (
                <div>
                  <p className="text-sm font-medium">Additional Information Required</p>
                  <div className="flex items-center mt-1">
                    <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">
                      <AlertTriangle className="mr-2 h-4 w-4" />
                      Needs More Info
                    </Badge>
                  </div>
                </div>
              )}

              {incident?.isClery && (
                <div>
                  <p className="text-sm font-medium">Classification</p>
                  <div className="flex items-center mt-1">
                    <Badge variant="outline" className="bg-[#8B5CF6]/10 text-[#8B5CF6] border-[#8B5CF6]/20">
                      <Flag className="mr-2 h-4 w-4" />
                      Clery Act Incident
                    </Badge>
                  </div>
                </div>
              )}

              {incident?.requiresTimelyWarning && (
                <div>
                  <p className="text-sm font-medium">Timely Warning Required</p>
                  <div className="flex items-center mt-1">
                    <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
                      <Shield className="mr-2 h-4 w-4" />
                      Timely Warning
                    </Badge>
                  </div>
                </div>
              )}

              <div>
                <p className="text-sm font-medium">File</p>
                <p className="text-gray-600">{incident?.title}</p>
              </div>

              <div>
                <p className="text-sm font-medium">Uploaded By</p>
                <p className="text-gray-600">{incident?.uploaderName}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium">Uploaded At</p>
                <p className="text-gray-600">{incident?.uploadedAt ? formatDate(incident.uploadedAt) : ''}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={isEmailTemplateOpen} onOpenChange={setIsEmailTemplateOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              {generateEmailTemplateHeader()}
            </DialogTitle>
            <DialogDescription>
              {generateEmailTemplateDescription()}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 mt-2 mb-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Subject</h3>
              <div className="bg-muted/50 p-3 rounded-md border relative">
                <code className="text-sm font-mono whitespace-pre-wrap">
                  {generateEmailSubject()}
                </code>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleCopySubject}
                  className="absolute bottom-2 right-2 h-8 w-8 p-0"
                >
                  {subjectCopied ? <ClipboardCheck className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-2">Body</h3>
              <div className="bg-muted/50 p-3 rounded-md border relative">
                <pre className="text-sm font-mono whitespace-pre-wrap pr-10">
                  {generateEmailBody()}
                </pre>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleCopyBody}
                  className="absolute bottom-2 right-2 h-8 w-8 p-0"
                >
                  {bodyCopied ? <ClipboardCheck className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default IncidentDetail;
