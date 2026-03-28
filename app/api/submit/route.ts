import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Submission from "@/lib/models/Submission";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    await connectToDatabase();
    
    // Create new submission under MongoDB schema
    const submission = await Submission.create({
      formId: data.formId,
      answers: data.answers,
    });
    
    return NextResponse.json({ success: true, id: submission._id });
  } catch (error) {
    console.error("Submit error:", error);
    return NextResponse.json({ error: "Failed to submit response" }, { status: 500 });
  }
}
