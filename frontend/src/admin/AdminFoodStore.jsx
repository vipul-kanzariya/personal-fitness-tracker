import React, { useEffect, useState } from "react";
import axios from "axios";
import Spinner from "../components/Spinner";

function AdminFoodStore() {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [category, setCategory] = useState('Protein');
  const [image, setImage] = useState('');

  const fetchFoods = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/food`);
      setFoods(res.data);
    } catch (err) {
      setError("Failed to load food items.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFoods(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/food`,
        { name, description, price, calories, protein, carbs, fat, category, image },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFoods([res.data, ...foods]);
      setName(''); setDescription(''); setPrice(''); setCalories('');
      setProtein(''); setCarbs(''); setFat(''); setImage('');
      setError('');
    } catch (err) {
      setError("Failed to add food item.");
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/food/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFoods(foods.filter(f => f._id !== id));
      setError('');
    } catch (err) {
      setError("Failed to delete food item.");
    }
  };

  return (
    <div className="container mt-4">
      {error && <div className="alert alert-danger mt-3">{error}</div>}

      <form onSubmit={handleSubmit} className="row g-2 mb-4">
        <div className="col-md-3">
          <input className="form-control" placeholder="Name" value={name}
            onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="col-md-3">
          <input className="form-control" placeholder="Description" value={description}
            onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div className="col-md-2">
          <input type="number" min="0" className="form-control" placeholder="Price" value={price}
            onChange={(e) => setPrice(e.target.value)} required />
        </div>
        <div className="col-md-2">
          <input type="number" min="0" className="form-control" placeholder="Calories" value={calories}
            onChange={(e) => setCalories(e.target.value)} />
        </div>
        <div className="col-md-2">
          <select className="form-select" value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="Protein">Protein</option>
            <option value="LowCalorie">LowCalorie</option>
            <option value="HealthySnack">HealthySnack</option>
            <option value="Supplement">Supplement</option>
          </select>
        </div>
        <div className="col-md-2">
          <input type="number" min="0" className="form-control" placeholder="Protein(g)" value={protein}
            onChange={(e) => setProtein(e.target.value)} />
        </div>
        <div className="col-md-2">
          <input type="number" min="0" className="form-control" placeholder="Carbs(g)" value={carbs}
            onChange={(e) => setCarbs(e.target.value)} />
        </div>
        <div className="col-md-2">
          <input type="number" min="0" className="form-control" placeholder="Fat(g)" value={fat}
            onChange={(e) => setFat(e.target.value)} />
        </div>
        <div className="col-md-4">
          <input className="form-control" placeholder="Image URL" value={image}
            onChange={(e) => setImage(e.target.value)} />
        </div>
        <div className="col-md-2">
          <button className="btn btn-primary w-100" type="submit">Add Food</button>
        </div>
      </form>

      {loading ? <Spinner /> : (
        <table className="table table-bordered">
          <thead className="table-dark">
            <tr>
              <th>Name</th>
              <th>Price</th>
              <th>Calories</th>
              <th>Category</th>
              <th>In Stock</th>
              <th>Image</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {foods.map((f) => (
              <tr key={f._id}>
                <td>{f.name}</td>
                <td>₹ {f.price}</td>
                <td>{f.calories}</td>
                <td>{f.category}</td>
                <td>{f.inStock ? 'Yes' : 'No'}</td>
                <td>
  <img src={f.image || 'https://via.placeholder.com/50'} alt={f.name} width="50" height="50" style={{objectFit: 'cover'}}/>
</td>
                <td>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(f._id)}>
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

export default AdminFoodStore;