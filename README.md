# Vibe Jobpin – AI Job Search Assistant

一个基于 **Next.js 16 + Clerk Auth** 的小型 Demo 项目，模拟 “AI 求职助手” 场景：

- 用户可以注册 / 登录
- 上传自己的简历（PDF / DOCX / TXT）
- 系统在后台解析出基础信息（姓名、邮箱、电话、Skills）
- 在 Dashboard 中以结构化方式展示，并配合 Onboarding 进度条与订阅模块做引导

> 详细的功能规格与 API 说明见：[spec.md](./spec.md)

---

## 1. Tech stack

- **Framework**：Next.js 16（App Router）
- **Language**：TypeScript
- **Styling**：Tailwind CSS
- **Auth**：Clerk (Sign-in / Sign-up / User session)
- **Deployment**：Vercel
- **Resume Parsing**：
  - `pdf-parse`（解析 PDF 文本）
  - `mammoth`（解析 DOCX 文本）
  - 简单的正则抽取（邮箱、电话、Skills、Name）

---

## 2. Features

### 2.1 Auth & Routing

- `/`：Landing page，包含「Get started」+ 「Create account」按钮。
- `/sign-in`：登录页面（Clerk 提供组件）。
- `/sign-up`：注册页面（Clerk 提供组件）。
- `/dashboard`：登录后可访问的主面板，未登录会被重定向到 `/sign-in`。

### 2.2 Dashboard

登录成功后进入 `/dashboard`，包括：

- 欢迎文案：`Hi, {name}`（优先使用 Clerk 的 firstName）
- **Profile completion** 进度条（示意用，例如 70%）
- **Onboarding steps**：
  1. Complete your profile  
  2. Upload your resume  
  3. Review insights & subscribe（上传成功后点亮）
- **Resume summary** 卡片：
  - 上传 `.pdf / .docx / .txt` 简历文件
  - 后端 `/api/parse-resume` 解析
  - 展示：Name / Email / Phone / Skills（raw）
- **Subscription card**：
  - 客户端模拟的「Upgrade to Pro」按钮
  - 点击后界面内状态变为「You are on Pro (demo)」，不接入真实计费

---

## 3. Getting started

### 3.1 Prerequisites

- Node.js 18+（推荐 18 或 20）
- 包管理工具：`npm` 或 `pnpm`
- 一个 **Clerk** 帐号，用于创建应用并获取 API Keys

### 3.2 Install dependencies

```bash
# 使用 npm
npm install

# 或者使用 pnpm
pnpm install
```

### 3.3 环境变量（Environment variables）

在项目根目录创建 `.env.local`，填入 Clerk 的 Key 和路由配置：

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_****************
CLERK_SECRET_KEY=sk_test_****************

# 登录 / 注册路由（需要和 app 中的路由一致）
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
```
### 3.4 启动开发环境（Run dev server）

```bash
npm run dev
# 或
pnpm dev
```

启动后访问：

- 开发环境主页：http://localhost:3000
- 登录后 Dashboard：http://localhost:3000/dashboard


### 3.5 构建与生产运行（Build & production）

```bash
npm run build
npm start
```

在 **Vercel** 部署时：

- 在 Project → Settings → Environment Variables 中配置与 .env.local 相同的变量；
- 每次推送到 GitHub 的 main（或者你配置的分支）时，Vercel 会自动重新构建并部署

## 4. 项目结构（Project structure）

vibe-jobpin-clean/
├─ .env.local            # 本地环境变量（不会提交到 git）
├─ README.md             # 项目说明
├─ spec.md               # 规格说明 / API 文档
├─ next.config.mjs
├─ package.json
├─ public/
│  └─ ...                # 静态资源
└─ src/
   ├─ app/
   │  ├─ page.tsx        # Landing 页面
   │  ├─ dashboard/
   │  │  └─ page.tsx     # Dashboard 主界面
   │  ├─ sign-in/        # 登录路由（Clerk）
   │  ├─ sign-up/        # 注册路由（Clerk）
   │  └─ api/
   │     └─ parse-resume/
   │        └─ route.ts  # 简历解析 API
   ├─ components/
   │  ├─ ResumeSection.tsx      # 上传简历 + 展示解析结果
   │  └─ SubscriptionCard.tsx   # Pro 订阅 Demo 卡片
   └─ ...

## 5. 简历解析（Resume parsing）

### 5.1 后端 API：POST /api/parse-resume

- 请求方式：multipart/form-data
- 字段：file: 简历文件（支持 .pdf / .docx / .txt）
- 返回示例（ParsedResume）：

```json
{
  "name": "Xiaoke Chen",
  "email": "chenxiaok110@gmail.com",
  "phone": "+61 0478 621",
  "skills": "KEY SKILLS"
}
```

### 5.2 解析流程（route.ts）

- 从 formData 中取出 file，读取为 ArrayBuffer → Buffer；
- 根据文件扩展名选择解析方式：
1. .pdf → 使用 pdf-parse 抽取 data.text
2. .docx → 使用 mammoth 抽取 result.value
3. .txt → 直接 buffer.toString("utf8")
- 在纯文本上用正则提取：
1. Email：[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+...
2. Phone：偏向澳洲号码（+61 或 04xx xxx xxx）
3. Skills：寻找以 Skills: / KEY SKILLS: 等开头的行
4. Name：优先 Name:，否则尝试第一行人名样式的字符串
- 将 ParsedResume JSON 返回给前端。

### 5.3 前端展示（ResumeSection.tsx）

- 使用 <input type="file" /> 选择文件；
- 通过 fetch("/api/parse-resume", { method: "POST", body: formData }) 调用后端；
- 将返回的 name / email / phone / skills 显示在「Resume summary」卡片中；
- 若解析成功，调用 onResumeUploaded(parsed)，用来更新 Dashboard 的 Onboarding 状态（点亮 Step 2 / Step 3）。

## 6. 规格文档 (Specs)

- 更详细的需求与 API 设计可以参考： [spec.md](./SPEC.md)
- 包括：
  1. MVP 范围与成功指标  
  2. 用户用例（上传 / 查看 / Dashboard）  
  3. API 行为、字段说明与错误码  
  4. 验收标准 (Acceptance Criteria)

## 7. 已知限制（Known limitations）
1. 解析逻辑基于规则 + 正则，对排版复杂的 PDF 支持有限；
2. Skills 目前只读取第一条 Skills: / Key Skills: 行，未做更细的分词或分类；
3. Demo 版本未持久化存储简历，仅展示当前会话解析结果；
4. Pro 订阅按钮为前端模拟，不接真实支付系统。