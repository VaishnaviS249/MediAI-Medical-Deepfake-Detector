import { Link, useNavigate, useLocation } from "react-router-dom";
import "./Dashboard.css";

export default function Dashboard() {
const navigate = useNavigate();
const location = useLocation();
const isFirstTimeUser = location.state?.firstTimeUser;

let user = {};
try {
user = JSON.parse(sessionStorage.getItem("mediAI_user") || "{}");
} catch {
user = {};
}

function handleLogout() {
sessionStorage.removeItem("mediAI_token");
sessionStorage.removeItem("mediAI_user");
navigate("/login");
}

const displayName = user.name?.trim() || "there";

return ( <div className="medi-dashboard"> <aside className="medi-sidebar"> <Link to="/" className="medi-brand"> <span className="medi-brand-mark">M<span>+</span></span> <span className="medi-brand-name">MediAI<small>IMAGE INTEGRITY</small></span> </Link>


    <div className="medi-sidebar-label">WORKSPACE</div>

    <nav className="medi-sidebar-nav">
      <Link to="/dashboard" className="medi-side-link active">
        <span className="medi-side-icon">◫</span>
        Overview
      </Link>
      <Link to="/detector" className="medi-side-link">
        <span className="medi-side-icon">⌕</span>
        Image detector
        <span className="medi-side-arrow">↗</span>
      </Link>
    </nav>
    <Link to="/history" className="medi-side-link">
  <span className="medi-side-icon">◷</span>
  Scan History
</Link>

    <div className="medi-sidebar-bottom">
      <div className="medi-help-card">
        <span className="medi-help-icon">✳</span>
        <strong>Designed for careful analysis</strong>
        <p>Review scan results thoughtfully. AI results are not a medical diagnosis.</p>
      </div>

      <div className="medi-profile">
        <div className="medi-avatar">
          {user.name?.trim()?.charAt(0)?.toUpperCase() || "M"}
        </div>
        <div className="medi-profile-info">
          <strong>{user.name || "MediAI User"}</strong>
          <span>Personal workspace</span>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="medi-logout"
          title="Log out"
          aria-label="Log out"
        >
          ↗
        </button>
      </div>
    </div>
  </aside>

  <main className="medi-dash-content">
    <header className="medi-topbar">
      <div>
        <span className="medi-breadcrumb">
  Medical Image Analysis <span>/</span> Dashboard
</span>
      </div>
      <div className="medi-topbar-right">
        <span className="medi-system-status">
          <span className="medi-status-dot" />
          Your workspace
        </span>
        <button
  type="button"
  className="medi-topbar-avatar"
  onClick={() => navigate("/profile")}
  title="View profile"
  aria-label="View profile"
>
  {user.name?.trim()?.charAt(0)?.toUpperCase() || "M"}
</button>
      </div>
    </header>

    <div className="medi-page-inner">
      <section className="medi-welcome">
        <div className="medi-welcome-copy">
          <div className="medi-eyebrow">
            <span className="medi-eyebrow-line" />
            MEDICAL IMAGE INTELLIGENCE
          </div>

          <h1>
            {isFirstTimeUser ? "Welcome to your new workspace," : "Welcome back,"}
            <br />
            <span>{displayName}.</span>
          </h1>

          <p>
            A clearer way to inspect medical images. Start an analysis
            to explore potentially suspicious regions in your scan.
          </p>

          <div className="medi-welcome-actions">
            <Link to="/detector" className="medi-primary-btn">
              <span>Start new analysis</span>
              <span className="medi-btn-arrow">↗</span>
            </Link>
            <span className="medi-no-setup">No complicated setup needed</span>
          </div>

          <div className="medi-welcome-footnote">
            <span>✳</span> AI-assisted image inspection
            <i />
            CT · MRI · X-ray
          </div>
        </div>

        <div className="medi-hero-art" aria-label="Decorative medical scan illustration">
          <div className="medi-art-orbit medi-art-orbit-one" />
          <div className="medi-art-orbit medi-art-orbit-two" />
          <div className="medi-art-glow" />
          <div className="medi-scan-frame">
            <div className="medi-scan-top">
              <span><i /> SCAN VISUALIZATION</span>
              <span>01 / AI</span>
            </div>
            <div className="medi-scan-visual">
              <div className="medi-scan-ring ring-one" />
              <div className="medi-scan-ring ring-two" />
              <div className="medi-scan-ring ring-three" />
              <div className="medi-scan-core">
                <span className="medi-brain-symbol">✳</span>
                <span className="medi-scan-cross cross-a">+</span>
                <span className="medi-scan-cross cross-b">+</span>
                <span className="medi-scan-cross cross-c">+</span>
                <div className="medi-scan-sweep" />
              </div>
            </div>
            <div className="medi-scan-bottom">
              <span>IMAGE ANALYSIS</span>
              <span className="medi-scan-ready"><i /> READY</span>
            </div>
          </div>
          <div className="medi-floating-tag tag-top">
            <span className="medi-tag-icon">✳</span>
            <span><strong>AI-assisted</strong><small>Image inspection</small></span>
          </div>
          <div className="medi-floating-tag tag-bottom">
            <span className="medi-tag-check">✓</span>
            <span><strong>One workspace</strong><small>For your scan workflow</small></span>
          </div>
          <span className="medi-art-plus plus-one">+</span>
          <span className="medi-art-plus plus-two">+</span>
        </div>
      </section>

      <section className="medi-section">
        <div className="medi-section-heading">
          <div>
            <span className="medi-section-kicker">YOUR TOOLS</span>
            <h2>Make your next move</h2>
            <p>Everything you need to get started, in one place.</p>
          </div>
          <span className="medi-workspace-pill">
            <span /> Workspace active
          </span>
        </div>

        <div className="medi-tool-grid">
          <article className="medi-tool-card medi-tool-primary">
            <div className="medi-tool-card-top">
              <div className="medi-tool-icon"><span>⌕</span></div>
              <span className="medi-tool-number">01</span>
            </div>
            <span className="medi-tool-label">CORE FEATURE</span>
            <h3>Medical image detector</h3>
            <p>
              Upload a medical scan and inspect AI-generated findings
              for potentially suspicious image regions.
            </p>
            <Link to="/detector" className="medi-tool-link">
              Open image detector <span>↗</span>
            </Link>
            <div className="medi-card-decoration">✳</div>
          </article>

          <article className="medi-tool-card medi-account-card">
            <div className="medi-tool-card-top">
              <div className="medi-tool-icon medi-account-icon">♙</div>
              <span className="medi-tool-number">02</span>
            </div>
            <span className="medi-tool-label">YOUR ACCOUNT</span>
            <h3>Your profile</h3>
            <p>Your signed-in account details for this MediAI workspace.</p>
            <div className="medi-account-detail">
              <span className="medi-account-detail-icon">✉</span>
              <span>
                <small>EMAIL ADDRESS</small>
                <strong>{user.email || "No email available"}</strong>
              </span>
            </div>
            <button type="button" onClick={handleLogout} className="medi-account-logout">
              Sign out of your account <span>→</span>
            </button>
          </article>
        </div>
      </section>

      <section className="medi-note">
        <div className="medi-note-icon">i</div>
        <div>
          <strong>A note on responsible use</strong>
          <p>
          MediAI uses AI-based image analysis to identify potentially suspicious regions in medical images. Results should be interpreted alongside expert review to support further investigation.
          </p>
        </div>
      </section>

      <footer className="medi-footer">
        <span>© {new Date().getFullYear()} MediAI <i /> Medical Deepfake Detector</span>
        <span>Built for academic exploration</span>
      </footer>
    </div>
  </main>
</div>


);
}
