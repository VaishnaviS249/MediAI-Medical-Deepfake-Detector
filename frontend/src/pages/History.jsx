
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../App.css";
import "./History.css";

const API_URL = "http://127.0.0.1:8001";

function getSummary(result) {
  if (!result) return "No result available";

  if (typeof result === "string") return result;

  return (
    result.prediction ??
    result.class_name ??
    result.label ??
    result.status ??
    "Analysis completed"
  );
}

export default function History() {
  const navigate = useNavigate();

  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadHistory = useCallback(async () => {
    const token = sessionStorage.getItem("mediAI_token");

    if (!token) {
      navigate("/login");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/history`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.status === 401) {
        sessionStorage.removeItem("mediAI_token");
        sessionStorage.removeItem("mediAI_user");
        navigate("/login");
        return;
      }

      if (!response.ok) {
        throw new Error(
          data.detail || "Could not load scan history."
        );
      }

      setScans(Array.isArray(data.scans) ? data.scans : []);
    } catch (err) {
      setError(
        err.message || "Could not connect to the backend."
      );
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  function handleLogout() {
    sessionStorage.removeItem("mediAI_token");
    sessionStorage.removeItem("mediAI_user");
    navigate("/login");
  }

  return (
    <main className="medi-app">
      <header className="medi-app-nav">
        <Link to="/" className="medi-app-brand">
          <span className="medi-app-logo">M</span>
          <span>
            <strong>MediAI</strong>
            <small>MEDICAL IMAGE INTELLIGENCE</small>
          </span>
        </Link>

        <nav className="medi-app-links">
          <Link to="/">Home</Link>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/detector">Detector</Link>
          <Link to="/history" className="active">
            History
          </Link>
        </nav>

        <button
          type="button"
          className="medi-app-logout"
          onClick={handleLogout}
        >
          Logout <span aria-hidden="true">↗</span>
        </button>
      </header>

      <section className="medi-history-page">
        <div className="medi-history-heading">
          <span className="medi-history-eyebrow">
            YOUR MEDICAL IMAGE RECORDS
          </span>

          <h1>Scan <span>History</span></h1>

          <p>
            Review your previous image analyses and their saved
            model results.
          </p>
        </div>

        <div className="medi-history-toolbar">
          <div>
            <strong>Previous scans</strong>
            <p>
              {scans.length} saved{" "}
              {scans.length === 1 ? "scan" : "scans"}
            </p>
          </div>

          <button
            type="button"
            className="medi-history-refresh"
            onClick={loadHistory}
            disabled={loading}
          >
            {loading ? "Loading..." : "↻ Refresh"}
          </button>
        </div>

        {error && (
          <div className="medi-history-message error" role="alert">
            {error}
          </div>
        )}

        {loading ? (
          <div className="medi-history-message">
            Loading your scan history...
          </div>
        ) : !error && scans.length === 0 ? (
          <div className="medi-history-empty">
            <h2>No scans yet</h2>
            <p>
              Your completed analyses will appear here.
            </p>
            <Link to="/detector" className="medi-history-primary">
              Analyze an image →
            </Link>
          </div>
        ) : (
          <div className="medi-history-list">
            {scans.map((scan) => (
              <article
                className="medi-history-card"
                key={scan.scan_id}
              >
                <div className="medi-history-card-top">
                  <div className="medi-history-file-icon">
                    IMG
                  </div>

                  <div className="medi-history-file">
                    <h2>{scan.filename || "Medical scan"}</h2>
                    <p>
                      {scan.created_at
                        ? new Date(scan.created_at).toLocaleString()
                        : "Date unavailable"}
                    </p>
                  </div>
                </div>

                <div className="medi-history-results">
                  <div>
                    <span>CNN classification</span>
                    <strong>
                      {getSummary(scan.cnn_result)}
                    </strong>
                  </div>

                  <div>
                    <span>YOLO detection</span>
                    <strong>
                      {getSummary(scan.yolo_result)}
                    </strong>
                  </div>
                </div>

                <details className="medi-history-details">
                  <summary>View saved analysis details</summary>

                  <h3>CNN result</h3>
                  <pre>
                    {JSON.stringify(scan.cnn_result, null, 2)}
                  </pre>

                  <h3>YOLO result</h3>
                  <pre>
                    {JSON.stringify(scan.yolo_result, null, 2)}
                  </pre>
                </details>
              </article>
            ))}
          </div>
        )}

        <footer className="medi-history-footer">
          Research and educational demonstration only. Results
          are not a substitute for professional medical assessment.
        </footer>
      </section>
    </main>
  );
}
