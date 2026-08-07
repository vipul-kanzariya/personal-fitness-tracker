import React, { useEffect, useState } from "react";
import axios from "axios";
import Spinner from "../components/Spinner";
import "../style/Diet.css"; // Imported CSS stylesheet

function Diet() {
  const [diets, setDiets] = useState([]);
  const [foodName, setFoodName] = useState("");
  const [carbs, setCarbs] = useState("");
  const [protein, setProtein] = useState("");
  const [fat, setFat] = useState("");
  const [calories, setCalories] = useState("");

  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Default daily target goals
  const [targets] = useState({
    calories: 2000,
    protein: 150,
    carbs: 225,
    fat: 65,
  });

  useEffect(() => {
    const fetchDiet = async () => {
      try {
        const token = localStorage.getItem("token");
        setLoading(true);
        const dietsRes = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/diet`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setDiets(dietsRes.data);
      } catch (err) {
        setError("Failed to load diet entries.");
      } finally {
        setLoading(false);
      }
    };
    fetchDiet();
  }, []);

  // Calculate Daily Totals
  const totals = diets.reduce(
    (acc, d) => ({
      calories: acc.calories + (Number(d.calories) || 0),
      protein: acc.protein + (Number(d.protein) || 0),
      carbs: acc.carbs + (Number(d.carbs) || 0),
      fat: acc.fat + (Number(d.fat) || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const getProgressPct = (current, target) =>
    Math.min(100, Math.round(((current || 0) / target) * 100));

  const handleAutoFill = async () => {
    if (!foodName.trim()) {
      setError("Pehle food name daalo.");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      setLoading(true);
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/diet/estimate`,
        { foodName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCalories(res.data.calories ?? "");
      setProtein(res.data.protein ?? "");
      setCarbs(res.data.carbs ?? "");
      setFat(res.data.fat ?? "");
      setError(null);
    } catch (err) {
      setError("Nutrition estimate fail ho gaya. Values manually daal do.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      setLoading(true);
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/diet`,
        {
          foodName,
          calories,
          protein,
          carbs,
          fat,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setDiets([res.data, ...diets]);

      setFoodName("");
      setCalories("");
      setProtein("");
      setCarbs("");
      setFat("");
      setError(null);
    } catch (err) {
      setError("Failed to save entry.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("token");
      setLoading(true);
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/diet/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDiets(diets.filter((d) => d._id !== id));
    } catch (err) {
      setError("Failed to delete entry.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (diet) => {
    setEditId(diet._id);
    setEditData({
      calories: diet.calories,
      protein: diet.protein,
      carbs: diet.carbs,
      fat: diet.fat,
    });
  };

  const handleUpdate = async (id) => {
    if (!editData.calories || editData.calories <= 0) {
      setError("Calories must be greater than 0.");
      return;
    }
    if (editData.protein !== undefined && editData.protein < 0) {
      setError("Protein cannot be negative.");
      return;
    }
    if (editData.carbs !== undefined && editData.carbs < 0) {
      setError("Carbs cannot be negative.");
      return;
    }
    if (editData.fat !== undefined && editData.fat < 0) {
      setError("Fat cannot be negative.");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/diet/${id}`,
        editData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDiets(diets.map((d) => (d._id === id ? res.data : d)));
      setEditId(null);
      setEditData({});
      setError("");
    } catch (err) {
      setError("Failed to update diet entry.");
    }
  };

  return (
    <div className="container mt-4 text-white">
      <h2 className="fw-bold mb-4 text-white">
        DIET & <span className="text-neon-green">NUTRITION TRACKER</span>
      </h2>
      {error && <div className="alert alert-danger mb-4">{error}</div>}

      {/* Daily Macros Summary Cards with Progress Bars */}
      <div className="row g-3 mb-4">
        {/* Calories Card */}
        <div className="col-12 col-sm-6 col-md-3">
          <div className="card dark-card shadow-sm p-3 h-100">
            <span className="text-subtle small fw-bold text-uppercase">
              Calories
            </span>
            <h4 className="fw-bold my-1 text-white">
              {totals.calories}{" "}
              <span className="fs-6 text-subtle font-normal">
                / {targets.calories} KCAL
              </span>
            </h4>
            <div
              className="progress mt-2 bg-secondary bg-opacity-25"
              style={{ height: "8px" }}
            >
              <div
                className="progress-bar bg-primary"
                role="progressbar"
                style={{
                  width: `${getProgressPct(totals.calories, targets.calories)}%`,
                }}
              ></div>
            </div>
          </div>
        </div>

        {/* Protein Card */}
        <div className="col-12 col-sm-6 col-md-3">
          <div className="card dark-card shadow-sm p-3 h-100">
            <span className="text-subtle small fw-bold text-uppercase">
              Protein
            </span>
            <h4 className="fw-bold my-1 text-white">
              {totals.protein}G{" "}
              <span className="fs-6 text-subtle font-normal">
                / {targets.protein}G
              </span>
            </h4>
            <div
              className="progress mt-2 bg-secondary bg-opacity-25"
              style={{ height: "8px" }}
            >
              <div
                className="progress-bar bg-danger"
                role="progressbar"
                style={{
                  width: `${getProgressPct(totals.protein, targets.protein)}%`,
                }}
              ></div>
            </div>
          </div>
        </div>

        {/* Carbs Card */}
        <div className="col-12 col-sm-6 col-md-3">
          <div className="card dark-card shadow-sm p-3 h-100">
            <span className="text-subtle small fw-bold text-uppercase">
              Carbs
            </span>
            <h4 className="fw-bold my-1 text-white">
              {totals.carbs}G{" "}
              <span className="fs-6 text-subtle font-normal">
                / {targets.carbs}G
              </span>
            </h4>
            <div
              className="progress mt-2 bg-secondary bg-opacity-25"
              style={{ height: "8px" }}
            >
              <div
                className="progress-bar bg-warning"
                role="progressbar"
                style={{
                  width: `${getProgressPct(totals.carbs, targets.carbs)}%`,
                }}
              ></div>
            </div>
          </div>
        </div>

        {/* Fat Card */}
        <div className="col-12 col-sm-6 col-md-3">
          <div className="card dark-card shadow-sm p-3 h-100">
            <span className="text-subtle small fw-bold text-uppercase">
              Fat
            </span>
            <h4 className="fw-bold my-1 text-white">
              {totals.fat}G{" "}
              <span className="fs-6 text-subtle font-normal">
                / {targets.fat}G
              </span>
            </h4>
            <div
              className="progress mt-2 bg-secondary bg-opacity-25"
              style={{ height: "8px" }}
            >
              <div
                className="progress-bar bg-info"
                role="progressbar"
                style={{
                  width: `${getProgressPct(totals.fat, targets.fat)}%`,
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="card dark-card shadow-sm p-4 mb-4">
        <h5 className="fw-bold mb-3 text-white">ADD FOOD ENTRY</h5>
        <form onSubmit={handleSubmit}>
          <div className="row g-3 align-items-end">
            {/* Food Name */}
            <div className="col-12 col-md-4">
              <label
                htmlFor="food"
                className="form-label text-subtle fw-bold small text-uppercase"
              >
                Food Name
              </label>
              <div className="input-group">
                <input
                  type="text"
                  className="form-control dark-input"
                  value={foodName}
                  onChange={(e) => setFoodName(e.target.value)}
                  id="food"
                  placeholder="e.g. 2 boiled eggs"
                  required
                />
                <button
                  type="button"
                  className="btn btn-outline-primary d-inline-flex align-items-center gap-2 fw-medium"
                  onClick={handleAutoFill}
                  title="Quickly estimate nutrition"
                >
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                  </svg>
                  <span>Quick Fill</span>
                </button>
              </div>
            </div>

            {/* Calories */}
            <div className="col-6 col-md-2">
              <label
                htmlFor="calories"
                className="form-label text-subtle fw-bold small text-uppercase"
              >
                Calories
              </label>
              <input
                type="number"
                className="form-control dark-input"
                min="0"
                step="0.1"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                id="calories"
                placeholder="kcal"
                required
              />
            </div>

            {/* Protein */}
            <div className="col-6 col-md-2">
              <label
                htmlFor="protein"
                className="form-label text-subtle fw-bold small text-uppercase"
              >
                Protein (g)
              </label>
              <input
                type="number"
                className="form-control dark-input"
                min="0"
                step="0.1"
                value={protein}
                onChange={(e) => setProtein(e.target.value)}
                id="protein"
                placeholder="Protein"
              />
            </div>

            {/* Carbs */}
            <div className="col-6 col-md-2">
              <label
                htmlFor="carbs"
                className="form-label text-subtle fw-bold small text-uppercase"
              >
                Carbs (g)
              </label>
              <input
                type="number"
                className="form-control dark-input"
                min="0"
                step="0.1"
                value={carbs}
                onChange={(e) => setCarbs(e.target.value)}
                id="carbs"
                placeholder="Carbs"
              />
            </div>

            {/* Fat */}
            <div className="col-6 col-md-2">
              <label
                htmlFor="fat"
                className="form-label text-subtle fw-bold small text-uppercase"
              >
                Fat (g)
              </label>
              <input
                type="number"
                className="form-control dark-input"
                min="0"
                step="0.1"
                value={fat}
                onChange={(e) => setFat(e.target.value)}
                id="fat"
                placeholder="Fat"
              />
            </div>

            {/* Submit Button */}
            <div className="col-12 mt-3">
              <button
                type="submit"
                className="btn btn-success text-dark fw-bold px-4"
              >
                ADD MEAL
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Table Section */}
      {loading ? (
        <Spinner />
      ) : (
        <div className="card dark-card shadow-sm p-3">
          <h5 className="fw-bold mb-3 text-white">LOGGED MEALS</h5>
          <div className="table-responsive">
            <table className="table table-dark table-hover align-middle mb-0">
              <thead>
                <tr>
                  <th className="text-subtle">Food Name</th>
                  <th className="text-subtle">Calories (kcal)</th>
                  <th className="text-subtle">Protein (g)</th>
                  <th className="text-subtle">Carbs (g)</th>
                  <th className="text-subtle">Fat (g)</th>
                  <th className="text-subtle">Action</th>
                </tr>
              </thead>
              <tbody>
                {diets.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-subtle">
                      No food entries logged yet today.
                    </td>
                  </tr>
                ) : (
                  diets.map((d) => (
                    <tr key={d._id}>
                      {editId === d._id ? (
                        <>
                          <td className="fw-semibold text-white">
                            {d.foodName}
                          </td>
                          <td>
                            <input
                              type="number"
                              className="form-control form-control-sm dark-input"
                              min="0"
                              step="0.1"
                              value={editData.calories}
                              onChange={(e) =>
                                setEditData({
                                  ...editData,
                                  calories: e.target.value,
                                })
                              }
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              className="form-control form-control-sm dark-input"
                              min="0"
                              step="0.1"
                              value={editData.protein}
                              onChange={(e) =>
                                setEditData({
                                  ...editData,
                                  protein: e.target.value,
                                })
                              }
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              className="form-control form-control-sm dark-input"
                              min="0"
                              step="0.1"
                              value={editData.carbs}
                              onChange={(e) =>
                                setEditData({
                                  ...editData,
                                  carbs: e.target.value,
                                })
                              }
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              className="form-control form-control-sm dark-input"
                              min="0"
                              step="0.1"
                              value={editData.fat}
                              onChange={(e) =>
                                setEditData({
                                  ...editData,
                                  fat: e.target.value,
                                })
                              }
                            />
                          </td>
                          <td>
                            <button
                              className="btn btn-success btn-sm me-1"
                              onClick={() => handleUpdate(d._id)}
                            >
                              Save
                            </button>
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => setEditId(null)}
                            >
                              Cancel
                            </button>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="fw-semibold text-white">
                            {d.foodName}
                          </td>
                          <td className="text-white">{d.calories}</td>
                          <td className="text-white">{d.protein || 0}</td>
                          <td className="text-white">{d.carbs || 0}</td>
                          <td className="text-white">{d.fat || 0}</td>
                          <td>
                            <button
                              className="btn btn-warning btn-sm me-1"
                              onClick={() => handleEdit(d)}
                            >
                              Edit
                            </button>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => handleDelete(d._id)}
                            >
                              Delete
                            </button>
                          </td>
                        </>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default Diet;