"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Form, Response, Question } from "@/lib/types";
import { 
  Type, CheckSquare, Calendar, Hash, Mail, Link as LinkIcon, 
  Phone, FileUp, Filter, ArrowUpDown, Zap, Search, Maximize2, 
  SlidersHorizontal, Plus, MoreHorizontal, FileText, Clock, User
} from "lucide-react";

const getIconForType = (type: string) => {
  switch(type) {
    case "short_text": return <Type className="h-4 w-4" />;
    case "long_text": return <FileText className="h-4 w-4" />;
    case "multiple_choice": return <CheckSquare className="h-4 w-4" />;
    case "multiple_select": return <CheckSquare className="h-4 w-4" />;
    case "date_picker": return <Calendar className="h-4 w-4" />;
    case "number": return <Hash className="h-4 w-4" />;
    case "email": return <Mail className="h-4 w-4" />;
    case "url": return <LinkIcon className="h-4 w-4" />;
    case "phone": return <Phone className="h-4 w-4" />;
    case "file_upload": return <FileUp className="h-4 w-4" />;
    default: return <Type className="h-4 w-4" />;
  }
};

export default function ResultsPage() {
  const params = useParams();
  const router = useRouter();
  const formId = params.formId as string;

  const [form, setForm] = useState<Form | null>(null);
  const [responses, setResponses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchResults() {
      try {
        const [formRes, responsesRes] = await Promise.all([
          fetch(`/api/forms/${formId}`),
          fetch(`/api/results/${formId}`)
        ]);

        if (formRes.ok) {
          const formData = await formRes.json();
          setForm(formData.form);
        }
        if (responsesRes.ok) {
          const respData = await responsesRes.json();
          setResponses(respData.responses || []);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchResults();
  }, [formId]);

  if (loading) return <div className="flex h-screen items-center justify-center bg-gray-50 text-foreground">Loading database...</div>;
  if (!form) return <div className="flex h-screen items-center justify-center bg-gray-50 text-foreground">Database not found.</div>;

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20 selection:text-foreground pb-20">
      
      {/* Top Navigation simulating Notion Tab Bar */}
      <div className="flex items-center justify-between px-4 h-12 border-b border-border bg-white">
        <div className="flex items-center gap-2">
          {/* Breadcrumbs */}
          <button onClick={() => router.push('/dashboard')} className="text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted px-2 py-1 flex items-center gap-2 rounded transition border border-transparent hover:border-border">
            <LayoutDashboardIcon className="w-4 h-4" /> Dashboard
          </button>
          <span className="text-muted-foreground/50">/</span>
          <div className="text-sm font-medium px-2 py-1 bg-muted rounded flex items-center gap-2 shadow-sm border border-border">
            <div className="w-4 h-4 rounded-sm bg-primary/10 flex items-center justify-center">
               <FileText className="w-3 h-3 text-primary" />
            </div>
            Responses
          </div>
        </div>

        {/* Toolbar Right */}
        <div className="flex items-center gap-1.5 text-muted-foreground">
           <button className="p-1.5 hover:bg-muted hover:text-foreground transition-colors rounded"><Filter className="w-4 h-4" /></button>
           <button className="p-1.5 hover:bg-muted hover:text-foreground transition-colors rounded"><ArrowUpDown className="w-4 h-4" /></button>
           <button className="p-1.5 hover:bg-muted hover:text-foreground transition-colors rounded"><Zap className="w-4 h-4" /></button>
           <button className="p-1.5 hover:bg-muted hover:text-foreground transition-colors rounded"><Search className="w-4 h-4" /></button>
           <button className="p-1.5 hover:bg-muted hover:text-foreground transition-colors rounded"><Maximize2 className="w-4 h-4" /></button>
           <button className="p-1.5 hover:bg-muted hover:text-foreground transition-colors rounded"><SlidersHorizontal className="w-4 h-4" /></button>
           <div className="ml-2 flex items-center">
             <button className="bg-primary hover:opacity-90 transition text-primary-foreground text-sm font-medium px-3 py-1.5 rounded shadow-sm">
               New 
             </button>
           </div>
        </div>
      </div>

      <div className="w-full overflow-x-auto mt-4 px-8 pb-4 custom-scrollbar-light">
        <style dangerouslySetInnerHTML={{__html: `
          .custom-scrollbar-light::-webkit-scrollbar { height: 12px; }
          .custom-scrollbar-light::-webkit-scrollbar-track { background: transparent; }
          .custom-scrollbar-light::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 6px; border: 3px solid #ffffff; }
          .custom-scrollbar-light::-webkit-scrollbar-thumb:hover { background: #d1d5db; }
        `}} />
        
        {/* Table Container */}
        <div className="inline-block min-w-full align-middle border-t border-border">
          <table className="min-w-full text-left border-collapse bg-white">
            <thead>
              <tr className="border-b border-border text-sm text-muted-foreground bg-gray-50/50">
                <th className="font-normal px-4 py-2 border-r border-border min-w-[200px] whitespace-nowrap sticky left-0 z-10 shadow-[1px_0_0_hsl(var(--border))] bg-gray-50">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" /> Respondent
                  </div>
                </th>
                <th className="font-normal px-4 py-2 border-r border-border min-w-[200px] whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" /> Submission time
                  </div>
                </th>
                {form.questions.map((q: Question) => (
                  <th key={q.id} className="font-normal px-4 py-2 border-r border-border min-w-[250px] whitespace-nowrap">
                    <div className="flex items-center gap-2 text-foreground">
                      <span className="text-muted-foreground">{getIconForType(q.type)}</span> {q.title || "Untitled Question"}
                    </div>
                  </th>
                ))}
                <th className="font-normal px-4 py-2 w-full">
                  <div className="flex items-center gap-2 cursor-pointer hover:bg-muted text-muted-foreground w-fit p-1 rounded transition-colors">
                    <Plus className="w-4 h-4" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="text-sm text-foreground">
              {responses.length === 0 && (
                 <tr>
                    <td colSpan={form.questions.length + 3} className="px-4 py-8 text-center text-muted-foreground italic bg-white">
                      No entries found in database
                    </td>
                 </tr>
              )}
              {responses.map((resp, index) => (
                <tr key={resp._id || index} className="border-b border-border hover:bg-muted/30 transition-colors group bg-white">
                  <td className="px-4 py-2 border-r border-border whitespace-nowrap sticky left-0 group-hover:bg-gray-50/80 z-10 shadow-[1px_0_0_hsl(var(--border))] bg-white">
                     Anonymous Visitor
                  </td>
                  <td className="px-4 py-2 border-r border-border whitespace-nowrap text-muted-foreground">
                     {new Date(resp.createdAt || Date.now()).toLocaleString(undefined, {
                        month: "short", day: "numeric", hour: "2-digit", minute:"2-digit"
                     })}
                  </td>
                  {form.questions.map((q: Question) => {
                    const ans = resp.answers.find((a: any) => a.questionId === q.id);
                    let displayValue = ans?.value;

                    if (Array.isArray(displayValue)) {
                      displayValue = displayValue.map(id => {
                        const opt = q.options?.find(o => o.id === id);
                        return opt ? opt.value : id;
                      }).join(", ");
                    } else if (q.type === "multiple_choice" && typeof displayValue === "string") {
                      const opt = q.options?.find(o => o.id === displayValue);
                      displayValue = opt ? opt.value : displayValue;
                    }

                    return (
                      <td key={q.id} className="px-4 py-2 border-r border-border min-w-[250px]">
                         {displayValue !== undefined && displayValue !== null && displayValue !== "" 
                             ? displayValue.toString() 
                             : <span className="text-muted-foreground/50 italic">Empty</span>}
                      </td>
                    );
                  })}
                  <td className="px-4 py-2">
                     {/* Empty spacer cell */}
                  </td>
                </tr>
              ))}
              
              {/* Bottom New Row simulating Notion Add */}
              <tr className="border-b border-border hover:bg-muted/30 transition-colors cursor-pointer text-muted-foreground bg-white">
                  <td className="px-4 py-2 border-r border-border whitespace-nowrap sticky left-0 shadow-[1px_0_0_hsl(var(--border))] bg-white">
                     <div className="flex items-center gap-2">
                        <Plus className="w-4 h-4 opacity-50" /> New page
                     </div>
                  </td>
                  <td colSpan={form.questions.length + 2} className="px-4 py-2"></td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}

// Custom icon mapping wrapper manually injecting for the layout structure
const LayoutDashboardIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect width="7" height="9" x="3" y="3" rx="1" />
    <rect width="7" height="5" x="14" y="3" rx="1" />
    <rect width="7" height="9" x="14" y="12" rx="1" />
    <rect width="7" height="5" x="3" y="16" rx="1" />
  </svg>
)
