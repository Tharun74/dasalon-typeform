import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Form from "@/lib/models/Form";

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    await connectToDatabase();
    
    // Create new form or update if id exists
    const form = await Form.findOneAndUpdate(
      { id: data.id },
      { ...data },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    
    return NextResponse.json({ success: true, formId: form.id });
  } catch (error) {
    console.error("Form save error:", error);
    return NextResponse.json({ error: "Failed to save form" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    
    // Fetch all forms from MongoDB, sorted by newest
    const forms = await Form.find().sort({ createdAt: -1 });
    
    return NextResponse.json({ forms });
  } catch (error) {
    console.error("Fetch forms list error:", error);
    return NextResponse.json({ error: "Failed to fetch forms" }, { status: 500 });
  }
}
