import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  Building2,
  GraduationCap,
  Users,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowRight,
  LockKeyhole,
} from "lucide-react";

import "./Login.css";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8080";

function Login() {
  const [accountType, setAccountType] = useState("student");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleAccountTypeChange = (type) => {
    setAccountType(type);
    setIdentifier("");
    setPassword("");
    setError("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!identifier.trim() || !password) {
      setError("Please enter your ID and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          usn: identifier.trim().toUpperCase(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Invalid ID or password.");
      }

      if (!data.token) {
        throw new Error("Authentication token was not received.");
      }

      const role = (data.role || "").toUpperCase();

      const expectedRole = {
        student: "STUDENT",
        faculty: "FACULTY",
        admin: "ADMIN",
      }[accountType];

      if (role !== expectedRole) {
        throw new Error(
          `This account is not registered as ${accountType}.`
        );
      }

      localStorage.setItem("campuscare_token", data.token);

      localStorage.setItem(
        "campuscare_user",
        JSON.stringify({
          id: data.id,
          fullName: data.fullName,
          email: data.email,
          usn: data.usn,
          role,
        })
      );

      if (role === "ADMIN") {
        navigate("/admin/dashboard", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    } catch (err) {
      setError(
        err.message || "Unable to connect to CampusCare server."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cc-login-page">
      <section className="cc-login-brand-panel">
        <div className="cc-brand-header">
          <div className="cc-brand-icon">
            <Building2 size={25} />
          </div>

          <div>
            <h1>CampusCare</h1>
            <p>SMART CAMPUS MANAGEMENT</p>
          </div>
        </div>

        <div className="cc-brand-content">
          <span className="cc-brand-eyebrow">
            <ShieldCheck size={16} />
            EXCLUSIVE COLLEGE PORTAL
          </span>

          <h2>
            Your campus.
            <br />
            Your community.
            <br />
            <span>Your care.</span>
          </h2>

          <p className="cc-brand-description">
            A smarter way to report campus issues, track maintenance
            requests, and help build a better college environment.
          </p>

          <div className="cc-brand-features">
            <div className="cc-feature-item">
              <div className="cc-feature-icon">
                <GraduationCap size={21} />
              </div>

              <div>
                <h3>Built for students</h3>
                <p>Report issues and follow their progress.</p>
              </div>
            </div>

            <div className="cc-feature-item">
              <div className="cc-feature-icon">
                <Users size={21} />
              </div>

              <div>
                <h3>Designed for faculty</h3>
                <p>Report and track campus maintenance requests.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="cc-brand-footer">
          <ShieldCheck size={17} />
          <span>Designed for the college community</span>
        </div>
      </section>

      <section className="cc-login-form-panel">
        <div className="cc-login-mobile-brand">
          <div className="cc-brand-icon">
            <Building2 size={23} />
          </div>

          <span>CampusCare</span>
        </div>

        <div className="cc-login-form-container">
          <div className="cc-login-heading">
            <span className="cc-welcome-label">
              WELCOME BACK
            </span>

            <h2>Sign in to CampusCare</h2>

            <p>
              Access your college maintenance portal using your
              registered identification.
            </p>
          </div>

          <div
            className="cc-account-selector"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "8px",
            }}
          >
            <button
              type="button"
              className={`cc-account-option ${
                accountType === "student" ? "selected" : ""
              }`}
              onClick={() => handleAccountTypeChange("student")}
              disabled={loading}
            >
              <GraduationCap size={19} />
              <span>Student</span>
            </button>

            <button
              type="button"
              className={`cc-account-option ${
                accountType === "faculty" ? "selected" : ""
              }`}
              onClick={() => handleAccountTypeChange("faculty")}
              disabled={loading}
            >
              <Users size={19} />
              <span>Faculty</span>
            </button>

            <button
              type="button"
              className={`cc-account-option ${
                accountType === "admin" ? "selected" : ""
              }`}
              onClick={() => handleAccountTypeChange("admin")}
              disabled={loading}
            >
              <ShieldCheck size={19} />
              <span>Admin</span>
            </button>
          </div>

          <form className="cc-login-form" onSubmit={handleLogin}>
            <div className="cc-login-field">
              <label htmlFor="college-identifier">
                {accountType === "student"
                  ? "Student USN"
                  : accountType === "faculty"
                  ? "Faculty Staff ID"
                  : "Administrator ID"}
              </label>

              <input
                id="college-identifier"
                type="text"
                placeholder={
                  accountType === "student"
                    ? "Enter your college USN"
                    : accountType === "faculty"
                    ? "Enter your registered Staff ID"
                    : "Enter your Admin ID"
                }
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                autoComplete="username"
                required
              />

              <span className="cc-field-hint">
                {accountType === "student"
                  ? "Use your university seat number."
                  : accountType === "faculty"
                  ? "Use your registered Staff ID."
                  : "Use your administrator login ID."}
              </span>
            </div>

            <div className="cc-login-field">
              <div className="cc-password-label-row">
                <label htmlFor="college-password">
                  Password
                </label>
              </div>

              <div className="cc-password-wrapper">
                <LockKeyhole
                  size={18}
                  className="cc-password-icon"
                />

                <input
                  id="college-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />

                <button
                  type="button"
                  className="cc-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <p
                role="alert"
                style={{
                  color: "#dc2626",
                  fontSize: "14px",
                }}
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              className="cc-signin-button"
              disabled={loading}
            >
              <span>
                {loading ? "Signing in..." : "Sign In"}
              </span>

              {!loading && <ArrowRight size={19} />}
            </button>
          </form>

          <div className="cc-login-security-note">
            <ShieldCheck size={19} />

            <p>
              <strong>
                {accountType === "admin"
                  ? "Authorized administrators only"
                  : "College members only"}
              </strong>

              <span>
                {accountType === "admin"
                  ? "Restricted access to CampusCare administration."
                  : "Access is intended for students and faculty."}
              </span>
            </p>
          </div>

          {accountType !== "admin" && (
            <>
              <div className="cc-login-divider">
                <span>NEW TO CAMPUSCARE?</span>
              </div>

              <p className="cc-register-prompt">
                Need an account?{" "}
                <Link to="/register">
                  Create an account
                </Link>
              </p>
            </>
          )}

          <p className="cc-login-terms">
            CampusCare · College Maintenance &amp; Report Tracking
          </p>
        </div>
      </section>
    </div>
  );
}

export default Login;