import fs from "fs/promises";
import path from "path";
import { Form, Response } from "./types";

const dataDir = path.join(process.cwd(), "data");
const formsFile = path.join(dataDir, "forms.json");
const responsesFile = path.join(dataDir, "responses.json");

async function ensureDataFiles() {
  try {
    await fs.mkdir(dataDir, { recursive: true });
    try {
      await fs.access(formsFile);
    } catch {
      await fs.writeFile(formsFile, JSON.stringify([]));
    }
    try {
      await fs.access(responsesFile);
    } catch {
      await fs.writeFile(responsesFile, JSON.stringify([]));
    }
  } catch (error) {
    console.error("Error ensuring data files:", error);
  }
}

export async function getForms(): Promise<Form[]> {
  await ensureDataFiles();
  const data = await fs.readFile(formsFile, "utf-8");
  return JSON.parse(data);
}

export async function getForm(id: string): Promise<Form | undefined> {
  const forms = await getForms();
  return forms.find((f) => f.id === id);
}

export async function saveForm(form: Form): Promise<void> {
  const forms = await getForms();
  forms.push(form);
  await fs.writeFile(formsFile, JSON.stringify(forms, null, 2));
}

export async function getResponses(formId: string): Promise<Response[]> {
  await ensureDataFiles();
  const data = await fs.readFile(responsesFile, "utf-8");
  const responses: Response[] = JSON.parse(data);
  return responses.filter((r) => r.formId === formId);
}

export async function saveResponse(response: Response): Promise<void> {
  await ensureDataFiles();
  const data = await fs.readFile(responsesFile, "utf-8");
  const responses: Response[] = JSON.parse(data);
  responses.push(response);
  await fs.writeFile(responsesFile, JSON.stringify(responses, null, 2));
}
