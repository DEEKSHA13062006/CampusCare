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
  UserRound,
  Mail,
  IdCard,
} from "lucide-react";

import "./Login.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

function Register() {
  const [accountType, setAccountType] = useState("student");
  const [fullName, setFullName] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const isStudent = accountType === "student";

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Your password must contain at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please try again.");
      return;
    }

    try {
      setLoading(true);

      const endpoint = isStudent
        ? "/api/auth/register"
        : "/api/auth/register-faculty";

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: fullName.trim(),
          usn: identifier.trim().toUpperCase(),
          email: email.trim().toLowerCase(),
          password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            "Registration failed. Please check your details."
        );
      }

            alert(
        data.message ||
          "Registration successful! Please check your email and click the verification link before logging in."
      );

      navigate("/login");
    } catch (err) {
      setError(
        err.message || "Unable to connect to CampusCare server."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cc-auth-page">
      <section className="cc-brand-panel">
        <div className="cc-brand">
          <div className="cc-brand-icon">
            <Building2 size={25} />
          </div>

          <div>
            <h1>CampusCare</h1>
            <p>SMART CAMPUS MANAGEMENT</p>
          </div>
        </div>

        <div className="cc-brand-content">
          <span className="cc-eyebrow">
            <span className="cc-status-dot" />
            EXCLUSIVE TO COLLEGE MEMBERS
          </span>

          <h2>
            Your campus.
            <br />
            Your voice.
            <br />
            <span>Better together.</span>
          </h2>

          <p>
            Join your campus community and help make college
            facilities safer, cleaner, and better maintained.
          </p>

          <div className="cc-feature-list">
            <div className="cc-feature">
              <div className="cc-feature-icon">
                <ShieldCheck size={19} />
              </div>

              <div>
                <strong>Verified college access</strong>
                <span>Designed for authorized students and staff.</span>
              </div>
            </div>

            <div className="cc-feature">
              <div className="cc-feature-icon">
                <IdCard size={19} />
              </div>

              <div>
                <strong>One campus identity</strong>
                <span>Register using your USN or Staff ID.</span>
              </div>
            </div>

            <div className="cc-feature">
              <div className="cc-feature-icon">
                <Users size={19} />
              </div>

              <div>
                <strong>A better campus experience</strong>
                <span>Report issues and follow their progress.</span>
              </div>
            </div>
          </div>
        </div>

        <div className="cc-brand-footer">
          <span>CampusCare</span>
          <span>MADE FOR CAMPUS COMMUNITIES</span>
        </div>
      </section>

      <main className="cc-form-panel cc-register-panel">
        <div className="cc-mobile-brand">
          <div className="cc-brand-icon">
            <Building2 size={22} />
          </div>
          <span>CampusCare</span>
        </div>

        <div className="cc-form-container">
          <div className="cc-form-heading">
            <span className="cc-form-kicker">GET STARTED</span>
            <h2>Create your account</h2>
            <p>Register with your official college identity.</p>
          </div>

          <form className="cc-auth-form" onSubmit={handleRegister}>
            <div className="cc-field">
              <label>Account type</label>

              <div className="cc-account-options">
                <button
                  type="button"
                  className={`cc-account-option ${
                    isStudent ? "active" : ""
                  }`}
                  onClick={() => {
                    setAccountType("student");
                    setIdentifier("");
                    setError("");
                  }}
                  aria-pressed={isStudent}
                >
                  <GraduationCap size={19} />
                  <span>Student</span>
                </button>

                <button
                  type="button"
                  className={`cc-account-option ${
                    !isStudent ? "active" : ""
                  }`}
                  onClick={() => {
                    setAccountType("faculty");
                    setIdentifier("");
                    setError("");
                  }}
                  aria-pressed={!isStudent}
                >
                  <Users size={19} />
                  <span>Faculty</span>
                </button>
              </div>
            </div>

            <div className="cc-field">
              <label htmlFor="fullName">Full name</label>
              <div className="cc-input-wrap">
                <UserRound size={18} />
                <input
                  id="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  autoComplete="name"
                  required
                />
              </div>
            </div>

            <div className="cc-field">
              <label htmlFor="identifier">
                {isStudent ? "University Seat Number (USN)" : "Staff ID"}
              </label>

              <div className="cc-input-wrap">
                <IdCard size={18} />
                <input
                  id="identifier"
                  type="text"
                  placeholder={
                    isStudent
                      ? "Enter your college USN"
                      : "Enter your official Staff ID"
                  }
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  autoComplete="off"
                  required
                />
              </div>

              <span className="cc-field-hint">
                {isStudent
                  ? "Use the university seat number assigned by your college."
                  : "Your Staff ID and registered college email must be authorized."}
              </span>
            </div>

            <div className="cc-field">
              <label htmlFor="email">Registered email</label>
              <div className="cc-input-wrap">
                <Mail size={18} />
                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>

              <span className="cc-field-hint">
                This email will be used for password recovery.
              </span>
            </div>

            <div className="cc-field">
              <label htmlFor="password">Create password</label>
              <div className="cc-input-wrap">
                <LockKeyhole size={18} />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  minLength={8}
                  required
                />

                <button
                  type="button"
                  className="cc-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            <div className="cc-field">
              <label htmlFor="confirmPassword">Confirm password</label>
              <div className="cc-input-wrap">
                <LockKeyhole size={18} />
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                />

                <button
                  type="button"
                  className="cc-password-toggle"
                  onClick={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                  aria-label={
                    showConfirmPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="cc-form-error" role="alert">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="cc-primary-btn"
              disabled={loading}
            >
              <span>
                {loading ? "Creating account..." : "Create account"}
              </span>
              {!loading && <ArrowRight size={18} />}
            </button>

            <div className="cc-security-note">
              <ShieldCheck size={16} />
              <span>
                Your password is securely encrypted by the backend.
              </span>
            </div>
          </form>

          <p className="cc-auth-switch">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>

          <p className="cc-legal-note">
            CampusCare · College Maintenance &amp; Report Tracking
          </p>
        </div>
      </main>
    </div>
  );
}

export default Register;