import React, { useEffect, useState } from "react";
import axios from "axios";
import Spinner from "../components/Spinner";
import "../style/Admin.css";

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const usersRes = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/admin/users`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        setUsers(usersRes.data);
      } catch (err) {
        setError("Failed to load Users");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleBlockToggle = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/admin/users/${id}/block`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setUsers(users.map((u) => (u._id === id ? res.data : u)));
      setError('');
    } catch (err) {
      setError("Failed to update user status.");
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/admin/users/${id}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setUsers(users.filter((u) => u._id !== id));
      setError('');
    } catch (err) {
      setError("Failed to delete user.");
    }
  };

  return (
    <div className="container py-4 text-white">
      <div className="mb-4">
        <h2 className="fw-black text-uppercase tracking-wide m-0">
          USER <span className="text-neon-accent">MANAGEMENT</span>
        </h2>
        <p className="text-secondary small mt-1">Control accounts, roles, and status privileges.</p>
      </div>

      {error && (
        <div className="alert alert-danger bg-danger bg-opacity-25 text-danger border-0 rounded-4 mb-4 text-center fw-semibold">
          {error}
        </div>
      )}

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
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id}>
                    <td className="fw-semibold">{u.name}</td>
                    <td className="text-secondary">{u.email}</td>
                    <td>
                      <span className="badge bg-secondary bg-opacity-25 text-white">{u.role}</span>
                    </td>
                    <td>
                      <span className={u.isBlocked ? "badge-neon-danger" : "badge-neon-success"}>
                        {u.isBlocked ? "Blocked" : "Active"}
                      </span>
                    </td>
                    <td className="text-end">
                      <button
                        className={`btn me-2 ${u.isBlocked ? "btn-action-success" : "btn-action-warning"}`}
                        onClick={() => handleBlockToggle(u._id)}
                      >
                        {u.isBlocked ? "Unblock" : "Block"}
                      </button>
                      <button
                        className="btn btn-action-danger"
                        onClick={() => handleDelete(u._id)}
                      >
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

export default AdminUsers;