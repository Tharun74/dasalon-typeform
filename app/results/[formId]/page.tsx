"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Form, Response } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ResultsPage() {
  const params = useParams();
  const formId = params.formId as string;

  const [form, setForm] = useState<Form | null>(null);
  const [responses, setResponses] = useState<Response[]>([]);
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

  if (loading) return <div className="flex h-screen items-center justify-center">Loading results...</div>;
  if (!form) return <div className="flex h-screen items-center justify-center">Form not found.</div>;

  return (
    <div className="min-h-screen bg-gray-50/50 py-12 px-4">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="flex items-center space-x-4 mb-8">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{form.title}</h1>
            <p className="text-muted-foreground">{responses.length} Submissions</p>
          </div>
        </div>

        {responses.length === 0 ? (
          <Card className="shadow-sm">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <p className="text-xl text-muted-foreground mb-4">No responses yet.</p>
              <p className="text-muted-foreground">Share your form to start collecting responses!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {responses.map((resp, index) => (
              <Card key={resp.id} className="shadow-sm overflow-hidden border-t-4 border-t-secondary">
                <CardHeader className="bg-muted/30 pb-4">
                  <CardTitle className="text-lg">Response #{index + 1}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Submitted at {new Date(resp.submittedAt).toLocaleString()}
                  </p>
                </CardHeader>
                <CardContent className="p-0 divide-y">
                  {form.questions.map((q) => {
                    const ans = resp.answers.find((a) => a.questionId === q.id);
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
                      <div key={q.id} className="p-4 flex flex-col sm:flex-row sm:items-start sm:justify-between py-4">
                        <div className="font-medium text-muted-foreground sm:w-1/3 pr-4 mb-2 sm:mb-0">
                          {q.title}
                        </div>
                        <div className="sm:w-2/3 text-foreground font-medium">
                          {displayValue !== undefined && displayValue !== null && displayValue !== "" 
                            ? displayValue.toString() 
                            : <span className="text-muted-foreground font-normal italic">No answer</span>}
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
