import { useEffect, useMemo, useRef, useState } from "react";
import {
  buildCsvUrl,
  createForm,
  deleteForm,
  fetchForms,
  fetchResponses,
  fetchSummary,
  updateForm,
  updateFormStatus,
} from "../api/services";
import { useAuth } from "../context/AuthContext";
import FormBuilder from "../components/FormBuilder";
import FormCard from "../components/FormCard";
import ReportPanel from "../components/ReportPanel";

const baseDraft = {
  title: "",
  description: "",
  isActive: true,
  questions: [{ type: "text", label: "", required: true, options: ["Option 1", "Option 2"] }],
};

const formatAnswerValue = (answer) => {
  if (!answer) return "Not answered";
  if (answer.questionType === "rating") return `${answer.value}/5`;
  if (answer.questionType === "multi") {
    const selected = Array.isArray(answer.value) ? answer.value : [];
    return selected.length ? selected.join(", ") : "Not answered";
  }
  if (answer.value === null || answer.value === undefined || String(answer.value).trim() === "") return "Not answered";
  return String(answer.value);
};

const AdminDashboardPage = () => {
  const { logout, admin } = useAuth();
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [draft, setDraft] = useState(baseDraft);
  const [reportForm, setReportForm] = useState(null);
  const [summary, setSummary] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [responses, setResponses] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const insightsSectionRef = useRef(null);

  const loadForms = async () => {
    setLoading(true);
    try {
      const data = await fetchForms();
      setForms(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load forms");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadForms();
  }, []);

  const validateDraft = () => {
    if (!draft.title.trim()) return "Title is required";
    if (!draft.questions.length) return "At least one question is required";
    for (const q of draft.questions) {
      if (!q.label.trim()) return "All questions need labels";
      if ((q.type === "mcq" || q.type === "multi") && (!q.options || q.options.filter((o) => o.trim()).length < 2)) {
        return "Choice questions need at least two options";
      }
    }
    return "";
  };

  const onSaveForm = async () => {
    const validationError = validateDraft();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");
    setSaving(true);
    try {
      const payload = {
        title: draft.title,
        description: draft.description,
        isActive: draft.isActive,
        questions: draft.questions.map((q) => ({
          ...q,
          options: q.type === "mcq" || q.type === "multi" ? (q.options || []).filter((o) => o.trim()) : [],
        })),
      };

      if (draft._id) {
        await updateForm(draft._id, payload);
      } else {
        await createForm(payload);
      }

      setDraft(baseDraft);
      await loadForms();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save form");
    } finally {
      setSaving(false);
    }
  };

  const onEdit = (form) => {
    setDraft({
      ...form,
      questions: form.questions.map((q) => ({
        ...q,
        options: q.type === "mcq" || q.type === "multi" ? (q.options?.length ? q.options : ["Option 1", "Option 2"]) : [],
      })),
    });
  };

  const onToggleStatus = async (form) => {
    try {
      await updateFormStatus(form._id, !form.isActive);
      await loadForms();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update status");
    }
  };

  const onDelete = async (form) => {
    try {
      await deleteForm(form._id);
      if (reportForm?._id === form._id) {
        setReportForm(null);
        setSummary(null);
        setResponses([]);
      }
      await loadForms();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete form");
    }
  };

  const openReport = async (form, nextPage = 1) => {
    try {
      setReportLoading(true);
      setReportForm(form);
      const [summaryData, responseData] = await Promise.all([
        fetchSummary(form._id),
        fetchResponses(form._id, nextPage, 10),
      ]);
      setSummary(summaryData);
      setResponses(responseData.items);
      setPage(responseData.pagination.page);
      setTotalPages(responseData.pagination.totalPages || 1);
      requestAnimationFrame(() => {
        insightsSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load report");
    } finally {
      setReportLoading(false);
    }
  };

  useEffect(() => {
    if (!loading && forms.length && !reportForm) {
      openReport(forms[0]);
    }
  }, [loading, forms, reportForm]);

  const csvUrl = useMemo(() => (reportForm ? buildCsvUrl(reportForm._id, 1, 100) : "#"), [reportForm]);

  const quickInsights = useMemo(() => {
    if (!summary) return null;

    const ratingQuestions = summary.questionAnalytics.filter((q) => q.type === "rating" && q.totalResponses > 0);
    const overallRating = ratingQuestions.length
      ? (ratingQuestions.reduce((acc, q) => acc + q.average, 0) / ratingQuestions.length).toFixed(2)
      : null;

    const textQuestions = summary.questionAnalytics.filter((q) => q.type === "text");
    const recentTextCount = textQuestions.reduce((acc, q) => acc + (q.recentTexts?.length || 0), 0);

    return {
      totalResponses: summary.totalResponses,
      questionCount: summary.questionAnalytics.length,
      overallRating,
      focusArea: summary.lowestRatedQuestion,
      recentTextCount,
    };
  }, [summary]);

  const activeFormCount = useMemo(() => forms.filter((form) => form.isActive).length, [forms]);

  return (
    <div className="min-h-screen px-4 py-6 md:px-8">
      <header className="mb-6 rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-lg backdrop-blur-sm md:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="inline-flex rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-teal-700">
              Admin Command Center
            </p>
            <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">Smart Feedback Dashboard</h1>
            <p className="mt-1 text-sm text-slate-600">Logged in as {admin?.email}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-center">
              <p className="text-xs uppercase tracking-wide text-slate-500">Total Forms</p>
              <p className="text-xl font-bold text-slate-900">{forms.length}</p>
            </div>
            <div className="rounded-xl border border-teal-100 bg-teal-50 px-4 py-2 text-center">
              <p className="text-xs uppercase tracking-wide text-teal-700">Active Forms</p>
              <p className="text-xl font-bold text-teal-800">{activeFormCount}</p>
            </div>
          </div>
        </div>
        <div className="mt-5 flex justify-end">
          <button
            onClick={logout}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            Logout
          </button>
        </div>
      </header>

      {error && <p className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-1">
          <FormBuilder
            draft={draft}
            setDraft={setDraft}
            onSubmit={onSaveForm}
            onCancel={() => setDraft(baseDraft)}
            loading={saving}
          />
        </div>

        <div className="space-y-4 xl:col-span-2">
          <section className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-lg backdrop-blur-sm md:p-5">
            <h2 className="mb-3 text-lg font-semibold text-slate-900">Created Forms</h2>
            {loading ? (
              <p className="text-sm text-slate-600">Loading forms...</p>
            ) : forms.length === 0 ? (
              <p className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">No forms found.</p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {forms.map((form) => (
                  <FormCard
                    key={form._id}
                    form={form}
                    onEdit={onEdit}
                    onToggleStatus={onToggleStatus}
                    onDelete={onDelete}
                    onOpenReport={() => openReport(form)}
                  />
                ))}
              </div>
            )}
          </section>

          {reportForm && (
            <section ref={insightsSectionRef} className="space-y-4 rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-lg backdrop-blur-sm md:p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-lg font-semibold text-slate-900">Insights: {reportForm.title}</h2>
                <a
                  href={csvUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
                >
                  Export CSV
                </a>
              </div>

              {reportLoading && <p className="text-sm text-slate-600">Loading insights...</p>}

              {quickInsights && (
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-3 shadow-sm">
                    <p className="text-xs uppercase tracking-wide text-slate-500">Total Responses</p>
                    <p className="mt-1 text-2xl font-bold text-slate-900">{quickInsights.totalResponses}</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-3 shadow-sm">
                    <p className="text-xs uppercase tracking-wide text-slate-500">Questions</p>
                    <p className="mt-1 text-2xl font-bold text-slate-900">{quickInsights.questionCount}</p>
                  </div>
                  <div className="rounded-xl border border-teal-100 bg-gradient-to-br from-teal-50 to-white p-3 shadow-sm">
                    <p className="text-xs uppercase tracking-wide text-slate-500">Overall Rating</p>
                    <p className="mt-1 text-2xl font-bold text-slate-900">
                      {quickInsights.overallRating ? `${quickInsights.overallRating}/5` : "N/A"}
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-3 shadow-sm">
                    <p className="text-xs uppercase tracking-wide text-slate-500">Recent Text Insights</p>
                    <p className="mt-1 text-2xl font-bold text-slate-900">{quickInsights.recentTextCount}</p>
                  </div>
                </div>
              )}

              {quickInsights?.focusArea ? (
                <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                  Insight: Lowest-rated area is "{quickInsights.focusArea.label}" at {quickInsights.focusArea.average}/5.
                  This is the best place to improve next.
                </p>
              ) : (
                <p className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-sm text-sky-800">
                  Insight: Collect a few more responses to unlock stronger rating insights for this form.
                </p>
              )}

              <ReportPanel summary={summary} />

              <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-4 shadow-sm">
                <h3 className="text-sm font-semibold">Responses (Paginated)</h3>
                <div className="mt-3 space-y-2">
                  {responses.map((response) => (
                    <div key={response._id} className="rounded-lg border border-slate-200 bg-white p-3 text-sm shadow-sm">
                      <p className="text-xs text-slate-500">{new Date(response.createdAt).toLocaleString()}</p>
                      {response.respondentEmail ? (
                        <p className="mt-1 text-xs text-slate-600">Email: {response.respondentEmail}</p>
                      ) : (
                        <p className="mt-1 text-xs text-slate-600">Anonymous</p>
                      )}
                      <div className="mt-2 space-y-2">
                        {reportForm?.questions?.map((question, questionIndex) => {
                          const answer = response.answers?.find((item) => item.questionIndex === questionIndex);
                          return (
                            <div key={`${response._id}-${questionIndex}`} className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
                              <p className="text-xs font-semibold text-slate-600">{question.label}</p>
                              <p className="text-sm text-slate-800">{formatAnswerValue(answer)}</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex items-center justify-between text-sm">
                  <button
                    onClick={() => openReport(reportForm, Math.max(1, page - 1))}
                    disabled={page <= 1}
                    className="rounded-md border border-slate-300 bg-white px-3 py-1 font-medium text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
                  >
                    Prev
                  </button>
                  <span>
                    Page {page} / {totalPages}
                  </span>
                  <button
                    onClick={() => openReport(reportForm, Math.min(totalPages, page + 1))}
                    disabled={page >= totalPages}
                    className="rounded-md border border-slate-300 bg-white px-3 py-1 font-medium text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
