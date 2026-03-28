import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Submission from "@/lib/models/Submission";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ formId: string }> }
) {
  try {
    const { formId } = await context.params;
    await connectToDatabase();
    const responses = await Submission.find({ formId }).sort({ createdAt: -1 });
    return NextResponse.json({ responses });
  } catch (error) {
    console.error("Fetch responses error:", error);
    return NextResponse.json({ error: "Failed to fetch responses" }, { status: 500 });
  }
}
