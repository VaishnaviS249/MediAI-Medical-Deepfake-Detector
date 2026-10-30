import "./Profile.css";
import { Link, useNavigate } from "react-router-dom";
import "./Profile.css";

export default function Profile() {
  const navigate = useNavigate();

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

  const initial = user.name?.trim()?.charAt(0)?.toUpperCase() || "M";

  return (
    <div className="medi-profile-page">
      <header className="medi-profile-header">
        <Link to="/dashboard" className="medi-profile-brand">
          <span className="medi-profile-logo">M</span>
          <span>MediAI</span>
        </Link>

        <Link to="/dashboard" className="medi-profile-back">
          ← Back to Dashboard
        </Link>
      </header>

      <main className="medi-profile-main">
        <div className="medi-profile-heading">
          <span className="medi-profile-eyebrow">YOUR ACCOUNT</span>
          <h1>My Profile</h1>
          <p>View your account information and manage your MediAI session.</p>
        </div>

        <section className="medi-profile-card">
          <div className="medi-profile-banner" />

          <div className="medi-profile-content">
            <div className="medi-profile-avatar">{initial}</div>

            <h2>{user.name || "MediAI User"}</h2>
            <p className="medi-profile-email">
              {user.email || "Email not available"}
            </p>

            <div className="medi-profile-divider" />

            <h3>Personal Information</h3>

            <div className="medi-profile-detail">
              <span className="medi-profile-detail-icon">♙</span>
              <div>
                <span className="medi-profile-label">Full Name</span>
                <p>{user.name || "Not provided"}</p>
              </div>
            </div>

            <div className="medi-profile-detail">
              <span className="medi-profile-detail-icon">@</span>
              <div>
                <span className="medi-profile-label">Email Address</span>
                <p>{user.email || "Not provided"}</p>
              </div>
            </div>

            <div className="medi-profile-detail">
              <span className="medi-profile-detail-icon">✓</span>
              <div>
                <span className="medi-profile-label">Workspace</span>
                <p>MediAI Medical Deepfake Detector</p>
              </div>
            </div>

            <button
              type="button"
              className="medi-profile-logout"
              onClick={handleLogout}
            >
              Log out of account
            </button>
          </div>
        </section>

        <p className="medi-profile-note">
          MediAI is an academic project and is not a substitute for
          professional medical advice.
        </p>
      </main>
    </div>
  );
}