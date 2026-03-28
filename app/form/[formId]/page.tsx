"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Form, Response, Answer, Question } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

export default function PublicFormPage() {
  const params = useParams();
  const router = useRouter();
  const formId = params.formId as string;

  const [form, setForm] = useState<Form | null>(null);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    async function loadForm() {
      try {
        const res = await fetch(`/api/forms/${formId}`);
        if (res.ok) {
          const data = await res.json();
          setForm(data.form);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    loadForm();
  }, [formId]);

  const handleInputChange = (questionId: string, value: any) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    if (errors[questionId]) {
      setErrors((prev) => {
        const newErrs = { ...prev };
        delete newErrs[questionId];
        return newErrs;
      });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    form?.questions.forEach((q) => {
      if (q.required) {
        const val = answers[q.id];
        if (val === undefined || val === null || val === "" || (Array.isArray(val) && val.length === 0)) {
          newErrors[q.id] = "This field is required";
        }
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submitForm = async () => {
    if (!validate()) return;
    setSubmitting(true);

    const payloadAnswers: Answer[] = Object.entries(answers).map(([qId, val]) => ({
      questionId: qId,
      value: val,
    }));

    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formId: form?.id, answers: payloadAnswers }),
      });
      if (res.ok) {
        setSubmitted(true);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center bg-background">Loading form...</div>;
  if (!form) return <div className="flex h-screen items-center justify-center bg-background">Form not found.</div>;

  if (submitted) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md bg-card border border-border rounded-lg p-5 shadow-sm">
          <CardHeader>
            <CardTitle className="text-center text-3xl font-bold">Thank You!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-muted-foreground">Your response has been submitted successfully.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 pt-4">
      <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">
        <Card className="bg-card border border-border rounded-lg p-5 space-y-4 shadow-sm">
          <CardHeader className="p-0 pb-2">
            <CardTitle className="text-4xl font-bold">{form.title}</CardTitle>
            <p className="text-muted-foreground mt-2 text-lg">{form.description}</p>
          </CardHeader>
        </Card>

        {form.questions.map((q) => (
          <Card key={q.id} className={`bg-card border rounded-lg p-5 space-y-4 shadow-sm hover:shadow-md transition ${errors[q.id] ? "border-destructive ring-1 ring-destructive/20" : "border-border"}`}>
            <CardContent className="p-0">
              <Label className="text-xl font-medium mb-4 block">
                {q.title} {q.required && <span className="text-destructive ml-1">*</span>}
              </Label>

              <div className="mt-4">
                {q.type === "short_text" && (
                  <Input
                    placeholder="Type your answer here..."
                    className="w-full h-11 px-4 rounded-md border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition shadow-sm"
                    value={answers[q.id] || ""}
                    onChange={(e) => handleInputChange(q.id, e.target.value)}
                  />
                )}
                {q.type === "long_text" && (
                  <Textarea
                    placeholder="Type your answer here..."
                    className="w-full min-h-[120px] p-4 rounded-md border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition shadow-sm resize-y"
                    value={answers[q.id] || ""}
                    onChange={(e) => handleInputChange(q.id, e.target.value)}
                  />
                )}
                {q.type === "number" && (
                  <Input
                    type="number"
                    placeholder="0"
                    className="w-full max-w-xs h-11 px-4 rounded-md border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition shadow-sm"
                    value={answers[q.id] || ""}
                    onChange={(e) => handleInputChange(q.id, parseFloat(e.target.value))}
                  />
                )}
                {q.type === "multiple_choice" && q.options && (
                  <RadioGroup
                    value={answers[q.id] || ""}
                    onValueChange={(val: string) => handleInputChange(q.id, val)}
                    className="space-y-3"
                  >
                    {q.options.map((opt) => (
                      <div key={opt.id} className="flex items-center space-x-3 bg-secondary/30 border border-transparent hover:border-border p-3 rounded-md transition-colors">
                        <RadioGroupItem value={opt.id} id={`opt-${opt.id}`} className="bg-white" />
                        <Label htmlFor={`opt-${opt.id}`} className="text-sm cursor-pointer flex-1">{opt.value}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}
                {q.type === "multiple_select" && q.options && (
                  <div className="space-y-3">
                    {q.options.map((opt) => {
                      const checked = (answers[q.id] || []).includes(opt.id);
                      return (
                        <div key={opt.id} className="flex items-center space-x-3 bg-secondary/30 border border-transparent hover:border-border p-3 rounded-md transition-colors">
                          <Checkbox
                            id={`opt-${opt.id}`}
                            checked={checked}
                            onCheckedChange={(c) => { 
                              const cur = answers[q.id] || [];
                              const next = c ? [...cur, opt.id] : cur.filter((id: string) => id !== opt.id);
                              handleInputChange(q.id, next);
                            }}
                            className="bg-white"
                          />
                          <Label htmlFor={`opt-${opt.id}`} className="text-sm cursor-pointer flex-1">{opt.value}</Label>
                        </div>
                      );
                    })}
                  </div>
                )}
                {q.type === "rating" && (
                  <div className="flex flex-wrap gap-3">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <div key={num}
                        onClick={() => handleInputChange(q.id, num)}
                        className={`h-11 w-11 flex items-center justify-center rounded-md border cursor-pointer text-sm font-medium transition-all shadow-sm
                          ${answers[q.id] === num ? "border-primary bg-primary text-primary-foreground" : "border-border bg-white hover:border-primary/50 text-foreground"}
                        `}
                      >
                        {num}
                      </div>
                    ))}
                  </div>
                )}
                {q.type === "yes_no" && (
                  <div className="flex gap-4">
                    {["Yes", "No"].map((opt) => (
                      <div key={opt}
                        onClick={() => handleInputChange(q.id, opt)}
                        className={`h-11 px-8 flex items-center justify-center rounded-md border cursor-pointer text-sm font-medium transition-all shadow-sm
                          ${answers[q.id] === opt ? "border-primary bg-primary text-primary-foreground" : "border-border bg-white hover:border-primary/50 text-foreground"}
                        `}
                      >
                        {opt}
                      </div>
                    ))}
                  </div>
                )}
                {q.type === "date_picker" && (
                  <Input
                    type="date"
                    className="w-full max-w-sm h-11 px-4 rounded-md border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition shadow-sm"
                    value={answers[q.id] || ""}
                    onChange={(e) => handleInputChange(q.id, e.target.value)}
                  />
                )}
              </div>

              {errors[q.id] && <p className="text-destructive mt-3 text-sm font-medium">{errors[q.id]}</p>}
            </CardContent>
          </Card>
        ))}

        <div className="pt-2">
          <Button
            className="bg-primary text-primary-foreground hover:opacity-90 rounded-md px-4 py-2 text-sm shadow-sm w-full h-11 transition-all"
            disabled={submitting}
            onClick={submitForm}
          >
            {submitting ? "Submitting..." : "Submit Answers"}
          </Button>
        </div>
      </div>
    </div>
  );
}

