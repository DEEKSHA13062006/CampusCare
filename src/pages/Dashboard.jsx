
import { useEffect, useState } from "react";
import {
  FileText,
  Clock3,
  Wrench,
  CheckCircle2,
  Plus,
  ArrowRight,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import StatCard from "../components/StatCard";
import ReportCard from "../components/ReportCard";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

function Dashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
  });

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [user] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem("campuscare_user") || "{}"
      );
    } catch {
      return {};
    }
  });

  const role = (user.role || "STUDENT").toUpperCase();

  const accountLabel =
    role === "FACULTY" ? "FACULTY" : "STUDENT";

  useEffect(() => {
    const fetchDashboard = async () => {
      const token = localStorage.getItem("campuscare_token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const [statsResponse, reportsResponse] = await Promise.all([
          fetch(`${API_URL}/api/reports/dashboard`, { headers }),
          fetch(`${API_URL}/api/reports/my`, { headers }),
        ]);

        if (!statsResponse.ok || !reportsResponse.ok) {
          throw new Error("Unable to load dashboard information.");
        }

        const statsData = await statsResponse.json();
        const reportsData = await reportsResponse.json();

        setStats(statsData);
        setReports(reportsData.slice(0, 4));

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [navigate]);

  const formatDate = (date) =>
    date
      ? new Date(date).toLocaleString("en-IN", {
          day: "numeric",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "Date unavailable";

  const formatStatus = (status) =>
    status === "IN_PROGRESS" ? "In Progress" : status;

  return (
    <div className="app-layout">
      <Sidebar />

      <div className="main-area">
        <Topbar />

        <main className="dashboard-content">

          <section className="welcome-section">
            <div>
              <p className="eyebrow">
                {accountLabel} DASHBOARD
              </p>

              <h2>
                Welcome, {user.fullName || accountLabel}.
              </h2>

              <p>
                Here's an overview of your campus maintenance reports.
              </p>
            </div>

            <button
              className="primary-button"
              onClick={() => navigate("/report")}
            >
              <Plus size={18} />
              Report an Issue
            </button>
          </section>

          {error && (
            <p style={{ color: "#dc2626", marginBottom: "20px" }}>
              {error}
            </p>
          )}

          <section className="stats-grid">

            <StatCard
              title="Total Reports"
              value={loading ? "..." : String(stats.total)}
              description="Your submitted reports"
              icon={<FileText size={20} />}
            />

            <StatCard
              title="Pending"
              value={loading ? "..." : String(stats.pending)}
              description="Waiting for attention"
              icon={<Clock3 size={20} />}
            />

            <StatCard
              title="In Progress"
              value={loading ? "..." : String(stats.inProgress)}
              description="Currently being resolved"
              icon={<Wrench size={20} />}
            />

            <StatCard
              title="Resolved"
              value={loading ? "..." : String(stats.resolved)}
              description="Successfully completed"
              icon={<CheckCircle2 size={20} />}
            />

          </section>

          <section className="dashboard-grid">

            <div className="reports-panel">

              <div className="panel-header">
                <div>
                  <h3>Recent Reports</h3>
                  <p>Your latest maintenance requests</p>
                </div>

                <button
                  className="view-all"
                  onClick={() => navigate("/reports")}
                >
                  View all
                  <ArrowRight size={15} />
                </button>
              </div>

              <div className="reports-list">

                {loading && <p>Loading reports...</p>}

                {!loading && !error && reports.length === 0 && (
                  <p>You haven't submitted any reports yet.</p>
                )}

                {!loading &&
                  reports.map((report) => (
                    <ReportCard
                      key={report.id}
                      title={report.title}
                      location={report.location}
                      date={formatDate(report.createdAt)}
                      status={formatStatus(report.status)}
                      priority={report.priority}
                    />
                  ))}

              </div>
            </div>

            <div className="quick-panel">

              <div className="quick-header">
                <h3>Need something fixed?</h3>
                <p>
                  Report a campus issue and let the right team handle it.
                </p>
              </div>

              <div className="quick-illustration">
                <div className="illustration-circle">
                  <Wrench size={35} />
                </div>
              </div>

              <button
                className="quick-button"
                onClick={() => navigate("/report")}
              >
                Create a report
                <ArrowRight size={17} />
              </button>

            </div>

          </section>

        </main>
      </div>
    </div>
  );
}

export default Dashboard;
