"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Question, QuestionType, Option } from "@/lib/types";
import { nanoid } from "nanoid";
import { 
  Plus, Trash2, GripVertical, Save, MoreHorizontal, 
  Type, CheckSquare, Calendar, Hash, Mail, Link as LinkIcon, 
  Phone, MapPin, FileUp, ArrowUp, ArrowDown, Eye, Share, X
} from "lucide-react";
import { cn } from "@/lib/utils";

const QUESTION_TYPES = [
  { value: "short_text", label: "Text", icon: Type },
  { value: "multiple_choice", label: "Multiple choice", icon: CheckSquare },
  { value: "date_picker", label: "Date", icon: Calendar },
  { value: "multiple_select", label: "Checkboxes", icon: CheckSquare }, // Using Checkboxes for Person/Files if missing, we adapt standard ones
  { value: "email", label: "Email", icon: Mail },
  { value: "url", label: "URL", icon: LinkIcon },
  { value: "phone", label: "Phone", icon: Phone },
  { value: "file_upload", label: "Files & media", icon: FileUp },
  { value: "number", label: "Number", icon: Hash },
] as const;

export default function BuilderPage() {
  const router = useRouter();
  const [title, setTitle] = useState("Untitled Form");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [saving, setSaving] = useState(false);
  const [savedLink, setSavedLink] = useState<string | null>(null);
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null);

  // Popover state for internal question type changing
  const [popoverView, setPopoverView] = useState<Record<string, "main" | "type">>({});
  const [addQuestionPopoverOpen, setAddQuestionPopoverOpen] = useState<{ index: number | null, open: boolean }>({ index: null, open: false });

  // Click outside listener to remove active state
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".question-block") && !target.closest(".popover-content") && !target.closest("[data-radix-popper-content-wrapper]")) {
        setActiveQuestionId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const addQuestion = (type: QuestionType, index?: number | null) => {
    const newQuestion: Question = {
      id: nanoid(),
      type: type,
      title: "",
      required: false,
      showDescription: false,
      description: "",
    };
    
    if (typeof index === "number" && index !== null) {
      const updated = [...questions];
      updated.splice(index + 1, 0, newQuestion);
      setQuestions(updated);
    } else {
      setQuestions([...questions, newQuestion]);
    }
    setActiveQuestionId(newQuestion.id);
    setAddQuestionPopoverOpen({ index: null, open: false });
  };

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setQuestions(questions.map((q) => (q.id === id ? { ...q, ...updates } : q)));
  };

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  const moveQuestion = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === questions.length - 1)
    ) return;

    const newIndex = direction === "up" ? index - 1 : index + 1;
    const updated = [...questions];
    const temp = updated[index];
    updated[index] = updated[newIndex];
    updated[newIndex] = temp;
    setQuestions(updated);
  };

  const addOption = (questionId: string) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === questionId) {
          const ops = q.options || [];
          return { ...q, options: [...ops, { id: nanoid(), value: `Option ${ops.length + 1}` }] };
        }
        return q;
      })
    );
  };

  const updateOption = (questionId: string, optionId: string, value: string) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === questionId && q.options) {
          return {
            ...q,
            options: q.options.map((o) => (o.id === optionId ? { ...o, value } : o)),
          };
        }
        return q;
      })
    );
  };

  const removeOption = (questionId: string, optionId: string) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === questionId && q.options) {
          return {
            ...q,
            options: q.options.filter((o) => o.id !== optionId),
          };
        }
        return q;
      })
    );
  };

  const saveForm = async () => {
    setSaving(true);
    const formId = nanoid(10);
    const payload = {
      id: formId,
      title,
      description,
      questions,
    };

    try {
      const res = await fetch("/api/forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setSavedLink(formId);
      }
    } catch (error) {
      console.error("Failed to save", error);
    } finally {
      setSaving(false);
    }
  };

  const TypeSelectorContent = ({ onSelect, onClose }: { onSelect: (val: QuestionType) => void, onClose: () => void }) => (
    <div className="w-64 p-2 popover-content relative">
      <div className="flex items-center justify-between px-2 py-1 mb-2">
        <span className="text-sm font-semibold text-foreground">Select type</span>
        <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full hover:bg-muted" onClick={onClose}>
          <X className="h-3.5 w-3.5 text-muted-foreground" />
        </Button>
      </div>
      <div className="space-y-0.5 overflow-y-auto max-h-80 pr-1 custom-scrollbar">
        {QUESTION_TYPES.map(t => (
          <button
            key={t.value}
            onClick={() => onSelect(t.value as QuestionType)}
            className="w-full flex items-center gap-3 px-2 py-2 hover:bg-muted/60 rounded-md transition-colors text-sm text-foreground"
          >
            <div className="h-6 w-6 rounded flex items-center justify-center border border-border/50 bg-background/50 text-muted-foreground shrink-0">
              <t.icon className="h-3.5 w-3.5" />
            </div>
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );

  if (savedLink) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md bg-card border border-border rounded-lg p-5 shadow-sm">
          <CardHeader>
            <CardTitle className="text-center text-2xl font-bold text-foreground">Form Created!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 flex flex-col items-center">
            <p className="text-center text-muted-foreground">
              Your form has been successfully created and is ready to share.
            </p>
            <div className="flex w-full flex-col gap-3">
              <Button onClick={() => router.push(`/form/${savedLink}`)} className="bg-primary text-primary-foreground hover:opacity-90 rounded-md px-4 py-2 text-sm shadow-sm w-full h-11">
                View Public Form
              </Button>
              <Button onClick={() => router.push(`/results/${savedLink}`)} variant="outline" className="w-full h-11 border border-border text-sm shadow-sm">
                View Responses
              </Button>
              <Button onClick={() => {
                setSavedLink(null);
                setQuestions([]);
                setTitle("Untitled Form");
              }} variant="ghost" className="w-full h-11">
                Create Another Form
              </Button>
              <Button onClick={() => router.push(`/dashboard`)} variant="ghost" className="w-full h-11 text-muted-foreground">
                Go to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-32">
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e5e7eb;
          border-radius: 4px;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #27272a;
        }
      `}} />
      {/* Top Navigation */}
      <div className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="font-semibold px-2 py-1 rounded hover:bg-muted cursor-default transition-colors">
            Form builder
          </div>
          <div className="h-4 w-px bg-border"></div>
          <button onClick={() => router.push('/dashboard')} className="text-sm font-medium text-muted-foreground hover:text-foreground px-2 py-1 rounded hover:bg-muted transition-colors">
            Dashboard
          </button>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="hidden sm:flex items-center gap-2">
            <Eye className="w-4 h-4" /> Preview
          </Button>
          <Button 
            onClick={saveForm} 
            disabled={saving || questions.length === 0}
            className="bg-primary text-primary-foreground hover:opacity-90 h-9"
          >
            {saving ? "Saving..." : "Share form"}
          </Button>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 pt-12">
        {/* Form Header */}
        <div className="mb-12 px-2">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-transparent text-4xl font-bold tracking-tight text-foreground placeholder:text-muted-foreground focus:outline-none mb-4"
            placeholder="Form title"
          />
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-transparent text-lg text-muted-foreground placeholder:text-muted-foreground/50 focus:outline-none"
            placeholder="Description (optional)"
          />
        </div>

        {/* Question Blocks */}
        <div className="space-y-4 relative">
          {questions.map((q, index) => {
            const isActive = activeQuestionId === q.id;
            const isMultipleChoice = q.type === "multiple_choice" || q.type === "multiple_select";
            const currentView = popoverView[q.id] || "main";

            return (
              <div key={q.id} className="relative group question-block">
                {/* Floating Add Button Between Blocks (only visible on hover gap) */}
                <div className="absolute -top-4 inset-x-0 z-10">
                  <Popover 
                    open={addQuestionPopoverOpen.open && addQuestionPopoverOpen.index === (index - 1)} 
                    onOpenChange={(open) => setAddQuestionPopoverOpen({ open, index: open ? (index - 1) : null })}
                  >
                    <PopoverTrigger asChild>
                      <div className="w-full h-4 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6 rounded-full bg-background border border-border shadow-sm text-muted-foreground transition-transform hover:scale-110"
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 rounded-xl" align="start" side="right" sideOffset={16}>
                      <TypeSelectorContent 
                        onSelect={(type) => addQuestion(type, index - 1)} 
                        onClose={() => setAddQuestionPopoverOpen({ open: false, index: null })} 
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div
                  onClick={() => setActiveQuestionId(q.id)}
                  className={cn(
                    "relative rounded-xl border border-transparent p-6 transition-all duration-200",
                    isActive ? "bg-card shadow-sm border-primary/50 ring-1 ring-primary scale-[1.01]" : "hover:bg-muted/40 hover:border-border",
                  )}
                >
                  {/* Grip Handle */}
                  <div className={cn(
                    "absolute left-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground cursor-grab opacity-0 transition-opacity",
                    isActive ? "opacity-100" : "group-hover:opacity-100"
                  )}>
                    <GripVertical className="h-4 w-4" />
                  </div>

                  {/* Question Content */}
                  <div className="pl-4 pr-10">
                    <div className="flex flex-col gap-1 mb-3">
                      <div className="flex items-center gap-2">
                        {q.required && <span className="text-red-500 font-bold">*</span>}
                        <input
                          type="text"
                          value={q.title}
                          onChange={(e) => updateQuestion(q.id, { title: e.target.value })}
                          placeholder={`Question ${index + 1}`}
                          className={cn(
                            "w-full bg-transparent text-xl font-bold text-foreground placeholder:text-muted-foreground/40 focus:outline-none",
                            !isActive && "pointer-events-none"
                          )}
                          readOnly={!isActive}
                        />
                      </div>
                      
                      {q.showDescription && (
                        <input
                          type="text"
                          value={q.description || ""}
                          onChange={(e) => updateQuestion(q.id, { description: e.target.value })}
                          placeholder="Description (optional)"
                          className={cn(
                            "w-full bg-transparent text-sm text-muted-foreground placeholder:text-muted-foreground/50 focus:outline-none",
                            !isActive && "pointer-events-none"
                          )}
                          readOnly={!isActive}
                        />
                      )}
                    </div>

                    {/* Input Preview Base on Type */}
                    <div className="mt-4 opacity-80">
                      {q.type === "short_text" || q.type === "number" || q.type === "email" || q.type === "url" || q.type === "phone" ? (
                        <div className="w-full rounded-md border border-border bg-background/50 px-3 py-2 text-sm text-muted-foreground">
                          Respondent's answer
                        </div>
                      ) : q.type === "long_text" ? (
                        <div className="w-full rounded-md border border-border bg-background/50 px-3 py-2 h-20 text-sm text-muted-foreground">
                          Respondent's long answer...
                        </div>
                      ) : isMultipleChoice ? (
                        <div className="space-y-2">
                          {q.options?.map((opt, i) => (
                            <div key={opt.id} className="flex items-center gap-2">
                              <div className={cn(
                                "flex-shrink-0 border border-border",
                                q.type === "multiple_choice" ? "h-4 w-4 rounded-full" : "h-4 w-4 rounded-[4px]"
                              )} />
                              <input
                                type="text"
                                value={opt.value}
                                onChange={(e) => updateOption(q.id, opt.id, e.target.value)}
                                placeholder={`Option ${i + 1}`}
                                className={cn(
                                  "bg-transparent text-sm text-foreground focus:outline-none w-full",
                                  !isActive && "pointer-events-none"
                                )}
                                readOnly={!isActive}
                              />
                            </div>
                          ))}
                          {isActive && (
                            <div className="flex items-center gap-2 mt-2 group/add-option">
                              <div className="h-4 w-4 flex items-center justify-center">
                                <Plus className="h-3 w-3 text-muted-foreground group-hover/add-option:text-primary transition-colors" />
                              </div>
                              <button
                                onClick={() => addOption(q.id)}
                                className="text-sm text-muted-foreground group-hover/add-option:text-primary transition-colors outline-none"
                              >
                                Add option
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="w-full rounded-md border border-border border-dashed bg-background/20 px-3 py-4 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
                          {(() => {
                            const matchedType = QUESTION_TYPES.find(t => t.value === q.type);
                            return matchedType ? (
                              <>
                                <matchedType.icon className="w-4 h-4" />
                                {matchedType.label} input
                              </>
                            ) : null;
                          })()}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Contextual Hover Menu (Top Right) */}
                  <div className={cn(
                    "absolute right-4 top-4 transition-opacity",
                    isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                  )}>
                    <Popover onOpenChange={(open) => { if (!open) setPopoverView({ ...popoverView, [q.id]: "main" }); }}>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:bg-muted hover:text-foreground shadow-sm rounded-md border border-border bg-background">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-64 p-0 rounded-xl border border-border shadow-lg popover-content overflow-hidden" align="start" side="right" sideOffset={32}>
                        
                        {currentView === "main" ? (
                          <div className="p-2">
                            <div className="mb-2 px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                              Question Options
                            </div>
                            <div className="space-y-0.5">
                              <div className="flex items-center justify-between px-2 py-1.5 hover:bg-muted/50 rounded-md transition-colors cursor-pointer">
                                <span className="text-sm flex items-center gap-2 text-foreground">
                                  <span className="text-muted-foreground w-4 text-center">*</span> Required
                                </span>
                                <Switch checked={q.required} onCheckedChange={(v: boolean) => updateQuestion(q.id, { required: v })} />
                              </div>
                              <div className="flex items-center justify-between px-2 py-1.5 hover:bg-muted/50 rounded-md transition-colors cursor-pointer">
                                <span className="text-sm flex items-center gap-2 text-foreground">
                                  <Type className="h-4 w-4 text-muted-foreground" /> Description
                                </span>
                                <Switch checked={q.showDescription || false} onCheckedChange={(v: boolean) => updateQuestion(q.id, { showDescription: v })} />
                              </div>
                              <div className="flex items-center justify-between px-2 py-1.5 hover:bg-muted/50 rounded-md transition-colors cursor-pointer">
                                <span className="text-sm flex items-center gap-2 text-foreground">
                                  <MoreHorizontal className="h-4 w-4 text-muted-foreground" /> Long answer
                                </span>
                                <Switch 
                                  checked={q.type === "long_text"} 
                                  onCheckedChange={(v: boolean) => updateQuestion(q.id, { type: v ? "long_text" : "short_text" })} 
                                />
                              </div>
                            </div>

                            <div className="my-2 h-px bg-border/80" />
                            
                            <div className="px-2 py-1">
                              <button
                                onClick={() => setPopoverView({ ...popoverView, [q.id]: "type" })}
                                className="w-full flex items-center justify-between hover:bg-muted/50 px-2 py-1.5 rounded-md transition-colors text-sm"
                              >
                                <div className="flex items-center gap-2 text-foreground">
                                  {QUESTION_TYPES.find(t => t.value === q.type)?.label || "Select type"}
                                </div>
                                <span className="text-muted-foreground">v</span> {/* Simple chevron down representation */}
                              </button>
                            </div>

                            <div className="my-2 h-px bg-border/80" />

                            <div className="space-y-0.5">
                              <button 
                                className="w-full flex items-center gap-2 px-2 py-1.5 hover:bg-muted/50 rounded-md transition-colors text-sm text-foreground disabled:opacity-50"
                                onClick={() => moveQuestion(index, "up")}
                                disabled={index === 0}
                              >
                                <ArrowUp className="h-4 w-4 text-muted-foreground" /> Move up
                              </button>
                              <button 
                                className="w-full flex items-center gap-2 px-2 py-1.5 hover:bg-muted/50 rounded-md transition-colors text-sm text-foreground disabled:opacity-50"
                                onClick={() => moveQuestion(index, "down")}
                                disabled={index === questions.length - 1}
                              >
                                <ArrowDown className="h-4 w-4 text-muted-foreground" /> Move down
                              </button>
                              <button 
                                className="w-full flex items-center gap-2 px-2 py-1.5 hover:bg-destructive/10 text-destructive rounded-md transition-colors text-sm"
                                onClick={() => removeQuestion(q.id)}
                              >
                                <Trash2 className="h-4 w-4" /> Delete question
                              </button>
                            </div>
                          </div>
                        ) : (
                          // Type Selector Sub-menu View
                          <div className="flex flex-col h-[320px]">
                             <div className="flex items-center justify-between px-3 py-2 border-b border-border shadow-sm">
                                <span className="text-sm font-semibold text-foreground">Select type</span>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-6 w-6 rounded-full hover:bg-muted" 
                                  onClick={() => setPopoverView({ ...popoverView, [q.id]: "main" })}
                                >
                                  <X className="h-3.5 w-3.5 text-muted-foreground" />
                                </Button>
                             </div>
                             <div className="overflow-y-auto p-2 custom-scrollbar flex-1">
                                {QUESTION_TYPES.map(t => (
                                  <button
                                    key={t.value}
                                    onClick={() => {
                                      updateQuestion(q.id, { type: t.value as QuestionType });
                                      setPopoverView({ ...popoverView, [q.id]: "main" });
                                    }}
                                    className={cn(
                                      "w-full flex items-center gap-3 px-2 py-2 hover:bg-muted/60 rounded-md transition-colors text-sm text-foreground",
                                      q.type === t.value && "bg-muted font-medium"
                                    )}
                                  >
                                    <div className="h-6 w-6 rounded flex items-center justify-center border border-border/50 bg-background/50 text-muted-foreground shrink-0">
                                      <t.icon className="h-3.5 w-3.5" />
                                    </div>
                                    {t.label}
                                  </button>
                                ))}
                             </div>
                          </div>
                        )}
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Global Add Button */}
        <div className="mt-8 pb-20">
          <Popover 
            open={addQuestionPopoverOpen.open && addQuestionPopoverOpen.index === null} 
            onOpenChange={(open) => setAddQuestionPopoverOpen({ open, index: null })}
          >
            <PopoverTrigger asChild>
              <div className="w-full flex justify-center cursor-pointer">
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-full pr-5 pl-4 transition-colors border border-border shadow-sm h-10 w-fit pointer-events-auto"
                >
                  <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                    <Plus className="h-3.5 w-3.5" />
                  </div>
                  <span className="font-medium">Add question</span>
                </Button>
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 rounded-xl" align="start" side="right" sideOffset={16}>
              <TypeSelectorContent 
                onSelect={(type) => addQuestion(type, null)} 
                onClose={() => setAddQuestionPopoverOpen({ open: false, index: null })} 
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
}
