import { QRCodeCanvas } from "qrcode.react";

const FormCard = ({ form, onEdit, onToggleStatus, onDelete, onOpenReport }) => {
  const publicLink = `${window.location.origin}/forms/${form._id}`;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{form.title}</h3>
          <p className="text-sm text-slate-600">{form.description}</p>
          <p className="mt-2 text-xs text-slate-500">Created: {new Date(form.createdAt).toLocaleString()}</p>
          <span
            className={`mt-2 inline-flex rounded-full px-2 py-1 text-xs font-medium ${
              form.isActive ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
            }`}
          >
            {form.isActive ? "Active" : "Inactive"}
          </span>
        </div>
        <div className="rounded-lg bg-slate-50 p-2">
          <QRCodeCanvas value={publicLink} size={84} />
        </div>
      </div>

      <div className="mt-3 rounded-md bg-slate-50 p-2 text-xs text-slate-700 break-all">{publicLink}</div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button onClick={() => navigator.clipboard.writeText(publicLink)} className="rounded-md bg-slate-200 px-3 py-1 text-sm">
          Copy Link
        </button>
        <button onClick={() => onEdit(form)} className="rounded-md bg-blue-600 px-3 py-1 text-sm text-white">
          Edit
        </button>
        <button
          onClick={() => onToggleStatus(form)}
          className="rounded-md bg-amber-500 px-3 py-1 text-sm text-white"
        >
          {form.isActive ? "Deactivate" : "Activate"}
        </button>
        <button onClick={() => onOpenReport(form)} className="rounded-md bg-indigo-600 px-3 py-1 text-sm text-white">
          Report
        </button>
        <button onClick={() => onDelete(form)} className="rounded-md bg-rose-600 px-3 py-1 text-sm text-white">
          Delete
        </button>
      </div>
    </div>
  );
};

export default FormCard;