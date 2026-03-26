import { NextRequest, NextResponse } from "next/server";
import { getResponses } from "@/lib/storage";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ formId: string }> }
) {
  try {
    const { formId } = await context.params;
    const responses = await getResponses(formId);
    return NextResponse.json({ responses });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch responses" }, { status: 500 });
  }
}
