import { NextRequest, NextResponse } from "next/server";
import { getForm } from "@/lib/storage";

export async function GET(
  req: NextRequest,
  { params }: { params: { formId: string } }
) {
  try {
    const { formId } = await params;
    const form = await getForm(formId);
    if (!form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }
    return NextResponse.json({ form });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch form" }, { status: 500 });
  }
}
