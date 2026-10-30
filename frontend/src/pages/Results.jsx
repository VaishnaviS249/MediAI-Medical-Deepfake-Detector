
import { Link, useLocation } from "react-router-dom";
import "./Results.css";
import "../App.css";

export default function Results() {
  const location = useLocation();

  const result = location.state?.result;
  const cnnResult = location.state?.cnn_result;
  const fileName = location.state?.fileName || "Medical image";
  const finalVerdict = location.state?.final_verdict;
  const verdictSource = location.state?.verdict_source;

  if (!result) {
    return (
      <div className="app">
        <nav className="navbar">
          <Link to="/" className="logo">
            <span className="results-logo-icon">✚</span>
            <span className="results-brand-text">
              <strong>MediAI</strong>
              <small>MEDICAL INTELLIGENCE</small>
            </span>
          </Link>

          <div className="nav-links">
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/detector">Detector</Link>
          </div>

          <div className="results-header-tag">
            <span className="results-status-dot"></span>
            AI ANALYSIS
          </div>
        </nav>

        <section className="results-container">
          <div className="results-card">
            <h1>No Results Yet</h1>
            <p>Upload and analyze a medical image to see your results.</p>
            <Link to="/detector" className="auth-nav-button">
              Go to Detector
            </Link>
          </div>
        </section>
      </div>
    );
  }

  const annotatedImageUrl = result.annotated_image_url
    ? `http://127.0.0.1:8001${result.annotated_image_url}`
    : null;

  const regions = Array.isArray(result.suspicious_regions)
    ? result.suspicious_regions
    : [];
    const heatmapUrl = cnnResult?.heatmap_url
    ? `http://127.0.0.1:8001${cnnResult.heatmap_url}`
    : null;

  return (
    <div className="app">
      <nav className="navbar">
        <Link to="/" className="logo">
          <span className="results-logo-icon">✚</span>
          <span className="results-brand-text">
            <strong>MediAI</strong>
            <small>MEDICAL INTELLIGENCE</small>
          </span>
        </Link>

        <div className="nav-links">
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/detector">Detector</Link>
        </div>

        <div className="results-header-tag">
          <span className="results-status-dot"></span>
          AI ANALYSIS
        </div>
      </nav>

      <section className="results-container">
        <div className="results-card">
          <div className="hero-badge">ANALYSIS COMPLETE</div>

          <h1>Analysis Results</h1>
          <p className="result-filename">File: {fileName}</p>

                    <div className="regions">
            <h2>Final Verdict</h2>
            <div className="result-box">
              <h3>{verdictSource ? `Based on: ${verdictSource}` : "Result"}</h3>
              <p>{(finalVerdict ?? "Not provided").toUpperCase()}</p>
            </div>
          </div>

          {/* Member 1: CNN classification */}
          <div className="regions">
            <h2>CNN Classification</h2>

            {cnnResult ? (
              <>
                <div className="result-summary">
                  <div className="result-box">
                    <h3>Prediction</h3>
                    <p>{cnnResult.label ?? "Not provided"}</p>
                  </div>

                  <div className="result-box">
                    <h3>Confidence</h3>
                    <p>
                      {cnnResult.confidence != null
                        ? `${(cnnResult.confidence * 100).toFixed(2)}%`
                        : "Not provided"}
                    </p>
                  </div>
                </div>

                <div className="result-summary">
                  <div className="result-box">
                    <h3>Fake Probability</h3>
                    <p>
                      {cnnResult.prob_fake != null
                        ? `${(cnnResult.prob_fake * 100).toFixed(2)}%`
                        : "Not provided"}
                    </p>
                  </div>

                  <div className="result-box">
                    <h3>Real Probability</h3>
                    <p>
                      {cnnResult.prob_real != null
                        ? `${(cnnResult.prob_real * 100).toFixed(2)}%`
                        : "Not provided"}
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <p>CNN classification was not included in the results.</p>
            )}
          </div>

          {/* Member 2: YOLO suspicious-region detection */}
          <div className="regions">
            <h2>YOLO Detection</h2>

            <div className="result-summary">
              <div className="result-box">
                <h3>Tampering Detected</h3>
                <p>
                  {result.tampering_detected === true
                    ? "YES"
                    : result.tampering_detected === false
                      ? "NO"
                      : "Not provided"}
                </p>
              </div>

              <div className="result-box">
                <h3>Suspicious Regions</h3>
                <p>{result.region_count ?? regions.length}</p>
              </div>
            </div>
          </div>

          {regions.length > 0 && (
            <div className="regions">
              <h2>Detected Regions</h2>

              {regions.map((region, index) => (
                <div className="region" key={index}>
                  <h3>Region {index + 1}</h3>

                  {region.confidence != null && (
                    <p>Confidence: {region.confidence}%</p>
                  )}

                  {Array.isArray(region.bounding_box) && (
                    <p>
                      Bounding box: [{region.bounding_box.join(", ")}]
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {annotatedImageUrl && (
            <div className="annotated-section">
              <h2>Annotated Detection Image</h2>
              <img
                src={annotatedImageUrl}
                alt="YOLO detection result with marked regions"
                className="result-image"
              />
            </div>
          )}

                    {result.low_confidence_pass && (
            <p className="dashboard-note">
              The boxes above come from a low-confidence second pass of the
              detector.
            </p>
          )}

          {!annotatedImageUrl && null}

          {heatmapUrl && (
            <div className="annotated-section">
              <h2>CNN Attention Heatmap</h2>
              <img
                src={heatmapUrl}
                alt="Grad-CAM heatmap showing where the classifier focused"
                className="result-image"
              />
              <p className="dashboard-note">
                Red and yellow areas show where the classifier focused. This
                shows model attention, not confirmed tampering.
              </p>
            </div>
          )}

          <p className="dashboard-note">
            This is an AI-generated result for an academic project, not a
            medical diagnosis. Please have medical images reviewed by a
            qualified professional.
          </p>

          <div className="result-actions">
            <Link to="/detector" className="auth-nav-button">
              Analyze Another Image
            </Link>
            <Link to="/dashboard" className="secondary-button">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
