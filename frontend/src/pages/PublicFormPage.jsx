import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchFormById, submitResponse } from "../api/services";

const StarRatingInput = ({ value, onChange }) => {
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => {
          const active = star <= Number(value || 0);
          return (
            <button
              key={star}
              type="button"
              aria-label={`Rate ${star} out of 5`}
              onClick={() => onChange(star)}
              className="rounded-md p-1 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <span className={`text-3xl leading-none ${active ? "text-amber-400" : "text-slate-300"}`}>
                {"\u2605"}
              </span>
            </button>
          );
        })}
      </div>
      <span className="text-sm font-semibold text-slate-600">{value ? `${value}/5` : "Tap to rate"}</span>
    </div>
  );
};

const PublicFormPage = () => {
  const { id } = useParams();
  const [form, setForm] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [submissionMode, setSubmissionMode] = useState("anonymous");
  const [email, setEmail] = useState("");

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
            value: q.type === "rating" ? 0 : q.type === "multi" ? [] : "",
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

  const toggleMultiAnswer = (index, option) => {
    setAnswers((prev) => {
      const next = [...prev];
      const current = Array.isArray(next[index]?.value) ? next[index].value : [];
      const updated = current.includes(option) ? current.filter((item) => item !== option) : [...current, option];
      next[index] = { ...next[index], value: updated };
      return next;
    });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form?.isActive) return;

    for (const answer of answers) {
      if (answer.questionType === "rating" && Number(answer.value) < 1) {
        setError("Please rate every star-rating question");
        return;
      }

      if (answer.questionType === "multi" && (!Array.isArray(answer.value) || answer.value.length === 0)) {
        setError("Please select at least one option for multi-select questions");
        return;
      }

      if (answer.questionType !== "rating" && answer.questionType !== "multi" && !String(answer.value ?? "").trim()) {
        setError("Please fill in all required questions");
        return;
      }
    }

    setSubmitting(true);
    setError("");
    try {
      if (submissionMode === "email") {
        const normalizedEmail = email.trim().toLowerCase();
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(normalizedEmail)) {
          setError("Please enter a valid email address");
          setSubmitting(false);
          return;
        }
      }

      await submitResponse(id, {
        answers,
        userType: submissionMode === "email" ? "email" : "anonymous",
        respondentEmail: submissionMode === "email" ? email.trim().toLowerCase() : "",
      });
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
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white/90 p-7 text-center shadow-lg backdrop-blur-sm">
          <h1 className="text-2xl font-bold text-slate-900">Form Closed</h1>
          <p className="mt-2 text-sm text-slate-600">This feedback form is currently inactive.</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-lg rounded-2xl border border-teal-100 bg-white/90 p-7 text-center shadow-lg backdrop-blur-sm">
          <h1 className="text-2xl font-bold text-teal-700">Thank you!</h1>
          <p className="mt-2 text-sm text-slate-600">Your feedback has been submitted successfully.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-8 sm:px-6 sm:py-12">
      <form
        onSubmit={onSubmit}
        className="mx-auto w-full max-w-3xl rounded-2xl border border-slate-200 bg-white/95 p-5 shadow-xl backdrop-blur-sm sm:p-8"
      >
        <div className="mb-2 inline-flex items-center rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-teal-700">
          Smart Feedback
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{form.title}</h1>
        <p className="mt-2 text-sm text-slate-600 sm:text-base">{form.description}</p>

        {error && <p className="mt-4 rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}

        <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-800">How do you want to submit?</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <label className="flex items-center gap-2 rounded-md bg-white px-3 py-2 text-sm text-slate-700">
              <input
                type="radio"
                name="submitMode"
                value="anonymous"
                checked={submissionMode === "anonymous"}
                onChange={() => setSubmissionMode("anonymous")}
                className="h-4 w-4 accent-teal-600"
              />
              Submit anonymously
            </label>
            <label className="flex items-center gap-2 rounded-md bg-white px-3 py-2 text-sm text-slate-700">
              <input
                type="radio"
                name="submitMode"
                value="email"
                checked={submissionMode === "email"}
                onChange={() => setSubmissionMode("email")}
                className="h-4 w-4 accent-teal-600"
              />
              Submit with email
            </label>
          </div>

          {submissionMode === "email" && (
            <div className="mt-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
              />
              <p className="mt-1 text-xs text-slate-500">We will attach this email with your feedback response.</p>
            </div>
          )}
        </div>

        <div className="mt-6 space-y-4">
          {form.questions.map((question, index) => (
            <div key={index} className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 sm:p-5">
              <p className="mb-3 text-base font-semibold text-slate-800">{question.label}</p>

              {question.type === "text" && (
                <input
                  type="text"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                  onChange={(e) => setAnswer(index, e.target.value)}
                />
              )}

              {question.type === "rating" && (
                <StarRatingInput
                  value={Number(answers[index]?.value || 0)}
                  onChange={(nextValue) => setAnswer(index, Number(nextValue))}
                />
              )}

              {question.type === "mcq" && (
                <div className="space-y-2">
                  {question.options.map((option, optIndex) => (
                    <label key={optIndex} className="flex items-center gap-2 rounded-md bg-white px-3 py-2 text-sm text-slate-700">
                      <input
                        type="radio"
                        name={`q-${index}`}
                        onChange={() => setAnswer(index, option)}
                        checked={answers[index]?.value === option}
                        className="h-4 w-4 accent-teal-600"
                      />
                      {option}
                    </label>
                  ))}
                </div>
              )}

              {question.type === "multi" && (
                <div className="space-y-2">
                  {question.options.map((option, optIndex) => (
                    <label key={optIndex} className="flex items-center gap-2 rounded-md bg-white px-3 py-2 text-sm text-slate-700">
                      <input
                        type="checkbox"
                        name={`q-${index}-multi-${optIndex}`}
                        onChange={() => toggleMultiAnswer(index, option)}
                        checked={Array.isArray(answers[index]?.value) && answers[index].value.includes(option)}
                        className="h-4 w-4 accent-teal-600"
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
          className="mt-6 w-full rounded-lg bg-teal-700 px-4 py-2.5 font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? "Submitting..." : "Submit Feedback"}
        </button>
      </form>
    </div>
  );
};

export default PublicFormPage;
