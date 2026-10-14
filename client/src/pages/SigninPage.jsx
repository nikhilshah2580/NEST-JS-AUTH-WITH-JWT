import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import AuthForm from "../components/AuthForm";
import AuthPageFrame from "../components/AuthPageFrame";
import { useAuth } from "../auth/AuthContext";
import { useToast } from "../components/ToastProvider";

export default function SigninPage() {
  const { signin, status } = useAuth();
  const showToast = useToast();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      showToast("You are signed in.");
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
      <AuthForm
        mode="signin"
        onSubmit={handleSignin}
        serverError={error}
        isSubmitting={isSubmitting}
      />
    </AuthPageFrame>
  );
}
