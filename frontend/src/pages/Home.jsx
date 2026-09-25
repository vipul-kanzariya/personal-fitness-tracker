import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { FiActivity, FiArrowRight, FiBarChart2, FiCheckCircle, FiHeart, FiMail, FiMenu, FiMoon, FiShield, FiSun, FiTarget, FiUsers, FiX } from "react-icons/fi";
import { toast } from "react-toastify";
import { useTheme } from "../context/ThemeContext";
import { API_BASE_URL } from "../utils/api";
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

function RatingStars({ rating }) {
  return (
    <span className="home-display-rating" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          className={rating >= star ? "is-full" : rating >= star - 0.5 ? "is-half" : ""}
          key={star}
          aria-hidden="true"
        >
          ★
        </span>
      ))}
    </span>
  );
}

function Home() {
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [feedbackName, setFeedbackName] = useState("");
  const [feedback, setFeedback] = useState("");
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [feedbackItems, setFeedbackItems] = useState(
    defaultFeedback.map((message) => ({ message, name: "FitTrack member", rating: 5 })),
  );

  useEffect(() => {
    const loadFeedback = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/feedback`);
        if (!Array.isArray(response.data)) {
          throw new Error("Community feedback response was invalid.");
        }
        setFeedbackItems([
          ...response.data,
          ...defaultFeedback.map((message) => ({ message, name: "FitTrack member", rating: 5 })),
        ]);
      } catch (error) {
        console.error("Unable to load community feedback", error);
        toast.error("Unable to load community feedback.");
      }
    };
    loadFeedback();

    const revealItems = document.querySelectorAll(".home-reveal");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14 },
    );

    revealItems.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, []);

  const handleFeedback = (event) => {
    event.preventDefault();
    if (!feedback.trim() || !feedbackName.trim()) {
      toast.info("Please add your name and feedback.");
      return;
    }
    const submitFeedback = async () => {
      try {
        const response = await axios.post(`${API_BASE_URL}/api/feedback`, {
          name: feedbackName.trim(),
          message: feedback.trim(),
          rating: feedbackRating,
        });
        setFeedbackItems((items) => [response.data, ...items].slice(0, 53));
        toast.success("Thanks for sharing your feedback!");
        setFeedbackName("");
        setFeedback("");
        setFeedbackRating(5);
      } catch (error) {
        const message = error.response?.data?.message || error.response?.data;
        toast.error(typeof message === "string" ? message : "Unable to submit feedback.");
      }
    };
    submitFeedback();
  };

  return (
    <div className="home-page">
      <header className="home-header">
        <Link to="/" className="home-brand">
          <span className="home-brand-mark"><FiActivity aria-hidden="true" /></span>
          <span>Fit<span>Track</span></span>
        </Link>
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
          <button type="button" className="home-theme-toggle" onClick={toggleTheme} aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}>
            {theme === "dark" ? <FiSun /> : <FiMoon />}
            <span>{theme === "dark" ? "Light" : "Dark"}</span>
          </button>
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

        <section className="home-feature-section home-reveal" id="features">
          <div className="home-section-heading">
            <div className="home-section-heading-main">
              <span className="home-eyebrow">Everything in one place</span>
              <h2>Simple tools.<br /><span>Real momentum.</span></h2>
            </div>
            <p>FitTrack gives you the clarity and structure to turn good intentions into lasting routines.</p>
          </div>
          <div className="home-feature-grid">
            {features.map(({ icon: Icon, title, description }) => (
              <article className="home-feature-card home-reveal" key={title}>
                <div className="home-feature-icon"><Icon /></div>
                <h3>{title}</h3>
                <p>{description}</p>
                <span className="home-feature-number">0{features.findIndex((feature) => feature.title === title) + 1}</span>
              </article>
            ))}
          </div>
        </section>

        <section className="home-about-section home-reveal" id="about">
          <div className="home-about-panel home-reveal">
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
            <div className="home-reveal"><strong>01</strong><span><b>Personal by design</b> Your dashboard follows your goals, routine, and pace.</span></div>
            <div className="home-reveal"><strong>02</strong><span><b>Progress you can feel</b> Build momentum with useful trends instead of guesswork.</span></div>
            <div className="home-reveal"><strong>03</strong><span><b>One consistent habit</b> Small daily actions become your strongest results.</span></div>
          </div>
        </section>

        <section className="home-feedback-section home-reveal" id="feedback">
          <div className="home-reveal">
            <span className="home-eyebrow">We want to hear from you</span>
            <h2>Help us make<br /><span>FitTrack better.</span></h2>
            <p>Have an idea, suggestion, or a win to share? Send us a quick note.</p>
          </div>
          <form className="home-feedback-form home-reveal" onSubmit={handleFeedback}>
            <div className="home-feedback-fields">
              <div>
                <label htmlFor="feedback-name">Your name</label>
                <input id="feedback-name" value={feedbackName} onChange={(event) => setFeedbackName(event.target.value)} placeholder="Your name" />
              </div>
              <div>
                <label>Rating</label>
                <div
                  className="home-star-rating"
                  role="radiogroup"
                  aria-label="Choose a rating from one to five stars, including half stars"
                  onMouseLeave={() => setHoveredRating(0)}
                >
                  {[1, 2, 3, 4, 5].map((rating) => {
                    const displayRating = hoveredRating || feedbackRating;
                    const fillPercentage = Math.max(0, Math.min(100, (displayRating - rating + 1) * 100));
                    return (
                      <span className="home-star" key={rating} style={{ "--star-fill": `${fillPercentage}%` }}>
                        <span className="home-star-outline" aria-hidden="true">★</span>
                        <span className="home-star-fill" aria-hidden="true">★</span>
                        <button
                          type="button"
                          className="home-star-half-button"
                          onClick={() => setFeedbackRating(rating - 0.5)}
                          onMouseEnter={() => setHoveredRating(rating - 0.5)}
                          onFocus={() => setHoveredRating(rating - 0.5)}
                          role="radio"
                          aria-checked={feedbackRating === rating - 0.5}
                          aria-label={`${rating - 0.5} stars`}
                        />
                        <button
                          type="button"
                          className="home-star-half-button"
                          onClick={() => setFeedbackRating(rating)}
                          onMouseEnter={() => setHoveredRating(rating)}
                          onFocus={() => setHoveredRating(rating)}
                          role="radio"
                          aria-checked={feedbackRating === rating}
                          aria-label={`${rating} star${rating > 1 ? "s" : ""}`}
                        />
                      </span>
                    );
                  })}
                  <span className="home-rating-value">{feedbackRating}/5</span>
                </div>
              </div>
            </div>
            <label htmlFor="feedback">Your feedback</label>
            <textarea id="feedback" value={feedback} onChange={(event) => setFeedback(event.target.value)} placeholder="Tell us what you think..." rows="4" />
            <button className="home-primary-button" type="submit">Send feedback <FiArrowRight /></button>
          </form>
        </section>
        <section className="home-feedback-ticker home-reveal" aria-label="FitTrack community feedback">
          <div className="home-feedback-ticker-heading">
            <span className="home-eyebrow">Community feedback</span>
            <strong>Small words. Big motivation.</strong>
          </div>
          <div className="home-feedback-marquee">
            <div className="home-feedback-track">
              {[...feedbackItems, ...feedbackItems].map((item, index) => (
                <blockquote key={`${item.message}-${index}`}>
                  <FiHeart aria-hidden="true" />
                  <span>
                    <strong>{item.name}</strong>
                    <RatingStars rating={Number(item.rating) || 0} />
                    <em>"{item.message}"</em>
                  </span>
                </blockquote>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="home-footer">
        <div className="home-footer-brand">
          <Link to="/" className="home-brand"><span className="home-brand-mark"><FiActivity /></span><span>Fit<span>Track</span></span></Link>
          <p>Train smarter. Live stronger.</p>
          <span className="home-footer-copy">A simple space for better daily habits.</span>
        </div>
        <div className="home-footer-column">
          <strong>Explore</strong>
          <a href="#features">Features</a>
          <a href="#about">About us</a>
          <a href="#feedback">Feedback</a>
        </div>
        <div className="home-footer-column">
          <strong>Get started</strong>
          <Link to="/login">Log in</Link>
          <Link to="/register">Create account</Link>
          <a href="mailto:support@fittrack.app"><FiMail aria-hidden="true" /> Contact support</a>
        </div>
        <div className="home-footer-bottom">
          <span>© 2026 FitTrack</span>
          <span>Built for consistent progress.</span>
        </div>
      </footer>
    </div>
  );
}

export default Home;
