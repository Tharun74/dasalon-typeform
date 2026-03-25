import { NextRequest, NextResponse } from "next/server";
import { saveResponse } from "@/lib/storage";
import { nanoid } from "nanoid";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const responseId = nanoid();
    
    await saveResponse({
      id: responseId,
      formId: data.formId,
      answers: data.answers,
      submittedAt: new Date().toISOString(),
    });
    
    return NextResponse.json({ success: true, id: responseId });
  } catch (error) {
    console.error("Submit error:", error);
    return NextResponse.json({ error: "Failed to submit response" }, { status: 500 });
  }
}
