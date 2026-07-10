import React, { useEffect, useState } from "react";
import AuthForm from "./components/AuthForm";
import UserTable from "./components/UserTable";
import { API_BASE_URL } from "./apiConfig";
import { fetchCsrfToken } from "./csrf";
import "./App.css";

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    fetchCsrfToken().then(() =>
      fetch(`${API_BASE_URL}/me`, { credentials: "include" })
        .then((response) => (response.ok ? response.json() : null))
        .then((data) => setCurrentUser(data ? data.user : null))
        .finally(() => setIsCheckingSession(false))
    );
  }, []);

  if (isCheckingSession) {
    return <div className="app-container" />;
  }

  return (
    <div className="app-container">
      {currentUser ? (
        <UserTable currentUser={currentUser} onLogout={() => setCurrentUser(null)} />
      ) : (
        <AuthForm onAuthenticated={setCurrentUser} />
      )}
    </div>
  );
}

export default App;
