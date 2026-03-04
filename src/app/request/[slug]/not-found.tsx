import Link from "next/link";
import { Wrench } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Wrench className="w-8 h-8 text-slate-400" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Property Not Found</h1>
        <p className="text-slate-600 mb-6">
          This maintenance request portal link is invalid or has been removed.
          Please contact your landlord for the correct link.
        </p>
        <Link href="/" className="btn-secondary">
          Go to PropCare
        </Link>
      </div>
    </div>
  );
}
