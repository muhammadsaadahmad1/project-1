import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, CheckCircle2, Mail, ShieldCheck, UserRound } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const frameStyle = {
  minHeight: "100vh",
  display: "grid",
  placeItems: "center",
  padding: "2rem 1rem",
  background: "radial-gradient(ellipse at 50% 0%, rgba(212, 175, 55, 0.1), transparent 55%), var(--bg-primary)"
};

const panelStyle = {
  width: "min(100%, 440px)",
  background: "rgba(17, 17, 20, 0.94)",
  border: "1px solid var(--border-gold)",
  borderRadius: "8px",
  padding: "2rem",
  boxShadow: "var(--shadow-deep)"
};

const errorStyle = {
  marginBottom: "1rem",
  padding: "0.7rem 0.85rem",
  color: "#fca5a5",
  background: "rgba(239, 68, 68, 0.12)",
  border: "1px solid rgba(239, 68, 68, 0.3)",
  borderRadius: "6px",
  fontSize: "0.84rem"
};

const successStyle = {
  marginBottom: "1rem",
  padding: "0.7rem 0.85rem",
  color: "#6ee7b7",
  background: "rgba(16, 185, 129, 0.1)",
  border: "1px solid rgba(16, 185, 129, 0.25)",
  borderRadius: "6px",
  fontSize: "0.84rem"
};

