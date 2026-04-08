import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { getAssetUrl, request } from "../../services/apiClient";
import "./Users.css";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [confirmAction, setConfirmAction] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await request("/admin/users?limit=100");
      setUsers(Array.isArray(data?.users) ? data.users : []);
    } catch (error) {
      toast.error(error.message || "Failed to load users");
    }
  };

  const deleteUser = (id) => {
    setConfirmAction({
      type: "delete",
      id,
      message: "Are you sure you want to delete this user?",
    });
  };

  const changeRole = async (id, role) => {
    try {
      await request(`/admin/users/${id}/role`, "PATCH", { role });
      setUsers((currentUsers) =>
        currentUsers.map((user) =>
          user._id === id ? { ...user, role } : user
        )
      );
      toast.success("User role updated");
    } catch (error) {
      toast.error(error.message || "Failed to update role");
    }
  };

  const toggleBan = async (id, banned) => {
    try {
      await request(`/admin/users/${id}/ban`, "PATCH", { banned });
      setUsers((currentUsers) =>
        currentUsers.map((user) =>
          user._id === id ? { ...user, isBanned: banned } : user
        )
      );
      toast.success(banned ? "User banned" : "User unbanned");
    } catch (error) {
      toast.error(error.message || "Failed to update user status");
    }
  };

  const handleConfirm = async () => {
    if (!confirmAction) return;

    const { id } = confirmAction;

    try {
      await request(`/admin/users/${id}`, "DELETE");
      setUsers((currentUsers) =>
        currentUsers.filter((user) => user._id !== id)
      );
      setConfirmAction(null);
      toast.success("User deleted");
    } catch (error) {
      toast.error(error.message || "Failed to delete user");
    }
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
                      src={getAssetUrl(user.profileImage)}
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
