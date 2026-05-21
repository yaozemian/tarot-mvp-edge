import { client } from "./edgespark";
import type { ReadingRecord } from "../types/tarot";

export async function getCloudReadingRecords() {
  const response = await client.api.fetch("/api/readings");

  if (!response.ok) {
    throw new Error("Failed to load cloud reading records");
  }

  const data = (await response.json()) as { records: ReadingRecord[] };
  return data.records;
}

export async function getCloudReadingRecord(id: string) {
  const response = await client.api.fetch(`/api/readings/${id}`);

  if (!response.ok) {
    throw new Error("Failed to load cloud reading record");
  }

  const data = (await response.json()) as { record: ReadingRecord };
  return data.record;
}

export async function saveCloudReadingRecord(record: ReadingRecord) {
  const response = await client.api.fetch("/api/readings", {
    body: JSON.stringify(record),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });

  if (!response.ok) {
    throw new Error("Failed to save cloud reading record");
  }

  const data = (await response.json()) as { record: ReadingRecord };
  return data.record;
}
