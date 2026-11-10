import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle, XCircle, LoaderCircle } from "lucide-react";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8080";

function VerifyEmail() {
  const [searchParams] = useSearchParams();

  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("Verifying your email address...");

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setStatus("error");
      setMessage("Verification token is missing.");
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await fetch(
          `${API_URL}/api/auth/verify-email?token=${encodeURIComponent(token)}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Email verification failed."
          );
        }

        setStatus("success");
        setMessage(
          data.message || "Your email has been verified successfully!"
        );
      } catch (error) {
        setStatus("error");
        setMessage(
          error.message || "Something went wrong. Please try again."
        );
      }
    };

    verifyEmail();
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-lg">

        {status === "loading" && (
          <>
            <LoaderCircle
              size={60}
              className="mx-auto mb-5 animate-spin text-blue-600"
            />
            <h2 className="text-2xl font-bold text-slate-800">
              Verifying Email
            </h2>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle
              size={65}
              className="mx-auto mb-5 text-green-500"
            />
            <h2 className="text-2xl font-bold text-slate-800">
              Email Verified!
            </h2>
          </>
        )}

        {status === "error" && (
          <>
            <XCircle
              size={65}
              className="mx-auto mb-5 text-red-500"
            />
            <h2 className="text-2xl font-bold text-slate-800">
              Verification Failed
            </h2>
          </>
        )}

        <p className="mt-4 text-slate-600">
          {message}
        </p>

        {status !== "loading" && (
          <Link
            to="/login"
            className="mt-7 inline-block rounded-lg bg-blue-600 px-7 py-3 font-semibold text-white transition hover:bg-blue-700"
          >
            Go to Login
          </Link>
        )}

      </div>
    </div>
  );
}

export default VerifyEmail;