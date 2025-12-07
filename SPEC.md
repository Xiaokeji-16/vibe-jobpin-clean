# Vibe Jobpin — 简历解析 Demo 规格说明（MVP）

## 1. 概述

项目目标：  
构建一个基于 Next.js 的小型 Demo，允许用户在登录后上传简历（PDF / DOCX / TXT），  
由后端 API 解析出基础信息（姓名、邮箱、电话、技能），并在 Dashboard 中结构化展示。

本说明书描述当前 MVP 的功能范围、API 行为与验收标准。

---

## 2. 目标与成功指标（MVP）

- 目标用户：求职者 / 测试用户（上传自己的简历，看解析效果）
- 成功指标（MVP）：
  - 支持三种格式：`.pdf`、`.docx`、`.txt`
  - 对常见英文简历，能正确抽取出：
    - Email：>= 95% 的样例
    - Phone（澳洲手机号 / +61 格式）：在样例简历中能被识别
    - Skills：能从 `Skills:` / `KEY SKILLS` 等标题下抽取出一行文本
  - 单次解析接口延迟（不含上传时间）< 5s（本地 & Vercel 环境）

---

## 3. 范围

### 3.1 包含（MVP）

- 登录 / 注册（Clerk 提供 `sign-in` / `sign-up` 页面）
- 登录后访问 `/dashboard`：
  - 显示欢迎信息 & Profile completion 进度条（演示用）
  - Onboarding steps（三步引导）
  - Resume summary 卡片：上传简历并展示解析结果
  - Subscription 区块：Upgrade to Pro（纯前端 demo）

- 后端解析 API：
  - `POST /api/parse-resume`：接收文件，解析基础字段并返回 JSON

### 3.2 不包含（当前版本）

- 多简历存储、搜索与列表视图
- 招聘方视角的管理后台
- 职位匹配引擎
- 复杂 NLP 模型与置信度算法

以上可以作为未来扩展方向，但不在 MVP 实现范围内。

---

## 4. 用户用例（MVP）

### 用例 U1：用户上传并查看解析结果

- 前置条件：用户已在 Clerk 完成登录
- 流程：
  1. 用户访问 `/dashboard`
  2. 在「Resume summary」卡片中点击 **Upload resume**
  3. 选择本地简历文件（`.pdf` / `.docx` / `.txt`，≤ 5MB）
  4. 前端通过 `POST /api/parse-resume` 上传
  5. 后端解析成功，返回 `name/email/phone/skills`
  6. 前端展示解析结果，Onboarding step2 视为完成

- 异常流：
  - 文件类型不支持：前端提示「仅支持 .pdf/.docx/.txt」
  - 后端 500：前端显示「Failed to parse resume」

---

## 5. 功能需求

### 5.1 简历上传

- 前端限制：
  - 接受的 MIME / 后缀：`.pdf`、`.docx`、`.txt`
- 文件大小限制：
  - 推荐：≤ 5MB（可在未来加入实际校验）

### 5.2 解析 API：`POST /api/parse-resume`

- 输入：
  - `Content-Type: multipart/form-data`
  - 字段：`file` — 单个文件

- 行为：
  - 若未收到文件或类型不在白名单，返回 400
  - 对不同类型分别处理：
    - PDF：使用 `pdf-parse` 提取文本
    - DOCX：使用 `mammoth` 提取纯文本
    - TXT：直接按 UTF-8 读取
  - 对提取出的文本运行简单正则：
    - `email`：邮箱匹配
    - `phone`：偏向澳洲手机号/`+61` 格式
    - `skills`：查找以 `Skills:` / `KEY SKILLS` 等开头的行
    - `name`：优先使用首行 / 以 `Name:` 开头的行

