
import { useState } from 'react';
import { Upload, X, Check, File } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { IncidentProcessingStatus } from '@/types';

const IncidentUploader = ({ onUploadSuccess }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{[key: string]: number}>({});
  
  const { user } = useAuth();

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      const validFiles = droppedFiles.filter(file => file.type === 'application/pdf');
      
      if (validFiles.length !== droppedFiles.length) {
        toast({
          title: "Invalid file type(s)",
          description: "Only PDF files are accepted.",
          variant: "destructive"
        });
      }
      
      if (validFiles.length > 0) {
        setFiles(prevFiles => [...prevFiles, ...validFiles]);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      const validFiles = selectedFiles.filter(file => file.type === 'application/pdf');
      
      if (validFiles.length !== selectedFiles.length) {
        toast({
          title: "Invalid file type(s)",
          description: "Only PDF files are accepted.",
          variant: "destructive"
        });
      }
      
      if (validFiles.length > 0) {
        setFiles(prevFiles => [...prevFiles, ...validFiles]);
      }
    }
  };

  const removeFile = (indexToRemove: number) => {
    setFiles(prevFiles => prevFiles.filter((_, index) => index !== indexToRemove));
  };

  const uploadIncident = async (file: File) => {
    // Create a unique filename
    const fileName = `${uuidv4()}.${file.name.split('.').pop()}`;
    const filePath = `${user.id}/${fileName}`;
    
    // Upload file to Supabase Storage
    const { error: uploadError, data: uploadData } = await supabase.storage
      .from('incidents')
      .upload(filePath, file);
    
    if (uploadError) throw uploadError;

    // Get the public URL
    const { data: urlData } = supabase.storage
      .from('incidents')
      .getPublicUrl(filePath);
      
    const pdfUrl = urlData.publicUrl;
    
    // Insert incident record into database
    const { error: insertError, data: incidentData } = await supabase
      .from('incidents')
      .insert({
        title: file.name,
        status: IncidentProcessingStatus.QUEUED,
        pdf_url: pdfUrl,
        file_path: filePath,
        uploaded_by: user.id,
      })
      .select()
      .single();
    
    if (insertError) throw insertError;
    
    return incidentData;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to upload incidents.",
        variant: "destructive"
      });
      return;
    }
    
    if (files.length === 0) {
      toast({
        title: "Missing information",
        description: "Please upload at least one PDF file.",
        variant: "destructive"
      });
      return;
    }
    
    setIsUploading(true);
    const initialUploadProgress = files.reduce((acc, _, index) => {
      acc[index] = 0;
      return acc;
    }, {});
    setUploadProgress(initialUploadProgress);
    
    let successCount = 0;
    const failedFiles: string[] = [];
    
    try {
      // Upload files in parallel with individual progress tracking
      await Promise.all(files.map(async (file, index) => {
        try {
          // Update progress for this file
          setUploadProgress(prev => ({ ...prev, [index]: 10 }));
          
          await uploadIncident(file);
          
          // Update progress when complete
          setUploadProgress(prev => ({ ...prev, [index]: 100 }));
          successCount++;
        } catch (error) {
          console.error(`Error uploading ${file.name}:`, error);
          failedFiles.push(file.name);
          setUploadProgress(prev => ({ ...prev, [index]: -1 })); // -1 indicates error
        }
      }));
      
      if (successCount > 0) {
        toast({
          title: `${successCount} ${successCount === 1 ? 'incident' : 'incidents'} uploaded successfully`,
          description: "Your incident(s) have been queued for processing.",
          variant: "success"
        });
      }
      
      if (failedFiles.length > 0) {
        toast({
          title: `Failed to upload ${failedFiles.length} ${failedFiles.length === 1 ? 'file' : 'files'}`,
          description: failedFiles.join(', '),
          variant: "destructive"
        });
      }
      
      // Reset form only if at least one file was successful
      if (successCount > 0) {
        setFiles([]);
        
        // Call the onUploadSuccess callback
        if (onUploadSuccess) {
          onUploadSuccess();
        }
      }
      
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error.message || "There was an error uploading your incidents.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
      setUploadProgress({});
    }
  };

  return (
    <div className="w-full lg:w-3/4 mx-auto bg-white rounded-xl shadow-sm border border-border p-4 animate-scale-in">
      <h2 className="text-2xl font-semibold mb-6">Upload Incidents</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div 
          className={cn(
            "border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center text-center transition-all",
            isDragging ? "border-primary bg-primary/5" : "border-border",
            files.length > 0 ? "bg-secondary/30" : "hover:bg-secondary/50 cursor-pointer"
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => document.getElementById('file-upload')?.click()}
        >
          <input
            id="file-upload"
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="hidden"
            multiple
          />
          
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Upload className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-lg font-medium mb-1">Drag & drop your PDF files</h3>
          <p className="text-sm text-muted-foreground mb-4">
            or click to browse from your computer
          </p>
          <p className="text-xs text-muted-foreground">
            Accepted format: PDF only (Max 10MB per file)
          </p>
        </div>
        
        {files.length > 0 && (
          <div className="space-y-3 animate-scale-in">
            <p className="text-sm font-medium">Selected files: {files.length}</p>
            <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
              {files.map((file, index) => (
                <div key={index} className="flex items-center p-3 bg-secondary rounded-lg">
                  <File className="h-8 w-8 text-primary mr-3 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-left truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground text-left">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    {isUploading && uploadProgress[index] !== undefined && (
                      <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden mt-1">
                        <div 
                          className={cn(
                            "h-full rounded-full transition-all duration-300",
                            uploadProgress[index] === -1 
                              ? "bg-destructive" 
                              : "bg-primary"
                          )} 
                          style={{ width: `${uploadProgress[index] === -1 ? 100 : uploadProgress[index]}%` }}
                        />
                      </div>
                    )}
                  </div>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    onClick={(e) => { 
                      e.stopPropagation();
                      removeFile(index);
                    }}
                    disabled={isUploading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="flex justify-end">
          <Button 
            type="submit" 
            disabled={isUploading || files.length === 0} 
            className="min-w-[150px]"
          >
            {isUploading ? (
              <div className="flex items-center">
                <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                Uploading...
              </div>
            ) : (
              <div className="flex items-center">
                <Check className="mr-2 h-4 w-4" />
                Upload {files.length > 0 ? `(${files.length})` : ''}
              </div>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default IncidentUploader;
