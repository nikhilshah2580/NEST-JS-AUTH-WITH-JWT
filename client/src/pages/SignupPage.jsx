import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import AuthPageFrame from "../components/AuthPageFrame";
import AuthForm from "../components/AuthForm";
import { useAuth } from "../auth/AuthContext";
import { useToast } from "../components/ToastProvider";

export default function SignupPage() {
  const { signup, status } = useAuth();
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

  async function handleSignup(details) {
    setIsSubmitting(true);
    setError("");
    try {
      await signup(details);
      showToast("Account created. Sign in to continue.");
      navigate("/signin", { replace: true });
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthPageFrame
      eyebrow="A fresh start"
      title="Create your account"
      description="Set up your personal space. It only takes a minute."
      footer={
        <>
          Already have an account?{" "}
          <Link className="font-bold text-[#527657] hover:underline" to="/signin">
            Sign in
          </Link>
        </>
      }
    >
      <AuthForm
        mode="signup"
        onSubmit={handleSignup}
        serverError={error}
        isSubmitting={isSubmitting}
      />
    </AuthPageFrame>
  );
}