- 输出（200）：
  ```json
  {
    "name": "Xiaoke Chen",
    "email": "chenxiaok110@gmail.com",
    "phone": "+61 0478 621",
    "skills": "KEY SKILLS",
    "rawText": "... 可选，仅调试用 ..."
  }

  ### 5.3 Dashboard 页面

- 路由：`/dashboard`（受保护路由，未登录会被 Clerk 重定向到 `/sign-in`）

- 页面主要模块：

  1. 顶部欢迎区  
     - 展示「Welcome back」「Hi, {name}」  
     - `name` 优先使用 Clerk 用户的 `firstName`，否则使用邮箱

  2. Profile completion 进度条  
     - 当前为演示用固定数值（如 70%）  
     - 视觉上表现为一条蓝色进度条，不绑定实际表单字段

  3. Onboarding steps  
     - 三个步骤按顺序展示：  
       1. **Complete your profile**  
          - 当前视为默认完成（绿色状态）  
       2. **Upload your resume**  
          - 初始为激活状态；成功上传并解析简历后，状态切换为完成  
       3. **Review insights & subscribe**  
          - 在用户完成上传后视为「下一步」，但目前仅展示说明文案

  4. Resume summary 卡片  
     - 初始状态：文案提示「No resume uploaded yet」  
     - 上传时：显示 “Analysing your resume…” 加载提示  
     - 上传成功后：展示从 `/api/parse-resume` 返回的字段：  
       - Name / Email / Phone / Skills（raw）  
     - 上传按钮文案从 “Upload resume” 变为 “Re-upload resume”

  5. SubscriptionCard（订阅演示）  
     - 按钮：**Upgrade to Pro**  
     - 点击后在本地状态中将 plan 从 `Free` 切换为 `Pro (demo)`  
     - 不调用真实支付接口，也不改变后端任何数据

---

## 6. 数据模型（逻辑视图）

当前实现只在前端状态中暂存解析结果，没有持久化到数据库。  
逻辑上，一个解析结果建模如下：

```ts
type ParsedResume = {
  name?: string;
  email?: string;
  phone?: string;
  skills?: string;
  rawText?: string; // 可选，用于调试或未来扩展
};

## 7. 非功能需求（Demo 范围）

- 性能
  - 中等大小的简历文件（3–5 页 PDF 或相当体量的 DOCX）在 **3–5 秒** 内完成解析。
  - 解析时间包含：文件上传到服务器、`pdf-parse` / `mammoth` 提取文本、正则匹配解析字段。

- 安全性
  - 上传文件只在内存中处理，不写入磁盘持久化。
  - 服务器日志中禁止记录完整简历正文，只允许记录：文件类型、大小、解析耗时与错误信息。
  - 部署环境建议使用 HTTPS（例如 Vercel 默认的 https 域名），保证传输加密。

- 可扩展性
  - 所有解析逻辑集中在 `src/app/api/parse-resume/route.ts` 中，方便未来替换为：
    - 第三方简历解析 API，或
    - 独立的 Node / Python 微服务。
  - 前端调用统一走 `POST /api/parse-resume`，接口契约稳定后，后端实现可以自由替换。

- 可维护性
  - 正则解析函数保持纯函数形式：
    - `extractEmail(text)`
    - `extractPhone(text)`
    - `extractSkills(text)`
    - `extractName(text)`
  - 需要调整解析规则时，只需修改这些 helper 函数，不需要改动 API 路由和前端调用方式。


## 8. 验收标准（MVP）

### 8.1 AC1：解析 PDF 简历

- **给定**：一份包含 Name / Email / Phone / Skills（或 Key Skills）字段的英文 PDF 简历（≤ 5MB）。
- **当**：用户登录后，进入 `/dashboard` 并上传该 PDF。
- **那么**：
  - 接口 `POST /api/parse-resume` 返回 `200`。
  - Dashboard 中的 **Resume summary** 卡片展示：
    - Name：为简历中的姓名，例如 `Xiaoke Chen`。
    - Email：为简历中的邮箱，例如 `chenxiaok110@gmail.com`。
    - Phone：以常见澳洲格式展示，例如 `+61 0478 621` 或 `04xx xxx xxx`。
    - Skills (raw)：显示对应的 Skills / Key Skills 行（如 `KEY SKILLS` 或技能列表）。

### 8.2 AC2：解析 DOCX / TXT 简历

- **给定**：同一内容的简历另存为 `.docx` 或 `.txt` 文件。
- **当**：用户在 `/dashboard` 上传 `.docx` 或 `.txt` 文件。
- **那么**：
  - 接口返回 `200`。
  - Resume summary 中的 Name / Email / Phone / Skills 字段与上传 PDF 时的解析结果一致或非常接近。

### 8.3 AC3：错误处理与不支持格式

- **给定**：用户上传不支持的文件类型（例如 `.jpg`、`.png`）。
- **当**：点击 Upload。
- **那么**：
  - 后端可返回 `400 Bad Request` 或在前端直接给出校验提示。
  - 前端在 Resume summary 区域展示友好的错误信息，如：
    - `Failed to parse resume. Please upload a .pdf, .docx or .txt file.`

### 8.4 AC4：访问控制

- **给定**：未登录用户直接访问 `/dashboard`。
- **当**：在浏览器地址栏输入 `/dashboard`。
- **那么**：
  - 被 Clerk 中间件拦截并重定向到 `/sign-in`。
  - 用户登录成功后自动跳转回 `/dashboard`，可以看到 Resume summary 与 Onboarding steps。