const AuthFrame = ({ eyebrow = "AURA PARFUMS", title, children, footer }) => (
  <main style={frameStyle}>
    <section style={panelStyle} className="animate-fade-in">
      <Link to="/" aria-label="AURA PARFUMS home" style={{ textDecoration: "none", color: "inherit" }}>
        <div style={{ color: "var(--gold-400)", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.16em", marginBottom: "0.45rem" }}>
          {eyebrow}
        </div>
      </Link>
      <h1 style={{ color: "#fff", fontSize: "2rem", marginBottom: "1.35rem" }}>{title}</h1>
      {children}
      {footer && <div style={{ marginTop: "1.35rem", paddingTop: "1rem", borderTop: "1px solid var(--border-subtle)" }}>{footer}</div>}
    </section>
  </main>
);

const AuthError = ({ children }) => children ? <div role="alert" style={errorStyle}>{children}</div> : null;

const destinationFrom = (location, fallback = "/") => {
  const destination = location.state?.from;
  return destination ? `${destination.pathname || "/"}${destination.search || ""}${destination.hash || ""}` : fallback;
};

export const SignInPage = () => {
  const { loginUser, currentUser, authLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const destination = destinationFrom(location);

  useEffect(() => {
    if (!authLoading && currentUser) navigate(destination, { replace: true });
  }, [authLoading, currentUser, destination, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    const result = await loginUser(identifier.trim(), password);
    setSubmitting(false);
    if (result.success) navigate(destination, { replace: true });
    else setError(result.message);
  };

  return (
    <AuthFrame title="Sign in" footer={(
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ color: "#a1a1aa", fontSize: "0.84rem" }}>New here? <Link to="/register" state={location.state} style={{ color: "var(--gold-400)" }}>Create an account</Link></span>
        <Link to="/admin-login" style={{ color: "#71717a", fontSize: "0.75rem", textDecoration: "none" }}>Admin</Link>
      </div>
    )}>
      <AuthError>{error}</AuthError>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="signin-identifier">Email or phone number</label>
          <input id="signin-identifier" className="form-input" autoComplete="username" required value={identifier} onChange={event => setIdentifier(event.target.value)} placeholder="Email or +1 555 000 0000" />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="signin-password">Password</label>
          <input id="signin-password" className="form-input" type="password" autoComplete="current-password" required value={password} onChange={event => setPassword(event.target.value)} />
        </div>
        <button className="btn-gold" type="submit" disabled={submitting || authLoading} style={{ width: "100%", marginTop: "0.5rem" }}>
          <span>{submitting ? "Signing in..." : "Sign In"}</span><ArrowRight size={16} />
        </button>
        <Link to="/register" state={location.state} className="btn-outline" style={{ width: "100%", marginTop: "0.75rem", textDecoration: "none" }}>
          <UserRound size={16} /> <span>Sign In / Register</span>
        </Link>
      </form>
    </AuthFrame>
  );
};

export const RegisterPage = () => {
  const { registerUser, currentUser, authLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const returnTo = destinationFrom(location);

  useEffect(() => {
    if (!authLoading && currentUser) navigate("/profile", { replace: true });
  }, [authLoading, currentUser, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!email.trim()) {
      setError("Enter your email address.");
      return;
    }
    setSubmitting(true);
    setError("");
    const result = await registerUser({ email: email.trim(), password });
    setSubmitting(false);
    if (!result.success) {
      setError(result.message);
      return;
    }
    const verification = {
      flow: "signup",
      stage: "primary",
      primaryType: "email",
      primaryContact: email.trim(),
      verificationType: "email",
      returnTo
    };
    sessionStorage.setItem("auth-verification", JSON.stringify(verification));
    navigate("/verify", { state: verification, replace: true });
  };

  return (
    <AuthFrame title="Create your account" footer={<span style={{ color: "#a1a1aa", fontSize: "0.84rem" }}>Already registered? <Link to="/signin" state={location.state} style={{ color: "var(--gold-400)" }}>Sign in</Link></span>}>
      <AuthError>{error}</AuthError>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="register-email">Email address</label>
          <input id="register-email" className="form-input" type="email" autoComplete="email" required value={email} onChange={event => setEmail(event.target.value)} placeholder="name@example.com" />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="register-password">Password</label>
          <input id="register-password" className="form-input" type="password" autoComplete="new-password" minLength={8} required value={password} onChange={event => setPassword(event.target.value)} />
        </div>
        <button className="btn-gold" type="submit" disabled={submitting} style={{ width: "100%", marginTop: "0.5rem" }}>
          <span>{submitting ? "Creating account..." : "Continue"}</span><ArrowRight size={16} />
        </button>
      </form>
    </AuthFrame>
  );
};

const readPendingVerification = (locationState) => {
  if (locationState?.primaryContact || locationState?.stage) return locationState;
  try {
    return JSON.parse(sessionStorage.getItem("auth-verification") || "null");
  } catch {
    return null;
  }
};

const maskContact = (type, value = "") => {
  if (type === "email") {
    const [name, domain] = value.split("@");
    return `${name?.slice(0, 1) || ""}***@${domain || ""}`;
  }
  return `${value.slice(0, 3)}••••${value.slice(-2)}`;
};

export const VerifyPage = () => {
  const { verifyAuthOtp, requestContactVerification, resendVerificationCode } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [pending, setPending] = useState(() => readPendingVerification(location.state));
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(30);
  const [attempts, setAttempts] = useState(() => Number(sessionStorage.getItem("auth-otp-attempts") || 0));

  useEffect(() => {
    if (!pending) navigate("/register", { replace: true });
  }, [pending, navigate]);

  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const timer = window.setInterval(() => setCooldown(value => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [cooldown]);

  if (!pending) return null;

  const contactType = pending.stage === "secondary" ? pending.secondaryType : pending.primaryType || pending.contactType;
  const contact = pending.stage === "secondary" ? pending.secondaryContact : pending.primaryContact || pending.contact;
  const otpType = pending.stage === "secondary" ? `${contactType}_change` : pending.verificationType;

  const finishVerification = () => {
    sessionStorage.removeItem("auth-verification");
    sessionStorage.removeItem("auth-otp-attempts");
    setSuccess("Your account is ready.");
    const destination = pending.flow === "signup" ? pending.returnTo || "/" : "/profile";
    window.setTimeout(() => navigate(destination, { replace: true }), 700);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (attempts >= 6) {
      setError("Request a new code to continue.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await verifyAuthOtp(contactType, contact, code, otpType);
      if (pending.flow === "signup" && pending.stage === "primary" && pending.secondaryType && pending.secondaryContact) {
        const nextPending = { ...pending, stage: "secondary" };
        setPending(nextPending);
        sessionStorage.setItem("auth-verification", JSON.stringify(nextPending));
        setCode("");
        setAttempts(0);
        sessionStorage.removeItem("auth-otp-attempts");
        try {
          await requestContactVerification(pending.secondaryType, pending.secondaryContact);
          setCooldown(30);
        } catch {
          setCooldown(0);
          setError("Unable to send a verification code. Please try again.");
        }
      } else {
        finishVerification();
      }
    } catch {
      const nextAttempts = attempts + 1;
      setAttempts(nextAttempts);
      sessionStorage.setItem("auth-otp-attempts", String(nextAttempts));
      setError(nextAttempts >= 6 ? "Request a new code to continue." : "That code did not work. Check it and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || resending) return;
    setResending(true);
    setError("");
    try {
      if (pending.stage === "secondary" || pending.flow === "contact") {
        await requestContactVerification(contactType, contact);
      } else {
        await resendVerificationCode(contactType, contact, false);
      }
      setCooldown(30);
      setAttempts(0);
      sessionStorage.removeItem("auth-otp-attempts");
    } catch {
      setError("Unable to send a new code right now. Please try again shortly.");
      setCooldown(30);
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthFrame eyebrow="ACCOUNT VERIFICATION" title="Verify your account" footer={<Link to="/signin" style={{ color: "#a1a1aa", fontSize: "0.84rem", textDecoration: "none" }}><ArrowLeft size={14} style={{ verticalAlign: "middle", marginRight: "0.35rem" }} />Back to sign in</Link>}>
      <p style={{ color: "#a1a1aa", fontSize: "0.88rem", marginBottom: "1.25rem" }}>
        Enter the 6-digit code sent to <strong style={{ color: "#e4e4e7" }}>{maskContact(contactType, contact)}</strong>.
      </p>
      <p style={{ color: "#71717a", fontSize: "0.78rem", marginTop: "-0.75rem", marginBottom: "1rem" }}>
        Check your spam folder if you don't see it. You can request another code after the timer.
      </p>
      <AuthError>{error}</AuthError>
      {success && <div role="status" style={successStyle}><CheckCircle2 size={15} style={{ verticalAlign: "middle", marginRight: "0.4rem" }} />{success}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="otp-code">Verification code</label>
          <input id="otp-code" className="form-input" type="text" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} required value={code} onChange={event => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="000000" style={{ textAlign: "center", letterSpacing: "0.4em", fontSize: "1.25rem" }} />
        </div>
        <button className="btn-gold" type="submit" disabled={submitting || success || attempts >= 6} style={{ width: "100%" }}>
          <span>{submitting ? "Checking code..." : "Verify"}</span><ArrowRight size={16} />
        </button>
      </form>
      <button type="button" onClick={handleResend} disabled={cooldown > 0 || resending || Boolean(success)} style={{ display: "block", margin: "1rem auto 0", border: 0, background: "none", color: cooldown > 0 ? "#71717a" : "var(--gold-400)", font: "inherit", fontSize: "0.82rem", cursor: cooldown > 0 || resending ? "default" : "pointer" }}>
        {resending ? "Sending..." : cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
      </button>
    </AuthFrame>
  );
};

export const AdminLoginPage = () => {
  const { loginAdmin, currentUser, authLoading } = useAuth();
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && currentUser?.role === "admin") navigate("/admin", { replace: true });
  }, [authLoading, currentUser, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    const result = await loginAdmin(identifier.trim(), password);
    setSubmitting(false);
    if (result.success) navigate("/admin", { replace: true });
    else setError("Invalid credentials or access denied.");
  };

  return (
    <AuthFrame eyebrow="AURA PARFUMS" title="Admin sign in" footer={<Link to="/signin" style={{ color: "#a1a1aa", fontSize: "0.84rem", textDecoration: "none" }}><ArrowLeft size={14} style={{ verticalAlign: "middle", marginRight: "0.35rem" }} />Return to sign in</Link>}>
      <AuthError>{error}</AuthError>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="admin-identifier">Email or phone number</label>
          <input id="admin-identifier" className="form-input" autoComplete="username" required value={identifier} onChange={event => setIdentifier(event.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="admin-password">Password</label>
          <input id="admin-password" className="form-input" type="password" autoComplete="current-password" required value={password} onChange={event => setPassword(event.target.value)} />
        </div>
        <button className="btn-gold" type="submit" disabled={submitting} style={{ width: "100%", marginTop: "0.5rem" }}>
          <ShieldCheck size={16} /><span>{submitting ? "Signing in..." : "Sign In"}</span>
        </button>
      </form>
    </AuthFrame>
  );
};

export const ProfilePage = () => {
  const { currentUser, updateUserProfile, logoutUser } = useAuth();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState(currentUser?.displayName || "");
  const [address, setAddress] = useState(currentUser?.address || "");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await updateUserProfile({ displayName, address });
      setSuccess("Profile saved.");
    } catch {
      setError("Unable to save your profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="container" style={{ maxWidth: "760px", paddingTop: "3rem", paddingBottom: "4rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Link to="/" style={{ color: "#a1a1aa", fontSize: "0.84rem", textDecoration: "none" }}><ArrowLeft size={14} style={{ verticalAlign: "middle", marginRight: "0.35rem" }} />Store</Link>
        <button type="button" className="btn-outline" onClick={() => void logoutUser().then(() => navigate("/signin", { replace: true }))} style={{ padding: "0.45rem 0.75rem", fontSize: "0.78rem" }}>Sign out</button>
      </div>
      <h1 style={{ color: "#fff", fontSize: "2.2rem", margin: "1rem 0 1.5rem" }}>Your profile</h1>
      <AuthError>{error}</AuthError>
      {success && <div role="status" style={successStyle}>{success}</div>}
      <section className="glass-panel" style={{ padding: "1.5rem", marginBottom: "1.25rem" }}>
        <h2 style={{ color: "#fff", fontSize: "1.25rem", marginBottom: "1rem" }}>Contact details</h2>
        <div style={{ display: "grid", gap: "0.9rem" }}>
          <div style={{ display: "flex", gap: "0.65rem", alignItems: "center", color: "#d4d4d8", overflowWrap: "anywhere" }}>
            <Mail size={17} color="var(--gold-400)" />
            <span>{currentUser?.email || "No email added"}</span>
          </div>
          <div style={{ display: "flex", gap: "0.65rem", alignItems: "center", color: "#d4d4d8", overflowWrap: "anywhere" }}>
            <UserRound size={17} color="var(--gold-400)" />
            <span>{currentUser?.phone || "No phone number added"}</span>
          </div>
        </div>
      </section>
      <section className="glass-panel" style={{ padding: "1.5rem" }}>
        <h2 style={{ color: "#fff", fontSize: "1.25rem", marginBottom: "1rem" }}>Profile details</h2>
        <form onSubmit={handleSave}>
          <div className="form-group"><label className="form-label" htmlFor="profile-name">Name</label><input id="profile-name" className="form-input" value={displayName} onChange={event => setDisplayName(event.target.value)} /></div>
          <div className="form-group"><label className="form-label" htmlFor="profile-address">Delivery address</label><textarea id="profile-address" className="form-textarea" rows="3" value={address} onChange={event => setAddress(event.target.value)} /></div>
          <button className="btn-gold" disabled={saving}>{saving ? "Saving..." : "Save profile"}</button>
        </form>
      </section>
    </main>
  );
};