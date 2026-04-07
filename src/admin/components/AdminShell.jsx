import { useContext, useState } from "react";
import {
  Boxes,
  LayoutDashboard,
  LogOut,
  ShoppingBag,
  Store,
  Users,
} from "lucide-react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Context } from "../../registrationpage/loginpages/LogincontextV2";

const navigationItems = [
  {
    to: "/admin",
    label: "Overview",
    icon: LayoutDashboard,
  },
  {
    to: "/admin/products",
    label: "Products",
    icon: Boxes,
  },
  {
    to: "/admin/orders",
    label: "Orders",
    icon: ShoppingBag,
  },
  {
    to: "/admin/users",
    label: "Users",
    icon: Users,
  },
];

export default function AdminShell({ title, description, actions, children }) {
  const navigate = useNavigate();
  const { user, logout } = useContext(Context) || {};
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await logout?.();
      navigate("/login", { replace: true });
    } catch (error) {
      toast.error(error.message || "Unable to logout");
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <Link to="/admin" className="admin-brand">
          <span className="admin-brand-mark">SS</span>
          <div>
            <strong>Sole Society</strong>
            <span>Admin Suite</span>
          </div>
        </Link>

        <div className="admin-user-card">
          <p className="admin-user-label">Signed in as</p>
          <strong>{user?.username || "Admin"}</strong>
          <span>{user?.email || "store-control@solesociety"}</span>
        </div>

        <nav className="admin-nav">
          {navigationItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/admin"}
                className={({ isActive }) =>
                  `admin-nav-link${isActive ? " admin-nav-link--active" : ""}`
                }
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="admin-sidebar-footer">
          <Link to="/" className="admin-secondary-link">
            <Store size={16} />
            <span>View Storefront</span>
          </Link>

          <button
            type="button"
            className="admin-logout-button"
            onClick={handleLogout}
            disabled={loggingOut}
          >
            <LogOut size={16} />
            <span>{loggingOut ? "Signing out..." : "Logout"}</span>
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-page-header">
          <div>
            <p className="admin-page-kicker">Operations Workspace</p>
            <h1>{title}</h1>
            <p>{description}</p>
          </div>

          {actions ? <div className="admin-page-actions">{actions}</div> : null}
        </header>

        {children}
      </main>
    </div>
  );
}
