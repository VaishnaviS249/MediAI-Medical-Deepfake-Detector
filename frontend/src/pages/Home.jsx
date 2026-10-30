
import React from "react";
import { Link } from "react-router-dom";
import "../App.css";
import "./Home.css";

export default function Home() {
  return (
    <main className="medi-home">
      <header className="medi-nav">
        <Link to="/" className="medi-brand">
          <span className="medi-brand-icon">∿</span>
          <span>
            <strong>Medi<span>AI</span></strong>
            <small>MEDICAL IMAGE INTELLIGENCE</small>
          </span>
        </Link>

        <nav className="medi-nav-links">
          <Link to="/" className="medi-nav-active">Home</Link>
          <Link to="/detector">Detector</Link>
          <Link to="/about">About</Link>
        </nav>

        <Link to="/login" className="medi-login">
          Login <span aria-hidden="true">↗</span>
        </Link>
      </header>

      <section className="medi-hero">
        <div className="medi-hero-content">
          <div className="medi-eyebrow">
            <span className="medi-status-dot" />
            AI-POWERED MEDICAL IMAGE ANALYSIS
          </div>

          <h1>
            See beyond
            <br />
            the scan.
            <br />
            <span>Trust the evidence.</span>
          </h1>

          <p className="medi-hero-description">
            Detect potential manipulations in medical images with
            AI-powered analysis. Explore suspicious regions and
            understand your results through one simple interface.
          </p>

          <div className="medi-hero-actions">
            <Link to="/detector" className="medi-primary-button">
              Open Image Detector <span aria-hidden="true">→</span>
            </Link>

            <Link to="/about" className="medi-secondary-button">
              Learn about MediAI
            </Link>
          </div>

          <div className="medi-trust-note">
            <span className="medi-trust-check">✓</span>
            <span>Image analysis support</span>
            <span className="medi-trust-separator">•</span>
            <span>Visual result insights</span>
          </div>
        </div>

        <div className="medi-hero-visual">
          <div className="medi-scan-card">
            <div className="medi-scan-top">
              <div>
                <span className="medi-scan-label">MEDICAL AI WORKSTATION</span>
                <span className="medi-scan-subtitle">
                  MRI · CT · Medical image analysis
                </span>
              </div>

              <span className="medi-scan-live">
                <span className="medi-status-dot" />
                AI READY
              </span>
            </div>

            <div className="medi-scan-image-wrap">
              <img
                src="/medical-scan.png"
                alt="Colourful medical imaging workstation"
                className="medi-scan-image"
              />

              <div className="medi-scan-image-shade" />

              <div className="medi-scan-corner-label">
                <span className="medi-status-dot" />
                MULTI-SCAN VIEW
              </div>

              <div className="medi-scan-bottom-label">
                AI-ASSISTED IMAGE REVIEW
              </div>
            </div>

            <div className="medi-scan-footer">
              <div className="medi-scan-footer-icon">✳</div>
              <div>
                <strong>Medical image integrity</strong>
                <p>Explore model predictions and suspicious regions</p>
              </div>
              <span className="medi-scan-arrow">↗</span>
            </div>
          </div>

          <p className="medi-image-disclaimer">
            Illustrative interface · Not a clinical diagnosis
          </p>
        </div>
      </section>
      
{/* About MediAI */}
<section className="medi-about">
  <div className="medi-section-heading">
    <span className="medi-eyebrow">ABOUT THE PROJECT</span>
    <h2>What is MediAI?</h2>
    <p>
      MediAI is an AI-assisted medical image analysis project
      that examines medical images for potential manipulation.
      It combines image classification and suspicious-region
      detection to present results in an understandable way.
    </p>
  </div>

  <div className="medi-feature-grid">
    <article className="medi-feature-card">
      <div className="medi-feature-icon">01</div>
      <h3>CNN Image Classification</h3>
      <p>
        Our CNN model classifies an uploaded image as Real
        or Fake and provides confidence scores for its
        predictions.
      </p>
    </article>

    <article className="medi-feature-card">
      <div className="medi-feature-icon">02</div>
      <h3>YOLO Region Detection</h3>
      <p>
        The YOLO model checks for potential suspicious
        regions and highlights detected areas on the image.
      </p>
    </article>

    <article className="medi-feature-card">
      <div className="medi-feature-icon">03</div>
      <h3>Visual Results</h3>
      <p>
        View the classification, confidence scores and
        detection results together on the results page.
      </p>
    </article>
  </div>
</section>

{/* How MediAI works */}
<section className="medi-how">
  <div className="medi-section-heading">
    <span className="medi-eyebrow">THE PROCESS</span>
    <h2>How Does It Work?</h2>
    <p>
      Three simple steps take you from uploading an image
      to understanding the AI-generated results.
    </p>
  </div>

  <div className="medi-steps">
    <article className="medi-step">
      <span className="medi-step-number">01</span>
      <h3>Upload</h3>
      <p>
        Select a supported medical image from your device
        using the image detector.
      </p>
    </article>

    <article className="medi-step">
      <span className="medi-step-number">02</span>
      <h3>Analyze</h3>
      <p>
        The CNN model classifies the image, while YOLO
        searches for potential suspicious regions.
      </p>
    </article>

    <article className="medi-step">
      <span className="medi-step-number">03</span>
      <h3>Review Results</h3>
      <p>
        Review the predicted class, confidence scores
        and any detected regions.
      </p>
    </article>
  </div>

  <div className="medi-cta">
    <div>
      <h3>Ready to explore MediAI?</h3>
      <p>Upload an image to see how the analysis works.</p>
    </div>
    <a href="/detector" className="medi-cta-button">
      Open Detector →
    </a>
  </div>
</section>

{/* Understanding results */}
<section className="medi-results-info">
  <div className="medi-section-heading">
    <span className="medi-eyebrow">KNOW YOUR RESULTS</span>
    <h2>Understanding the Analysis</h2>
    <p>
      Learn what the different parts of the results page mean.
    </p>
  </div>

  <div className="medi-result-grid">
    <article className="medi-result-card">
      <h3>Classification</h3>
      <p>
        The predicted Real or Fake label represents the
        category selected by the CNN model.
      </p>
    </article>

    <article className="medi-result-card">
      <h3>Confidence Scores</h3>
      <p>
        These scores show the model's relative confidence
        in its predicted categories. They do not guarantee
        that a prediction is correct.
      </p>
    </article>

    <article className="medi-result-card">
      <h3>Suspicious Regions</h3>
      <p>
        Highlighted boxes show regions flagged by YOLO.
        If no regions are detected, it does not prove
        that the image is genuine.
      </p>
    </article>
  </div>

  <p className="medi-disclaimer">
    <strong>Important:</strong> MediAI is an academic
    prototype for image analysis, not a diagnostic tool.
    Its predictions may be incorrect and should not replace
    professional medical evaluation.
  </p>
</section>


      

      <footer className="medi-footer">
        <span>© MediAI · Medical Image Integrity</span>
        <span>Designed for research and demonstration</span>
      </footer>
    </main>
  );
}
