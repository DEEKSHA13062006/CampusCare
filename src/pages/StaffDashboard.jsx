import { useNavigate } from "react-router-dom";

function StaffDashboard() {
  const navigate = useNavigate();

  const user = JSON.parse(
    localStorage.getItem("campuscare_user") || "{}"
  );

  const handleLogout = () => {
    localStorage.removeItem("campuscare_token");
    localStorage.removeItem("campuscare_user");
    navigate("/login");
  };

  return (
    <div style={{ padding: "40px" }}>
      <h1>CampusCare - Faculty Dashboard</h1>

      <h2>Welcome, {user.fullName || "Faculty"}!</h2>

      <p>Staff ID: {user.usn}</p>
      <p>Role: {user.role}</p>

      <p>
        Manage student maintenance reports and update their status here.
      </p>

      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default StaffDashboard;