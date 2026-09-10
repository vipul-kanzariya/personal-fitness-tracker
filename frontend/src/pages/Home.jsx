import { useState } from "react";
import { Link } from "react-router-dom";
import { FiActivity, FiArrowRight, FiBarChart2, FiCheckCircle, FiHeart, FiMenu, FiMoon, FiShield, FiSun, FiTarget, FiUsers, FiX } from "react-icons/fi";
import { toast } from "react-toastify";
import { useTheme } from "../context/ThemeContext";
import "../style/Home.css";

const features = [
  {
    icon: FiActivity,
    title: "Train with purpose",
    description: "Log workouts, track calories, and build a routine that keeps you moving forward.",
  },
  {
    icon: FiBarChart2,
    title: "See your progress",
    description: "Understand your fitness journey through clear dashboards, history, and useful insights.",
  },
  {
    icon: FiHeart,
    title: "Eat smarter",
    description: "Plan your nutrition and discover meals that support your everyday performance.",
  },
];

const defaultFeedback = [
  "FitTrack makes my weekly routine much easier to follow.",
  "I finally understand my progress instead of guessing.",
  "The simple dashboard keeps me consistent every day.",
];

function Home() {
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [feedbackItems, setFeedbackItems] = useState(() => {
    const savedFeedback = JSON.parse(localStorage.getItem("fittrackFeedback") || "[]");
    return [...savedFeedback, ...defaultFeedback];
  });

  const handleFeedback = (event) => {
    event.preventDefault();
    if (!feedback.trim()) return;
    const nextFeedback = [feedback.trim(), ...feedbackItems.filter((item) => !defaultFeedback.includes(item))].slice(0, 8);
    setFeedbackItems(nextFeedback);
    localStorage.setItem("fittrackFeedback", JSON.stringify(nextFeedback.filter((item) => !defaultFeedback.includes(item))));
    toast.success("Thanks for sharing your feedback!");
    setFeedback("");
  };

  return (
    <div className="home-page">
      <header className="home-header">
        <Link to="/" className="home-brand">
          <span className="home-brand-mark"><FiActivity aria-hidden="true" /></span>
          <span>Fit<span>Track</span></span>
        </Link>
        <button type="button" className="home-theme-toggle" onClick={toggleTheme} aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}>
        {theme === "dark" ? <FiSun /> : <FiMoon />}
        <span>{theme === "dark" ? "Light" : "Dark"}</span>
        </button>
        <button
          type="button"
          className="home-menu-toggle"
          onClick={() => setMobileMenuOpen((open) => !open)}
          aria-label="Toggle navigation"
        >
          {mobileMenuOpen ? <FiX /> : <FiMenu />}
        </button>
        <nav className={`home-nav ${mobileMenuOpen ? "is-open" : ""}`}>
          <a href="#features" onClick={() => setMobileMenuOpen(false)}>Features</a>
          <a href="#about" onClick={() => setMobileMenuOpen(false)}>About us</a>
          <a href="#feedback" onClick={() => setMobileMenuOpen(false)}>Feedback</a>
          <Link to="/login" className="home-login-link">Log in</Link>
          <Link to="/register" className="home-cta">Get started <FiArrowRight /></Link>
        </nav>
      </header>

      <main>
        <section className="home-hero">
          <div className="home-hero-copy">
            <span className="home-eyebrow"><span className="home-eyebrow-dot" /> Your everyday fitness companion</span>
            <h1>Build a stronger<br /><span>version of you.</span></h1>
            <p>
              One focused space for your workouts, nutrition, BMI, and progress.
              FitTrack makes healthy habits simple enough to keep.
            </p>
            <div className="home-hero-actions">
              <Link to="/register" className="home-primary-button">Start your journey <FiArrowRight /></Link>
              <a href="#features" className="home-secondary-button">Explore FitTrack</a>
            </div>
            <div className="home-trust-row">
              <span><FiCheckCircle /> Personal progress</span>
              <span><FiShield /> Private & secure</span>
            </div>
          </div>
          <div className="home-hero-visual" aria-label="Fitness progress overview">
            <div className="home-visual-label"><span /> LIVE PROGRESS PREVIEW</div>
            <div className="home-orbit home-orbit-one" />
            <div className="home-orbit home-orbit-two" />
            <div className="home-visual-card home-visual-main">
              <div className="home-visual-card-top"><span>WEEKLY PROGRESS</span><FiBarChart2 /></div>
              <strong>84<span>%</span></strong>
              <div className="home-progress-track"><div /></div>
              <small>+18% from last week</small>
              <div className="home-chart">
                <i /><i /><i /><i /><i /><i /><i />
              </div>
            </div>
            <div className="home-visual-card home-visual-badge"><FiTarget /><span><strong>Goal focused</strong><small>Stay consistent</small></span></div>
            <div className="home-visual-card home-visual-stat"><FiHeart /><span><strong>12.4k</strong><small>Active minutes</small></span></div>
          </div>
        </section>

        <section className="home-feature-section" id="features">
          <div className="home-section-heading">
            <span className="home-eyebrow">Everything in one place</span>
            <h2>Simple tools.<br /><span>Real momentum.</span></h2>
            <p>FitTrack gives you the clarity and structure to turn good intentions into lasting routines.</p>
          </div>
          <div className="home-feature-grid">
            {features.map(({ icon: Icon, title, description }) => (
              <article className="home-feature-card" key={title}>
                <div className="home-feature-icon"><Icon /></div>
                <h3>{title}</h3>
                <p>{description}</p>
                <span className="home-feature-number">0{features.findIndex((feature) => feature.title === title) + 1}</span>
              </article>
            ))}
          </div>
        </section>

        <section className="home-about-section" id="about">
          <div className="home-about-panel">
            <div className="home-about-badge"><FiUsers /><strong>Made for real life</strong></div>
            <span className="home-eyebrow">Why FitTrack</span>
            <h2>Your health is<br /><span>worth tracking.</span></h2>
            <p>
              Fitness should feel empowering, not overwhelming. FitTrack brings your
              essential health habits together so you can focus on showing up, learning
              from your data, and celebrating every improvement.
            </p>
            <Link to="/register" className="home-text-link">Create your free account <FiArrowRight /></Link>
          </div>
          <div className="home-about-points">
            <div><strong>01</strong><span><b>Personal by design</b> Your dashboard follows your goals, routine, and pace.</span></div>
            <div><strong>02</strong><span><b>Progress you can feel</b> Build momentum with useful trends instead of guesswork.</span></div>
            <div><strong>03</strong><span><b>One consistent habit</b> Small daily actions become your strongest results.</span></div>
          </div>
        </section>

        <section className="home-feedback-section" id="feedback">
          <div>
            <span className="home-eyebrow">We want to hear from you</span>
            <h2>Help us make<br /><span>FitTrack better.</span></h2>
            <p>Have an idea, suggestion, or a win to share? Send us a quick note.</p>
          </div>
          <form className="home-feedback-form" onSubmit={handleFeedback}>
            <label htmlFor="feedback">Your feedback</label>
            <textarea id="feedback" value={feedback} onChange={(event) => setFeedback(event.target.value)} placeholder="Tell us what you think..." rows="4" />
            <button className="home-primary-button" type="submit">Send feedback <FiArrowRight /></button>
          </form>
        </section>
        <section className="home-feedback-ticker" aria-label="FitTrack community feedback">
          <div className="home-feedback-ticker-heading">
            <span className="home-eyebrow">Community feedback</span>
            <strong>Small words. Big motivation.</strong>
          </div>
          <div className="home-feedback-marquee">
            <div className="home-feedback-track">
              {[...feedbackItems, ...feedbackItems].map((item, index) => (
                <blockquote key={`${item}-${index}`}><FiHeart aria-hidden="true" /><span>"{item}"</span></blockquote>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="home-footer">
        <Link to="/" className="home-brand"><span className="home-brand-mark"><FiActivity /></span><span>Fit<span>Track</span></span></Link>
        <p>Train smarter. Live stronger.</p>
        <div><Link to="/login">Log in</Link><Link to="/register">Register</Link><span>© 2026 FitTrack</span></div>
      </footer>
    </div>
  );
}

export default Home;
