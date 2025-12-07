// src/app/api/parse-resume/route.ts
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

type ParsedResume = {
  name?: string;
  email?: string;
  phone?: string;
  skills?: string;
};

/* ----------------- 提取工具函数 ----------------- */

function extractEmail(text: string): string | undefined {
  const m = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  return m?.[0];
}

// 偏向澳洲号码（+61 或 0 开头），防止乱抓地址里的数字
function extractPhone(text: string): string | undefined {
  const phoneRegex =
    /(\+61\s?\d{1,2}\s?\d{3}\s?\d{3}\s?\d{0,3}\b|\b0[2345]\d{2}\s?\d{3}\s?\d{3}\b)/;
  const m = text.match(phoneRegex);
  return m?.[0];
}

// Skills / KEY SKILLS：支持「同一行」或「下一行」两种写法
function extractSkills(text: string): string | undefined {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (/^(skills|key skills)\b/i.test(line)) {
      // 情况 1：KEY SKILLS: React, Node.js ...
      const afterHeader = line.replace(
        /^(skills|key skills)\s*[:\-]?\s*/i,
        ""
      );
      if (afterHeader.length > 0) return afterHeader;

      // 情况 2：下一行才写内容
      if (i + 1 < lines.length && lines[i + 1].length > 0) {
        return lines[i + 1];
      }

      // 实在没有，就返回这一行
      return line;
    }
  }
  return undefined;
}

function extractName(text: string): string | undefined {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  // 1）优先找 “Name: xxx”
  let nameLine =
    lines.find((l) => /^name\s*[:\-]/i.test(l)) ||
    // 2）否则找看起来像 “Xiaoke Chen” 这种，只有字母和空格
    lines.find(
      (l) =>
        /^[A-Za-z]+(?:\s+[A-Za-z]+){0,3}$/.test(l) &&
        l.length <= 40
    );

  if (!nameLine) return undefined;

  nameLine = nameLine.replace(/^name\s*[:\-]\s*/i, "").trim();
  return nameLine || undefined;
}

/* ----------------- 核心解析逻辑 ----------------- */

async function parseFile(file: File): Promise<ParsedResume> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const lowerName = file.name.toLowerCase();

  let text = "";

  // 1) docx
  if (
    lowerName.endsWith(".docx") ||
    file.type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ buffer });
    text = result.value || "";
  }
  // 2) 纯文本
  else if (lowerName.endsWith(".txt") || file.type.startsWith("text/")) {
    text = new TextDecoder("utf-8").decode(arrayBuffer);
  }
  // 3) PDF：这版 demo 不支持，直接抛出错误，让前端提示导出 docx/txt
  else if (lowerName.endsWith(".pdf") || file.type === "application/pdf") {
    throw new Error(
      "PDF parsing is not supported in this demo. Please export your resume as .docx or .txt and upload again."
    );
  } else {
    throw new Error(
      "Unsupported file type. Please upload a .docx or .txt resume."
    );
  }

  if (!text.trim()) {
    throw new Error("Could not read any text from the file.");
  }

  const parsed: ParsedResume = {
    name: extractName(text),
    email: extractEmail(text),
    phone: extractPhone(text),
    skills: extractSkills(text),
  };

  return parsed;
}

/* ----------------- Route Handler ----------------- */

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "No file uploaded" },
        { status: 400 }
      );
    }

    const parsed = await parseFile(file);

    return NextResponse.json(parsed, { status: 200 });
  } catch (err: any) {
    console.error("parse-resume error:", err);
    const message =
      err instanceof Error
        ? err.message
        : "Failed to parse resume.";
    return NextResponse.json(
      { error: message },
      { status: 400 }
    );
  }
}