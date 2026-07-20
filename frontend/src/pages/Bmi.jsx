import React, { useEffect, useState } from "react";
import axios from "axios";
import Spinner from "../components/Spinner";

function Bmi() {
  const [weight, setWeight] = useState();
  const [height, setHeight] = useState();
  const [feet, setFeet] = useState();
  const [inches, setInches] = useState();
  const [loading, setLoading] = useState(false);
  const [error,setError] = useState();
  const heightInMeters = (
    (parseInt(feet) * 12 + parseInt(inches)) *
    0.0254
  ).toFixed(2);
  const [bmiResult, setBmiResult] = useState({});
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem("token");
        setLoading(true);
        const history = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/bmi/history`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        setHistory(history.data);
      } catch (err) {
        setError("Failde to load BMI history");
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);
  const metersToFeet = (meters) => {
    const totalInches = meters / 0.0254;
    const feet = Math.floor(totalInches / 12);
    const inches = Math.round(totalInches % 12);
    return `${feet}'${inches}"`;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      setLoading(true);
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/bmi/calculate`,
        {
          weight,
          height: heightInMeters,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setBmiResult(res.data);
      setHistory([res.data, ...history]);
      setWeight("");
      setFeet("");
      setInches("");
    } catch (err) {
      console.log(err.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
    {error && (
  <div className='alert alert-danger mt-3'>{error}</div>
)}
      <div className="container mt-4">
        <form onSubmit={handleSubmit}>
          <input
            type="number"
            min="0"
            onKeyDown={(e) =>
              ["e", "-", "+"].includes(e.key) && e.preventDefault()
            }
            placeholder="Weight (kg)"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
          />
          <input
            type="number"
            min="0"
            onKeyDown={(e) =>
              ["e", "-", "+"].includes(e.key) && e.preventDefault()
            }
            placeholder="Feet (e.g. 5)"
            value={feet}
            onChange={(e) => setFeet(e.target.value)}
          />

          <input
            type="number"
            min="0"
            onKeyDown={(e) =>
              ["e", "-", "+"].includes(e.key) && e.preventDefault()
            }
            placeholder="Inches (e.g. 9)"
            value={inches}
            onChange={(e) => setInches(e.target.value)}
          />
          <button type="submit">Calculate BMI</button>
        </form>

        {/* BMI Result Card */}
        {bmiResult.bmi && (
          <div className="card p-3 mt-3">
            <h5>BMI Result</h5>
            <p>
              BMI: <strong>{bmiResult.bmi}</strong>
            </p>
            <p>
              Category: <strong>{bmiResult.category}</strong>
            </p>
          </div>
        )}

        {/* History Table */}
        {loading ? (
          <Spinner />
        ) : (
          <table className="table table-bordered mt-3">
            <thead className="table-dark">
              <tr>
                <th>Weight</th>
                <th>Height</th>
                <th>BMI</th>
                <th>Category</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {history.map((h) => (
                <tr key={h._id}>
                  <td>{h.weight}</td>
                  <td>{metersToFeet(h.height)}</td>
                  <td>{h.bmi}</td>
                  <td>{h.category}</td>
                  <td>{new Date(h.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}

export default Bmi;
