// src/components/scheduled-audit/schedule-form.tsx
// Component for configuring scheduled recurring audits

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

// Define the form schema with Zod
const scheduleFormSchema = z.object({
  enabled: z.boolean().default(false),
  frequency: z.enum(["DAILY", "WEEKLY", "BIWEEKLY", "MONTHLY", "QUARTERLY"]).default("WEEKLY"),
  dayOfWeek: z.number().min(0).max(6).nullable().optional(),
  dayOfMonth: z.number().min(1).max(31).nullable().optional(),
  categories: z.array(z.string()).min(1, "Select at least one audit category"),
});

type ScheduleFormValues = z.infer<typeof scheduleFormSchema>;

// Available audit categories
const auditCategories = [
  { id: "SEO", label: "SEO" },
  { id: "PERFORMANCE", label: "Performance" },
  { id: "ACCESSIBILITY", label: "Accessibility" },
  { id: "SECURITY", label: "Security" },
  { id: "MOBILE", label: "Mobile" },
  { id: "CONTENT", label: "Content" },
];

interface ScheduleFormProps {
  websiteId: string;
  initialData?: {
    enabled: boolean;
    frequency: string;
    dayOfWeek?: number | null;
    dayOfMonth?: number | null;
    categories: string[];
  };
}

export function ScheduleForm({ websiteId, initialData }: ScheduleFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  // Initialize form with react-hook-form
  const form = useForm<ScheduleFormValues>({
    resolver: zodResolver(scheduleFormSchema),
    defaultValues: {
      enabled: initialData?.enabled || false,
      frequency: (initialData?.frequency as any) || "WEEKLY",
      dayOfWeek: initialData?.dayOfWeek || null,
      dayOfMonth: initialData?.dayOfMonth || null,
      categories: initialData?.categories || ["SEO", "PERFORMANCE", "ACCESSIBILITY", "SECURITY", "MOBILE", "CONTENT"],
    },
  });

  // Watch for changes to frequency to show/hide relevant fields
  const frequency = form.watch("frequency");
  const enabled = form.watch("enabled");

  // Handle form submission
  async function onSubmit(data: ScheduleFormValues) {
    setIsLoading(true);

    try {
      const response = await fetch(`/api/websites/${websiteId}/schedule`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update schedule");
      }

      toast({
        title: "Schedule updated",
        description: data.enabled 
          ? "Scheduled audits have been enabled" 
          : "Scheduled audits have been disabled",
      });

      // Refresh the page to show updated data
      router.refresh();
    } catch (error) {
      toast({
        title: "Error",
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Scheduled Audits</CardTitle>
        <CardDescription>
          Configure automated recurring audits for this website
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="enabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Enable Scheduled Audits</FormLabel>
                    <FormDescription>
                      Automatically run audits on a recurring schedule
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isLoading}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className={cn("space-y-4", !enabled && "opacity-50 pointer-events-none")}>
              <FormField
                control={form.control}
                name="frequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Frequency</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isLoading || !enabled}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="DAILY">Daily</SelectItem>
                        <SelectItem value="WEEKLY">Weekly</SelectItem>
                        <SelectItem value="BIWEEKLY">Bi-weekly</SelectItem>
                        <SelectItem value="MONTHLY">Monthly</SelectItem>
                        <SelectItem value="QUARTERLY">Quarterly</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      How often the audit should run
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {frequency === "WEEKLY" && (
                <FormField
                  control={form.control}
                  name="dayOfWeek"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Day of Week</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        value={field.value?.toString() || ""}
                        disabled={isLoading || !enabled}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select day" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="0">Sunday</SelectItem>
                          <SelectItem value="1">Monday</SelectItem>
                          <SelectItem value="2">Tuesday</SelectItem>
                          <SelectItem value="3">Wednesday</SelectItem>
                          <SelectItem value="4">Thursday</SelectItem>
                          <SelectItem value="5">Friday</SelectItem>
                          <SelectItem value="6">Saturday</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Which day of the week to run the audit
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {frequency === "MONTHLY" && (
                <FormField
                  control={form.control}
                  name="dayOfMonth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Day of Month</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        value={field.value?.toString() || ""}
                        disabled={isLoading || !enabled}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select day" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Array.from({ length: 28 }, (_, i) => (
                            <SelectItem key={i + 1} value={(i + 1).toString()}>
                              {i + 1}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Which day of the month to run the audit
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="categories"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel className="text-base">Audit Categories</FormLabel>
                      <FormDescription>
                        Select which categories to include in the scheduled audit
                      </FormDescription>
                    </div>
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                      {auditCategories.map((category) => (
                        <FormField
                          key={category.id}
                          control={form.control}
                          name="categories"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={category.id}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(category.id)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, category.id])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== category.id
                                            )
                                          );
                                    }}
                                    disabled={isLoading || !enabled}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  {category.label}
                                </FormLabel>
                              </FormItem>
                            );
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Settings
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
