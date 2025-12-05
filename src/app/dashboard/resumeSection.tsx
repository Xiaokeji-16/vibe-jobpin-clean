// app/dashboard/ResumeSection.tsx
"use client";

/**
 * Simple front-end resume upload & parsing demo.
 * Supports .txt, .pdf and .doc/.docx uploads.
 * We read the file as text and try to extract basic fields (name/email/phone/skills).
 * For binary formats (PDF/Word) the underlying text may look noisy,
 * but we only show structured fields, never the raw content, to avoid gibberish in UI.
 */

import { useState } from "react";

type ParsedResume = {
  name?: string;
  email?: string;
  phone?: string;
  rawSkills?: string;
};

export default function ResumeSection() {
  const [parsed, setParsed] = useState<ParsedResume | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setParsed(null);
    setIsParsing(true);

    try {
      // 对于 .txt / .pdf / .doc / .docx，我都用 readAsText 简单读取
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
      });
    } catch (err) {
      console.error(err);
      setError(
        "Failed to read file. Please try another resume file (txt/pdf/doc)."
      );
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
            // ✅ 支持 txt / pdf / doc / docx
            accept=".txt,.pdf,.doc,.docx"
            className="hidden"
            onChange={handleFileChange}
          />
        </label>
      </div>

      {!parsed && !error && (
        <>
          <p className="text-sm text-gray-400 mb-3">
            No resume uploaded yet. Upload your resume to see a structured
            summary of your profile, skills and work history here.
          </p>
          <p className="text-xs text-gray-500 mb-4">
            This demo accepts{" "}
            <span className="font-semibold">.txt, .pdf and .doc/.docx</span>{" "}
            resumes. For best results, a clean .txt export works best.
          </p>
        </>
      )}

      {error && (
        <p className="text-xs text-red-400 mb-3">{error}</p>
      )}

      {isParsing && (
        <p className="text-sm text-blue-400 mb-3">
          Analysing your resume… ✨
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
              {parsed.rawSkills ||
                "No skills line detected. Try adding a 'Skills:' section in your resume."}
            </p>
          </div>

          <p className="text-[11px] text-gray-500">
            Note: For PDF/Word resumes we run simple text extraction and
            regex-based parsing. In a real product this would be replaced by a
            proper server-side parser.
          </p>
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
    // 对所有支持的格式都尝试 readAsText
    reader.readAsText(file);
  });
}

function extractEmail(text: string): string | undefined {
  const match = text.match(
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/
  );
  return match?.[0];
}

function extractPhone(text: string): string | undefined {
  // 非常粗糙的 phone 匹配（只为了 demo）
  const match = text.match(/(\+?\d[\d\s\-]{8,15})/);
  return match?.[0];
}

function extractName(text: string): string | undefined {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

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