import React, { useEffect, useState } from "react";
import axios from "axios";
import Spinner from "../components/Spinner";

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
    <div className="container mt-4">
      {error && <div className="alert alert-danger mt-3">{error}</div>}

      <form onSubmit={handleSubmit} className="row g-2 mb-4">
        <div className="col-md-4">
          <input className="form-control" placeholder="Exercise Name" value={name}
            onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="col-md-3">
          <input type="number" min="0" className="form-control" placeholder="Calories/Min" value={caloriesPerMinute}
            onChange={(e) => setCaloriesPerMinute(e.target.value)} required />
        </div>
        <div className="col-md-3">
          <select className="form-select" value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="Strength">Strength</option>
            <option value="Cardio">Cardio</option>
            <option value="Flexibility">Flexibility</option>
            <option value="Balance">Balance</option>
          </select>
        </div>
        <div className="col-md-2">
          <button className="btn btn-primary w-100" type="submit">Add</button>
        </div>
      </form>

      {loading ? <Spinner /> : (
        <table className="table table-bordered">
          <thead className="table-dark">
            <tr>
              <th>Name</th>
              <th>Calories/Min</th>
              <th>Category</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {types.map((t) => (
              <tr key={t._id}>
                <td>{t.name}</td>
                <td>{t.caloriesPerMinute}</td>
                <td>{t.category}</td>
                <td>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(t._id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default AdminWorkoutTypes;