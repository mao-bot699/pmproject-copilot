"use client";

import { useState } from "react";

type ProjectPlanResult = Record<string, string | string[] | object>;

const sectionLabels: Record<string, string> = {
  productPositioning: "Product Positioning",
  targetUsers: "Target Users",
  painPoints: "Pain Points",
  prdDraft: "PRD Draft",
  mvpFeatures: "MVP Features",
  blacklistFeatures: "Blacklist Features",
  techPlan: "Tech Plan",
  costEstimate: "Cost Estimate",
  risks: "Risks",
  sevenDayPlan: "Seven Day Plan",
  resumeBullets: "Resume Bullets",
  interviewStory: "Interview Story",
  demoGuide: "Demo Guide",
};

const mockSections = [
  {
    title: "Product Positioning",
    content:
      "PMProject Copilot helps aspiring AI Product Managers turn rough product ideas into portfolio-ready projects with PRD, MVP scope, tech plan, resume bullets, and interview story.",
  },
  {
    title: "PRD Draft",
    content:
      "Define the target users, core pain points, user journey, MVP features, success metrics, and key risks for the product idea.",
  },
  {
    title: "MVP Scope",
    content:
      "V1 focuses on structured idea input, AI-generated project package, modular result cards, copy buttons, and Markdown export. No login, payment, database, or project library in MVP.",
  },
  {
    title: "Tech Plan",
    content:
      "Use Next.js, Tailwind CSS, and an AI API route. Store API keys on the server side. Deploy the MVP on Vercel.",
  },
  {
    title: "Resume Bullets",
    content:
      "Designed and built an AI-powered PM project workspace that converts rough product ideas into PRD, MVP scope, tech plan, resume bullets, and interview narratives.",
  },
  {
    title: "Interview Story",
    content:
      "I built PMProject Copilot after noticing that many aspiring AI PMs have ideas but struggle to turn them into structured portfolio projects.",
  },
];

function stringifyContent(content: unknown) {
  if (Array.isArray(content)) {
    return content.map((item) => `- ${String(item)}`).join("\n");
  }

  if (content && typeof content === "object") {
    return JSON.stringify(content, null, 2);
  }

  return String(content || "");
}

export default function Home() {
  const [projectIdea, setProjectIdea] = useState("");
  const [targetRole, setTargetRole] = useState("AI Product Manager");
  const [productType, setProductType] = useState("AI SaaS");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<ProjectPlanResult | null>(null);

  const resultSections = result
    ? Object.entries(sectionLabels).map(([key, title]) => ({
        title,
        content: stringifyContent(result[key]),
      }))
    : mockSections;

  async function handleGenerateProjectPlan() {
    if (!projectIdea.trim()) {
      setError("Please enter a project idea first.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/generate-project-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectIdea, targetRole, productType }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Failed to generate project plan.");
      }

      setResult(data);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to generate project plan."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy(content: string) {
    await navigator.clipboard.writeText(content);
  }

  function handleExportMarkdown() {
    const markdown = resultSections
      .map((section) => `## ${section.title}\n\n${section.content}`)
      .join("\n\n");
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "pmproject-copilot-plan.md";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-8">
        <nav className="flex items-center justify-between">
          <div className="text-xl font-bold tracking-tight">
            PMProject <span className="text-indigo-400">Copilot</span>
          </div>
          <div className="hidden gap-6 text-sm text-slate-300 md:flex">
            <span>Product</span>
            <span>Workflow</span>
            <span>Examples</span>
            <span>Export</span>
          </div>
          <button className="rounded-full border border-white/15 px-4 py-2 text-sm text-slate-200">
            Demo
          </button>
        </nav>

        <div className="grid flex-1 items-center gap-10 py-16 lg:grid-cols-[0.95fr_1.05fr]">
          <div>
            <div className="mb-5 inline-flex rounded-full border border-indigo-400/30 bg-indigo-400/10 px-4 py-2 text-sm text-indigo-200">
              AI PM Portfolio Workspace
            </div>

            <h1 className="max-w-3xl text-5xl font-semibold leading-tight tracking-tight md:text-6xl">
              Turn your AI product idea into a portfolio-ready PM project.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              Generate PRD, MVP scope, tech plan, resume bullets, interview
              story, and demo guide in one guided workflow.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                className="rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={loading}
                onClick={handleGenerateProjectPlan}
              >
                {loading ? "Generating..." : "Generate Project Plan"}
              </button>
              <button className="rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-slate-200">
                View Example
              </button>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {["PRD Draft", "MVP Scope", "Interview Story"].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4"
                >
                  <div className="text-sm font-medium text-white">{item}</div>
                  <div className="mt-2 text-xs text-slate-400">
                    Generated in minutes
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-4 shadow-2xl shadow-indigo-950/40 backdrop-blur">
            <div className="rounded-[1.5rem] border border-white/10 bg-slate-900 p-5">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <div className="text-sm text-slate-400">Project Setup</div>
                  <div className="mt-1 text-xl font-semibold">
                    Portfolio Package Generator
                  </div>
                </div>
                <div className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300">
                  {loading ? "Working" : "Ready"}
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
                <div className="space-y-4">
                  <label className="block">
                    <span className="text-sm text-slate-300">
                      Project Idea
                    </span>
                    <textarea
                      className="mt-2 h-40 w-full resize-none rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white outline-none placeholder:text-slate-500"
                      onChange={(event) => setProjectIdea(event.target.value)}
                      placeholder="Describe your AI product idea..."
                      value={projectIdea}
                    />
                  </label>

                  <label className="block">
                    <span className="text-sm text-slate-300">
                      Target Role
                    </span>
                    <select
                      className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-white outline-none"
                      onChange={(event) => setTargetRole(event.target.value)}
                      value={targetRole}
                    >
                      <option>AI Product Manager</option>
                      <option>Product Intern</option>
                      <option>Overseas Growth</option>
                      <option>Indie Hacker</option>
                    </select>
                  </label>

                  <label className="block">
                    <span className="text-sm text-slate-300">
                      Product Type
                    </span>
                    <select
                      className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-white outline-none"
                      onChange={(event) => setProductType(event.target.value)}
                      value={productType}
                    >
                      <option>AI SaaS</option>
                      <option>Chrome Extension</option>
                      <option>Mobile App</option>
                      <option>Internal Tool</option>
                    </select>
                  </label>

                  {error ? (
                    <p className="rounded-2xl border border-red-400/20 bg-red-400/10 p-3 text-xs text-red-200">
                      {error}
                    </p>
                  ) : null}

                  <button
                    className="w-full rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={loading}
                    onClick={handleGenerateProjectPlan}
                  >
                    {loading ? "Generating..." : "Generate Project Plan"}
                  </button>
                </div>

                <div className="space-y-3">
                  {resultSections.map((section) => (
                    <div
                      key={section.title}
                      className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="text-sm font-semibold text-white">
                          {section.title}
                        </h3>
                        <button
                          className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-300"
                          onClick={() => handleCopy(section.content)}
                        >
                          Copy
                        </button>
                      </div>
                      <p className="mt-3 whitespace-pre-wrap text-xs leading-5 text-slate-400">
                        {section.content}
                      </p>
                    </div>
                  ))}

                  <button
                    className="w-full rounded-2xl border border-white/10 py-3 text-sm font-semibold text-slate-200"
                    onClick={handleExportMarkdown}
                  >
                    Export Markdown
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
