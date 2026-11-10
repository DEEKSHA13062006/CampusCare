
import {
  LayoutDashboard,
  FilePlus2,
  ClipboardList,
  Settings,
  HelpCircle,
  LogOut,
  Building2,
} from "lucide-react";

import { NavLink, useNavigate } from "react-router-dom";

function Sidebar() {
  const navigate = useNavigate();

  const menuItems = [
    {
      name: "Dashboard",
      icon: LayoutDashboard,
      path: "/dashboard",
    },
    {
      name: "Report an Issue",
      icon: FilePlus2,
      path: "/report",
    },
    {
      name: "My Reports",
      icon: ClipboardList,
      path: "/reports",
    },
  ];

  return (
    <aside className="sidebar">
      {/* CampusCare Logo */}
      <div className="sidebar-logo">
        <div className="logo-icon">
          <Building2 size={21} />
        </div>

        <div>
          <h1>CampusCare</h1>
          <span>Smart Campus</span>
        </div>
      </div>

      {/* Main Menu */}
      <div className="sidebar-section">
        <p className="sidebar-label">MENU</p>

        <nav>
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? "active" : ""}`
                }
              >
                <Icon size={19} />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom Menu */}
      <div className="sidebar-bottom">
        <NavLink
          to="/help"
          className={({ isActive }) =>
            `sidebar-link ${isActive ? "active" : ""}`
          }
        >
          <HelpCircle size={19} />
          <span>Help & Support</span>
        </NavLink>

        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `sidebar-link ${isActive ? "active" : ""}`
          }
        >
          <Settings size={19} />
          <span>Settings</span>
        </NavLink>

        <button
          type="button"
          className="sidebar-link logout-link"
          onClick={() => navigate("/login")}
        >
          <LogOut size={19} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
