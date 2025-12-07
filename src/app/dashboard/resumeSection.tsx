"use client";

import { useState } from "react";
import type { ChangeEvent } from "react";

type ParsedResume = {
  name?: string;
  email?: string;
  phone?: string;
  skills?: string; 
};

type Props = {
  // 可选：让 Dashboard 联动 stepper
  onResumeUploaded?: (parsed: ParsedResume) => void;
};

export default function ResumeSection({ onResumeUploaded }: Props) {
  const [parsed, setParsed] = useState<ParsedResume | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setParsed(null);
    setIsParsing(true);

    try {
      const form = new FormData();
      form.append("file", file);

      const res = await fetch("/api/parse-resume", {
        method: "POST",
        body: form,
      });

      const payload = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(
          payload.error ||
            "Failed to parse resume. Please try another file."
        );
      }

      const data = payload as ParsedResume;

      setParsed(data);
      onResumeUploaded?.(data);
    } catch (err: any) {
      console.error(err);
      setError(
        err?.message ||
          "Failed to parse resume. Please try another file."
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
            accept=".txt,.docx,.pdf"
            className="hidden"
            onChange={handleFileChange}
          />
        </label>
      </div>

      {/* 初始提示文案 */}
      {!parsed && !error && !isParsing && (
        <>
          <p className="text-sm text-gray-400 mb-2">
            No resume uploaded yet. Upload your resume to see a structured
            summary of your profile, skills and work history here.
          </p>
          <p className="text-xs text-gray-500">
            Supported formats: <b>.docx, .txt</b>. PDF files are not
            parsed in this demo; please export your resume as .docx or
            .txt before uploading.
          </p>
        </>
      )}

      {/* 正在解析 */}
      {isParsing && (
        <p className="text-sm text-blue-400 mb-3">
          Analysing your resume… ✨
        </p>
      )}

      {/* 错误提示 */}
      {error && (
        <p className="text-xs text-red-400 mb-3">{error}</p>
      )}

      {/* 解析结果 */}
      {parsed && !isParsing && (
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
              {parsed.skills ||
                "No skills section detected. Try adding a 'Skills:' or 'Key Skills:' block in your resume."}
            </p>
          </div>

          <p className="text-[11px] text-gray-500">
            Note: For PDF/Word resumes we extract text on the server and
            run simple regex-based parsing. In a real product this would
            be replaced by a more robust parser.
          </p>
        </div>
      )}
    </div>
  );
}