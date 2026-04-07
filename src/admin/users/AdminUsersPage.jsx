import { useContext, useEffect, useMemo, useState } from "react";
import { Search, Shield, UserRound } from "lucide-react";
import { toast } from "react-toastify";
import AdminShell from "../components/AdminShell";
import { request } from "../../services/apiClient";
import { Context } from "../../registrationpage/loginpages/LogincontextV2";

const getInitials = (name) => String(name || "U").trim().charAt(0).toUpperCase();

export default function AdminUsersPage() {
  const { user: currentUser } = useContext(Context) || {};
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [confirmAction, setConfirmAction] = useState(null);
  const [busyUserId, setBusyUserId] = useState("");

  useEffect(() => {
    let active = true;

    const loadUsers = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await request("/admin/users?limit=100");
        if (!active) {
          return;
        }

        setUsers(Array.isArray(data?.users) ? data.users : []);
      } catch (loadError) {
        if (!active) {
          return;
        }

        setError(loadError.message || "Failed to load users");
        toast.error(loadError.message || "Failed to load users");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadUsers();

    return () => {
      active = false;
    };
  }, []);

  const filteredUsers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return users;
    }

    return users.filter((user) =>
      [user.username, user.email, user.role]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalizedQuery))
    );
  }, [users, query]);

  const metrics = useMemo(
    () => ({
      total: users.length,
      admins: users.filter((user) => user.role === "admin").length,
      banned: users.filter((user) => user.isBanned).length,
      active: users.filter((user) => !user.isBanned).length,
    }),
    [users]
  );

  const queueAction = (nextAction) => {
    setConfirmAction(nextAction);
  };

  const executeAction = async () => {
    if (!confirmAction) {
      return;
    }

    try {
      setBusyUserId(confirmAction.id);

      if (confirmAction.type === "role") {
        const response = await request(`/admin/users/${confirmAction.id}/role`, "PATCH", {
          role: confirmAction.value,
        });

        setUsers((currentUsers) =>
          currentUsers.map((user) =>
            user._id === confirmAction.id ? { ...user, role: response.role } : user
          )
        );
      }

      if (confirmAction.type === "ban") {
        const response = await request(`/admin/users/${confirmAction.id}/ban`, "PATCH", {
          banned: confirmAction.value,
        });

        setUsers((currentUsers) =>
          currentUsers.map((user) =>
            user._id === confirmAction.id ? { ...user, isBanned: response.isBanned } : user
          )
        );
      }

      if (confirmAction.type === "delete") {
        await request(`/admin/users/${confirmAction.id}`, "DELETE");
        setUsers((currentUsers) =>
          currentUsers.filter((user) => user._id !== confirmAction.id)
        );
      }

      toast.success(confirmAction.successMessage);
      setConfirmAction(null);
    } catch (error) {
      toast.error(error.message || "Unable to complete action");
    } finally {
      setBusyUserId("");
    }
  };

  return (
    <AdminShell
      title="Access control"
      description="Manage customer access, role elevation, and account safety without leaving the admin workspace."
    >
      <section className="admin-metric-grid">
        <article className="admin-metric-card">
          <div>
            <p>Total users</p>
            <strong>{metrics.total}</strong>
          </div>
        </article>
        <article className="admin-metric-card">
          <div>
            <p>Admins</p>
            <strong>{metrics.admins}</strong>
          </div>
        </article>
        <article className="admin-metric-card">
          <div>
            <p>Active</p>
            <strong>{metrics.active}</strong>
          </div>
        </article>
        <article className="admin-metric-card">
          <div>
            <p>Banned</p>
            <strong>{metrics.banned}</strong>
          </div>
        </article>
      </section>

      <section className="admin-section-card">
        <div className="admin-toolbar">
          <label className="admin-search">
            <Search size={16} />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search username, email, or role"
            />
          </label>
        </div>

        {loading ? (
          <div className="admin-loading-state">
            <div className="admin-loader" />
            <p>Loading users...</p>
          </div>
        ) : error ? (
          <div className="admin-empty-state">
            <h2>Unable to load users</h2>
            <p>{error}</p>
          </div>
        ) : filteredUsers.length ? (
          <div className="admin-user-grid">
            {filteredUsers.map((user) => {
              const isSelf = currentUser?._id === user._id;
              const nextRole = user.role === "admin" ? "customer" : "admin";

              return (
                <article key={user._id} className="admin-user-card">
                  <div className="admin-user-card-header">
                    <div className="admin-user-avatar">{getInitials(user.username)}</div>
                    <div>
                      <h2>{user.username}</h2>
                      <p>{user.email}</p>
                    </div>
                  </div>

                  <div className="admin-user-badges">
                    <span className={`status-pill status-pill--${user.role === "admin" ? "delivered" : "processing"}`}>
                      {user.role}
                    </span>
                    <span className={`status-pill status-pill--${user.isBanned ? "cancelled" : "pending"}`}>
                      {user.isBanned ? "Banned" : "Active"}
                    </span>
                  </div>

                  <div className="admin-user-details">
                    <div>
                      <span>Joined</span>
                      <strong>{new Date(user.createdAt).toLocaleDateString()}</strong>
                    </div>
                    <div>
                      <span>Account</span>
                      <strong>{isSelf ? "Current admin" : "Managed user"}</strong>
                    </div>
                  </div>

                  <div className="admin-user-actions">
                    <button
                      type="button"
                      className="admin-secondary-action"
                      disabled={isSelf}
                      onClick={() =>
                        queueAction({
                          id: user._id,
                          type: "role",
                          value: nextRole,
                          successMessage:
                            nextRole === "admin" ? "User promoted to admin" : "Admin role removed",
                          title:
                            nextRole === "admin" ? "Promote this user?" : "Remove admin access?",
                          description:
                            nextRole === "admin"
                              ? "This user will gain full administrative access."
                              : "This user will lose administrative access and return to customer permissions.",
                        })
                      }
                    >
                      {user.role === "admin" ? (
                        <>
                          <UserRound size={16} />
                          <span>Make customer</span>
                        </>
                      ) : (
                        <>
                          <Shield size={16} />
                          <span>Make admin</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      className={user.isBanned ? "admin-secondary-action" : "admin-danger-action"}
                      disabled={isSelf}
                      onClick={() =>
                        queueAction({
                          id: user._id,
                          type: "ban",
                          value: !user.isBanned,
                          successMessage: user.isBanned ? "User unbanned" : "User banned",
                          title: user.isBanned ? "Restore account access?" : "Ban this user?",
                          description: user.isBanned
                            ? "This account will regain access to the storefront."
                            : "The user will no longer be able to sign in or place orders.",
                        })
                      }
                    >
                      {user.isBanned ? "Unban" : "Ban"}
                    </button>

                    <button
                      type="button"
                      className="admin-danger-action"
                      disabled={isSelf}
                      onClick={() =>
                        queueAction({
                          id: user._id,
                          type: "delete",
                          successMessage: "User deleted",
                          title: "Delete this user?",
                          description:
                            "This permanently removes the account record. Use this only when account recovery is not needed.",
                        })
                      }
                    >
                      Delete
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="admin-empty-state">
            <h2>No matching users</h2>
            <p>Search with a broader email, role, or username query.</p>
          </div>
        )}
      </section>

      {confirmAction ? (
        <div className="admin-modal-backdrop">
          <div className="admin-modal">
            <h2>{confirmAction.title}</h2>
            <p>{confirmAction.description}</p>

            <div className="admin-modal-actions">
              <button
                type="button"
                className="admin-secondary-action"
                onClick={() => setConfirmAction(null)}
                disabled={Boolean(busyUserId)}
              >
                Cancel
              </button>
              <button
                type="button"
                className={confirmAction.type === "delete" || confirmAction.type === "ban" ? "admin-danger-action" : "admin-primary-action"}
                onClick={executeAction}
                disabled={busyUserId === confirmAction.id}
              >
                {busyUserId === confirmAction.id ? "Saving..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </AdminShell>
  );
}
