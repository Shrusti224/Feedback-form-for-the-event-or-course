import {
  Bar,
  BarChart,
  CartesianGrid,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from "recharts";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#14b8a6"];

const ReportPanel = ({ summary }) => {
  if (!summary) return null;

  const ratingData = summary.questionAnalytics
    .filter((q) => q.type === "rating")
    .map((q) => ({ name: q.label.slice(0, 20), average: q.average }));

  const mcqQuestion = summary.questionAnalytics.find((q) => q.type === "mcq");
  const mcqData = mcqQuestion
    ? Object.entries(mcqQuestion.distribution).map(([name, value]) => ({ name, value }))
    : [];

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-lg font-semibold">Summary Report</h2>
      <p className="mt-1 text-sm text-slate-600">Total Responses: {summary.totalResponses}</p>

      {summary.lowestRatedQuestion && (
        <p className="mt-2 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-700">
          Lowest rated question: {summary.lowestRatedQuestion.label} ({summary.lowestRatedQuestion.average}/5)
        </p>
      )}

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="h-64 rounded-md border border-slate-100 p-2">
          <h3 className="mb-2 text-sm font-medium">Average Rating per Question</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={ratingData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 5]} />
              <Tooltip />
              <Bar dataKey="average" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="h-64 rounded-md border border-slate-100 p-2">
          <h3 className="mb-2 text-sm font-medium">Multiple Choice Distribution</h3>
          {mcqData.length ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={mcqData} dataKey="value" nameKey="name" outerRadius={90}>
                  {mcqData.map((entry, index) => (
                    <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-slate-500">No MCQ data</p>
          )}
        </div>
      </div>

      <div className="mt-4">
        <h3 className="text-sm font-medium">Recent Submissions</h3>
        <ul className="mt-2 space-y-2 text-sm text-slate-600">
          {summary.recentSubmissions.map((item) => (
            <li key={item.id} className="rounded-md bg-slate-50 px-3 py-2">
              {new Date(item.submittedAt).toLocaleString()} | {item.userType}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ReportPanel;