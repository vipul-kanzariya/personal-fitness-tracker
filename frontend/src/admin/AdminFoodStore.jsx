import { useEffect, useState } from "react";
import axios from "axios";
import Spinner from "../components/Spinner";
import "../style/Admin.css";
import { FiEdit2, FiPlus, FiX } from "react-icons/fi";

function AdminFoodStore() {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [calories, setCalories] = useState('');
  const [initialStock, setInitialStock] = useState('');
  const [lowStockThreshold, setLowStockThreshold] = useState('10');
  const [category, setCategory] = useState('Protein');
  const [imageFile, setImageFile] = useState(null);
  const [currentImage, setCurrentImage] = useState('');
  const [uploading, setUploading] = useState(false);
  const [editingFoodId, setEditingFoodId] = useState(null);

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

  const resetForm = () => {
    setEditingFoodId(null);
    setName('');
    setDescription('');
    setPrice('');
    setCalories('');
    setInitialStock('');
    setLowStockThreshold('10');
    setCategory('Protein');
    setImageFile(null);
    setCurrentImage('');
  };

  const startEditing = (food) => {
    setEditingFoodId(food._id);
    setName(food.name || '');
    setDescription(food.description || '');
    setPrice(food.price ?? '');
    setCalories(food.calories ?? '');
    setInitialStock(food.inventory?.quantity ?? 0);
    setLowStockThreshold(food.lowStockThreshold ?? '10');
    setCategory(food.category || 'Protein');
    setImageFile(null);
    setCurrentImage(food.image || '');
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
      const method = editingFoodId ? 'put' : 'post';
      const url = editingFoodId
        ? `${import.meta.env.VITE_API_URL}/api/food/${editingFoodId}`
        : `${import.meta.env.VITE_API_URL}/api/food`;
      await axios[method](
        url,
        {
          name,
          description,
          price,
          calories,
          category,
          image: imageUrl || currentImage,
          initialStock,
          lowStockThreshold,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchFoods();
      resetForm();
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
      setFoods((currentFoods) => currentFoods.filter(f => f._id !== id));
      if (editingFoodId === id) resetForm();
      setError('');
    } catch (err) {
      setError("Failed to delete food item.");
    }
  };

  return (
    <div className="container py-4">
      <div className="mb-4">
        <h2 className="fw-black text-uppercase tracking-wide m-0">
          MANAGE <span className="text-neon-accent">FOOD STORE</span>
        </h2>
        <p className="text-subtle small mt-1">Add and manage catalog inventory items.</p>
      </div>

      {error && (
        <div className="alert alert-danger bg-danger bg-opacity-25 text-danger border-0 rounded-4 mb-4 text-center fw-semibold">
          {error}
        </div>
      )}

      {/* Add Item Card */}
      <div className="admin-card p-4 mb-4">
        <h5 className="fw-bold mb-3 border-bottom border-secondary border-opacity-25 pb-2 d-flex align-items-center gap-2">
          {editingFoodId ? <FiEdit2 aria-hidden="true" /> : <FiPlus aria-hidden="true" />}
          {editingFoodId ? 'Edit Food Item' : 'Add New Item'}
        </h5>
        <form onSubmit={handleSubmit} className="row g-3 align-items-end">
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
            <label className="form-label-custom">Initial Stock</label>
            <input type="number" min="0" className="form-control form-control-custom" placeholder="50" value={initialStock}
              onChange={(e) => setInitialStock(e.target.value)} />
          </div>
          <div className="col-md-2">
            <label className="form-label-custom">Low Stock Threshold</label>
            <input type="number" min="0" className="form-control form-control-custom" placeholder="10" value={lowStockThreshold}
              onChange={(e) => setLowStockThreshold(e.target.value)} />
          </div>
          <div className="col-md-4">
            <label className="form-label-custom">Product Image</label>
            <input type="file" accept="image/*" className="form-control form-control-custom"
              onChange={(e) => setImageFile(e.target.files[0])} />
          </div>
          <div className="col-md-2 d-flex align-items-end">
            <button className="btn btn-neon-submit w-100 text-uppercase" type="submit" disabled={uploading}>
              {uploading ? 'Uploading...' : editingFoodId ? 'Update Item' : 'Add Item'}
            </button>
          </div>
          {editingFoodId && (
            <div className="col-md-2 d-flex align-items-end">
              <button className="btn btn-action-warning w-100" type="button" onClick={resetForm}>
                <FiX aria-hidden="true" /> Cancel
              </button>
            </div>
          )}
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
            <table className="table admin-table admin-food-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Price</th>
                  <th>Calories</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th className="text-end">Action</th>
                </tr>
              </thead>
              <tbody>
                {foods.map((f) => (
                  <tr key={f._id}>
                    <td data-label="Image">
                      <img src={f.image || 'https://placehold.co/50x50'} alt={f.name} width="45" height="45" className="rounded-3" style={{objectFit: 'cover'}}/>
                    </td>
                    <td className="fw-semibold" data-label="Name">{f.name}</td>
                    <td className="text-neon-accent fw-bold" data-label="Price">₹ {f.price}</td>
                    <td data-label="Calories">{f.calories || '--'} kcal</td>
                    <td data-label="Stock">
                      <div>{f.availableQuantity ?? 0} avail</div>
                      <small className="text-subtle">Threshold: {f.lowStockThreshold ?? 0}</small>
                    </td>
                    <td data-label="Status">
                      <span className={f.stockStatus === 'Out of Stock' ? 'badge-neon-danger' : f.stockStatus === 'Low Stock' ? 'badge-neon-warning' : 'badge-neon-success'}>
                        {f.stockStatus || (f.inStock ? 'In Stock' : 'Unavailable')}
                      </span>
                    </td>
                    <td className="text-end" data-label="Action">
                      <div className="d-flex justify-content-end gap-2 flex-wrap">
                        <button className="btn btn-action-warning" onClick={() => startEditing(f)}>
                          <FiEdit2 aria-hidden="true" /> Edit
                        </button>
                        <button className="btn btn-action-danger" onClick={() => handleDelete(f._id)}>
                          Delete
                        </button>
                      </div>
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