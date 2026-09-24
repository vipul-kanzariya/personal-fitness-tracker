import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Spinner from '../components/Spinner';
import '../style/Admin.css';

const getAuthConfig = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem('token')}`,
  },
});

const stockStatusClass = {
  'In Stock': 'badge-neon-success',
  'Low Stock': 'badge-neon-warning',
  'Out of Stock': 'badge-neon-danger',
};

function AdminInventory() {
  const [items, setItems] = useState([]);
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [form, setForm] = useState({
    foodId: '',
    action: 'add',
    quantity: '',
    lowStockThreshold: '',
  });

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const inventoryRes = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/inventory`,
        getAuthConfig(),
      );
      setItems(inventoryRes.data);
      setFoods(
        inventoryRes.data
          .filter((item) => item.foodId)
          .map((item) => item.foodId),
      );
    } catch (err) {
      toast.error(err.response?.data || 'Failed to load inventory data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const productName = item.foodId?.name || '';
      const matchesSearch = productName.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || item.stockStatus === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [items, search, statusFilter]);

  const handleStockUpdate = async (e) => {
    e.preventDefault();

    const quantity = Number(form.quantity);
    if (!form.foodId) {
      toast.warning('Please select a product.');
      return;
    }
    if (!Number.isFinite(quantity) || quantity <= 0) {
      toast.warning('Quantity must be a positive number.');
      return;
    }

    try {
      await axios.patch(
        `${import.meta.env.VITE_API_URL}/api/inventory/${form.foodId}/stock`,
        {
          action: form.action,
          quantity,
        },
        getAuthConfig(),
      );

      if (form.lowStockThreshold !== '') {
        const threshold = Number(form.lowStockThreshold);
        if (Number.isFinite(threshold) && threshold >= 0) {
          await axios.put(
            `${import.meta.env.VITE_API_URL}/api/inventory/${form.foodId}`,
            { lowStockThreshold: threshold },
            getAuthConfig(),
          );
        }
      }

      setForm({ foodId: '', action: 'add', quantity: '', lowStockThreshold: '' });
      toast.success('Inventory updated successfully');
      fetchInventory();
    } catch (err) {
      toast.error(err.response?.data || 'Inventory update failed.');
    }
  };

  const handleToggleInventory = async (foodId, isActive) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/inventory/${foodId}`,
        { isActive: !isActive },
        getAuthConfig(),
      );
      toast.success('Inventory status updated');
      fetchInventory();
    } catch (err) {
      toast.error(err.response?.data || 'Unable to update inventory status.');
    }
  };

  return (
    <div className="container py-4">
      <div className="mb-4">
        <h2 className="fw-black text-uppercase tracking-wide m-0">
          INVENTORY <span className="text-neon-accent">MANAGEMENT</span>
        </h2>
        <p className="text-subtle small mt-1">Track stock, low-stock alerts, and product availability.</p>
      </div>

      <div className="admin-card p-4 mb-4">
        <h5 className="fw-bold mb-3 border-bottom border-secondary border-opacity-25 pb-2">Quick stock update</h5>
        <form onSubmit={handleStockUpdate} className="row g-3">
          <div className="col-md-3">
            <label className="form-label-custom">Product</label>
            <select
              className="form-select form-select-custom"
              value={form.foodId}
              onChange={(e) => setForm((prev) => ({ ...prev, foodId: e.target.value }))}
            >
              <option value="">Select product</option>
              {foods.map((food) => (
                <option key={food._id} value={food._id}>{food.name}</option>
              ))}
            </select>
          </div>
          <div className="col-md-2">
            <label className="form-label-custom">Action</label>
            <select
              className="form-select form-select-custom"
              value={form.action}
              onChange={(e) => setForm((prev) => ({ ...prev, action: e.target.value }))}
            >
              <option value="add">Add stock</option>
              <option value="remove">Remove stock</option>
              <option value="set">Set stock</option>
            </select>
          </div>
          <div className="col-md-2">
            <label className="form-label-custom">Quantity</label>
            <input
              type="number"
              min="1"
              className="form-control form-control-custom"
              value={form.quantity}
              onChange={(e) => setForm((prev) => ({ ...prev, quantity: e.target.value }))}
            />
          </div>
          <div className="col-md-2">
            <label className="form-label-custom">Threshold</label>
            <input
              type="number"
              min="0"
              className="form-control form-control-custom"
              value={form.lowStockThreshold}
              onChange={(e) => setForm((prev) => ({ ...prev, lowStockThreshold: e.target.value }))}
            />
          </div>
          <div className="col-md-3 d-flex align-items-end">
            <button type="submit" className="btn btn-neon-submit w-100">
              Update stock
            </button>
          </div>
        </form>
      </div>

      <div className="admin-card p-3 mb-4">
        <div className="row g-3 align-items-center">
          <div className="col-md-6">
            <input
              className="form-control form-control-custom"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search product name..."
            />
          </div>
          <div className="col-md-3">
            <select
              className="form-select form-select-custom"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All status</option>
              <option value="In Stock">In Stock</option>
              <option value="Low Stock">Low Stock</option>
              <option value="Out of Stock">Out of Stock</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5"><Spinner /></div>
      ) : (
        <div className="admin-table-container">
          <div className="table-responsive">
            <table className="table admin-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Available</th>
                  <th>Reserved</th>
                  <th>Threshold</th>
                  <th>Status</th>
                  <th>Active</th>
                  <th className="text-end">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => (
                  <tr key={item._id}>
                    <td>
                      <div className="d-flex align-items-center gap-3">
                        <img
                          src={item.foodId?.image || 'https://placehold.co/48x48'}
                          alt={item.foodId?.name || 'Product'}
                          width="42"
                          height="42"
                          className="rounded-3"
                          style={{ objectFit: 'cover' }}
                        />
                        <div>
                          <div className="fw-semibold">{item.foodId?.name || 'Unknown product'}</div>
                          <small className="text-subtle">₹{item.foodId?.price || 0}</small>
                        </div>
                      </div>
                    </td>
                    <td className="fw-bold">{item.availableQuantity ?? 0}</td>
                    <td>{item.reservedQuantity || 0}</td>
                    <td>{item.lowStockThreshold || 0}</td>
                    <td>
                      <span className={stockStatusClass[item.stockStatus] || 'badge bg-secondary bg-opacity-25 text-light'}>
                        {item.stockStatus}
                      </span>
                    </td>
                    <td>
                      <span className={item.isActive ? 'badge-neon-success' : 'badge-neon-danger'}>
                        {item.isActive ? 'Enabled' : 'Disabled'}
                      </span>
                    </td>
                    <td className="text-end">
                      <button
                        className="btn btn-action-warning me-2"
                        onClick={() => handleToggleInventory(item.foodId?._id, item.isActive)}
                      >
                        {item.isActive ? 'Disable' : 'Enable'}
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

export default AdminInventory;
