import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchFormById, submitResponse } from "../api/services";

const PublicFormPage = () => {
  const { id } = useParams();
  const [form, setForm] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const loadForm = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await fetchFormById(id);
        setForm(data);
        setAnswers(
          data.questions.map((q, index) => ({
            questionIndex: index,
            questionType: q.type,
            value: q.type === "rating" ? 3 : "",
          }))
        );
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load form");
      } finally {
        setLoading(false);
      }
    };

    loadForm();
  }, [id]);

  const setAnswer = (index, value) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], value };
      return next;
    });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form?.isActive) return;

    for (const answer of answers) {
      if (answer.value === "" || answer.value === null || answer.value === undefined) {
        setError("Please fill in all required questions");
        return;
      }
    }

    setSubmitting(true);
    setError("");
    try {
      await submitResponse(id, { answers, userType: "anonymous" });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p className="p-6 text-sm text-slate-600">Loading form...</p>;
  if (!form) return <p className="p-6 text-sm text-rose-600">{error || "Form not found"}</p>;

  if (!form.isActive) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
        <div className="rounded-xl bg-white p-6 text-center shadow-md">
          <h1 className="text-xl font-semibold text-slate-900">Form Closed</h1>
          <p className="mt-2 text-sm text-slate-600">This feedback form is currently inactive.</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
        <div className="rounded-xl bg-white p-6 text-center shadow-md">
          <h1 className="text-xl font-semibold text-emerald-700">Thank you!</h1>
          <p className="mt-2 text-sm text-slate-600">Your feedback has been submitted successfully.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8">
      <form onSubmit={onSubmit} className="mx-auto max-w-2xl rounded-xl bg-white p-6 shadow-md">
        <h1 className="text-2xl font-bold text-slate-900">{form.title}</h1>
        <p className="mt-1 text-sm text-slate-600">{form.description}</p>

        {error && <p className="mt-4 rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}

        <div className="mt-5 space-y-4">
          {form.questions.map((question, index) => (
            <div key={index} className="rounded-lg border border-slate-200 p-4">
              <p className="mb-2 text-sm font-medium text-slate-800">{question.label}</p>
              {question.type === "text" && (
                <input
                  type="text"
                  className="w-full rounded-md border border-slate-300 px-3 py-2"
                  onChange={(e) => setAnswer(index, e.target.value)}
                />
              )}
              {question.type === "rating" && (
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={Number(answers[index]?.value || 3)}
                  className="w-full"
                  onChange={(e) => setAnswer(index, Number(e.target.value))}
                />
              )}
              {question.type === "mcq" && (
                <div className="space-y-2">
                  {question.options.map((option, optIndex) => (
                    <label key={optIndex} className="flex items-center gap-2 text-sm text-slate-700">
                      <input
                        type="radio"
                        name={`q-${index}`}
                        onChange={() => setAnswer(index, option)}
                        checked={answers[index]?.value === option}
                      />
                      {option}
                    </label>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="mt-5 w-full rounded-md bg-blue-600 px-4 py-2 font-medium text-white disabled:opacity-50"
        >
          {submitting ? "Submitting..." : "Submit Feedback"}
        </button>
      </form>
    </div>
  );
};

export default PublicFormPage;