import { Link } from "react-router-dom";

export default function Login() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-md px-4 py-12">
        <h1 className="text-2xl font-bold">Login</h1>
        <p className="mt-2 text-sm text-slate-600">
          We’ll add API login next.
        </p>

        <div className="mt-6 rounded-xl bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-700">
            Go to <Link className="text-blue-600 underline" to="/library">Library</Link> or{" "}
            <Link className="text-blue-600 underline" to="/register">Register</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
