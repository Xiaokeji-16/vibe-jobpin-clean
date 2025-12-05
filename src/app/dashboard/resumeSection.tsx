// app/dashboard/ResumeSection.tsx
"use client";

import { useState } from "react";

type ParsedResume = {
  name?: string;
  email?: string;
  phone?: string;
  rawSkills?: string;
  rawText?: string;
};

export default function ResumeSection() {
  const [parsed, setParsed] = useState<ParsedResume | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setIsParsing(true);

    try {
      const text = await readFileAsText(file);

      const name = extractName(text);
      const email = extractEmail(text);
      const phone = extractPhone(text);
      const rawSkills = extractSkillsLine(text);

      setParsed({
        name,
        email,
        phone,
        rawSkills,
        rawText: text.slice(0, 800), // 只展示前 800 字，避免太长
      });
    } catch (err) {
      console.error(err);
      setError("Failed to read file. Please try a .txt or simple PDF export.");
    } finally {
      setIsParsing(false);
    }
  }

  return (
    <div className="rounded-xl border border-gray-800 bg-[#050505] p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">Resume summary</h2>

        <label className="px-3 py-1.5 text-xs rounded-md border border-gray-600 hover:bg-gray-900 cursor-pointer">
          {parsed ? "Re-upload resume" : "Upload resume"}
          <input
            type="file"
            accept=".txt,.pdf"
            className="hidden"
            onChange={handleFileChange}
          />
        </label>
      </div>

      {!parsed && (
        <>
          <p className="text-sm text-gray-400 mb-3">
            No resume uploaded yet. Upload your resume to see a structured
            summary of your profile, skills and work history here.
          </p>
          <p className="text-xs text-gray-500 mb-4">
            For this demo, a .txt resume works best. You can export your CV as
            plain text and upload it.
          </p>
        </>
      )}

      {error && (
        <p className="text-xs text-red-400 mb-3">
          {error}
        </p>
      )}

      {isParsing && (
        <p className="text-sm text-blue-400 mb-3">
          Analysing your resume with AI vibes… ✨
        </p>
      )}

      {parsed && (
        <div className="space-y-3 text-sm text-gray-200">
          <div>
            <h3 className="font-semibold mb-1">Basic info</h3>
            <ul className="text-gray-300 space-y-1">
              <li>
                <span className="text-gray-500">Name: </span>
                {parsed.name || "Not detected"}
              </li>
              <li>
                <span className="text-gray-500">Email: </span>
                {parsed.email || "Not detected"}
              </li>
              <li>
                <span className="text-gray-500">Phone: </span>
                {parsed.phone || "Not detected"}
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-1">Skills (raw)</h3>
            <p className="text-gray-300">
              {parsed.rawSkills || "No skills line detected. Try adding a 'Skills:' section in your resume."}
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-1">Preview (first 800 chars)</h3>
            <p className="text-xs text-gray-400 whitespace-pre-wrap border border-gray-800 rounded-md p-2 bg-black/40">
              {parsed.rawText}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- helpers ---------- */

function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}

function extractEmail(text: string): string | undefined {
  const match = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  return match?.[0];
}

function extractPhone(text: string): string | undefined {
  // 非常粗略：匹配带 +61、+86 或 10~11 位数字
  const match = text.match(/(\+?\d[\d\s\-]{8,15})/);
  return match?.[0];
}

function extractName(text: string): string | undefined {
  // Demo: 取第一行，或者找以 "Name:" 开头的行
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const nameLine =
    lines.find((l) => /^name[:\-]/i.test(l)) || lines[0];

  if (!nameLine) return undefined;

  return nameLine.replace(/^name[:\-]\s*/i, "");
}

function extractSkillsLine(text: string): string | undefined {
  const lines = text.split(/\r?\n/);
  const skillsLine = lines.find((l) =>
    /^skills[:\-]/i.test(l.trim())
  );
  return skillsLine?.replace(/^skills[:\-]\s*/i, "");
}