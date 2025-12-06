"use client";

/**
 * ResumeSection (demo)
 *
 * - 支持 .txt / .pdf / .doc / .docx
 * - 使用 FileReader.readAsText 做“轻量解析”
 * - 对 PDF 做了更保守的策略，避免把 %PDF / 时间戳 当成 Name / Phone
 * - Phone 只接受“像澳洲号码”的格式（+61... 或 0 开头 10 位）
 */

import React, { useState, ChangeEvent } from "react";

type ParsedResume = {
  name?: string;
  email?: string;
  phone?: string;
  skillsSnippet?: string;
};

type ResumeSectionProps = {
  /** 上传成功后回调（用于点亮 stepper，可选） */
  onResumeUploaded?: () => void;
};

export default function ResumeSection({ onResumeUploaded }: ResumeSectionProps) {
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
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
      const text = await readFileAsText(file);

      // ✅ 更鲁棒的 PDF 检测：扩展名 + 内容前 80 字符是否包含 %PDF-
      const looksLikePdfHeader = text.slice(0, 80).includes("%PDF-");
      const isPdf = ext === "pdf" || looksLikePdfHeader;

      const email = extractEmail(text);
      const phone = extractPhone(text, { isPdf });
      const name = extractName(text, { isPdf });
      const skillsSnippet = extractSkillsSnippet(text);

      setParsed({
        name,
        email,
        phone,
        skillsSnippet,
      });

      onResumeUploaded?.();
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
            accept=".txt,.pdf,.doc,.docx"
            className="hidden"
            onChange={handleFileChange}
          />
        </label>
      </div>

      {/* 初始提示 */}
      {!parsed && !error && !isParsing && (
        <>
          <p className="text-sm text-gray-400 mb-3">
            No resume uploaded yet. Upload your resume to see a structured
            summary of your profile, skills and work history here.
          </p>
          <p className="text-xs text-gray-500 mb-4">
            This demo accepts{" "}
            <span className="font-semibold">.txt, .pdf and .doc/.docx</span>{" "}
            resumes. For best results, a clean .txt or .docx export works best.
          </p>
        </>
      )}

      {/* 错误信息 */}
      {error && <p className="text-xs text-red-400 mb-3">{error}</p>}

      {/* 解析中提示 */}
      {isParsing && (
        <p className="text-sm text-blue-400 mb-3">
          Analysing your resume… ✨
        </p>
      )}

      {/* 解析结果 */}
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
              {parsed.skillsSnippet ||
                "No skills section detected. Try adding a 'Skills' or 'Key Skills' block in your resume."}
            </p>
          </div>

          <p className="text-[11px] text-gray-500">
            Note: For PDF/Word resumes we run simple text extraction and
            regex-based parsing on the client side. In a real product this would
            be replaced by a proper server-side parser.
          </p>
        </div>
      )}
    </div>
  );
}

/* ---------------- helpers ---------------- */

function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}

function extractEmail(text: string): string | undefined {
  const match = text.match(
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/
  );
  return match?.[0];
}

/**
 * Phone 提取（偏澳洲风格）：
 * 1. 只从带 Phone/Mobile/Tel/Contact 标签的行里找；
 * 2. 清理为只包含数字与 +；
 * 3. 仅接受：
 *    - 以 +61 开头，并且去掉 +61 后有 9 位数字（共 12 位）
 *    - 或以 0 开头，并且总共 10 位数字（典型澳洲本地号）
 * 4. 如果是 PDF，绝不做“全局兜底”，避免时间戳等被误判。
 */
function extractPhone(
  text: string,
  opts?: { isPdf?: boolean }
): string | undefined {
  const { isPdf } = opts || {};
  const lines = text.split(/\r?\n/);

  // 1. 带标签的行
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;

    const labeled = line.match(
      /\b(phone|mobile|tel|contact)\b[^+\d]*(\+?[0-9()[\]\s\-]{6,20})/i
    );
    if (labeled?.[2]) {
      const cleaned = labeled[2].replace(/[^\d+]/g, "");
      if (looksLikeAustralianNumber(cleaned)) {
        return formatAustralianNumber(cleaned);
      }
    }
  }

  // 2. PDF：到此为止，不再兜底
  if (isPdf) return undefined;

  // 3. 非 PDF：可以尝试兜底一次
  const generic = text.match(/(\+?[0-9()[\]\s\-]{6,20})/);
  if (generic) {
    const cleaned = generic[0].replace(/[^\d+]/g, "");
    if (looksLikeAustralianNumber(cleaned)) {
      return formatAustralianNumber(cleaned);
    }
  }

  return undefined;
}

