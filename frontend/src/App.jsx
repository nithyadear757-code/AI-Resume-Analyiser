import { useRef, useState } from 'react';
import './App.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const ACCEPTED_FILES = '.pdf,.docx,.txt';

function App() {
  const fileInputRef = useRef(null);
  const [resume, setResume] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [dragging, setDragging] = useState(false);

  const chooseFile = (file) => {
    if (!file) return;
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!['pdf', 'docx', 'txt'].includes(extension)) {
      setError('Choose a PDF, DOCX, or TXT resume.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Your resume must be smaller than 5 MB.');
      return;
    }
    setResume(file);
    setAnalysis(null);
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setAnalysis(null);

    if (!resume) {
      setError('Upload your resume to get started.');
      return;
    }
    if (jobDescription.trim().length < 40) {
      setError('Add a job description with at least 40 characters.');
      return;
    }

    const formData = new FormData();
    formData.append('resume', resume);
    formData.append('jobDescription', jobDescription.trim());

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/analyze`, {
        method: 'POST',
        body: formData,
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || 'Analysis could not be completed.');
      setAnalysis(body);
    } catch (requestError) {
      setError(requestError.message || 'Could not connect to the analyzer. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragging(false);
    chooseFile(event.dataTransfer.files[0]);
  };

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#" aria-label="ClearCV home">
          <span className="brand-icon" aria-hidden="true">c</span>
          <span>clear<span>cv</span></span>
        </a>
        <div className="privacy-note"><span className="privacy-dot" /> Private by design. Analyzed on your server.</div>
        <span className="local-badge">LOCAL ANALYSIS</span>
      </header>

      <section className="intro">
        <div className="intro-copy">
          <p className="eyebrow"><span className="eyebrow-line" /> YOUR NEXT CHAPTER STARTS HERE</p>
          <h1>A clearer path<br />to <em>your next role.</em></h1>
          <p className="intro-text">
            See how your resume lines up with the role you want. Get a practical match score and clear, useful ways to strengthen your application.
          </p>
          <div className="trust-points">
            <span><span className="check-mark">✓</span> No API key needed</span>
            <span><span className="check-mark">✓</span> Your resume stays local</span>
          </div>
        </div>
        <div className="intro-art" aria-hidden="true">
          <div className="art-orbit orbit-one" />
          <div className="art-orbit orbit-two" />
          <div className="art-document">
            <span className="document-tag">YOUR RESUME</span>
            <span className="document-line document-line-long" />
            <span className="document-line document-line-medium" />
            <span className="document-line document-line-short" />
            <span className="document-highlight"><span>✓</span> A strong match</span>
            <span className="document-line document-line-long" />
            <span className="document-line document-line-medium" />
          </div>
          <span className="art-star star-one">✳</span>
          <span className="art-star star-two">✦</span>
          <span className="art-caption">SMALL STEPS. BIG CAREERS.</span>
        </div>
      </section>

      <section className="workspace">
        <div className="workspace-heading">
          <div>
            <p className="eyebrow muted-eyebrow">A BETTER APPLICATION BEGINS WITH A GOOD MATCH</p>
            <h2>Let’s look at your fit.</h2>
          </div>
          <span className="step-label"><span>01</span> Add your details</span>
        </div>

        <form className="analysis-form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="field-column">
              <div className="field-heading">
                <label htmlFor="resume-upload">Your resume</label>
                <span>PDF, DOCX or TXT · up to 5 MB</span>
              </div>
              <input
                ref={fileInputRef}
                className="visually-hidden"
                id="resume-upload"
                type="file"
                accept={ACCEPTED_FILES}
                onChange={(event) => chooseFile(event.target.files[0])}
              />
              <button
                className={`upload-box ${dragging ? 'upload-box-dragging' : ''} ${resume ? 'upload-box-selected' : ''}`}
                type="button"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                aria-describedby="upload-hint"
              >
                <span className="upload-icon" aria-hidden="true">{resume ? '✓' : '↑'}</span>
                <span className="upload-main">{resume ? resume.name : 'Drop your resume here'}</span>
                <span className="upload-secondary">{resume ? `${(resume.size / 1024).toFixed(0)} KB · Click to change` : 'or click to browse your files'}</span>
              </button>
              <p className="field-hint" id="upload-hint">We read the text to compare your experience with the role.</p>
            </div>

            <div className="field-column">
              <div className="field-heading">
                <label htmlFor="job-description">Job description</label>
                <span>{jobDescription.length}/12,000</span>
              </div>
              <textarea
                id="job-description"
                className="job-description"
                value={jobDescription}
                onChange={(event) => setJobDescription(event.target.value.slice(0, 12000))}
                placeholder={'Paste the job description here...\n\nInclude responsibilities and required skills for a more useful comparison.'}
                minLength={40}
                maxLength={12000}
                required
              />
              <p className="field-hint">Tip: include the requirements and responsibilities, not just the job title.</p>
            </div>
          </div>

          {error && <p className="form-error" role="alert">{error}</p>}
          <div className="form-footer">
            <p><span className="lock-icon" aria-hidden="true">▣</span> Your resume is processed in memory and not saved.</p>
            <button className="analyze-button" type="submit" disabled={loading}>
              {loading ? 'Reviewing your resume…' : 'Analyze my resume'}
              {!loading && <span aria-hidden="true">↗</span>}
            </button>
          </div>
        </form>
      </section>

      {analysis && (
        <section className="results" aria-live="polite">
          <div className="results-heading">
            <div>
              <p className="eyebrow muted-eyebrow">YOUR PERSONALIZED REVIEW</p>
              <h2>Your match at a glance.</h2>
              <p className="results-file">Review for <strong>{analysis.fileName}</strong></p>
            </div>
            <div className="score-card" aria-label={`Resume match score ${analysis.score} out of 100`}>
              <span className="score-value">{analysis.score}<small>%</small></span>
              <span className="score-label">MATCH SCORE</span>
            </div>
          </div>

          <p className="results-summary">{analysis.summary}</p>

          <div className="results-grid">
            <article className="result-panel">
              <div className="panel-heading"><span className="panel-icon matched-icon">✓</span><h3>Skills that match</h3><span>{analysis.matchedSkills.length}</span></div>
              {analysis.matchedSkills.length ? (
                <ul className="skill-list">{analysis.matchedSkills.map((skill) => <li key={skill}>{skill}</li>)}</ul>
              ) : <p className="panel-empty">No matching skills were identified from the text provided.</p>}
            </article>
            <article className="result-panel">
              <div className="panel-heading"><span className="panel-icon missing-icon">＋</span><h3>Skills to highlight</h3><span>{analysis.missingSkills.length}</span></div>
              {analysis.missingSkills.length ? (
                <ul className="skill-list missing-list">{analysis.missingSkills.map((skill) => <li key={skill}>{skill}</li>)}</ul>
              ) : <p className="panel-empty">Great coverage. No additional listed skills to highlight.</p>}
            </article>
          </div>

          <div className="advice-grid">
            <article className="advice-panel">
              <h3><span aria-hidden="true">✦</span> What’s working</h3>
              {analysis.strengths.length ? <ul>{analysis.strengths.map((item) => <li key={item}>{item}</li>)}</ul> : <p>Add clear section headings and measurable accomplishments to help employers understand your experience.</p>}
            </article>
            <article className="advice-panel improvement-panel">
              <h3><span aria-hidden="true">↗</span> Ways to improve</h3>
              <ul>{analysis.suggestions.map((item) => <li key={item}>{item}</li>)}</ul>
            </article>
          </div>

          <p className="method-note">{analysis.methodNote}</p>
        </section>
      )}

      <footer className="footer">
        <span className="footer-brand">clear<span>cv</span></span>
        <span>A thoughtful first step toward what’s next.</span>
        <span>Built for your next chapter.</span>
      </footer>
    </main>
  );
}

export default App;
