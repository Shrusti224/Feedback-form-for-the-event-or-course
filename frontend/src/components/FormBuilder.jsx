const defaultOptions = ["Option 1", "Option 2"];
const moodOptions = ["Worst", "Moderate", "Fine", "Great"];
const emptyQuestion = { type: "text", label: "", required: true, options: [...defaultOptions] };

const hasKeyword = (text, keywords) => keywords.some((keyword) => text.includes(keyword));

const generateQuestionsFromContext = (title, description) => {
  const context = `${title} ${description}`.toLowerCase();
  const questions = [];

  questions.push({
    type: "rating",
    label: `How would you rate ${title.trim() || "this event"} overall?`,
    required: true,
    options: [],
  });

  if (hasKeyword(context, ["food", "snack", "catering", "meal", "lunch", "dinner"])) {
    questions.push({
      type: "multi",
      label: "What did you like about the food and beverage?",
      required: true,
      options: ["Taste", "Variety", "Quantity", "Hygiene", "Presentation"],
    });
  }

  if (hasKeyword(context, ["speaker", "session", "talk", "panel", "workshop"])) {
    questions.push({
      type: "rating",
      label: "How useful were the sessions/speakers?",
      required: true,
      options: [],
    });
  }

  if (hasKeyword(context, ["venue", "hall", "location", "arrangement", "logistics"])) {
    questions.push({
      type: "mcq",
      label: "How was the venue and overall arrangement?",
      required: true,
      options: [...moodOptions],
    });
  }

  questions.push({
    type: "mcq",
    label: "How would you describe your overall experience?",
    required: true,
    options: [...moodOptions],
  });

  questions.push({
    type: "text",
    label: "What should we improve next time?",
    required: true,
    options: [],
  });

  return questions.slice(0, 6);
};

const FormBuilder = ({ draft, setDraft, onSubmit, onCancel, loading }) => {
  const normalizeQuestionByType = (question, nextType) => {
    if (nextType === "mcq" || nextType === "multi") {
      const cleaned = (question.options || []).filter((option) => String(option).trim());
      return {
        ...question,
        type: nextType,
        options: cleaned.length ? cleaned : [...defaultOptions],
      };
    }

    return {
      ...question,
      type: nextType,
      options: [],
    };
  };

  const updateQuestion = (index, patch) => {
    const next = [...draft.questions];
    next[index] = { ...next[index], ...patch };
    setDraft({ ...draft, questions: next });
  };

  const updateQuestionType = (index, nextType) => {
    const next = [...draft.questions];
    next[index] = normalizeQuestionByType(next[index], nextType);
    setDraft({ ...draft, questions: next });
  };

  const addQuestion = () => {
    setDraft({ ...draft, questions: [...draft.questions, { ...emptyQuestion }] });
  };

  const duplicateQuestion = (index) => {
    const source = draft.questions[index];
    if (!source) return;
    const clone = {
      ...source,
      options: [...(source.options || [])],
    };
    const next = [...draft.questions];
    next.splice(index + 1, 0, clone);
    setDraft({ ...draft, questions: next });
  };

  const removeQuestion = (index) => {
    if (draft.questions.length === 1) return;
    const next = draft.questions.filter((_, idx) => idx !== index);
    setDraft({ ...draft, questions: next });
  };

  const updateOption = (qIndex, optionIndex, value) => {
    const nextQuestions = [...draft.questions];
    const opts = [...(nextQuestions[qIndex].options || [])];
    opts[optionIndex] = value;
    nextQuestions[qIndex] = { ...nextQuestions[qIndex], options: opts };
    setDraft({ ...draft, questions: nextQuestions });
  };

  const addOption = (qIndex) => {
    const nextQuestions = [...draft.questions];
    const opts = [...(nextQuestions[qIndex].options || []), `Option ${(nextQuestions[qIndex].options || []).length + 1}`];
    nextQuestions[qIndex] = { ...nextQuestions[qIndex], options: opts };
    setDraft({ ...draft, questions: nextQuestions });
  };

  const applyMoodPreset = (qIndex) => {
    const nextQuestions = [...draft.questions];
    nextQuestions[qIndex] = { ...nextQuestions[qIndex], options: [...moodOptions] };
    setDraft({ ...draft, questions: nextQuestions });
  };

  const autoGenerateQuestions = () => {
    const title = draft.title.trim();
    const description = draft.description.trim();
    if (!title && !description) return;

    setDraft({
      ...draft,
      questions: generateQuestionsFromContext(title, description),
    });
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-lg backdrop-blur-sm md:p-5">
      <h2 className="text-lg font-semibold tracking-tight text-slate-900">{draft._id ? "Edit Form" : "Create Feedback Form"}</h2>
      <div className="mt-4 grid gap-3">
        <input
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
          placeholder="Form Title"
          value={draft.title}
          onChange={(e) => setDraft({ ...draft, title: e.target.value })}
        />
        <textarea
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
          placeholder="Description"
          value={draft.description}
          onChange={(e) => setDraft({ ...draft, description: e.target.value })}
        />
        <button
          onClick={autoGenerateQuestions}
          disabled={!draft.title.trim() && !draft.description.trim()}
          className="rounded-lg bg-teal-700 px-3 py-2 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Auto Generate Questions
        </button>
      </div>

      <div className="mt-4 space-y-3">
        {draft.questions.map((question, index) => (
          <div key={index} className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
            <div className="grid gap-2 md:grid-cols-3">
              <input
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100 md:col-span-2"
                placeholder={`Question ${index + 1}`}
                value={question.label}
                onChange={(e) => updateQuestion(index, { label: e.target.value })}
              />
              <select
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                value={question.type}
                onChange={(e) => updateQuestionType(index, e.target.value)}
              >
                <option value="text">Short Text</option>
                <option value="rating">Rating (1-5)</option>
                <option value="mcq">Multiple Choice</option>
                <option value="multi">Multi Select (Tick Many)</option>
              </select>
            </div>

            {(question.type === "mcq" || question.type === "multi") && (
              <div className="mt-2 space-y-2">
                {(question.options || []).map((option, optIndex) => (
                  <input
                    key={optIndex}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                    value={option}
                    onChange={(e) => updateOption(index, optIndex, e.target.value)}
                  />
                ))}
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => addOption(index)} className="rounded-md bg-slate-200 px-3 py-1 text-sm font-medium text-slate-700 transition hover:bg-slate-300">
                    Add Option
                  </button>
                  <button
                    onClick={() => applyMoodPreset(index)}
                    className="rounded-md bg-amber-100 px-3 py-1 text-sm font-medium text-amber-800 transition hover:bg-amber-200"
                  >
                    Use Preset: Worst / Moderate / Fine / Great
                  </button>
                </div>
              </div>
            )}

            <div className="mt-3 flex justify-end gap-2">
              <button
                onClick={() => duplicateQuestion(index)}
                className="rounded-md bg-indigo-100 px-3 py-1 text-sm font-medium text-indigo-700 transition hover:bg-indigo-200"
              >
                Duplicate
              </button>
              <button
                onClick={() => removeQuestion(index)}
                className="rounded-md bg-rose-100 px-3 py-1 text-sm font-medium text-rose-700 transition hover:bg-rose-200"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button onClick={addQuestion} className="rounded-lg bg-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-300">
          Add Question
        </button>
        <button
          onClick={onSubmit}
          disabled={loading}
          className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Form"}
        </button>
        <button onClick={onCancel} className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200">
          Cancel
        </button>
      </div>
    </div>
  );
};

export default FormBuilder;
