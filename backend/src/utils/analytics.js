export const calculateFormSummary = (form, responses) => {
  const questionAnalytics = form.questions.map((question, index) => {
    const answers = responses
      .map((r) => r.answers.find((ans) => ans.questionIndex === index))
      .filter(Boolean)
      .map((ans) => ans.value);

    if (question.type === "rating") {
      const numeric = answers.map(Number).filter((v) => Number.isFinite(v));
      const total = numeric.reduce((a, b) => a + b, 0);
      const average = numeric.length ? Number((total / numeric.length).toFixed(2)) : 0;
      return {
        index,
        label: question.label,
        type: question.type,
        totalResponses: numeric.length,
        average,
      };
    }

    if (question.type === "mcq") {
      const distribution = (question.options || []).reduce((acc, option) => {
        acc[option] = 0;
        return acc;
      }, {});

      answers.forEach((value) => {
        const key = String(value);
        distribution[key] = (distribution[key] || 0) + 1;
      });

      return {
        index,
        label: question.label,
        type: question.type,
        totalResponses: answers.length,
        distribution,
      };
    }

    return {
      index,
      label: question.label,
      type: question.type,
      totalResponses: answers.length,
      recentTexts: answers.slice(-5),
    };
  });

  const ratingQuestions = questionAnalytics.filter((q) => q.type === "rating" && q.totalResponses > 0);
  let lowestRatedQuestion = null;
  if (ratingQuestions.length) {
    lowestRatedQuestion = ratingQuestions.reduce((low, current) => (current.average < low.average ? current : low));
  }

  return {
    formId: form._id,
    formTitle: form.title,
    totalResponses: responses.length,
    questionAnalytics,
    lowestRatedQuestion,
    recentSubmissions: responses.slice(0, 10).map((r) => ({
      id: r._id,
      submittedAt: r.createdAt,
      userType: r.userType,
    })),
  };
};