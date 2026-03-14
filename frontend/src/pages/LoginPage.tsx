import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";

import { env } from "../config/env";
import { login } from "../features/auth/auth.service";
import { useAuth } from "../features/auth/auth-context";

export function LoginPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, setAuthenticatedSession, enableDemoSession } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (env.demoMode && !isAuthenticated) {
      enableDemoSession();
      navigate("/dashboard", { replace: true });
    }
  }, [enableDemoSession, isAuthenticated, navigate]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const result = await login({
        email,
        password,
      });
      setAuthenticatedSession(result.user, result.accessToken);
      navigate("/dashboard");
    } catch {
      setErrorMessage("Invalid email or password");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleDemo(): void {
    enableDemoSession();
    navigate("/dashboard");
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100">
        <section className="mx-auto max-w-md px-6 py-20 text-sm text-slate-400">
          Restoring session...
        </section>
      </main>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <section className="mx-auto flex max-w-md flex-col gap-6 px-6 py-20">
        <h1 className="text-3xl font-semibold tracking-tight">Sign In</h1>
        {env.demoMode ? (
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
            Demo mode is enabled. You can explore the dashboard with sample data.
          </div>
        ) : null}
        <p className="text-sm text-slate-400">
          Login to view your e-commerce analytics dashboard.
        </p>
        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900 p-6"
        >
          <label className="block space-y-2 text-sm">
            <span>Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 outline-none ring-brand-500 transition focus:ring-2"
              placeholder="you@company.com"
              required
            />
          </label>
          <label className="block space-y-2 text-sm">
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 outline-none ring-brand-500 transition focus:ring-2"
              placeholder="********"
              required
            />
          </label>
          {errorMessage ? (
            <p className="text-sm text-red-400">{errorMessage}</p>
          ) : null}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-brand-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Signing In..." : "Sign In"}
          </button>
        </form>
        {env.demoMode ? (
          <button
            type="button"
            onClick={handleDemo}
            className="w-full rounded-xl border border-slate-700 px-4 py-2 text-sm font-medium text-slate-100 transition hover:border-slate-500"
          >
            Continue as Demo
          </button>
        ) : null}
      </section>
    </main>
  );
}
