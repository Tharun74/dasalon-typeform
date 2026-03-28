import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Form from "@/lib/models/Form";

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ formId: string }> }
) {
  try {
    const { formId } = await context.params;
    await connectToDatabase();
    const form = await Form.findOne({ id: formId });
    if (!form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }
    return NextResponse.json({ form });
  } catch (error) {
    console.error("Fetch form error:", error);
    return NextResponse.json({ error: "Failed to fetch form" }, { status: 500 });
  }
}
