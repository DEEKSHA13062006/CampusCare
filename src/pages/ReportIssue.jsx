
import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import {
  ArrowLeft,
  Send,
  QrCode,
  MapPin,
  Navigation,
  CheckCircle,
  ImagePlus,
  X,
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import "./ReportIssue.css";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8080";

function ReportIssue() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fileInputRef = useRef(null);

  const qrLocation = searchParams.get("location")?.trim() || "";

  const [form, setForm] = useState({
    title: "",
    category: "",
    location: qrLocation,
    priority: "MEDIUM",
    description: "",
  });

  const [loading, setLoading] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [error, setError] = useState("");
  const [gpsCoordinates, setGpsCoordinates] = useState(null);

  // Photo upload states
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  useEffect(() => {
    if (!imageFile) {
      setImagePreview("");
      return;
    }

    const previewUrl = URL.createObjectURL(imageFile);
    setImagePreview(previewUrl);

    return () => URL.revokeObjectURL(previewUrl);
  }, [imageFile]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // Handle photo selection
  const handleImageChange = (e) => {
    setError("");

    const file = e.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError("Only JPG, PNG and WEBP images are allowed.");
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must not exceed 5 MB.");
      e.target.value = "";
      return;
    }

    setImageFile(file);
  };

  const removeImage = () => {
    setImageFile(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Detect user's current GPS location
  const handleDetectLocation = () => {
    setError("");

    if (!navigator.geolocation) {
      setError("GPS is not supported by your browser.");
      return;
    }

    setDetectingLocation(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        setGpsCoordinates({
          latitude,
          longitude,
          accuracy: position.coords.accuracy,
        });

        setForm((previous) => ({
          ...previous,
          location: `GPS: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
        }));

        setDetectingLocation(false);
      },
      (err) => {
        let message = "Unable to detect your location. Please try again.";

        if (err.code === 1) {
          message = "Please allow location permission in your browser.";
        } else if (err.code === 2) {
          message = "Your current location is unavailable. Try again outdoors.";
        } else if (err.code === 3) {
          message = "Location request timed out. Please try again.";
        }

        setError(message);
        setDetectingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 0,
      }
    );
  };

  // Submit report and upload photo
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const token = localStorage.getItem("campuscare_token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setLoading(true);

      let uploadedImagePath = null;

      // First upload the image if selected
      if (imageFile) {
        const imageData = new FormData();
        imageData.append("file", imageFile);

        const uploadResponse = await fetch(
          `${API_URL}/api/uploads/image`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: imageData,
          }
        );

        if (!uploadResponse.ok) {
          const message = await uploadResponse.text();
          throw new Error(message || "Image upload failed.");
        }

        const uploadResult = await uploadResponse.json();
        uploadedImagePath = uploadResult.imagePath;
      }

      // Then submit the maintenance report
      const response = await fetch(`${API_URL}/api/reports`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...form,
          latitude: gpsCoordinates?.latitude ?? null,
          longitude: gpsCoordinates?.longitude ?? null,
          imagePath: uploadedImagePath,
        }),
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "Unable to submit your report.");
      }

      alert("Your maintenance report has been submitted successfully!");

      navigate("/reports");
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-layout">
      <Sidebar />

      <div className="main-area">
        <Topbar />

        <main className="dashboard-content report-page">

          <button
            className="report-back"
            onClick={() => navigate("/dashboard")}
          >
            <ArrowLeft size={18} />
            Back to Dashboard
          </button>

          <section className="welcome-section">
            <div>
              <p className="eyebrow">CAMPUS MAINTENANCE</p>
              <h2>Report an Issue</h2>
              <p>
                Tell us about the problem. Our maintenance team will take care
                of it.
              </p>
            </div>
          </section>

          <div className="report-form-card">

            <div className="report-form-heading">
              <h3>Issue Information</h3>
              <p>
                Provide the details below to submit your maintenance request.
              </p>
            </div>

            {qrLocation && (
              <div className="qr-location-notice">
                <QrCode size={19} />
                <span>
                  Location detected from campus QR code:{" "}
                  <strong>{qrLocation}</strong>
                </span>
              </div>
            )}

            {error && (
              <div className="report-error">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="report-form">

              <div className="report-field">
                <label htmlFor="title">Issue Title</label>

                <input
                  id="title"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="Example: Classroom fan not working"
                  required
                />
              </div>

              <div className="report-form-grid">

                <div className="report-field">
                  <label htmlFor="category">Category</label>

                  <select
                    id="category"
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select category</option>
                    <option value="ELECTRICAL">Electrical</option>
                    <option value="PLUMBING">Plumbing</option>
                    <option value="CLASSROOM">Classroom</option>
                    <option value="CLEANING">Cleaning</option>
                    <option value="INTERNET">Internet</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div className="report-field">
                  <label htmlFor="priority">Priority</label>

                  <select
                    id="priority"
                    name="priority"
                    value={form.priority}
                    onChange={handleChange}
                    required
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>

              </div>

              {/* GPS Location */}
              <div className="report-field">
                <label htmlFor="location">
                  <MapPin size={16} />
                  Location
                </label>

                <button
                  type="button"
                  className="gps-detect-button"
                  onClick={handleDetectLocation}
                  disabled={detectingLocation}
                >
                  <Navigation size={17} />

                  {detectingLocation
                    ? "Detecting location..."
                    : "Detect My Location"}
                </button>

                <input
                  id="location"
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="Enter location or detect using GPS"
                  required
                />

                {gpsCoordinates && (
                  <div className="gps-success">
                    <CheckCircle size={18} />

                    <div>
                      <strong>GPS location detected!</strong>

                      <p>
                        Latitude: {gpsCoordinates.latitude.toFixed(6)}
                      </p>

                      <p>
                        Longitude: {gpsCoordinates.longitude.toFixed(6)}
                      </p>

                      <p>
                        Accuracy: Approximately{" "}
                        {Math.round(gpsCoordinates.accuracy)} metres
                      </p>

                      <a
                        href={`https://www.openstreetmap.org/?mlat=${gpsCoordinates.latitude}&mlon=${gpsCoordinates.longitude}#map=18/${gpsCoordinates.latitude}/${gpsCoordinates.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View on Map
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* Photo Evidence Upload */}
              <div className="report-field">
                <label>
                  <ImagePlus size={17} />
                  Photo Evidence (Optional)
                </label>

                <p className="photo-upload-description">
                  Upload a photo showing the maintenance issue.
                  Maximum size: 5 MB.
                </p>

                <input
                  ref={fileInputRef}
                  type="file"
                  id="reportImage"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageChange}
                  className="photo-file-input"
                />

                {!imageFile && (
                  <label
                    htmlFor="reportImage"
                    className="photo-upload-button"
                  >
                    <ImagePlus size={22} />
                    <span>Choose a Photo</span>
                    <small>JPG, PNG or WEBP</small>
                  </label>
                )}

                {imageFile && imagePreview && (
                  <div className="photo-preview-card">
                    <img
                      src={imagePreview}
                      alt="Maintenance issue preview"
                    />

                    <div className="photo-preview-info">
                      <strong>{imageFile.name}</strong>
                      <span>
                        {(imageFile.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </div>

                    <button
                      type="button"
                      className="photo-remove-button"
                      onClick={removeImage}
                      aria-label="Remove selected photo"
                    >
                      <X size={18} />
                    </button>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="report-field">
                <label htmlFor="description">
                  Issue Description
                </label>

                <textarea
                  id="description"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Describe the issue in detail..."
                  rows="5"
                  maxLength="2000"
                  required
                />

                <span className="report-character-count">
                  {form.description.length}/2000 characters
                </span>
              </div>

              <div className="report-form-footer">
                <button
                  type="submit"
                  disabled={loading}
                  className="report-submit-button"
                >
                  <Send size={17} />

                  {loading
                    ? "Uploading & Submitting..."
                    : "Submit Report"}
                </button>
              </div>

            </form>
          </div>

        </main>
      </div>
    </div>
  );
}

export default ReportIssue;
