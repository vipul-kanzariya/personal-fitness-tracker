import React, { useEffect, useState } from "react";
import axios from "axios";
import Spinner from "../components/Spinner";
import "../style/Bmi.css";

function Bmi() {
  const [weight, setWeight] = useState("");
  const [feet, setFeet] = useState("");
  const [inches, setInches] = useState("");
  const [suggestedWorkouts, setSuggestedWorkouts] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [bmiResult, setBmiResult] = useState({});
  const [history, setHistory] = useState([]);

  // Calculate height in meters on the fly safely
  const feetNum = parseInt(feet) || 0;
  const inchesNum = parseInt(inches) || 0;
  const heightInMeters = ((feetNum * 12 + inchesNum) * 0.0254).toFixed(2);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem("token");
        setLoading(true);
        const historyRes = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/bmi/history`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setHistory(historyRes.data);
      } catch (err) {
        setError("Failed to load BMI history");
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const metersToFeet = (meters) => {
    if (!meters) return "N/A";
    const totalInches = meters / 0.0254;
    const f = Math.floor(totalInches / 12);
    const i = Math.round(totalInches % 12);
    return `${f}' ${i}"`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!weight || (!feet && !inches)) {
      setError("Please fill in weight and height fields.");
      return;
    }

    try {
      setError("");
      const token = localStorage.getItem("token");
      setLoading(true);
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/bmi/calculate`,
        {
          weight: Number(weight),
          height: Number(heightInMeters),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setBmiResult(res.data);
      setSuggestedWorkouts(res.data.suggestedWorkouts || []);
      setHistory([res.data, ...history]);
      setWeight("");
      setFeet("");
      setInches("");
    } catch (err) {
      setError("Failed to calculate BMI.");
    } finally {
      setLoading(false);
    }
  };

  // Slider Position Percentage
  const getSliderPosition = (bmiVal) => {
    if (!bmiVal) return 0;
    const val = Number(bmiVal);
    if (val <= 18.5) return Math.min(25, (val / 18.5) * 25);
    if (val <= 24.9) return 25 + ((val - 18.5) / (24.9 - 18.5)) * 25;
    if (val <= 29.9) return 50 + ((val - 25) / (29.9 - 25)) * 25;
    return Math.min(100, 75 + ((val - 30) / 10) * 25);
  };

  // Badge Color Styles based on Category
  const getBadgeClass = (cat) => {
    switch (cat) {
      case "Underweight":
        return "bg-info bg-opacity-25 text-info border border-info border-opacity-50";
      case "Normal":
      case "Normal weight":
        return "bg-success bg-opacity-25 text-success border border-success border-opacity-50";
      case "Overweight":
        return "bg-warning bg-opacity-25 text-warning border border-warning border-opacity-50";
      case "Obese":
      case "Obesity":
        return "bg-danger bg-opacity-25 text-danger border border-danger border-opacity-50";
      default:
        return "bg-secondary text-white";
    }
  };

  return (
    <div className="container mt-4 text-white">
      {/* Header */}
      <div className="text-center mb-4">
        <span className="badge bg-primary bg-opacity-25 text-primary border border-primary border-opacity-25 px-3 py-2 rounded-pill small fw-bold text-uppercase mb-2">
          Health Metrics
        </span>
        <h2 className="fw-bold text-white mb-1">
          BMI ANALYTICS & <span className="text-neon-green">WORKOUTS</span>
        </h2>
        <p className="text-subtle small">
          Track your Body Mass Index and discover tailored fitness recommendations.
        </p>
      </div>

      {error && (
        <div className="alert alert-danger bg-danger bg-opacity-25 text-danger border border-danger border-opacity-50 mb-4 rounded-3">
          {error}
        </div>
      )}

      {/* Form Input Card */}
      <div className="card dark-card p-4 mb-4 shadow-sm">
        <form onSubmit={handleSubmit}>
          <div className="row g-3 align-items-end">
            <div className="col-12 col-md-3">
              <label htmlFor="weight" className="form-label text-subtle fw-bold small text-uppercase">
                Weight (KG)
              </label>
              <input
                type="number"
                min="0"
                step="0.1"
                id="weight"
                className="form-control dark-input"
                onKeyDown={(e) => ["e", "-", "+"].includes(e.key) && e.preventDefault()}
                placeholder="e.g. 70"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                required
              />
            </div>
            <div className="col-6 col-md-3">
              <label htmlFor="feet" className="form-label text-subtle fw-bold small text-uppercase">
                Height (Feet)
              </label>
              <input
                type="number"
                min="0"
                step="0.1"
                id="feet"
                className="form-control dark-input"
                onKeyDown={(e) => ["e", "-", "+"].includes(e.key) && e.preventDefault()}
                placeholder="e.g. 5"
                value={feet}
                onChange={(e) => setFeet(e.target.value)}
                required
              />
            </div>
            <div className="col-6 col-md-3">
              <label htmlFor="inches" className="form-label text-subtle fw-bold small text-uppercase">
                Height (Inches)
              </label>
              <input
                type="number"
                min="0"
                step="0.1"
                id="inches"
                className="form-control dark-input"
                onKeyDown={(e) => ["e", "-", "+"].includes(e.key) && e.preventDefault()}
                placeholder="e.g. 9"
                value={inches}
                onChange={(e) => setInches(e.target.value)}
              />
            </div>
            <div className="col-12 col-md-3">
              <button type="submit" className="btn btn-neon w-100 py-2 text-uppercase" disabled={loading}>
                {loading ? "Calculating..." : "Calculate"}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* BMI Result Display Card */}
      {bmiResult.bmi && (
        <div className="card dark-card p-4 mb-4 shadow-sm">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <span className="text-subtle fw-bold small text-uppercase d-block mb-1">
                Calculated Result
              </span>
              <div className="d-flex align-items-baseline gap-2">
                <h1 className="display-4 fw-bold text-white mb-0">{bmiResult.bmi}</h1>
                <span className="text-subtle fw-bold fs-5">BMI</span>
              </div>
            </div>
            <div>
              <span className={`badge px-3 py-2 rounded-pill fs-6 fw-bold ${getBadgeClass(bmiResult.category)}`}>
                {bmiResult.category}
              </span>
            </div>
          </div>

          {/* Visual Scale Bar */}
          <div className="mt-3 px-2">
            <div className="bmi-scale-bar">
              <div
                className="bmi-marker"
                style={{ left: `${getSliderPosition(bmiResult.bmi)}%` }}
              ></div>
            </div>
            <div className="d-flex justify-content-between text-subtle extra-small mt-3 fw-semibold">
              <span>Underweight (&lt;18.5)</span>
              <span>Normal (18.5-24.9)</span>
              <span>Overweight (25-29.9)</span>
              <span>Obese (30+)</span>
            </div>
          </div>
        </div>
      )}

      {/* Suggested Workouts Section */}
      {suggestedWorkouts.length > 0 && (
        <div className="card dark-card p-4 mb-4 shadow-sm">
          <h5 className="fw-bold text-white mb-4 d-flex align-items-center gap-2">
            🔥 SUGGESTED WORKOUTS <span className="text-neon-green">FOR YOU</span>
          </h5>
          <div className="row g-3">
            {suggestedWorkouts.map((w) => (
              <div key={w._id} className="col-6 col-md-3">
                <div className="p-3 text-center rounded-3 workout-card">
                  <h6 className="fw-bold text-white mb-2 text-uppercase">{w.name}</h6>
                  <span className="badge bg-secondary bg-opacity-25 text-subtle mb-3 px-2 py-1 small">
                    {w.category}
                  </span>
                  <div className="text-neon-green fw-bold small d-flex align-items-center justify-content-center gap-1">
                    ⚡ {w.caloriesPerMinute || 0} cal / min
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Assessment History Table */}
      <div className="card dark-card p-4 mb-4 shadow-sm">
        <h5 className="fw-bold text-white mb-3 d-flex align-items-center gap-2">
          📜 ASSESSMENT <span className="text-neon-green">HISTORY</span>
        </h5>

        {loading && history.length === 0 ? (
          <div className="text-center py-4">
            <Spinner />
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-dark table-hover align-middle mb-0">
              <thead>
                <tr className="border-bottom border-secondary">
                  <th className="text-subtle small text-uppercase">Weight</th>
                  <th className="text-subtle small text-uppercase">Height</th>
                  <th className="text-subtle small text-uppercase">BMI</th>
                  <th className="text-subtle small text-uppercase">Category</th>
                  <th className="text-subtle small text-uppercase">Date</th>
                </tr>
              </thead>
              <tbody>
                {history.length > 0 ? (
                  history.map((h) => (
                    <tr key={h._id}>
                      <td className="fw-bold text-white">{h.weight} kg</td>
                      <td className="text-white">{metersToFeet(h.height)}</td>
                      <td className="fw-bold text-white">{h.bmi}</td>
                      <td>
                        <span className={`badge px-2 py-1 rounded-pill small ${getBadgeClass(h.category)}`}>
                          {h.category}
                        </span>
                      </td>
                      <td className="text-subtle small">
                        {h.createdAt
                          ? new Date(h.createdAt).toLocaleDateString()
                          : h.date
                          ? new Date(h.date).toLocaleDateString()
                          : "N/A"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center text-subtle py-4">
                      No assessment history found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Bmi;