function looksLikeAustralianNumber(num: string): boolean {
  const digits = num.replace(/\D/g, "");

  // +61 开头（13 或 12 字符）→ 去掉 + 后应为 11 位，其中前两位为 61
  if (num.startsWith("+61")) {
    const rest = digits.slice(2); // 去掉 61
    return rest.length === 9; // 澳洲号码后面 9 位
  }

  // 0 开头、本地 10 位号码
  if (/^0\d{9}$/.test(digits)) {
    return true;
  }

  return false;
}

function formatAustralianNumber(num: string): string {
  const digits = num.replace(/\D/g, "");
  if (num.startsWith("+61")) {
    return `+61 ${digits.slice(2)}`;
  }
  // 简单分组，04xx xxx xxx 或 0x xxxx xxxx
  if (/^04\d{8}$/.test(digits)) {
    return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
  }
  if (/^0[2378]\d{8}$/.test(digits)) {
    return `${digits.slice(0, 2)} ${digits.slice(2, 6)} ${digits.slice(6)}`;
  }
  return digits;
}

/** Name 提取：PDF 情况下避免 %PDF-1.7，并尽量找“看起来像名字”的行 */
function extractName(
  text: string,
  opts?: { isPdf?: boolean }
): string | undefined {
  const { isPdf } = opts || {};

  let lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (!lines.length) return undefined;

  // 1. 带 label 的 Name: XXX
  const labeled = lines.find((l) => /^name[:\-]/i.test(l));
  if (labeled) {
    return labeled.replace(/^name[:\-]\s*/i, "");
  }

  // 2. PDF：过滤掉明显不是名字的行
  if (isPdf) {
    lines = lines.filter((line) => {
      if (/^%PDF/i.test(line)) return false;
      if (/^\d+$/.test(line)) return false;
      if (line.length > 60) return false;
      if (line.includes("@")) return false;

      const letters = (line.match(/[A-Za-z]/g) || []).length;
      return letters / line.length >= 0.5;
    });
  }

  // 3. 从剩下的里挑第一个“像名字”的
  const candidate = lines.find(looksLikeName);
  return candidate ?? undefined;
}

function looksLikeName(line: string): boolean {
  if (!line) return false;
  if (line.length > 40) return false;
  if (/\d|@/.test(line)) return false;
  const letters = (line.match(/[A-Za-z]/g) || []).length;
  return letters / line.length >= 0.6;
}

/** Skills 提取：找包含 skill 的标题行（大小写均可），收集下面 1~3 行 */
function extractSkillsSnippet(text: string): string | undefined {
  const lines = text.split(/\r?\n/);

  const sectionHeadings = [
    "experience",
    "work experience",
    "professional experience",
    "employment",
    "education",
    "projects",
    "profile",
    "summary",
  ];

  let skillsIndex = -1;

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i].trim();
    if (!raw) continue;
    const lower = raw.toLowerCase();
    if (lower.includes("skill")) {
      skillsIndex = i;
      break;
    }
  }

  if (skillsIndex === -1) return undefined;

  const collected: string[] = [];

  for (let j = skillsIndex + 1; j < lines.length && collected.length < 3; j++) {
    let raw = lines[j].trim();
    if (!raw) continue;

    const lower = raw.toLowerCase();
    if (sectionHeadings.some((h) => lower.includes(h))) break;

    // 去掉 bullet（• - * · 等）
    raw = raw.replace(/^[\-\u2022•·*]+/, "").trim();
    if (!raw) continue;

    collected.push(raw);
  }

  if (!collected.length) return undefined;

  return normaliseSnippet(collected.join(" · "));
}

function normaliseSnippet(s: string): string {
  return s
    .replace(/[^\x20-\x7E]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}