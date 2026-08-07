import React, { useEffect, useState } from "react";
import axios from "axios";
import Spinner from "../components/Spinner";
import "../style/Admin.css";

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
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);

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

  const handleImageUpload = async () => {
    if(!imageFile) return null;
    const formData = new FormData();
    formData.append('image', imageFile);
    const token = localStorage.getItem('token');
    setUploading(true);
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/food/upload-image`,
        formData,
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } }
      );
      return res.data.imageUrl;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      let imageUrl = '';
      if(imageFile){
        imageUrl = await handleImageUpload();
      }
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/food`,
        { name, description, price, calories, protein, carbs, fat, category, image: imageUrl },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFoods([res.data, ...foods]);
      setName(''); setDescription(''); setPrice(''); setCalories('');
      setProtein(''); setCarbs(''); setFat(''); setImageFile(null);
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
    <div className="container py-4 text-white">
      <div className="mb-4">
        <h2 className="fw-black text-uppercase tracking-wide m-0">
          MANAGE <span className="text-neon-accent">FOOD STORE</span>
        </h2>
        <p className="text-secondary small mt-1">Add and manage catalog inventory items.</p>
      </div>

      {error && (
        <div className="alert alert-danger bg-danger bg-opacity-25 text-danger border-0 rounded-4 mb-4 text-center fw-semibold">
          {error}
        </div>
      )}

      {/* Add Item Card */}
      <div className="admin-card p-4 mb-4">
        <h5 className="fw-bold mb-3 border-bottom border-secondary border-opacity-25 pb-2">
          ➕ Add New Item
        </h5>
        <form onSubmit={handleSubmit} className="row g-3">
          <div className="col-md-3">
            <label className="form-label-custom">Name</label>
            <input className="form-control form-control-custom" placeholder="Item Name" value={name}
              onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="col-md-3">
            <label className="form-label-custom">Description</label>
            <input className="form-control form-control-custom" placeholder="Brief description" value={description}
              onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="col-md-2">
            <label className="form-label-custom">Price (₹)</label>
            <input type="number" min="0" step="0.1" className="form-control form-control-custom" placeholder="Price" value={price}
              onChange={(e) => setPrice(e.target.value)} required />
          </div>
          <div className="col-md-2">
            <label className="form-label-custom">Calories</label>
            <input type="number" min="0" step="0.1" className="form-control form-control-custom" placeholder="kcal" value={calories}
              onChange={(e) => setCalories(e.target.value)} />
          </div>
          <div className="col-md-2">
            <label className="form-label-custom">Category</label>
            <select className="form-select form-select-custom" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="Protein">Protein</option>
              <option value="LowCalorie">LowCalorie</option>
              <option value="HealthySnack">HealthySnack</option>
              <option value="Supplement">Supplement</option>
            </select>
          </div>
          <div className="col-md-2">
            <label className="form-label-custom">Protein (g)</label>
            <input type="number" min="0" step="0.1" className="form-control form-control-custom" placeholder="Protein" value={protein}
              onChange={(e) => setProtein(e.target.value)} />
          </div>
          <div className="col-md-2">
            <label className="form-label-custom">Carbs (g)</label>
            <input type="number" min="0" step="0.1" className="form-control form-control-custom" placeholder="Carbs" value={carbs}
              onChange={(e) => setCarbs(e.target.value)} />
          </div>
          <div className="col-md-2">
            <label className="form-label-custom">Fat (g)</label>
            <input type="number" min="0" step="0.1" className="form-control form-control-custom" placeholder="Fat" value={fat}
              onChange={(e) => setFat(e.target.value)} />
          </div>
          <div className="col-md-4">
            <label className="form-label-custom">Product Image</label>
            <input type="file" accept="image/*" className="form-control form-control-custom"
              onChange={(e) => setImageFile(e.target.files[0])} />
          </div>
          <div className="col-md-2 d-flex align-items-end">
            <button className="btn btn-neon-submit w-100 text-uppercase" type="submit" disabled={uploading}>
              {uploading ? 'Uploading...' : 'Add Item'}
            </button>
          </div>
        </form>
      </div>

      {/* Items Table */}
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
                  <th>Image</th>
                  <th>Name</th>
                  <th>Price</th>
                  <th>Calories</th>
                  <th>Category</th>
                  <th>In Stock</th>
                  <th className="text-end">Action</th>
                </tr>
              </thead>
              <tbody>
                {foods.map((f) => (
                  <tr key={f._id}>
                    <td>
                      <img src={f.image || 'https://placehold.co/50x50'} alt={f.name} width="45" height="45" className="rounded-3" style={{objectFit: 'cover'}}/>
                    </td>
                    <td className="fw-semibold">{f.name}</td>
                    <td className="text-neon-accent fw-bold">₹ {f.price}</td>
                    <td>{f.calories || '--'} kcal</td>
                    <td><span className="badge bg-secondary bg-opacity-25 text-white">{f.category}</span></td>
                    <td>
                      <span className={f.inStock ? "badge-neon-success" : "badge-neon-danger"}>
                        {f.inStock ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="text-end">
                      <button className="btn btn-action-danger" onClick={() => handleDelete(f._id)}>
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

export default AdminFoodStore;