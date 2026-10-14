import { useEffect, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import AuthForm from "../components/AuthForm";
import AuthPageFrame from "../components/AuthPageFrame";
import { useAuth } from "../auth/AuthContext";

export default function SigninPage() {
  const { signin, status } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [flashNotice] = useState(location.state?.notice);

  useEffect(() => {
    if (location.state?.notice) {
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.pathname, location.state, navigate]);

  if (status === "loading") {
    return (
      <p className="py-16 text-center text-sm text-[#737a70]">
        Checking your session…
      </p>
    );
  }
  if (status === "authenticated") return <Navigate to="/profile" replace />;

  async function handleSignin(credentials) {
    setIsSubmitting(true);
    setError("");
    try {
      await signin(credentials);
      navigate("/profile", { replace: true });
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthPageFrame
      eyebrow="Welcome back"
      title="Sign in"
      description="Enter your details and pick up where you left off."
      footer={
        <>
          New around here?{" "}
          <Link className="font-bold text-[#527657] hover:underline" to="/signup">
            Create an account
          </Link>
        </>
      }
    >
      {flashNotice && (
        <p
          className="mt-5 rounded-lg bg-[#e8eee3] px-3 py-2 text-xs text-[#405242]"
          role="status"
        >
          {flashNotice}
        </p>
      )}
      <AuthForm
        mode="signin"
        onSubmit={handleSignin}
        serverError={error}
        isSubmitting={isSubmitting}
      />
    </AuthPageFrame>
  );
}
