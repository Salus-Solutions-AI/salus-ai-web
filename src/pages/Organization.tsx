import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Save, AlertTriangle, Shield, Info } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import Navbar from '@/components/Navbar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { organizationsApi } from '@/api/resources/organizations';
import type { Organization } from '@/types';

const organizationSchema = z.object({
  additionalInfoEmailSubject: z.string().min(1, 'Additional Info subject is required'),
  additionalInfoEmailBody: z.string().min(1, 'Additional Info body is required'),
  timelyWarningEmailSubject: z.string().min(1, 'Timely Warning subject is required'),
  timelyWarningEmailBody: z.string().min(1, 'Timely Warning body is required'),
});

const ADDITIONAL_INFO_VARIABLES = [
  { name: 'title', example: 'Maxient Report #12345', description: 'Incident title' },
  { name: 'location', example: 'Residence Hall A', description: 'Incident location' },
  { name: 'datetimeOccurred', example: new Date(Date.now() - 86400000).toLocaleString(), description: 'Date and time occurred' },
  { name: 'datetimeReported', example: new Date().toLocaleString(), description: 'Date and time reported' },
];

const TIMELY_WARNING_VARIABLES = [
  { name: 'title', example: 'Maxient Report #12345', description: 'Incident title' },
  { name: 'category', example: 'Aggravated Assault', description: 'Incident category' },
  { name: 'datetimeOccurred', example: new Date(Date.now() - 86400000).toLocaleString(), description: 'Date and time occurred' },
  { name: 'datetimeReported', example: new Date().toLocaleString(), description: 'Date and time reported' },
  { name: 'location', example: 'Residence Hall A', description: 'Incident location' },
  { name: 'summary', example: 'A student was assaulted by an unknown male student in the residence hall.', description: 'Incident summary' },
  { name: 'suspectDescription', example: 'An unknown male student wearing a blue hat.', description: 'Suspect description' },
  { name: 'safetyTips', example: '- Stay alert around Residence Halls and other high-risk areas.\n- Report any suspicious activity to Campus Safety.', description: 'Safety tips' },
];

function renderTemplateWithValues(text: string, variables) {
  const parts = text.split(/(\{\{\s*[^}]+\s*\}\})/g);
  return parts.map((part, idx) => {
    const match = part.match(/^\{\{\s*([^}]+)\s*\}\}$/);
    if (match) {
      const varName = match[1].trim();
      const found = variables.find(v => v.name === varName);
      return found ? <span key={idx} className="font-bold" title={found.description}>{found.example}</span> : <span key={idx} className="font-bold text-destructive">{part}</span>;
    }
    return <span key={idx}>{part}</span>;
  });
}

function findInvalidVariables(text: string, variables) {
  const matches = text.match(/\{\{\s*([^}]+)\s*\}\}/g) || [];
  return matches.filter(match => {
    const varName = match.replace(/\{\{|\}\}/g, '').trim();
    return !variables.some(v => v.name === varName);
  });
}

