import { useState } from "react";
import { FiArrowRight, FiHeart, FiMessageCircle, FiShield, FiZap } from "react-icons/fi";
import { toast } from "react-toastify";
import { useAuthFetch } from "../hooks/useAuthFetch";
import "../style/AiCoach.css";

function AiCoach() {
  const { execute, loading } = useAuthFetch();
  const [question, setQuestion] = useState("");
  const [advice, setAdvice] = useState(null);

  const getAdvice = async (event) => {
    event?.preventDefault();
    try {
      const result = await execute({
        method: "POST",
        url: "/api/ai/coach",
        data: { question },
      });
      setAdvice(result);
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to get AI guidance right now.");
    }
  };

  return (
    <div className="container mt-4 ai-coach-page">
      <div className="ai-coach-hero">
        <div>
          <span className="ai-coach-eyebrow"><FiZap /> PERSONALIZED AI COACH</span>
          <h1>Train smarter with <span>FitTrack AI.</span></h1>
          <p>Get guidance based on your profile, recent activity, nutrition, and available store products.</p>
        </div>
        <div className="ai-coach-safety"><FiShield /> Practical guidance, not medical diagnosis</div>
      </div>

      <form className="ai-coach-question" onSubmit={getAdvice}>
        <FiMessageCircle aria-hidden="true" />
        <input
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          maxLength={500}
          placeholder="Ask: What should I eat after today's workout?"
          aria-label="Ask FitTrack AI a question"
        />
        <button type="submit" disabled={loading}>
          {loading ? "Thinking..." : "Ask AI"} <FiArrowRight />
        </button>
      </form>

      {advice && (
        <div className="ai-coach-grid">
          <section className="ai-coach-card ai-coach-summary">
            <span className="ai-coach-card-label"><FiHeart /> YOUR COACH SAYS</span>
            <h2>{advice.summary}</h2>
            <div className="ai-coach-next-step"><strong>Today's next step</strong><span>{advice.nextStep}</span></div>
          </section>
          <section className="ai-coach-card">
            <span className="ai-coach-card-label">HEALTH & FITNESS TIPS</span>
            <ul>{advice.tips.map((tip) => <li key={tip}>{tip}</li>)}</ul>
          </section>
          <section className="ai-coach-card ai-coach-products">
            <span className="ai-coach-card-label">PRODUCT SUGGESTIONS</span>
            {advice.recommendedProducts.length ? advice.recommendedProducts.map((product) => (
              <div className="ai-coach-product" key={`${product.name}-${product.reason}`}>
                <strong>{product.name}</strong><span>{product.reason}</span>
              </div>
            )) : <p>No matching store products were recommended for this request.</p>}
          </section>
        </div>
      )}
    </div>
  );
}

export default AiCoach;
