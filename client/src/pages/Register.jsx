import { Link } from "react-router-dom";

export default function Register() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-md px-4 py-12">
        <h1 className="text-2xl font-bold">Register</h1>
        <p className="mt-2 text-sm text-slate-600">
          We’ll add API register + under-18 guardian validation next.
        </p>

        <div className="mt-6 rounded-xl bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-700">
            Back to <Link className="text-blue-600 underline" to="/login">Login</Link> or{" "}
            <Link className="text-blue-600 underline" to="/library">Library</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
