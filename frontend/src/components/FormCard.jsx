import { QRCodeCanvas } from "qrcode.react";

const FormCard = ({ form, onEdit, onToggleStatus, onDelete, onOpenReport }) => {
  const publicLink = `${window.location.origin}/forms/${form._id}`;
  const qrCanvasId = `qr-code-${form._id}`;

  const onDownloadQr = () => {
    const canvas = document.getElementById(qrCanvasId);
    if (!canvas) return;

    const pngUrl = canvas.toDataURL("image/png");
    const downloadLink = document.createElement("a");
    downloadLink.href = pngUrl;
    downloadLink.download = `${form.title || "feedback-form"}-qr.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold tracking-tight text-slate-900">{form.title}</h3>
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
        <div className="rounded-lg border border-slate-200 bg-white p-2 shadow-sm">
          <QRCodeCanvas id={qrCanvasId} value={publicLink} size={84} />
        </div>
      </div>

      <div className="mt-3 rounded-md border border-slate-200 bg-white p-2 text-xs text-slate-700 break-all">{publicLink}</div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={() => navigator.clipboard.writeText(publicLink)}
          className="rounded-md bg-slate-200 px-3 py-1 text-sm font-medium text-slate-700 transition hover:bg-slate-300"
        >
          Copy Link
        </button>
        <button onClick={onDownloadQr} className="rounded-md bg-teal-600 px-3 py-1 text-sm font-semibold text-white transition hover:bg-teal-700">
          Download QR
        </button>
        <button onClick={() => onEdit(form)} className="rounded-md bg-blue-600 px-3 py-1 text-sm font-semibold text-white transition hover:bg-blue-700">
          Edit
        </button>
        <button onClick={() => onToggleStatus(form)} className="rounded-md bg-amber-500 px-3 py-1 text-sm font-semibold text-white transition hover:bg-amber-600">
          {form.isActive ? "Deactivate" : "Activate"}
        </button>
        <button onClick={() => onOpenReport(form)} className="rounded-md bg-indigo-600 px-3 py-1 text-sm font-semibold text-white transition hover:bg-indigo-700">
          View Summary
        </button>
        <button onClick={() => onDelete(form)} className="rounded-md bg-rose-600 px-3 py-1 text-sm font-semibold text-white transition hover:bg-rose-700">
          Delete
        </button>
      </div>
    </div>
  );
};

export default FormCard;
