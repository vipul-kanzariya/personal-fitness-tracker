import React, { useEffect, useState } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Spinner from "../components/Spinner";
import NumberInput from "../components/NumberInput";
import FilterButtons from "../components/FilterButtons";
import { useDateFilter } from "../hooks/useDateFilter";
import { useAuthFetch } from "../hooks/useAuthFetch";
import { API_BASE_URL, getAuthConfig } from "../utils/api";
import { getProgressPercent } from "../utils/formatters";
import "../style/Diet.css";
import { toast } from "react-toastify";

function Diet() {
  const [diets, setDiets] = useState([]);
  const [foodName, setFoodName] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());

  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});

  const { loading, error, execute, setError } = useAuthFetch();
  const { filter, setFilter, filteredItems: filteredDiets } = useDateFilter(diets, "date");

  // Default daily target goals
  const [targets] = useState({
    calories: 2000,
    protein: 150,
    carbs: 225,
    fat: 65,
  });

  useEffect(() => {
    fetchDiet();
  }, []);

  const fetchDiet = async () => {
    try {
      const data = await execute({
        method: 'GET',
        url: '/api/diet',
      });
      setDiets(data);
    } catch (err) {
      toast.error("Failed to load diet entries.");
    }
  };

  // Calculate Totals
  const totals = filteredDiets.reduce(
    (acc, d) => ({
      calories: acc.calories + (Number(d.calories) || 0),
      protein: acc.protein + (Number(d.protein) || 0),
      carbs: acc.carbs + (Number(d.carbs) || 0),
      fat: acc.fat + (Number(d.fat) || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const handleAutoFill = async () => {
    if (!foodName.trim()) {
      setError("Please enter a food name first.");
      return;
    }
    try {
      const data = await execute({
        method: 'POST',
        url: '/api/diet/estimate',
        data: { foodName },
      });
      setCalories(data.calories ?? "");
      setProtein(data.protein ?? "");
      setCarbs(data.carbs ?? "");
      setFat(data.fat ?? "");
      setError(null);
      toast.success("Nutrition estimated!");
    } catch (err) {
      toast.error("Failed to estimate nutrition. Please enter values manually.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!calories || Number(calories) <= 0) {
      setError("Calories must be greater than 0");
      return;
    }

    try {
      const data = await execute({
        method: 'POST',
        url: '/api/diet',
        data: {
          foodName,
          calories,
          protein: protein || 0,
          carbs: carbs || 0,
          fat: fat || 0,
          date: selectedDate.toISOString(),
        },
      });
      setDiets([data, ...diets]);

      // Reset form
      setFoodName("");
      setCalories("");
      setProtein("");
      setCarbs("");
      setFat("");
      setSelectedDate(new Date());
      setError(null);
      toast.success("Meal added!");
    } catch (err) {
      toast.error("Failed to save entry.");
    }
  };

  const handleDelete = async (id) => {
    try {
      await execute({
        method: 'DELETE',
        url: `/api/diet/${id}`,
      });
      setDiets(diets.filter((d) => d._id !== id));
      toast.success("Entry deleted.");
    } catch (err) {
      toast.error("Failed to delete entry.");
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
    // Validation
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
      const data = await execute({
        method: 'PUT',
        url: `/api/diet/${id}`,
        data: editData,
      });
      setDiets(diets.map((d) => (d._id === id ? data : d)));
      setEditId(null);
      setEditData({});
      setError("");
      toast.success("Entry updated!");
    } catch (err) {
      toast.error("Failed to update diet entry.");
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="fw-bold mb-4 apex-title">
        DIET & <span className="text-neon-green">NUTRITION TRACKER</span>
      </h2>
      {error && <div className="alert alert-danger mb-4" role="alert">{error}</div>}

      {/* Daily Macros Summary Cards */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-md-3">
          <div className="card dark-card shadow-sm p-3 h-100">
            <span className="text-subtle small fw-bold text-uppercase">
              Calories
            </span>
            <h4 className="fw-bold my-1">
              {totals.calories}{" "}
              <span className="fs-6 text-subtle font-normal">
                / {targets.calories} KCAL
              </span>
            </h4>
            <div className="progress mt-2 custom-progress" style={{ height: "8px" }}>
              <div
                className="progress-bar bg-primary"
                role="progressbar"
                aria-valuenow={totals.calories}
                aria-valuemin="0"
                aria-valuemax={targets.calories}
                style={{
                  width: `${getProgressPercent(totals.calories, targets.calories)}%`,
                }}
              ></div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-md-3">
          <div className="card dark-card shadow-sm p-3 h-100">
            <span className="text-subtle small fw-bold text-uppercase">
              Protein
            </span>
            <h4 className="fw-bold my-1">
              {totals.protein}G{" "}
              <span className="fs-6 text-subtle font-normal">
                / {targets.protein}G
              </span>
            </h4>
            <div className="progress mt-2 custom-progress" style={{ height: "8px" }}>
              <div
                className="progress-bar bg-danger"
                role="progressbar"
                aria-valuenow={totals.protein}
                aria-valuemin="0"
                aria-valuemax={targets.protein}
                style={{
                  width: `${getProgressPercent(totals.protein, targets.protein)}%`,
                }}
              ></div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-md-3">
          <div className="card dark-card shadow-sm p-3 h-100">
            <span className="text-subtle small fw-bold text-uppercase">
              Carbs
            </span>
            <h4 className="fw-bold my-1">
              {totals.carbs}G{" "}
              <span className="fs-6 text-subtle font-normal">
                / {targets.carbs}G
              </span>
            </h4>
            <div className="progress mt-2 custom-progress" style={{ height: "8px" }}>
              <div
                className="progress-bar bg-warning"
                role="progressbar"
                aria-valuenow={totals.carbs}
                aria-valuemin="0"
                aria-valuemax={targets.carbs}
                style={{
                  width: `${getProgressPercent(totals.carbs, targets.carbs)}%`,
                }}
              ></div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-md-3">
          <div className="card dark-card shadow-sm p-3 h-100">
            <span className="text-subtle small fw-bold text-uppercase">
              Fat
            </span>
            <h4 className="fw-bold my-1">
              {totals.fat}G{" "}
              <span className="fs-6 text-subtle font-normal">
                / {targets.fat}G
              </span>
            </h4>
            <div className="progress mt-2 custom-progress" style={{ height: "8px" }}>
              <div
                className="progress-bar bg-info"
                role="progressbar"
                aria-valuenow={totals.fat}
                aria-valuemin="0"
                aria-valuemax={targets.fat}
                style={{
                  width: `${getProgressPercent(totals.fat, targets.fat)}%`,
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="card dark-card shadow-sm p-4 mb-4">
        <h5 className="fw-bold mb-3">ADD FOOD ENTRY</h5>
        <form onSubmit={handleSubmit} className="diet-entry-form">
          <div className="diet-entry-grid">
            <div className="diet-entry-field diet-entry-food">
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
                  aria-required="true"
                />
                <button
                  type="button"
                  className="btn btn-outline-primary d-inline-flex align-items-center gap-2 fw-medium"
                  onClick={handleAutoFill}
                  title="Quickly estimate nutrition using AI"
                  disabled={loading}
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
                    aria-hidden="true"
                  >
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                  </svg>
                  <span>Quick Fill</span>
                </button>
              </div>
            </div>

            <div className="diet-entry-field diet-entry-date">
              <label
                htmlFor="date"
                className="form-label text-subtle fw-bold small text-uppercase"
              >
                Date
              </label>
              <DatePicker
                selected={selectedDate}
                onChange={(date) => setSelectedDate(date || new Date())}
                className="form-control dark-input"
                dateFormat="dd/MM/yyyy"
                maxDate={new Date()}
                id="date"
                aria-label="Select date"
              />
            </div>

            <NumberInput
              name="calories"
              label="Calories"
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
              placeholder="kcal"
              min={0}
              required
              className="diet-entry-field"
            />

            <NumberInput
              name="protein"
              label="Protein (g)"
              value={protein}
              onChange={(e) => setProtein(e.target.value)}
              placeholder="Protein"
              min={0}
              className="diet-entry-field"
            />

            <NumberInput
              name="carbs"
              label="Carbs (g)"
              value={carbs}
              onChange={(e) => setCarbs(e.target.value)}
              placeholder="Carbs"
              min={0}
              className="diet-entry-field"
            />

            <NumberInput
              name="fat"
              label="Fat (g)"
              value={fat}
              onChange={(e) => setFat(e.target.value)}
              placeholder="Fat"
              min={0}
              className="diet-entry-field"
            />

            <div className="diet-entry-actions">
              <button
                type="submit"
                className="btn btn-success text-dark fw-bold px-4"
                disabled={loading}
              >
                {loading ? "Adding..." : "ADD MEAL"}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Filter & Table Section */}
      {loading && diets.length === 0 ? (
        <Spinner />
      ) : (
        <div className="card dark-card shadow-sm p-3">
          <h5 className="fw-bold mb-3">LOGGED MEALS</h5>

          {/* Date Filter Buttons */}
          <FilterButtons filter={filter} setFilter={setFilter} />

          <div className="table-responsive">
            <table className="table theme-table table-hover align-middle mb-0">
              <thead>
                <tr>
                  <th className="text-subtle">Food Name</th>
                  <th className="text-subtle">Date</th>
                  <th className="text-subtle">Calories (kcal)</th>
                  <th className="text-subtle">Protein (g)</th>
                  <th className="text-subtle">Carbs (g)</th>
                  <th className="text-subtle">Fat (g)</th>
                  <th className="text-subtle">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredDiets.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-4 text-subtle">
                      No food entries found for this filter.
                    </td>
                  </tr>
                ) : (
                  filteredDiets.map((d) => (
                    <tr key={d._id}>
                      {editId === d._id ? (
                        <>
                          <td className="fw-semibold">{d.foodName}</td>
                          <td className="text-subtle small">
                            {new Date(d.date || d.createdAt).toLocaleDateString()}
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
                              aria-label="Edit calories"
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
                              aria-label="Edit protein"
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
                              aria-label="Edit carbs"
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
                              aria-label="Edit fat"
                            />
                          </td>
                          <td>
                            <button
                              className="btn btn-success btn-sm me-1"
                              onClick={() => handleUpdate(d._id)}
                              aria-label="Save changes"
                            >
                              Save
                            </button>
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => setEditId(null)}
                              aria-label="Cancel editing"
                            >
                              Cancel
                            </button>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="fw-semibold">{d.foodName}</td>
                          <td className="text-subtle small">
                            {new Date(d.date || d.createdAt).toLocaleDateString()}
                          </td>
                          <td>{d.calories}</td>
                          <td>{d.protein || 0}</td>
                          <td>{d.carbs || 0}</td>
                          <td>{d.fat || 0}</td>
                          <td>
                            <button
                              className="btn btn-warning btn-sm me-1"
                              onClick={() => handleEdit(d)}
                              aria-label={`Edit ${d.foodName}`}
                            >
                              Edit
                            </button>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => handleDelete(d._id)}
                              aria-label={`Delete ${d.foodName}`}
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