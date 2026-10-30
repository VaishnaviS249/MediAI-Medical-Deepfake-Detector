
import { useState } from "react";
import { Link } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");

  function handleSubmit(e) {
    e.preventDefault();

    // Temporary until the password-reset API is implemented.
    alert("Password reset is not connected to the backend yet.");
  }

  return (
    <main className="auth-modern-page">
      <header className="auth-modern-nav">
        <Link to="/" className="auth-modern-brand">
          <span className="auth-modern-logo">M</span>
          <span className="auth-modern-brand-text">
            <strong>MediAI</strong>
            <small>MEDICAL IMAGE INTELLIGENCE</small>
          </span>
        </Link>

        <Link to="/login" className="auth-modern-home-link">
          ← Back to login
        </Link>
      </header>

      <section className="forgot-password-card">
        <h1>Forgot your password?</h1>

        <p>
          Enter your registered email address to begin
          resetting your MediAI account password.
        </p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="reset-email">Email address</label>

          <input
            id="reset-email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />

          <button type="submit">
            Reset password →
          </button>
        </form>

        <Link to="/login" className="forgot-back-link">
          Back to sign in
        </Link>
      </section>
    </main>
  );
}