import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Users.css";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [confirmAction, setConfirmAction] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const res = await axios.get("http://localhost:5000/api/admin/users", {
      withCredentials: true,
    });
    setUsers(res.data);
  };

  const deleteUser = (id) => {
    setConfirmAction({
      type: "delete",
      id,
      message: "Are you sure you want to delete this user?",
    });
  };

  const changeRole = async (id, role) => {
    await axios.patch(
      `http://localhost:5000/api/admin/users/${id}/role`,
      { role },
      { withCredentials: true }
    );

    setUsers(
      users.map((u) => (u._id === id ? { ...u, role } : u))
    );
  };

  const toggleBan = async (id, banned) => {
    await axios.patch(
      `http://localhost:5000/api/admin/users/${id}/ban`,
      { banned },
      { withCredentials: true }
    );

    setUsers(
      users.map((u) =>
        u._id === id ? { ...u, isBanned: banned } : u
      )
    );
  };

  const handleConfirm = async () => {
    if (!confirmAction) return;

    const { id } = confirmAction;

    await axios.delete(
      `http://localhost:5000/api/admin/users/${id}`,
      { withCredentials: true }
    );

    setUsers(users.filter((u) => u._id !== id));
    setConfirmAction(null);
  };

  return (
    <div className="admin-users">
      <h2>User Management</h2>

      <div className="users-table-wrapper">
        <table className="users-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Admin</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                
                {/* USER */}
                <td className="user-info">
                  {user.profileImage ? (
                    <img
                      src={`http://localhost:5000${user.profileImage}`}
                      alt="avatar"
                      className="avatar"
                    />
                  ) : (
                    <div className="avatar-letter">
                      {user.username?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span>{user.username}</span>
                </td>

                {/* EMAIL */}
                <td>{user.email}</td>

                {/* ROLE */}
                <td>
                  <span
                    className={
                      user.role === "admin"
                        ? "role-admin"
                        : "role-user"
                    }
                  >
                    {user.role}
                  </span>
                </td>

                {/* STATUS */}
                <td>
                  <span
                    className={
                      user.isBanned
                        ? "status-banned"
                        : "status-active"
                    }
                  >
                    {user.isBanned ? "Banned" : "Active"}
                  </span>
                </td>

                {/* ADMIN CONTROL */}
                <td>
                  {user.role === "admin" ? (
                    <button
                      className="demote"
                      onClick={() =>
                        changeRole(user._id, "customer")
                      }
                    >
                      Remove Admin
                    </button>
                  ) : (
                    <button
                      className="promote"
                      onClick={() =>
                        changeRole(user._id, "admin")
                      }
                    >
                      Make Admin
                    </button>
                  )}
                </td>

                {/* ACTIONS */}
                <td>
                  <button
                    className="ban-btn"
                    onClick={() =>
                      toggleBan(user._id, !user.isBanned)
                    }
                  >
                    {user.isBanned ? "Unban" : "Ban"}
                  </button>

                  <button
                    className="delete-btn"
                    onClick={() => deleteUser(user._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* CONFIRM MODAL */}
      {confirmAction && (
        <div className="confirm-overlay">
          <div className="confirm-box">
            <p>{confirmAction.message}</p>

            <div className="confirm-actions">
              <button
                className="confirm-cancel"
                onClick={() => setConfirmAction(null)}
              >
                Cancel
              </button>

              <button
                className="confirm-yes"
                onClick={handleConfirm}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}