function VariablePopover({ variables }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="ml-2 flex items-center justify-center gap-2 px-3 py-1.5"
          aria-label="Show template variables"
        >
          <Info className="h-5 w-5 text-muted-foreground" />
          <span className="text-muted-foreground font-medium">Variables</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[1000px]">
        <div className="font-semibold mb-2">Template Variables</div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-muted-foreground border-b">
                <th className="text-left font-medium pb-1">Variable</th>
                <th className="text-left font-medium pb-1">Example</th>
              </tr>
            </thead>
            <tbody>
              {variables.map(v => (
                <tr key={v.name} className="align-top">
                  <td className="pr-2 font-mono font-bold py-1">{'{{ ' + v.name + ' }}'}</td>
                  <td className="pr-2 whitespace-pre-line font-mono text-muted-foreground py-1">{v.example}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </PopoverContent>
    </Popover>
  );
}

const Organization = () => {
  const { session, profile, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [organization, setOrganization] = useState<Organization | null>(null);

  const form = useForm({
    resolver: zodResolver(organizationSchema),
    defaultValues: {
      additionalInfoEmailSubject: '',
      additionalInfoEmailBody: '',
      timelyWarningEmailSubject: '',
      timelyWarningEmailBody: '',
    },
  });

  useEffect(() => {
    const fetchOrganization = async () => {
      if (!session || !profile?.organizationId) return;
      
      try {
        const org = await organizationsApi.getById(session, profile.organizationId);
        setOrganization(org);
        
        // Update form with organization data
        form.reset({
          additionalInfoEmailSubject: org.additionalInfoEmailSubject,
          additionalInfoEmailBody: org.additionalInfoEmailBody,
          timelyWarningEmailSubject: org.timelyWarningEmailSubject,
          timelyWarningEmailBody: org.timelyWarningEmailBody,
        });
      } catch (error) {
        console.error('Error fetching organization:', error);
        toast({
          title: "Error loading organization",
          description: "Failed to load organization settings. Please try again.",
          variant: "destructive",
        });
      }
    };

    fetchOrganization();
  }, [session, profile?.organizationId, form]);

  const onSubmit = async (data) => {
    if (!user || !profile?.organizationId) return;
    
    // Check for invalid variables in all fields
    const invalidAdditionalInfoSubject = findInvalidVariables(data.additionalInfoEmailSubject, ADDITIONAL_INFO_VARIABLES);
    const invalidAdditionalInfoBody = findInvalidVariables(data.additionalInfoEmailBody, ADDITIONAL_INFO_VARIABLES);
    const invalidTimelyWarningSubject = findInvalidVariables(data.timelyWarningEmailSubject, TIMELY_WARNING_VARIABLES);
    const invalidTimelyWarningBody = findInvalidVariables(data.timelyWarningEmailBody, TIMELY_WARNING_VARIABLES);

    if (invalidAdditionalInfoSubject.length > 0 || 
        invalidAdditionalInfoBody.length > 0 || 
        invalidTimelyWarningSubject.length > 0 || 
        invalidTimelyWarningBody.length > 0) {
      toast({
        title: "Invalid variables detected",
        description: "Please fix all invalid variables before saving.",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    try {
      const updatedOrg = await organizationsApi.update(session, profile.organizationId, {
        additionalInfoEmailSubject: data.additionalInfoEmailSubject,
        additionalInfoEmailBody: data.additionalInfoEmailBody,
        timelyWarningEmailSubject: data.timelyWarningEmailSubject,
        timelyWarningEmailBody: data.timelyWarningEmailBody,
      });
      
      setOrganization(updatedOrg);

      toast({
        title: "Settings updated",
        description: "Your organization settings have been updated successfully.",
        variant: "success",
      });
    } catch (error) {
      console.error('Error updating organization settings:', error);
      toast({
        title: "Failed to update settings",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div className="container py-24">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-secondary/20">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32">
        <div className="flex justify-between items-center mb-16">
          <div>
            <h1 className="text-3xl font-bold mb-2">Organization Settings</h1>
            <p className="text-muted-foreground">
              Manage email templates for <span className="font-semibold text-foreground">{organization?.name}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-[100rem] mx-auto px-4 sm:px-6 lg:px-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <AlertTriangle className="mr-2 h-5 w-5 text-amber-500" />
                    Additional Information Emails
                    <span className="ml-auto flex items-center">
                      <VariablePopover variables={ADDITIONAL_INFO_VARIABLES} />
                    </span>
                  </CardTitle>
                  <CardDescription>
                    Template for additional information emails
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="md:flex md:gap-6">
                    <div className="md:w-1/2">
                      <FormField
                        control={form.control}
                        name="additionalInfoEmailSubject"
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex items-center gap-3">
                              <FormLabel className="mb-0 whitespace-nowrap">Subject</FormLabel>
                              <FormControl>
                                <Input className="font-mono" {...field} />
                              </FormControl>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="md:w-1/2">
                      <div className="text-sm text-muted-foreground font-mono border rounded p-2 bg-muted/50">
                        {renderTemplateWithValues(form.watch('additionalInfoEmailSubject'), ADDITIONAL_INFO_VARIABLES)}
                      </div>
                      {findInvalidVariables(form.watch('additionalInfoEmailSubject'), ADDITIONAL_INFO_VARIABLES).length > 0 && (
                        <div className="text-xs text-destructive mt-1">Input contains invalid variable(s): {findInvalidVariables(form.watch('additionalInfoEmailSubject'), ADDITIONAL_INFO_VARIABLES).join(', ')}</div>
                      )}
                    </div>
                  </div>
                  <div className="md:flex md:gap-6 pt-2">
                    <div className="md:w-1/2">
                      <FormField
                        control={form.control}
                        name="additionalInfoEmailBody"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Textarea className="min-h-[350px] font-mono" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="md:w-1/2">
                      <div className="min-h-[350px] text-sm text-muted-foreground font-mono border rounded p-2 bg-muted/50 whitespace-pre-wrap">
                        {renderTemplateWithValues(form.watch('additionalInfoEmailBody'), ADDITIONAL_INFO_VARIABLES)}
                      </div>
                      {findInvalidVariables(form.watch('additionalInfoEmailBody'), ADDITIONAL_INFO_VARIABLES).length > 0 && (
                        <div className="text-xs text-destructive mt-1">Input contains invalid variable(s): {findInvalidVariables(form.watch('additionalInfoEmailBody'), ADDITIONAL_INFO_VARIABLES).join(', ')}</div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="mr-2 h-5 w-5 text-red-500" />
                    Timely Warning Emails
                    <span className="ml-auto flex items-center">
                      <VariablePopover variables={TIMELY_WARNING_VARIABLES} />
                    </span>
                  </CardTitle>
                  <CardDescription>
                    Template for timely warning emails
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="md:flex md:gap-6">
                    <div className="md:w-1/2">
                      <FormField
                        control={form.control}
                        name="timelyWarningEmailSubject"
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex items-center gap-3">
                              <FormLabel className="mb-0 whitespace-nowrap">Subject</FormLabel>
                              <FormControl>
                                <Input className="font-mono" {...field} />
                              </FormControl>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="md:w-1/2 mt-4 md:mt-0">
                      <div className="text-sm text-muted-foreground font-mono border rounded p-2 bg-muted/50">
                        {renderTemplateWithValues(form.watch('timelyWarningEmailSubject'), TIMELY_WARNING_VARIABLES)}
                      </div>
                      {findInvalidVariables(form.watch('timelyWarningEmailSubject'), TIMELY_WARNING_VARIABLES).length > 0 && (
                        <div className="text-xs text-destructive mt-1">Input contains invalid variable(s): {findInvalidVariables(form.watch('timelyWarningEmailSubject'), TIMELY_WARNING_VARIABLES).join(', ')}</div>
                      )}
                    </div>
                  </div>
                  <div className="md:flex md:gap-6 pt-2">
                    <div className="md:w-1/2">
                      <FormField
                        control={form.control}
                        name="timelyWarningEmailBody"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Textarea className="min-h-[400px] font-mono" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="md:w-1/2">
                      <div className="min-h-[400px] text-sm text-muted-foreground font-mono border rounded p-2 bg-muted/50 whitespace-pre-wrap">
                        {renderTemplateWithValues(form.watch('timelyWarningEmailBody'), TIMELY_WARNING_VARIABLES)}
                      </div>
                      {findInvalidVariables(form.watch('timelyWarningEmailBody'), TIMELY_WARNING_VARIABLES).length > 0 && (
                        <div className="text-xs text-destructive mt-1">Input contains invalid variable(s): {findInvalidVariables(form.watch('timelyWarningEmailBody'), TIMELY_WARNING_VARIABLES).join(', ')}</div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-end mt-8 mb-8">
              <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                {loading ? "Saving..." : "Save Changes"}
                {!loading && <Save className="ml-2 h-4 w-4" />}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default Organization; 