import { NextRequest, NextResponse } from "next/server";
import { saveForm } from "@/lib/storage";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    await saveForm({
      ...data,
      createdAt: new Date().toISOString(),
    });
    return NextResponse.json({ success: true, formId: data.id });
  } catch (error) {
    console.error("Form save error:", error);
    return NextResponse.json({ error: "Failed to save form" }, { status: 500 });
  }
}
