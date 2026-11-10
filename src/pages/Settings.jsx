import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

function Settings() {
  return (
    <div className="app-layout">
      <Sidebar />

      <main className="main-area">
        <Topbar />

        <div className="dashboard-content">
          <div className="welcome-section">
            <div>
              <p className="eyebrow">ACCOUNT PREFERENCES</p>
              <h2>Settings</h2>
              <p>Manage your CampusCare account and preferences.</p>
            </div>
          </div>

          <div className="reports-panel">
            <h3>Profile Information</h3>
            <p>Manage your registered account details.</p>

            <div style={{ marginTop: "25px" }}>
              <p><strong>Name:</strong> {
                JSON.parse(localStorage.getItem("campuscare_user") || "{}").fullName
              }</p>

              <p style={{ marginTop: "15px" }}>
                <strong>Account Type:</strong> Faculty
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Settings;