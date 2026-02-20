const emptyQuestion = { type: "text", label: "", required: true, options: ["Option 1", "Option 2"] };

const FormBuilder = ({ draft, setDraft, onSubmit, onCancel, loading }) => {
  const updateQuestion = (index, patch) => {
    const next = [...draft.questions];
    next[index] = { ...next[index], ...patch };
    setDraft({ ...draft, questions: next });
  };

  const addQuestion = () => {
    setDraft({ ...draft, questions: [...draft.questions, { ...emptyQuestion }] });
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

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">{draft._id ? "Edit Form" : "Create Feedback Form"}</h2>
      <div className="mt-4 grid gap-3">
        <input
          className="rounded-md border border-slate-300 px-3 py-2"
          placeholder="Form Title"
          value={draft.title}
          onChange={(e) => setDraft({ ...draft, title: e.target.value })}
        />
        <textarea
          className="rounded-md border border-slate-300 px-3 py-2"
          placeholder="Description"
          value={draft.description}
          onChange={(e) => setDraft({ ...draft, description: e.target.value })}
        />
      </div>

      <div className="mt-4 space-y-3">
        {draft.questions.map((question, index) => (
          <div key={index} className="rounded-lg border border-slate-200 p-3">
            <div className="grid gap-2 md:grid-cols-3">
              <input
                className="rounded-md border border-slate-300 px-3 py-2 md:col-span-2"
                placeholder={`Question ${index + 1}`}
                value={question.label}
                onChange={(e) => updateQuestion(index, { label: e.target.value })}
              />
              <select
                className="rounded-md border border-slate-300 px-3 py-2"
                value={question.type}
                onChange={(e) => updateQuestion(index, { type: e.target.value })}
              >
                <option value="text">Short Text</option>
                <option value="rating">Rating (1-5)</option>
                <option value="mcq">Multiple Choice</option>
              </select>
            </div>

            {question.type === "mcq" && (
              <div className="mt-2 space-y-2">
                {(question.options || []).map((option, optIndex) => (
                  <input
                    key={optIndex}
                    className="w-full rounded-md border border-slate-300 px-3 py-2"
                    value={option}
                    onChange={(e) => updateOption(index, optIndex, e.target.value)}
                  />
                ))}
                <button onClick={() => addOption(index)} className="rounded-md bg-slate-200 px-3 py-1 text-sm">
                  Add Option
                </button>
              </div>
            )}

            <div className="mt-3 flex justify-end">
              <button onClick={() => removeQuestion(index)} className="rounded-md bg-rose-100 px-3 py-1 text-sm text-rose-700">
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button onClick={addQuestion} className="rounded-md bg-slate-200 px-3 py-2 text-sm">
          Add Question
        </button>
        <button
          onClick={onSubmit}
          disabled={loading}
          className="rounded-md bg-blue-600 px-3 py-2 text-sm text-white disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Form"}
        </button>
        <button onClick={onCancel} className="rounded-md bg-slate-100 px-3 py-2 text-sm">
          Cancel
        </button>
      </div>
    </div>
  );
};

export default FormBuilder;