"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Form } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, LayoutDashboard, Clock, Search, Link as LinkIcon, CheckCircle2 } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchForms() {
      try {
        const res = await fetch("/api/forms");
        if (res.ok) {
          const data = await res.json();
          setForms(data.forms || []);
        }
      } catch (error) {
        console.error("Failed to load forms", error);
      } finally {
        setLoading(false);
      }
    }
    fetchForms();
  }, []);

  const copyLink = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const url = `${window.location.origin}/form/${id}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      {/* Top Navigation */}
      <div className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-border bg-white px-6">
        <div className="flex items-center gap-2 font-bold text-lg cursor-pointer">
          <div className="w-6 h-6 rounded bg-primary text-white flex items-center justify-center">
            <LayoutDashboard className="w-3.5 h-3.5" />
          </div>
          Dashboard
        </div>
        <div className="flex items-center gap-3">
          <Button 
            onClick={() => router.push("/")}
            className="bg-primary text-primary-foreground hover:opacity-90 h-9"
          >
            <Plus className="w-4 h-4 mr-2" /> Create form
          </Button>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 pt-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">My Forms</h1>
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input 
              disabled
              placeholder="Search forms..." 
              className="pl-9 pr-4 py-2 border border-border rounded-md text-sm w-full sm:w-64 bg-white opacity-50 cursor-not-allowed" 
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : forms.length === 0 ? (
          <Card className="border-dashed border-2 bg-transparent shadow-none max-w-2xl mx-auto">
            <CardContent className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <LayoutDashboard className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No forms yet</h3>
              <p className="text-muted-foreground mb-6 max-w-sm">
                You haven't created any forms. Click the button below to start building your first interactive form.
              </p>
              <Button onClick={() => router.push("/")}>
                <Plus className="w-4 h-4 mr-2" /> Create new form
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-col gap-4">
            {forms.map((form) => (
              <Card 
                key={form.id} 
                className="group cursor-pointer hover:shadow-md transition-all hover:border-primary/50 overflow-hidden relative bg-white" 
                onClick={() => router.push(`/results/${form.id}`)}
              >
                <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-primary/0 to-transparent group-hover:via-primary/50 transition-all opacity-0 group-hover:opacity-100" />
                
                {/* Content */}
                <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1 min-w-0 pr-4">
                    <h3 className="font-bold text-lg truncate mb-1 text-foreground group-hover:text-primary transition-colors">
                      {form.title || "Untitled Form"}
                    </h3>
                    <p className="text-sm text-muted-foreground truncate mb-3">
                      {form.description || "No description provided."}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" /> 
                        {form.createdAt ? new Date(form.createdAt).toLocaleDateString() : "Just now"}
                      </span>
                      <span className="font-medium px-2 py-0.5 bg-secondary text-secondary-foreground rounded-md">
                        {form.questions?.length || 0} questions
                      </span>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex sm:flex-col gap-2 shrink-0 border-t sm:border-t-0 sm:border-l border-border pt-3 sm:pt-0 sm:pl-4">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={(e) => copyLink(e, form.id)}
                      className="w-full sm:w-auto bg-white hover:bg-muted"
                    >
                      {copiedId === form.id ? (
                        <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" />
                      ) : (
                        <LinkIcon className="w-4 h-4 mr-2 text-muted-foreground" />
                      )}
                      {copiedId === form.id ? "Copied" : "Copy Link"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
