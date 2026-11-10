
import { useEffect, useState } from "react";
import {
  FileText,
  Clock3,
  CheckCircle2,
  Wrench,
  AlertCircle,
  MapPin,
  CalendarDays,
  Hash,
  Plus,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import "./MyReports.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

function ReportEvidenceImage({ fileName, token }) {
  const [imageUrl, setImageUrl] = useState("");
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    let objectUrl;

    const loadImage = async () => {
      try {
        const response = await fetch(
          `${API_URL}/api/uploads/image/${encodeURIComponent(fileName)}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Unable to load image");
        }

        const blob = await response.blob();
        objectUrl = URL.createObjectURL(blob);
        setImageUrl(objectUrl);
      } catch {
        setImageError(true);
      }
    };

    loadImage();

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [fileName, token]);

  if (imageError) {
    return (
      <p className="my-report-image-error">
        Unable to load attached photo.
      </p>
    );
  }

  return (
    <div className="my-report-evidence">
      <strong>My Attached Photo</strong>

      {imageUrl ? (
        <a
          href={imageUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="my-report-evidence-link"
        >
          <img
            src={imageUrl}
            alt="Maintenance issue evidence"
            className="my-report-evidence-image"
          />
          <span>Click to view full image</span>
        </a>
      ) : (
        <p>Loading photo...</p>
      )}
    </div>
  );
}

function MyReports() {
  const navigate = useNavigate();

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("campuscare_token");

  useEffect(() => {
    const fetchReports = async () => {
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const response = await fetch(`${API_URL}/api/reports/my`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Unable to load your reports.");
        }

        const data = await response.json();
        setReports(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [navigate, token]);

  const getStatusIcon = (status) => {
    switch (status?.toUpperCase()) {
      case "RESOLVED":
        return <CheckCircle2 size={16} />;
      case "IN_PROGRESS":
        return <Wrench size={16} />;
      default:
        return <Clock3 size={16} />;
    }
  };

  const getStatusClass = (status) => {
    switch (status?.toUpperCase()) {
      case "RESOLVED":
        return "report-status-resolved";
      case "IN_PROGRESS":
        return "report-status-progress";
      default:
        return "report-status-pending";
    }
  };

  const formatStatus = (status) =>
    status?.replaceAll("_", " ") || "PENDING";

  const formatDate = (date) =>
    date
      ? new Date(date).toLocaleString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "Date unavailable";

  const pendingCount = reports.filter(
    (r) => r.status?.toUpperCase() === "PENDING"
  ).length;

  const progressCount = reports.filter(
    (r) => r.status?.toUpperCase() === "IN_PROGRESS"
  ).length;

  const resolvedCount = reports.filter(
    (r) => r.status?.toUpperCase() === "RESOLVED"
  ).length;

  return (
    <div className="app-layout">
      <Sidebar />

      <div className="main-area">
        <Topbar />

        <main className="dashboard-content my-reports-page">
          <section className="welcome-section">
            <div>
              <p className="eyebrow">MAINTENANCE TRACKING</p>
              <h2>My Reports</h2>
              <p>
                Keep track of your submitted campus maintenance requests.
              </p>
            </div>

            <button
              className="primary-button"
              onClick={() => navigate("/report")}
            >
              <Plus size={17} />
              New Report
            </button>
          </section>

          <div className="stats-grid my-report-stats">
            <div className="stat-card">
              <div className="my-report-stat-top">
                <span>Total Reports</span>
                <div className="my-report-stat-icon blue">
                  <FileText size={19} />
                </div>
              </div>
              <h3>{reports.length}</h3>
              <p>All submitted requests</p>
            </div>

            <div className="stat-card">
              <div className="my-report-stat-top">
                <span>Pending</span>
                <div className="my-report-stat-icon orange">
                  <Clock3 size={19} />
                </div>
              </div>
              <h3>{pendingCount}</h3>
              <p>Awaiting attention</p>
            </div>

            <div className="stat-card">
              <div className="my-report-stat-top">
                <span>In Progress</span>
                <div className="my-report-stat-icon purple">
                  <Wrench size={19} />
                </div>
              </div>
              <h3>{progressCount}</h3>
              <p>Currently being handled</p>
            </div>

            <div className="stat-card">
              <div className="my-report-stat-top">
                <span>Resolved</span>
                <div className="my-report-stat-icon green">
                  <CheckCircle2 size={19} />
                </div>
              </div>
              <h3>{resolvedCount}</h3>
              <p>Successfully completed</p>
            </div>
          </div>

          <section className="my-reports-panel">
            <div className="my-reports-header">
              <div>
                <h3>Submitted Reports</h3>
                <p>
                  View the latest updates on your maintenance requests.
                </p>
              </div>

              <span className="report-count">
                {reports.length} Reports
              </span>
            </div>

            {loading && (
              <div className="reports-message">
                <div className="reports-loader"></div>
                <p>Loading your reports...</p>
              </div>
            )}

            {error && (
              <div className="reports-error">
                <AlertCircle size={19} />
                {error}
              </div>
            )}

            {!loading && !error && reports.length === 0 && (
              <div className="reports-empty">
                <div className="empty-icon">
                  <FileText size={35} />
                </div>

                <h3>No reports yet</h3>
                <p>
                  You haven't submitted any maintenance issues.
                  Create your first report to get started.
                </p>

                <button
                  className="primary-button"
                  onClick={() => navigate("/report")}
                >
                  <Plus size={17} />
                  Report an Issue
                </button>
              </div>
            )}

            {!loading &&
              !error &&
              reports.map((report) => (
                <article className="my-report-card" key={report.id}>
                  <div className="my-report-card-header">
                    <div className="my-report-title">
                      <div className="my-report-file-icon">
                        <FileText size={20} />
                      </div>

                      <div>
                        <h3>{report.title}</h3>
                        <p>{report.category}</p>
                      </div>
                    </div>

                    <span
                      className={`report-status ${getStatusClass(
                        report.status
                      )}`}
                    >
                      {getStatusIcon(report.status)}
                      {formatStatus(report.status)}
                    </span>
                  </div>

                  <p className="my-report-description">
                    {report.description}
                  </p>

                  {report.imagePath && (
                    <ReportEvidenceImage
                      fileName={report.imagePath}
                      token={token}
                    />
                  )}

                  <div className="my-report-details">
                    <span>
                      <MapPin size={15} />
                      {report.location}
                    </span>

                    <span>
                      <CalendarDays size={15} />
                      {formatDate(report.createdAt)}
                    </span>

                    <span>
                      <Hash size={15} />
                      #{report.id}
                    </span>
                  </div>

                  <div className="my-report-card-footer">
                    <span className="priority-label">
                      Priority:
                      <strong
                        className={`priority-text priority-${report.priority?.toLowerCase()}`}
                      >
                        {report.priority}
                      </strong>
                    </span>

                    <span className="report-updated-label">
                      Report #{report.id}
                    </span>
                  </div>
                </article>
              ))}
          </section>
        </main>
      </div>
    </div>
  );
}

export default MyReports;
