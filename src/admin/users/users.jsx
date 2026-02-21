import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "./Users.css";

export default function Users() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);


  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://localhost:3000/user");
      setUsers(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch users");
    }
  };


  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await axios.delete(`http://localhost:3000/user/${id}`);
      toast.success("User deleted successfully");
      setUsers(users.filter((u) => u.id !== id));
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete user");
    }
  };

  const handleRoleChange = async (id, newRole) => {
    try {
      await axios.patch(`http://localhost:3000/user/${id}`, { role: newRole });
      toast.success(`User role updated to ${newRole}`);
      setUsers(users.map((u) => (u.id === id ? { ...u, role: newRole } : u)));
    } catch (err) {
      console.error(err);
      toast.error("Failed to update role");
    }
  };

  return (
    <div className="users-container">
      <h2 className="users-title">Manage Users</h2>

      {users.length === 0 ? (
        <p className="no-users">No users found</p>
      ) : (
        <table className="users-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>
                  <select
                    value={user.role || "customer"}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                  >
                    <option value="customer">Customer</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td>
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(user.id)}
                  >
                    Delete
                  </button>
                  {user.role === "admin" ? (
                    <button
                      className="demote-btn"
                      onClick={() => handleRoleChange(user.id, "customer")}
                    >
                      Remove Admin
                    </button>
                  ) : (
                    <button
                      className="promote-btn"
                      onClick={() => handleRoleChange(user.id, "admin")}
                    >
                      Make Admin
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
