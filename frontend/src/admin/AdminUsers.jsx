import React, { useEffect, useState } from "react";
import axios from "axios";
import Spinner from "../components/Spinner";

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        const usersRes = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/admin/users`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        setUsers(usersRes.data);
      } catch (err) {
        setError("Failde to load Users");
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
    <div className="container mt-4">
      {error && <div className="alert alert-danger mt-3">{error}</div>}
      {loading ? (
        <Spinner />
      ) : (
        <table className="table table-bordered mt-3">
          <thead className="table-dark">
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td>
                  {u.isBlocked ? (
                    <span className="badge bg-danger">Blocked</span>
                  ) : (
                    <span className="badge bg-success">Active</span>
                  )}
                </td>
                <td>
                  <button
                    className={`btn btn-sm me-1 ${u.isBlocked ? "btn-success" : "btn-warning"}`}
                    onClick={() => handleBlockToggle(u._id)}
                  >
                    {u.isBlocked ? "Unblock" : "Block"}
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(u._id)}
                  >
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

export default AdminUsers;
