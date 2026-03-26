"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Question, QuestionType, Option } from "@/lib/types";
import { nanoid } from "nanoid";
import { Plus, Trash2, GripVertical, Save, ArrowRight } from "lucide-react";

export default function BuilderPage() {
  const router = useRouter();
  const [title, setTitle] = useState("Untitled Form");
  const [description, setDescription] = useState("Please fill out this form.");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [saving, setSaving] = useState(false);
  const [savedLink, setSavedLink] = useState<string | null>(null);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: nanoid(),
        type: "short_text",
        title: "",
        required: false,
      },
    ]);
  };

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setQuestions(questions.map((q) => (q.id === id ? { ...q, ...updates } : q)));
  };

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id));
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

  if (savedLink) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md bg-card border border-border rounded-lg p-5 shadow-sm">
          <CardHeader>
            <CardTitle className="text-center text-2xl font-bold text-primary">Form Created!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 flex flex-col items-center">
            <p className="text-center text-muted-foreground">
              Your form has been successfully created and is ready to share.
            </p>
            <div className="flex w-full flex-col gap-3">
              <Button onClick={() => router.push(`/form/${savedLink}`)} className="bg-primary text-primary-foreground hover:opacity-90 rounded-md px-4 py-2 text-sm shadow-sm w-full h-11">
                View Public Form
              </Button>
              <Button onClick={() => router.push(`/results/${savedLink}`)} variant="outline" className="w-full h-11 border border-border bg-white text-sm shadow-sm">
                View Responses
              </Button>
              <Button onClick={() => {
                setSavedLink(null);
                setQuestions([]);
                setTitle("Untitled Form");
              }} variant="ghost" className="w-full h-11">
                Create Another Form
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 pt-4">
      <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Form Builder</h1>
          <Button onClick={saveForm} disabled={saving || questions.length === 0} className="bg-primary text-primary-foreground hover:opacity-90 rounded-md px-4 py-2 text-sm shadow-sm gap-2">
            <Save className="h-4 w-4" />
            {saving ? "Saving..." : "Save Form"}
          </Button>
        </div>

        <Card className="bg-card border border-border rounded-lg p-5 space-y-4 shadow-sm">
          <CardHeader className="p-0">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="border-0 text-3xl font-bold focus-visible:ring-0 px-0 h-auto w-full shadow-none bg-transparent"
              placeholder="Form Title"
            />
          </CardHeader>
          <CardContent className="p-0">
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="border-0 text-muted-foreground focus-visible:ring-0 px-0 resize-none w-full shadow-none bg-transparent"
              placeholder="Form Description"
            />
          </CardContent>
        </Card>

        <div className="space-y-6">
          {questions.map((q, index) => (
            <Card key={q.id} className="relative group bg-card border border-border rounded-lg p-5 space-y-4 shadow-sm hover:shadow-md transition">
              <div className="absolute left-0 top-0 bottom-0 w-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-grab">
                <GripVertical className="h-4 w-4 text-muted-foreground" />
              </div>
              <CardContent className="p-0 pl-6">
                <div className="flex flex-col gap-4 mb-4">
                  <Input
                    value={q.title}
                    onChange={(e) => updateQuestion(q.id, { title: e.target.value })}
                    placeholder="Question Title"
                    className="w-full h-11 px-4 rounded-md border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition shadow-sm font-medium"
                  />
                  <Select
                    value={q.type}
                    onValueChange={(val: string) => updateQuestion(q.id, { type: val as QuestionType })}
                  >
                    <SelectTrigger className="h-11 rounded-md border border-border bg-white px-3 text-sm shadow-sm focus:ring-2 focus:ring-primary/20 w-full">
                      <SelectValue placeholder="Question Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="short_text">Short Text</SelectItem>
                      <SelectItem value="long_text">Long Text</SelectItem>
                      <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                      <SelectItem value="multiple_select">Checkboxes</SelectItem>
                      <SelectItem value="number">Number</SelectItem>
                      <SelectItem value="rating">Rating (1-5)</SelectItem>
                      <SelectItem value="yes_no">Yes / No</SelectItem>
                      <SelectItem value="date_picker">Date</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {(q.type === "multiple_choice" || q.type === "multiple_select") && (
                  <div className="space-y-3 mt-4 ml-2 border-l-2 pl-4 border-border">
                    {q.options?.map((opt, i) => (
                      <div key={opt.id} className="flex items-center gap-2">
                        <div className="h-4 w-4 rounded-full border border-primary/50 flex-shrink-0" />
                        <Input
                          value={opt.value}
                          onChange={(e) => updateOption(q.id, opt.id, e.target.value)}
                          placeholder={`Option ${i + 1}`}
                          className="w-full h-11 px-4 rounded-md border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition shadow-sm"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeOption(q.id, opt.id)}
                          className="w-11 h-11 text-muted-foreground hover:text-destructive flex items-center justify-center shrink-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => addOption(q.id)}
                      className="text-primary mt-2 flex items-center gap-1 h-9 px-3"
                    >
                      <Plus className="h-4 w-4" /> Add Option
                    </Button>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 mt-4 border-t border-border">
                  <div className="flex items-center gap-2">
                    <Switch
                      id={`required-${q.id}`}
                      checked={q.required}
                      onCheckedChange={(val: boolean) => updateQuestion(q.id, { required: val })}
                    />
                    <span className="text-sm text-muted-foreground">Required</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeQuestion(q.id)}
                    className="w-9 h-9 flex items-center justify-center"
                  >
                    <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive transition" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Button
          onClick={addQuestion}
          variant="outline"
          className="w-full border-2 border-dashed border-border rounded-lg py-6 flex items-center justify-center gap-2 text-sm text-muted-foreground hover:border-primary hover:text-primary transition cursor-pointer"
        >
          <Plus className="h-5 w-5" /> Add Question
        </Button>
      </div>
    </div>
  );
}
