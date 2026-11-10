import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import {
  LayoutDashboard,
  ClipboardList,
  Clock,
  CheckCircle,
  AlertCircle,
  Search,
  RefreshCw,
  LogOut,
  ShieldCheck,
  MapPin,
  User,
  ChevronDown,
  BarChart3,
  TrendingUp,
} from "lucide-react";

import "./AdminDashboard.css";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8080";

// Photo evidence component
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
      } catch (error) {
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
      <p className="admin-image-error">
        Unable to load attached photo.
      </p>
    );
  }

  return (
    <div className="admin-evidence-section">
      <strong>Attached Photo Evidence</strong>

      {imageUrl ? (
        <a
          href={imageUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="admin-evidence-link"
        >
          <img
            src={imageUrl}
            alt="Maintenance issue evidence"
            className="admin-evidence-image"
          />
          <span>Click to view full image</span>
        </a>
      ) : (
        <p>Loading photo...</p>
      )}
    </div>
  );
}

// Analytics chart component
function AnalyticsChart({ title, subtitle, data, type = "bar" }) {
  const maxCount = Math.max(
    1,
    ...data.map((item) => Number(item.count) || 0)
  );

  return (
    <div className="admin-analytics-card">
      <div className="admin-analytics-card-heading">
        <div>
          <h3>{title}</h3>
          <p>{subtitle}</p>
        </div>

        <BarChart3 size={21} />
      </div>

      {data.length === 0 ? (
        <div className="admin-analytics-empty">
          No data available yet.
        </div>
      ) : (
        <div className="admin-chart-list">
          {data.map((item, index) => {
            const percentage =
              (Number(item.count) / maxCount) * 100;

            const label =
              type === "month"
                ? new Date(
                    `${item.label}-01T00:00:00`
                  ).toLocaleDateString("en-IN", {
                    month: "short",
                    year: "numeric",
                  })
                : String(item.label).replace("_", " ");

            return (
              <div
                className="admin-chart-item"
                key={`${item.label}-${index}`}
              >
                <div className="admin-chart-label">
                  <span>{label}</span>
                  <strong>{item.count}</strong>
                </div>

                <div className="admin-chart-track">
                  <div
                    className="admin-chart-bar"
                    style={{
                      width: `${percentage}%`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function AdminDashboard() {
  const navigate = useNavigate();

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [analyticsError, setAnalyticsError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [updatingId, setUpdatingId] = useState(null);

  const admin = JSON.parse(
    localStorage.getItem("campuscare_user") || "{}"
  );

  const token = localStorage.getItem("campuscare_token");

  // Fetch all reports
  const fetchReports = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/admin/reports`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          response.status === 403
            ? "You are not authorized to access the Admin Dashboard."
            : "Unable to fetch reports."
        );
      }

      const data = await response.json();
      setReports(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch analytics from PostgreSQL through backend API
  const fetchAnalytics = async () => {
    try {
      setAnalyticsLoading(true);
      setAnalyticsError("");

      const response = await fetch(
        `${API_URL}/api/admin/reports/analytics`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          "Unable to load analytics data."
        );
      }

      const data = await response.json();
      setAnalytics(data);
    } catch (err) {
      setAnalyticsError(err.message);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  // Refresh both sections
  const refreshDashboard = () => {
    fetchReports();
    fetchAnalytics();
  };

  useEffect(() => {
    if (!token || admin.role !== "ADMIN") {
      navigate("/login", { replace: true });
      return;
    }

    refreshDashboard();
  }, []);

  // Update report status
  const updateStatus = async (reportId, newStatus) => {
    try {
      setUpdatingId(reportId);

      const response = await fetch(
        `${API_URL}/api/admin/reports/${reportId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: newStatus,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Unable to update report status.");
      }

      const updatedReport = await response.json();

      setReports((previousReports) =>
        previousReports.map((report) =>
          report.id === reportId ? updatedReport : report
        )
      );

      // Update analytics after status change
      fetchAnalytics();
    } catch (err) {
      alert(err.message);
    } finally {
      setUpdatingId(null);
    }
  };
const exportToExcel = () => {
  if (filteredReports.length === 0) {
    alert("No reports available to export.");
    return;
  }

  const excelData = filteredReports.map((report, index) => ({
    "Sl. No.": index + 1,
    "Report ID": report.id,
    "Title": report.title,
    "Description": report.description,
    "Category": report.category,
    "Location": report.location,
    "Priority": report.priority,
    "Status": report.status?.replace("_", " "),
    "Submitted By": report.submittedBy || "Unknown",
    "USN / Staff ID": report.submitterUsn || "N/A",
    "Role": report.submitterRole || "Unknown",
    "Latitude": report.latitude ?? "N/A",
    "Longitude": report.longitude ?? "N/A",
    "Submitted Date": report.createdAt
      ? new Date(report.createdAt).toLocaleString()
      : "Unavailable",
  }));

  const worksheet = XLSX.utils.json_to_sheet(excelData);

  worksheet["!cols"] = [
    { wch: 8 },
    { wch: 12 },
    { wch: 25 },
    { wch: 40 },
    { wch: 18 },
    { wch: 22 },
    { wch: 12 },
    { wch: 16 },
    { wch: 22 },
    { wch: 18 },
    { wch: 14 },
    { wch: 14 },
    { wch: 14 },
    { wch: 22 },
  ];

  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    "Maintenance Reports"
  );

  XLSX.writeFile(
    workbook,
    `CampusCare_Reports_${new Date().toISOString().slice(0, 10)}.xlsx`
  );
};
const exportToPDF = () => {
  if (filteredReports.length === 0) {
    alert("No reports available to export.");
    return;
  }

  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  const pending = filteredReports.filter(
    (r) => r.status === "PENDING"
  ).length;

  const inProgress = filteredReports.filter(
    (r) => r.status === "IN_PROGRESS"
  ).length;

  const resolved = filteredReports.filter(
    (r) => r.status === "RESOLVED"
  ).length;

  // Document heading
  doc.setFillColor(29, 53, 87);
  doc.rect(0, 0, pageWidth, 35, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("CampusCare", 14, 15);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(
    "COLLEGE MAINTENANCE & REPORT TRACKING SYSTEM",
    14,
    23
  );

  doc.setFontSize(10);
  doc.text("ADMIN REPORT", pageWidth - 14, 15, {
    align: "right",
  });

  // Report information
  doc.setTextColor(40, 50, 65);
  doc.setFontSize(15);
  doc.setFont("helvetica", "bold");
  doc.text("Maintenance Report Summary", 14, 46);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");

  doc.text(
    `Generated: ${new Date().toLocaleString("en-IN")}`,
    14,
    53
  );

  doc.text(
    `Total Reports: ${filteredReports.length}`,
    14,
    61
  );

  // Summary statistics
  const summaryY = 69;
  const boxWidth = 82;
  const gap = 10;

  const summaryCards = [
    { label: "PENDING", count: pending },
    { label: "IN PROGRESS", count: inProgress },
    { label: "RESOLVED", count: resolved },
  ];

  summaryCards.forEach((card, index) => {
    const x = 14 + index * (boxWidth + gap);

    doc.setFillColor(243, 247, 252);
    doc.roundedRect(
      x,
      summaryY,
      boxWidth,
      19,
      3,
      3,
      "F"
    );

    doc.setTextColor(90, 105, 125);
    doc.setFontSize(8);
    doc.text(card.label, x + 5, summaryY + 7);

    doc.setTextColor(29, 53, 87);
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text(String(card.count), x + 5, summaryY + 14);
    doc.setFont("helvetica", "normal");
  });

  // Table data
  const tableRows = filteredReports.map((report) => [
    report.id,
    report.title || "-",
    report.category || "-",
    report.location || "-",
    report.priority || "-",
    (report.status || "-").replace("_", " "),
    report.submittedBy || "Unknown",
    report.submitterRole || "-",
    report.createdAt
      ? new Date(report.createdAt).toLocaleDateString("en-IN")
      : "-",
  ]);

  // Generate table
  autoTable(doc, {
    startY: 98,

    head: [[
      "ID",
      "Title",
      "Category",
      "Location",
      "Priority",
      "Status",
      "Submitted By",
      "Role",
      "Date",
    ]],

    body: tableRows,

    theme: "grid",

    styles: {
      font: "helvetica",
      fontSize: 8,
      cellPadding: 3,
      overflow: "linebreak",
      textColor: [55, 65, 81],
      lineColor: [225, 230, 238],
      lineWidth: 0.1,
    },

    headStyles: {
      fillColor: [29, 53, 87],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },

    alternateRowStyles: {
      fillColor: [246, 249, 253],
    },

    margin: {
      left: 14,
      right: 14,
      bottom: 18,
    },

    didDrawPage: () => {
      const pageHeight = doc.internal.pageSize.getHeight();

      doc.setFontSize(8);
      doc.setTextColor(130, 140, 155);

      doc.text(
        "CampusCare | College Maintenance Management",
        14,
        pageHeight - 8
      );

      doc.text(
        `Page ${doc.internal.getNumberOfPages()}`,
        pageWidth - 14,
        pageHeight - 8,
        { align: "right" }
      );
    },
  });

  doc.save(
    `CampusCare_Report_${new Date().toISOString().slice(0, 10)}.pdf`
  );
};
  // Logout
  const handleLogout = () => {
    localStorage.removeItem("campuscare_token");
    localStorage.removeItem("campuscare_user");

    navigate("/login", { replace: true });
  };

  // Report filters
  const filteredReports = reports.filter((report) => {
    const matchesStatus =
      statusFilter === "ALL" ||
      report.status === statusFilter;

    const matchesPriority =
      priorityFilter === "ALL" ||
      report.priority === priorityFilter;

    const searchText = search.toLowerCase();

    const matchesSearch =
      (report.title || "").toLowerCase().includes(searchText) ||
      (report.location || "").toLowerCase().includes(searchText) ||
      (report.submittedBy || "").toLowerCase().includes(searchText) ||
      (report.submitterUsn || "").toLowerCase().includes(searchText);

    return matchesStatus && matchesPriority && matchesSearch;
  });

  const pendingCount = reports.filter(
    (r) => r.status === "PENDING"
  ).length;

  const progressCount = reports.filter(
    (r) => r.status === "IN_PROGRESS"
  ).length;

  const resolvedCount = reports.filter(
    (r) => r.status === "RESOLVED"
  ).length;

  const resolutionRate =
    reports.length > 0
      ? Math.round((resolvedCount / reports.length) * 100)
      : 0;

  const getStatusClass = (status) => {
    return (status || "pending").toLowerCase().replace("_", "-");
  };

  return (
    <div className="admin-layout">

      {/* SIDEBAR */}
      <aside className="admin-sidebar">

        <div className="admin-brand">
          <div className="admin-brand-icon">
            <ShieldCheck size={25} />
          </div>

          <div>
            <h2>CampusCare</h2>
            <span>ADMINISTRATION</span>
          </div>
        </div>

        <div className="admin-nav-heading">
          MANAGEMENT
        </div>

        <div className="admin-nav-item active">
          <LayoutDashboard size={19} />
          <span>Dashboard</span>
        </div>

        <button
          type="button"
          className="admin-nav-item"
          onClick={() =>
            document.getElementById("admin-reports")?.scrollIntoView({
              behavior: "smooth",
            })
          }
        >
          <ClipboardList size={19} />
          <span>All Reports</span>
        </button>

        <div className="admin-sidebar-bottom">
          <div className="admin-profile">
            <div className="admin-avatar">
              <ShieldCheck size={20} />
            </div>

            <div>
              <strong>{admin.fullName || "Administrator"}</strong>
              <span>Administrator</span>
            </div>
          </div>

          <button
            className="admin-logout"
            onClick={handleLogout}
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>

      </aside>

      {/* MAIN CONTENT */}
      <main className="admin-main">

        <header className="admin-topbar">
          <div>
            <span className="admin-topbar-label">
              CAMPUSCARE MANAGEMENT
            </span>

            <h2>Admin Dashboard</h2>
          </div>

          <div className="admin-topbar-user">
            <div className="admin-topbar-avatar">
              <ShieldCheck size={20} />
            </div>

            <div>
              <strong>{admin.fullName || "Admin"}</strong>
              <span>Administrator</span>
            </div>
          </div>
        </header>

        <div className="admin-content">

          {/* WELCOME SECTION */}
          <section className="admin-welcome">
            <div>
              <span>OVERVIEW</span>

              <h1>
                Welcome, {admin.fullName || "Admin"}!
              </h1>

              <p>
                Monitor campus maintenance requests and manage
                reported issues from one place.
              </p>
            </div>

            <button
              className="admin-refresh-button"
              onClick={refreshDashboard}
              disabled={loading || analyticsLoading}
            >
              <RefreshCw size={17} />
              Refresh
            </button>
          </section>

          {/* SUMMARY CARDS */}
          <section className="admin-stats-grid">

            <div className="admin-stat-card">
              <div className="admin-stat-icon total">
                <ClipboardList size={23} />
              </div>

              <span>Total Reports</span>
              <h2>{reports.length}</h2>
              <p>All submitted issues</p>
            </div>

            <div className="admin-stat-card">
              <div className="admin-stat-icon pending">
                <Clock size={23} />
              </div>

              <span>Pending</span>
              <h2>{pendingCount}</h2>
              <p>Awaiting attention</p>
            </div>

            <div className="admin-stat-card">
              <div className="admin-stat-icon progress">
                <AlertCircle size={23} />
              </div>

              <span>In Progress</span>
              <h2>{progressCount}</h2>
              <p>Currently being handled</p>
            </div>

            <div className="admin-stat-card">
              <div className="admin-stat-icon resolved">
                <CheckCircle size={23} />
              </div>

              <span>Resolved</span>
              <h2>{resolvedCount}</h2>
              <p>Successfully completed</p>
            </div>

          </section>

          {/* ANALYTICS SECTION */}
          <section className="admin-analytics-section">

            <div className="admin-section-heading">
              <div>
                <span>DATA INSIGHTS</span>
                <h2>Maintenance Analytics</h2>

                <p>
                  Understand campus maintenance trends and performance.
                </p>
              </div>

              <div className="admin-analytics-heading-icon">
                <TrendingUp size={23} />
              </div>
            </div>

            {analyticsLoading ? (
              <div className="admin-analytics-loading">
                <RefreshCw className="admin-loading-icon" />
                Loading analytics...
              </div>
            ) : analyticsError ? (
              <div className="admin-analytics-error">
                <AlertCircle size={20} />
                <span>{analyticsError}</span>

                <button onClick={fetchAnalytics}>
                  Retry
                </button>
              </div>
            ) : analytics ? (

              <>
                {/* ANALYTICS OVERVIEW */}
                <div className="admin-analytics-overview">

                  <div className="admin-analytics-highlight">
                    <span>Total Recorded Reports</span>

                    <h2>
                      {analytics.totalReports ?? reports.length}
                    </h2>

                    <p>Across all campus categories</p>
                  </div>

                  <div className="admin-analytics-highlight">
                    <span>Resolution Rate</span>

                    <h2>{resolutionRate}%</h2>

                    <div className="admin-resolution-track">
                      <div
                        style={{
                          width: `${resolutionRate}%`,
                        }}
                      />
                    </div>

                    <p>Reports successfully resolved</p>
                  </div>

                </div>

                {/* CHARTS */}
                <div className="admin-analytics-grid">

                  <AnalyticsChart
                    title="Category Distribution"
                    subtitle="Reports by maintenance category"
                    data={analytics.categoryStats || []}
                  />

                  <AnalyticsChart
                    title="Status Overview"
                    subtitle="Current report status breakdown"
                    data={analytics.statusStats || []}
                  />

                  <AnalyticsChart
                    title="Priority Analysis"
                    subtitle="Reports grouped by priority"
                    data={analytics.priorityStats || []}
                  />

                  <AnalyticsChart
                    title="Monthly Submissions"
                    subtitle="Maintenance reports submitted each month"
                    data={analytics.monthlyStats || []}
                    type="month"
                  />

                </div>
              </>

            ) : null}

          </section>

          {/* ALL REPORTS */}
          <section
            className="admin-reports-section"
            id="admin-reports"
          >

            <div className="admin-section-heading">
              <div>
                <span>MAINTENANCE MANAGEMENT</span>

                <h2>All Maintenance Reports</h2>

                <p>
                  Review submissions and update their progress.
                </p>
              </div>

              <span className="admin-report-count">
                {filteredReports.length} Reports
              </span>
            </div>

            {/* FILTERS */}
            <div className="admin-filters">

              <div className="admin-search">
                <Search size={18} />

                <input
                  type="text"
                  placeholder="Search title, location or submitter..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
              </select>

              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
              >
                <option value="ALL">All Priorities</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
<button
  type="button"
  className="admin-export-button"
  onClick={exportToExcel}
>
  <ClipboardList size={17} />
  Export Excel
</button>
<button
  type="button"
  className="admin-pdf-button"
  onClick={exportToPDF}
>
  <ClipboardList size={17} />
  Export PDF
</button>
            </div>

            {/* REPORT LIST */}
            {loading ? (
              <div className="admin-empty-state">
                <RefreshCw className="admin-loading-icon" />
                <p>Loading maintenance reports...</p>
              </div>
            ) : error ? (
              <div className="admin-empty-state admin-error">
                <AlertCircle size={30} />
                <p>{error}</p>

                <button onClick={fetchReports}>
                  Try Again
                </button>
              </div>
            ) : filteredReports.length === 0 ? (
              <div className="admin-empty-state">
                <ClipboardList size={35} />

                <h3>No reports found</h3>

                <p>
                  No reports match your current filters.
                </p>
              </div>
            ) : (

              <div className="admin-report-list">

                {filteredReports.map((report) => (

                  <article
                    className="admin-report-card"
                    key={report.id}
                  >

                    <div className="admin-report-header">

                      <div>
                        <span className="admin-report-category">
                          {report.category}
                        </span>

                        <h3>{report.title}</h3>
                      </div>

                      <span
                        className={`admin-priority ${(
                          report.priority || "LOW"
                        ).toLowerCase()}`}
                      >
                        {report.priority}
                      </span>

                    </div>

                    <p className="admin-report-description">
                      {report.description}
                    </p>

                    {report.imagePath && (
                      <ReportEvidenceImage
                        fileName={report.imagePath}
                        token={token}
                      />
                    )}

                    <div className="admin-report-details">

                      <div className="admin-location-details">
                        <span>
                          <MapPin size={15} />
                          {report.location}
                        </span>

                        {report.latitude != null &&
                          report.longitude != null && (
                            <a
                              className="admin-map-button"
                              href={`https://www.openstreetmap.org/?mlat=${report.latitude}&mlon=${report.longitude}#map=18/${report.latitude}/${report.longitude}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <MapPin size={15} />
                              View on Map
                            </a>
                          )}
                      </div>

                      <span>
                        <User size={15} />
                        {report.submittedBy || "Unknown"}
                      </span>

                      <span>
                        {report.submitterUsn || "No ID"}
                      </span>

                      <span className="admin-role-label">
                        {report.submitterRole || "Unknown"}
                      </span>

                    </div>

                    <div className="admin-report-footer">

                      <span
                        className={`admin-status ${getStatusClass(
                          report.status
                        )}`}
                      >
                        {report.status?.replace("_", " ")}
                      </span>

                      <div className="admin-status-control">

                        <label>Update Status</label>

                        <div className="admin-status-select">
                          <select
                            value={report.status}
                            disabled={updatingId === report.id}
                            onChange={(e) =>
                              updateStatus(
                                report.id,
                                e.target.value
                              )
                            }
                          >
                            <option value="PENDING">
                              Pending
                            </option>

                            <option value="IN_PROGRESS">
                              In Progress
                            </option>

                            <option value="RESOLVED">
                              Resolved
                            </option>
                          </select>

                          <ChevronDown size={15} />
                        </div>

                      </div>

                    </div>

                    <div className="admin-report-date">
                      Submitted:{" "}
                      {report.createdAt
                        ? new Date(report.createdAt).toLocaleString()
                        : "Date unavailable"}
                    </div>

                  </article>

                ))}

              </div>

            )}

          </section>

        </div>

      </main>

    </div>
  );
}

export default AdminDashboard;
