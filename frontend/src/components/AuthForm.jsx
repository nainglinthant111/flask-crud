import React, { useState } from "react";
import { API_BASE_URL } from "../apiConfig";
import "./AuthForm.css";

const INITIAL_FORM_STATE = {
  username: "",
  email: "",
  password: "",
};

function AuthForm({ onAuthenticated }) {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: null, message: "" });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleMode = () => {
    setIsLoginMode((prev) => !prev);
    setFeedback({ type: null, message: "" });
    setFormData(INITIAL_FORM_STATE);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setFeedback({ type: null, message: "" });

    const endpoint = isLoginMode ? "/login" : "/register";
    const payload = isLoginMode
      ? { username: formData.username, password: formData.password }
      : formData;

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong. Please try again.");
      }

      setFormData(INITIAL_FORM_STATE);

      if (isLoginMode) {
        onAuthenticated(data.user);
        return;
      }

      setFeedback({ type: "success", message: `${data.message} You can now log in.` });
      setIsLoginMode(true);
    } catch (error) {
      setFeedback({ type: "error", message: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-card">
      <h2>{isLoginMode ? "Log In" : "Create Account"}</h2>

      <form onSubmit={handleSubmit} noValidate>
        <div className="form-field">
          <label htmlFor="username">Username</label>
          <input
            id="username"
            name="username"
            type="text"
            value={formData.username}
            onChange={handleChange}
            autoComplete="username"
            minLength={3}
            required
          />
        </div>

        {!isLoginMode && (
          <div className="form-field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
              required
            />
          </div>
        )}

        <div className="form-field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            autoComplete={isLoginMode ? "current-password" : "new-password"}
            minLength={8}
            required
          />
        </div>

        {feedback.message && (
          <p className={`auth-feedback auth-feedback--${feedback.type}`}>{feedback.message}</p>
        )}

        <button type="submit" className="auth-submit" disabled={isSubmitting}>
          {isSubmitting ? "Please wait..." : isLoginMode ? "Log In" : "Register"}
        </button>
      </form>

      <p className="auth-toggle">
        {isLoginMode ? "Don't have an account?" : "Already have an account?"}{" "}
        <button type="button" className="auth-toggle-btn" onClick={toggleMode}>
          {isLoginMode ? "Register" : "Log In"}
        </button>
      </p>
    </div>
  );
}

export default AuthForm;
