import React, { useEffect, useState } from "react";
import axios from "axios";
import Spinner from "../components/Spinner";
import "../style/Admin.css";

function AdminWorkoutTypes() {
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [name, setName] = useState('');
  const [caloriesPerMinute, setCaloriesPerMinute] = useState('');
  const [category, setCategory] = useState('Strength');

  const fetchTypes = async () => {
    try {
      const token = localStorage.getItem("token");
      setLoading(true);
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/workout-types`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTypes(res.data);
    } catch (err) {
      setError("Failed to load workout types.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTypes(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/workout-types`,
        { name, caloriesPerMinute, category },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTypes([res.data, ...types]);
      setName(''); setCaloriesPerMinute('');
      setError('');
    } catch (err) {
      setError("Failed to add workout type.");
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/workout-types/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTypes(types.filter(t => t._id !== id));
      setError('');
    } catch (err) {
      setError("Failed to delete workout type.");
    }
  };

  return (
    <div className="container py-4 text-white">
      <div className="mb-4">
        <h2 className="fw-black text-uppercase tracking-wide m-0">
          WORKOUT <span className="text-neon-accent">TYPES</span>
        </h2>
        <p className="text-secondary small mt-1">Add and delete preset workout categories and calorie burn rates.</p>
      </div>

      {error && (
        <div className="alert alert-danger bg-danger bg-opacity-25 text-danger border-0 rounded-4 mb-4 text-center fw-semibold">
          {error}
        </div>
      )}

      {/* Add Workout Form */}
      <div className="admin-card p-4 mb-4">
        <h5 className="fw-bold mb-3 border-bottom border-secondary border-opacity-25 pb-2">
          ➕ Add Exercise Preset
        </h5>
        <form onSubmit={handleSubmit} className="row g-3">
          <div className="col-md-4">
            <label className="form-label-custom">Exercise Name</label>
            <input className="form-control form-control-custom" placeholder="e.g. Bench Press" value={name}
              onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="col-md-3">
            <label className="form-label-custom">Calories / Min</label>
            <input type="number" min="0" step="0.1" className="form-control form-control-custom" placeholder="e.g. 8.5" value={caloriesPerMinute}
              onChange={(e) => setCaloriesPerMinute(e.target.value)} required />
          </div>
          <div className="col-md-3">
            <label className="form-label-custom">Category</label>
            <select className="form-select form-select-custom" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="Strength">Strength</option>
              <option value="Cardio">Cardio</option>
              <option value="Flexibility">Flexibility</option>
              <option value="Balance">Balance</option>
            </select>
          </div>
          <div className="col-md-2 d-flex align-items-end">
            <button className="btn btn-neon-submit w-100 text-uppercase" type="submit">Add</button>
          </div>
        </form>
      </div>

      {/* Workout Table */}
      {loading ? (
        <div className="text-center py-5">
          <Spinner />
        </div>
      ) : (
        <div className="admin-table-container">
          <div className="table-responsive">
            <table className="table admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Calories/Min</th>
                  <th>Category</th>
                  <th className="text-end">Action</th>
                </tr>
              </thead>
              <tbody>
                {types.map((t) => (
                  <tr key={t._id}>
                    <td className="fw-semibold">{t.name}</td>
                    <td className="text-neon-accent fw-bold">{t.caloriesPerMinute} kcal</td>
                    <td>
                      <span className="badge bg-secondary bg-opacity-25 text-white">{t.category}</span>
                    </td>
                    <td className="text-end">
                      <button className="btn btn-action-danger" onClick={() => handleDelete(t._id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminWorkoutTypes;