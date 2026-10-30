
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../App.css";
import "./Detector.css";

export default function Detector() {
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!file) {
      setPreview("");
      return;
    }

    const imageUrl = URL.createObjectURL(file);
    setPreview(imageUrl);

    return () => URL.revokeObjectURL(imageUrl);
  }, [file]);

  function handleFileChange(event) {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) return;

    if (!selectedFile.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      setFile(null);
      event.target.value = "";
      return;
    }

    setError("");
    setFile(selectedFile);
  }

  async function analyzeImage(event) {
    event.preventDefault();

    if (!file) {
      setError("Please select a medical image first.");
      return;
    }

    const token = sessionStorage.getItem("mediAI_token");

    if (!token) {
      navigate("/login");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(
        "http://127.0.0.1:8001/analyze",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await response.json();
      console.log("Analysis API response:", data);

      if (!response.ok) {
        throw new Error(
          data.detail || "Image analysis failed."
        );
      }

           navigate("/results", {
        state: {
          result: data.result,
          cnn_result: data.cnn_result,
          final_verdict: data.final_verdict,
          verdict_source: data.verdict_source,
          fileName: file.name,
        },
      });
    } catch (err) {
      setError(
        err.message ||
          "Could not connect to the backend. Check that the server is running."
      );
    } finally {
      setLoading(false);
    }
  }

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
          <Link to="/detector" className="active">
            Detector
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

      <section className="medi-detector-page">
        <div className="medi-detector-heading">
          <span className="medi-detector-eyebrow">
            <span className="medi-detector-dot" />
            AI-POWERED IMAGE ANALYSIS
          </span>

          <h1>
            Medical Image <span>Detector</span>
          </h1>

          <p>
            Upload a medical image for AI-assisted analysis
            and review the results returned by the detection model.
          </p>
        </div>

        <div className="medi-detector-layout">
          <section className="medi-upload-card">
            <div className="medi-card-heading">
              <div>
                <span className="medi-step-label">
                  STEP 01
                </span>
                <h2>Upload your scan</h2>
              </div>

              <span className="medi-upload-symbol">
                ↑
              </span>
            </div>

            <form onSubmit={analyzeImage}>
              <label
                className={`medi-upload-area ${
                  preview ? "has-preview" : ""
                }`}
              >
                {!preview ? (
                  <>
                    <span className="medi-upload-icon">
                      <svg
                        viewBox="0 0 48 48"
                        width="43"
                        height="43"
                        fill="none"
                        aria-hidden="true"
                      >
                        <rect
                          x="5"
                          y="5"
                          width="38"
                          height="38"
                          rx="10"
                          stroke="currentColor"
                          strokeWidth="1.8"
                        />
                        <path
                          d="M24 32V16M17 23L24 16L31 23"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>

                    <strong>
                      Choose a medical image
                    </strong>

                    <span className="medi-upload-description">
                      Click here to browse files on your device
                    </span>

                    <span className="medi-upload-formats">
                      MRI · CT · X-RAY
                    </span>
                  </>
                ) : (
                  <span className="medi-upload-replace">
                    Choose a different image
                  </span>
                )}

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={loading}
                  hidden
                />
              </label>

              {preview && (
                <div className="medi-preview-card">
                  <div className="medi-preview-image-wrap">
                    <img
                      src={preview}
                      alt="Preview of selected medical image"
                      className="medi-preview-image"
                    />
                  </div>

                  <div className="medi-preview-details">
                    <span className="medi-preview-file-icon">
                      IMG
                    </span>

                    <div className="medi-preview-file-text">
                      <strong>{file?.name}</strong>
                      <span>
                        {(file.size / (1024 * 1024)).toFixed(2)} MB
                      </span>
                    </div>

                    <button
                      type="button"
                      className="medi-remove-file"
                      disabled={loading}
                      onClick={() => {
                        setFile(null);
                        setError("");
                      }}
                      aria-label="Remove selected image"
                    >
                      ×
                    </button>
                  </div>
                </div>
              )}

              {error && (
                <div
                  className="medi-detector-error"
                  role="alert"
                >
                  <span aria-hidden="true">!</span>
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="medi-analyze-button"
                disabled={!file || loading}
              >
                {loading ? (
                  <>
                    <span className="medi-spinner" />
                    Analyzing image...
                  </>
                ) : (
                  <>
                    Analyze Medical Image
                    <span aria-hidden="true">→</span>
                  </>
                )}
              </button>
            </form>

            <div className="medi-upload-security">
              <span aria-hidden="true">✓</span>
              Select an image to begin analysis.
            </div>
          </section>

          <aside className="medi-guidance-card">
            <div className="medi-guidance-icon">
              ✳
            </div>

            <span className="medi-step-label">
              HOW IT WORKS
            </span>

            <h2>From scan to insights</h2>

            <p>
              Follow these steps to submit an image and
              review the model's analysis.
            </p>

            <div className="medi-workflow">
              <div className="medi-workflow-step">
                <span>01</span>
                <div>
                  <strong>Select an image</strong>
                  <p>
                    Choose a supported image from your device.
                  </p>
                </div>
              </div>

              <div className="medi-workflow-step">
                <span>02</span>
                <div>
                  <strong>Run the analysis</strong>
                  <p>
                    Submit the image to the connected backend.
                  </p>
                </div>
              </div>

              <div className="medi-workflow-step">
                <span>03</span>
                <div>
                  <strong>Review the results</strong>
                  <p>
                    View the information returned by your model.
                  </p>
                </div>
              </div>
            </div>

            <div className="medi-guidance-note">
              <span aria-hidden="true">i</span>
              <p>
                <strong>Research use only</strong>
                <br />
                This tool is a project demonstration, not a
                substitute for professional medical assessment.
              </p>
            </div>
          </aside>
        </div>

        <footer className="medi-app-footer">
          <span>© MediAI · Medical Image Integrity</span>
          <span>Research and educational demonstration</span>
        </footer>
      </section>
    </main>
  );
}