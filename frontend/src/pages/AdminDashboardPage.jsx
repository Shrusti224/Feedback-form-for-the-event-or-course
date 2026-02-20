import { useEffect, useMemo, useState } from "react";
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

const AdminDashboardPage = () => {
  const { logout, admin } = useAuth();
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [draft, setDraft] = useState(baseDraft);
  const [reportForm, setReportForm] = useState(null);
  const [summary, setSummary] = useState(null);
  const [responses, setResponses] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

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
      if (q.type === "mcq" && (!q.options || q.options.filter((o) => o.trim()).length < 2)) {
        return "MCQ questions need at least two options";
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
          options: q.type === "mcq" ? (q.options || []).filter((o) => o.trim()) : [],
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
        options: q.options?.length ? q.options : ["Option 1", "Option 2"],
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
      setReportForm(form);
      const [summaryData, responseData] = await Promise.all([
        fetchSummary(form._id),
        fetchResponses(form._id, nextPage, 10),
      ]);
      setSummary(summaryData);
      setResponses(responseData.items);
      setPage(responseData.pagination.page);
      setTotalPages(responseData.pagination.totalPages || 1);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load report");
    }
  };

  const csvUrl = useMemo(() => (reportForm ? buildCsvUrl(reportForm._id, 1, 100) : "#"), [reportForm]);

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-6 md:px-8">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Smart Feedback System</h1>
          <p className="text-sm text-slate-600">Logged in as {admin?.email}</p>
        </div>
        <button onClick={logout} className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white">
          Logout
        </button>
      </header>

      {error && <p className="mb-4 rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}

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
          <section>
            <h2 className="mb-3 text-lg font-semibold text-slate-900">Forms</h2>
            {loading ? (
              <p className="text-sm text-slate-600">Loading forms...</p>
            ) : forms.length === 0 ? (
              <p className="rounded-lg bg-white p-4 text-sm text-slate-600">No forms found.</p>
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
            <section className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-lg font-semibold">Insights: {reportForm.title}</h2>
                <a
                  href={csvUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-md bg-emerald-600 px-3 py-2 text-sm text-white"
                >
                  Export CSV
                </a>
              </div>
              <ReportPanel summary={summary} />

              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <h3 className="text-sm font-semibold">Responses (Paginated)</h3>
                <div className="mt-3 space-y-2">
                  {responses.map((response) => (
                    <div key={response._id} className="rounded-md bg-slate-50 p-2 text-sm">
                      <p className="text-xs text-slate-500">{new Date(response.createdAt).toLocaleString()}</p>
                      <pre className="mt-1 whitespace-pre-wrap text-xs text-slate-700">
                        {JSON.stringify(response.answers, null, 2)}
                      </pre>
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex items-center justify-between text-sm">
                  <button
                    onClick={() => openReport(reportForm, Math.max(1, page - 1))}
                    disabled={page <= 1}
                    className="rounded-md bg-slate-200 px-3 py-1 disabled:opacity-50"
                  >
                    Prev
                  </button>
                  <span>
                    Page {page} / {totalPages}
                  </span>
                  <button
                    onClick={() => openReport(reportForm, Math.min(totalPages, page + 1))}
                    disabled={page >= totalPages}
                    className="rounded-md bg-slate-200 px-3 py-1 disabled:opacity-50"
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