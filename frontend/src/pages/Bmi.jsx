import React, { useEffect, useState, useMemo } from "react";
import Spinner from "../components/Spinner";
import NumberInput from "../components/NumberInput";
import FilterButtons from "../components/FilterButtons";
import StatusBadge from "../components/StatusBadge";
import { useDateFilter } from "../hooks/useDateFilter";
import { useAuthFetch } from "../hooks/useAuthFetch";
import { metersToFeet } from "../hooks/useDateFilter";
import "../style/Bmi.css";

function Bmi() {
  const [weight, setWeight] = useState("");
  const [feet, setFeet] = useState("");
  const [inches, setInches] = useState("");
  const [suggestedWorkouts, setSuggestedWorkouts] = useState([]);

 
  const [bmiResult, setBmiResult] = useState({});
  const [history, setHistory] = useState([]);

  const { loading, error, execute, setError } = useAuthFetch();  
  const { filter, setFilter, filteredItems: filteredHistory } = useDateFilter(history, "createdAt");

  // Calculate height in meters on the fly safely
  const feetNum = parseInt(feet) || 0;
  const inchesNum = parseInt(inches) || 0;
  const heightInMeters = useMemo(
    () => ((feetNum * 12 + inchesNum) * 0.0254).toFixed(2),
    [feetNum, inchesNum]
  );

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const data = await execute({
        method: 'GET',
        url: '/api/bmi/history',
      });
      setHistory(data);
    } catch (err) {
      // Error handled by useAuthFetch
    }
  };

  const getSliderPosition = (bmiVal) => {
    if (!bmiVal) return 0;
    const val = Number(bmiVal);
    if (val <= 18.5) return Math.min(25, (val / 18.5) * 25);
    if (val <= 24.9) return 25 + ((val - 18.5) / (24.9 - 18.5)) * 25;
    if (val <= 29.9) return 50 + ((val - 25) / (29.9 - 25)) * 25;
    return Math.min(100, 75 + ((val - 30) / 10) * 25);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!weight || (!feet && !inches)) {
      setError("Please fill in weight and height fields.");
      return;
    }

    if (Number(weight) <= 0 || Number(heightInMeters) <= 0) {
      setError("Weight and height must be greater than 0.");
      return;
    }

    try {
      const data = await execute({
        method: 'POST',
        url: '/api/bmi/calculate',
        data: {
          weight: Number(weight),
          height: Number(heightInMeters),
        },
      });

      setBmiResult(data);
      setSuggestedWorkouts(data.suggestedWorkouts || []);
      setHistory([data, ...history]);

      // Reset form
      setWeight("");
      setFeet("");
      setInches("");
      setError(null);
    } catch (err) {
      // Error handled by useAuthFetch
    }
  };

  return (
    <div className="container mt-4">
      {/* Header */}
      <div className="text-center mb-4">
        <span className="badge bg-primary bg-opacity-25 text-primary border border-primary border-opacity-25 px-3 py-2 rounded-pill small fw-bold text-uppercase mb-2">
          Health Metrics
        </span>
        <h2 className="fw-bold mb-1 apex-title">
          BMI ANALYTICS & <span className="text-neon-green">WORKOUTS</span>
        </h2>
        <p className="text-subtle small">
          Track your Body Mass Index and discover tailored fitness recommendations.
        </p>
      </div>

      {error && (
        <div className="alert alert-danger bg-danger bg-opacity-25 text-danger border border-danger border-opacity-50 mb-4 rounded-3" role="alert">
          {error}
        </div>
      )}

      {/* Form Input Card */}
      <div className="card dark-card p-4 mb-4 shadow-sm">
        <form onSubmit={handleSubmit}>
          <div className="row g-3 align-items-end">
            <div className="col-12 col-md-3">
              <NumberInput
                name="weight"
                label="Weight (KG)"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="e.g. 70"
                min={0}
                required
                className="mb-0"
              />
            </div>

            <div className="col-6 col-md-3">
              <NumberInput
                name="feet"
                label="Height (Feet)"
                value={feet}
                onChange={(e) => setFeet(e.target.value)}
                placeholder="e.g. 5"
                min={0}
                required
                className="mb-0"
              />
            </div>

            <div className="col-6 col-md-3">
              <NumberInput
                name="inches"
                label="Height (Inches)"
                value={inches}
                onChange={(e) => setInches(e.target.value)}
                placeholder="e.g. 9"
                min={0}
                className="mb-0"
              />
            </div>

            <div className="col-12 col-md-3">
              <div className="mb-0">
                <label className="form-label text-subtle fw-bold small text-uppercase" style={{ visibility: 'hidden' }}>
                  Action
                </label>
                <button type="submit" className="btn btn-neon w-100 py-2 text-uppercase" disabled={loading}>
                  {loading ? "Calculating..." : "Calculate"}
                </button>
              </div>
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
                <h1 className="display-4 fw-bold mb-0">{bmiResult.bmi}</h1>
                <span className="text-subtle fw-bold fs-5">BMI</span>
              </div>
            </div>
            <div>
              <StatusBadge status={bmiResult.category} type="bmi" />
            </div>
          </div>

          <div className="mt-3 px-2">
            <div className="bmi-scale-bar" role="progressbar" aria-valuenow={bmiResult.bmi} aria-valuemin="0" aria-valuemax="40">
              <div
                className="bmi-marker"
                style={{ left: `${getSliderPosition(bmiResult.bmi)}%` }}
                aria-label={`BMI value: ${bmiResult.bmi}`}
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
          <h5 className="fw-bold mb-4 d-flex align-items-center gap-2">
            🔥 SUGGESTED WORKOUTS <span className="text-neon-green">FOR YOU</span>
          </h5>
          <div className="row g-3">
            {suggestedWorkouts.map((w) => (
              <div key={w._id} className="col-6 col-md-3">
                <div className="p-3 text-center rounded-3 workout-card">
                  <h6 className="fw-bold mb-2 text-uppercase">{w.name}</h6>
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
        <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
          📜 ASSESSMENT <span className="text-neon-green">HISTORY</span>
        </h5>

        {/* Date Filter Buttons */}
        <FilterButtons filter={filter} setFilter={setFilter} />

        {loading && history.length === 0 ? (
          <div className="text-center py-4">
            <Spinner />
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table theme-table table-hover align-middle mb-0">
              <thead>
                <tr>
                  <th className="text-subtle small text-uppercase">Weight</th>
                  <th className="text-subtle small text-uppercase">Height</th>
                  <th className="text-subtle small text-uppercase">BMI</th>
                  <th className="text-subtle small text-uppercase">Category</th>
                  <th className="text-subtle small text-uppercase">Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.length > 0 ? (
                  filteredHistory.map((h) => (
                    <tr key={h._id}>
                      <td className="fw-bold">{h.weight} kg</td>
                      <td>{metersToFeet(h.height)}</td>
                      <td className="fw-bold">{h.bmi}</td>
                      <td>
                        <StatusBadge status={h.category} type="bmi" />
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
                      No assessment history found for this filter.
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