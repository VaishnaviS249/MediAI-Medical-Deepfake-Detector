import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
export default function Auth({ mode }) {
  const isRegister = mode === "register";
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
 const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const endpoint = isRegister
        ? "http://127.0.0.1:8001/auth/register"
        : "http://127.0.0.1:8001/auth/login";

      const body = isRegister
        ? { name, email, password }
        : { email, password };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        const message =
          typeof data.detail === "string"
            ? data.detail
            : Array.isArray(data.detail)
              ? data.detail
                  .map((item) => item.msg || JSON.stringify(item))
                  .join(", ")
              : typeof data.detail === "object" && data.detail !== null
                ? JSON.stringify(data.detail)
                : "Authentication failed. Please try again.";

        throw new Error(message);
      }

      if (data.access_token) {
        sessionStorage.setItem("mediAI_token", data.access_token);
      }

      sessionStorage.setItem(
        "mediAI_user",
        JSON.stringify(data.user || { name, email })
      );

      
navigate("/dashboard", {
  state: { firstTimeUser: isRegister }
});
    } catch (err) {
      setError(
        err.message ||
          "Unable to connect to the server. Check that the backend is running."
      );
    } finally {
      setLoading(false);
    }
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

        <Link to="/" className="auth-modern-home-link">
          <span>←</span> Back to home
        </Link>
      </header>

      <section className="auth-modern-layout">
        <div className="auth-modern-form-side">
          <div className="auth-modern-form-wrap">
            <div className="auth-modern-badge">
              <span className="auth-modern-status-dot" />
              MEDICAL IMAGE SECURITY
            </div>

            <h1>
              {isRegister ? (
                <>
                  Start your
                  <br />
                  <span>MediAI journey.</span>
                </>
              ) : (
                <>
                  Welcome
                  <br />
                  <span>back.</span>
                </>
              )}
            </h1>

            <p className="auth-modern-description">
              {isRegister
                ? "Create your account to explore AI-assisted medical image integrity analysis."
                : "Sign in to access your workspace and continue your medical image analysis."}
            </p>

            <form
              className="auth-modern-form"
              onSubmit={handleSubmit}
            >
              {isRegister && (
                <div className="auth-modern-field">
                  <label htmlFor="auth-name">Full name</label>
                  <input
                    id="auth-name"
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoComplete="name"
                    required
                  />
                </div>
              )}

              <div className="auth-modern-field">
                <label htmlFor="auth-email">Email address</label>
                <input
                  id="auth-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>

              <div className="auth-modern-field">
  <label htmlFor="auth-password">Password</label>

  <div className="auth-password-wrapper">
    <input
      id="auth-password"
      type={showPassword ? "text" : "password"}
      placeholder="Enter your password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      autoComplete={
        isRegister ? "new-password" : "current-password"
      }
      minLength={6}
      required
    />


<button
  type="button"
  className="auth-password-toggle"
  onClick={() => setShowPassword((prev) => !prev)}
  aria-label={showPassword ? "Hide password" : "Show password"}
>
  {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
</button>


  </div>

  <small className="auth-modern-field-hint">
    {isRegister
      ? "Use at least 6 characters."
      : "Enter your account password."}
  </small>
</div>

<div className="auth-options">
  <label className="remember-me">
    <input type="checkbox" />
    <span>Remember me</span>
  </label>

  <Link
  to="/forgot-password"
  className="forgot-password"
>
  Forgot password?
</Link>
</div>


              {error && (
                <div className="auth-modern-error" role="alert">
                  <span>!</span>
                  {error}
                </div>
              )}

              <button
                className="auth-modern-submit"
                type="submit"
                disabled={loading}
              >
                {loading
                  ? "Please wait..."
                  : isRegister
                    ? "Create my account"
                    : "Sign in to MediAI"}
                {!loading && <span>→</span>}
              </button>
              

            </form>

            <p className="auth-modern-switch">
              {isRegister
                ? "Already have an account?"
                : "New to MediAI?"}{" "}
              <Link to={isRegister ? "/login" : "/register"}>
                {isRegister ? "Sign in" : "Create an account"}
              </Link>
            </p>

            <div className="auth-modern-security">
              <span>◇</span>
              <span>Secure access to your MediAI workspace</span>
            </div>
          </div>
        </div>

        <aside className="auth-modern-visual">
          <div className="auth-modern-visual-glow" />

          <div className="auth-modern-visual-content">
            <div className="auth-modern-visual-top">
              <span className="auth-modern-mini-logo">M</span>
              <span>MEDICAL IMAGE INTELLIGENCE</span>
              <span className="auth-modern-online">
                <i /> SYSTEM READY
              </span>
            </div>

            <div className="auth-modern-scan-frame">
              <img
  src="/AI-Driven.jpeg"
  alt="Futuristic AI-powered medical brain scan"
  className="auth-modern-scan"
/>

              <span className="auth-modern-scan-corner top-left" />
              <span className="auth-modern-scan-corner top-right" />
              <span className="auth-modern-scan-corner bottom-left" />
              <span className="auth-modern-scan-corner bottom-right" />

              <span className="auth-modern-scan-tag">
                MRI · BRAIN SCAN
              </span>

              <span className="auth-modern-scan-crosshair">+</span>
            </div>

            

            
          </div>

          
        </aside>
      </section>

      <footer className="auth-modern-footer">
        <span>© MediAI · Medical Image Integrity</span>
        <span>Built for research and education</span>
      </footer>
    </main>
  );
}