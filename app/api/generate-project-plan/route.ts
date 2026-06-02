import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: "https://api.deepseek.com",
});

const fallbackResult = {
  productPositioning: "",
  targetUsers: "",
  painPoints: "",
  prdDraft: "",
  mvpFeatures: "",
  blacklistFeatures: "",
  techPlan: "",
  costEstimate: "",
  risks: "",
  sevenDayPlan: "",
  resumeBullets: "",
  interviewStory: "",
  demoGuide: "",
};

export async function POST(request: Request) {
  try {
    if (!process.env.DEEPSEEK_API_KEY) {
      return Response.json(
        { error: "DEEPSEEK_API_KEY is not configured." },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { projectIdea, targetRole, productType } = body;

    if (!projectIdea?.trim()) {
      return Response.json(
        { error: "Project idea is required." },
        { status: 400 }
      );
    }

    const prompt = `
You are a senior AI Product Manager mentor.

Your task is to help aspiring AI Product Manager candidates turn a rough product idea into a realistic, portfolio-ready PM project package.

User input:
Project idea: ${projectIdea}
Target role: ${targetRole || "AI Product Manager"}
Product type: ${productType || "AI SaaS"}

Important context about the real MVP:
- This product is PMProject Copilot.
- It is a small MVP built with Next.js App Router, TypeScript, Tailwind CSS, a Next.js API Route, and the DeepSeek API.
- It can be deployed on Vercel.
- The first version has no database, no login, no user account, and no saved project history.
- The first version only supports structured input, AI generation, result cards, Copy for a single module, and Export Markdown.
- The current page has only three input fields: Project Idea, Target Role, and Product Type.

Please generate a structured project package for the user's idea.

Return ONLY valid JSON. Do not include markdown fences. Do not include explanations outside JSON.

The JSON object must include exactly these fields:
{
  "productPositioning": "",
  "targetUsers": "",
  "painPoints": "",
  "prdDraft": "",
  "mvpFeatures": "",
  "blacklistFeatures": "",
  "techPlan": "",
  "costEstimate": "",
  "risks": "",
  "sevenDayPlan": "",
  "resumeBullets": "",
  "interviewStory": "",
  "demoGuide": ""
}

Truthfulness rules:
- Do not invent real research, user counts, conversion rates, completion rates, satisfaction scores, interview results, revenue, retention, or hiring outcomes.
- Do not write claims like "surveyed 50 users", "completion rate reached 65%", "helped 3 people pass interviews", or any similar unverified result.
- If metrics are useful, write them only as "suggested metrics to track", not as achieved results.
- Do not imply that the product already has users, paid customers, saved histories, analytics data, or proven outcomes unless the user explicitly provided that information.
- Do not write that the MVP has already validated user behavior, resume quality, interview success, or market demand. The only verified status is that the local MVP core flow works.

Scope rules:
- The only real inputs in the current MVP are:
  1. Project Idea
  2. Target Role
  3. Product Type
- Do not describe input fields that do not exist, such as project title, target users, core features, tech stack, budget, timeline, or success metrics fields.
- The MVP features must stay within the current buildable scope:
  1. Structured project idea input
  2. Target role selection
  3. Product type selection
  4. AI-generated portfolio project package
  5. Modular result card display
  6. Copy a single module
  7. Export Markdown
- The blacklist features must include:
  1. Login and registration
  2. Payment
  3. Database
  4. User history
  5. PDF export
  6. Online collaboration
  7. Project community
  8. Automatically generating complete production code
- The technical plan must be based only on the real MVP:
  - Frontend: Next.js App Router + TypeScript + Tailwind CSS
  - Backend: Next.js API Route calling DeepSeek API
  - Deployment: Vercel
  - Environment variable: DEEPSEEK_API_KEY
  - No database in v1
  - No login in v1
  - Only Copy and Export Markdown in v1
- Do not recommend Express, PostgreSQL, Auth0, Redis, vector databases, PDF generation, background jobs, or complex infrastructure for the first version.
- Do not mention OpenAI GPT-4 as the implementation model. The implementation uses DeepSeek API.

Field-specific requirements:
- productPositioning: Explain what the product is and who it helps, without inflated claims.
- targetUsers: Describe realistic user groups and usage scenarios.
- painPoints: Describe practical pain points based on the user's idea.
- prdDraft: Include goal, user flow, key modules, and suggested metrics to track. Do not write achieved metrics.
- mvpFeatures: Use a numbered list limited to the MVP scope above. Base the description on the real current inputs only: Project Idea, Target Role, and Product Type. Do not add imaginary input fields.
- blacklistFeatures: Use a numbered list and include all blacklist items above.
- techPlan: Write a practical plan using only Next.js App Router, TypeScript, Tailwind CSS, DeepSeek API, Vercel, and DEEPSEEK_API_KEY.
- costEstimate: Do not include specific API prices, per-call costs, token prices, monthly totals, or exact cost numbers. Only describe cost components and control strategies, such as DeepSeek API cost depending on tokens, call volume, and output length; Vercel MVP stage may use free allowance; cost can be controlled by limiting input length, controlling output length, and avoiding repeated high-frequency generation.
- risks: Include risks such as AI output quality, prompt stability, vague user input, API cost, API latency, and privacy expectations.
- sevenDayPlan: Make it realistic for one person building a small MVP.
- resumeBullets: Use verifiable wording only. Start each bullet with action verbs such as "独立设计并开发", "使用", "负责". Do not include fake numbers or fake outcomes.
- interviewStory: Use conservative wording. It may say the local MVP has run through the core flow. It may say the next step is to invite target users to try it and validate whether the output is useful for resume and interview scenarios. Do not say "the MVP verified users can..." or imply completed real-user validation.
- demoGuide: Must match the real page flow:
  1. 打开首页
  2. 输入项目想法
  3. 选择 Target Role 和 Product Type
  4. 点击 Generate Project Plan
  5. 查看右侧结果卡片
  6. 点击 Copy
  7. 点击 Export Markdown

Output language:
- Default to Chinese unless the user explicitly writes in English.
- Keep the writing concrete, grounded, and useful for a real portfolio project.
`;

    const completion = await client.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        {
          role: "system",
          content:
            "You are a professional AI product manager and career mentor. Always return valid JSON only.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    const text = completion.choices[0]?.message?.content || "{}";
    const cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();

    try {
      const parsed = JSON.parse(cleaned);
      return Response.json({ ...fallbackResult, ...parsed });
    } catch {
      return Response.json({
        ...fallbackResult,
        productPositioning:
          "The AI response could not be parsed as JSON, but the raw response is shown below.",
        prdDraft: text,
      });
    }
  } catch (error) {
    console.error(error);

    return Response.json(
      { error: "Failed to generate project plan." },
      { status: 500 }
    );
  }
}
