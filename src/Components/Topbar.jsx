
import { Bell, Search, ChevronDown } from "lucide-react";

function Topbar() {

  let user = {};

  try {
    user = JSON.parse(
      localStorage.getItem("campuscare_user") || "{}"
    );
  } catch {
    user = {};
  }

  const fullName = user.fullName || "User";

  const role = (user.role || "STUDENT").toUpperCase();

  const accountLabel =
    role === "FACULTY"
      ? "Faculty"
      : role === "ADMIN"
      ? "Admin"
      : "Student";

  const initial = fullName.charAt(0).toUpperCase();

  return (
    <header className="topbar">

      <div className="mobile-brand">
        CampusCare
      </div>

      <div className="topbar-search">
        <Search size={18} />

        <input
          type="text"
          placeholder="Search reports..."
        />
      </div>

      <div className="topbar-right">

        <button className="notification-btn">
          <Bell size={19} />
          <span className="notification-dot"></span>
        </button>

        <div className="profile">

          <div className="avatar">
            {initial}
          </div>

          <div className="profile-info">
            <strong>{fullName}</strong>
            <span>{accountLabel}</span>
          </div>

          <ChevronDown size={16} />

        </div>

      </div>

    </header>
  );
}

export default Topbar;
