import React, { useEffect, useState } from "react";
import { API_BASE_URL } from "../apiConfig";
import "./UserTable.css";

const EMPTY_NEW_USER = { username: "", email: "", password: "" };
const EMPTY_EDIT_FORM = { username: "", email: "", password: "" };

function UserTable({ currentUser, onLogout }) {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [feedback, setFeedback] = useState({ type: null, message: "" });

  const [isAddingUser, setIsAddingUser] = useState(false);
  const [newUser, setNewUser] = useState(EMPTY_NEW_USER);
  const [isSavingNewUser, setIsSavingNewUser] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(EMPTY_EDIT_FORM);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/users`, { credentials: "include" });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load users.");
      }

      setUsers(data.users);
    } catch (error) {
      setFeedback({ type: "error", message: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE_URL}/logout`, { method: "POST", credentials: "include" });
    } finally {
      onLogout();
    }
  };

  const handleAddUser = async (event) => {
    event.preventDefault();
    setIsSavingNewUser(true);
    setFeedback({ type: null, message: "" });

    try {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(newUser),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create user.");
      }

      setUsers((prev) => [...prev, data.user]);
      setNewUser(EMPTY_NEW_USER);
      setIsAddingUser(false);
      setFeedback({ type: "success", message: "User created successfully." });
    } catch (error) {
      setFeedback({ type: "error", message: error.message });
    } finally {
      setIsSavingNewUser(false);
    }
  };

  const startEditing = (user) => {
    setEditingId(user.id);
    setEditForm({ username: user.username, email: user.email, password: "" });
    setFeedback({ type: null, message: "" });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditForm(EMPTY_EDIT_FORM);
  };

  const handleSaveEdit = async (userId) => {
    setIsSavingEdit(true);
    setFeedback({ type: null, message: "" });

    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(editForm),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update user.");
      }

      setUsers((prev) => prev.map((user) => (user.id === userId ? data.user : user)));
      setFeedback({ type: "success", message: "User updated successfully." });
      cancelEditing();
    } catch (error) {
      setFeedback({ type: "error", message: error.message });
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("Delete this user? This cannot be undone.")) {
      return;
    }

    setFeedback({ type: null, message: "" });

    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete user.");
      }

      setUsers((prev) => prev.filter((user) => user.id !== userId));
      setFeedback({ type: "success", message: "User deleted successfully." });

      if (userId === currentUser.id) {
        onLogout();
      }
    } catch (error) {
      setFeedback({ type: "error", message: error.message });
    }
  };

  return (
    <div className="user-table-card">
      <div className="user-table-header">
        <div>
          <h2>Users</h2>
          <p className="user-table-subtitle">Signed in as {currentUser.username}</p>
        </div>
        <button type="button" className="secondary-btn" onClick={handleLogout}>
          Log out
        </button>
      </div>

      {feedback.message && (
        <p className={`user-table-feedback user-table-feedback--${feedback.type}`}>
          {feedback.message}
        </p>
      )}

      {isLoading ? (
        <p>Loading users...</p>
      ) : (
        <div className="user-table-scroll">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Email</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) =>
                editingId === user.id ? (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>
                      <input
                        value={editForm.username}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, username: e.target.value }))}
                      />
                    </td>
                    <td>
                      <input
                        value={editForm.email}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, email: e.target.value }))}
                      />
                    </td>
                    <td>{new Date(user.created_at).toLocaleDateString()}</td>
                    <td className="actions-cell">
                      <input
                        className="password-input"
                        type="password"
                        placeholder="New password (optional)"
                        value={editForm.password}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, password: e.target.value }))}
                      />
                      <button
                        type="button"
                        className="primary-btn"
                        onClick={() => handleSaveEdit(user.id)}
                        disabled={isSavingEdit}
                      >
                        Save
                      </button>
                      <button type="button" className="secondary-btn" onClick={cancelEditing}>
                        Cancel
                      </button>
                    </td>
                  </tr>
                ) : (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.username}</td>
                    <td>{user.email}</td>
                    <td>{new Date(user.created_at).toLocaleDateString()}</td>
                    <td className="actions-cell">
                      <button type="button" className="secondary-btn" onClick={() => startEditing(user)}>
                        Edit
                      </button>
                      <button type="button" className="danger-btn" onClick={() => handleDelete(user.id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                )
              )}
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="empty-row">
                    No users yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <div className="add-user-section">
        {isAddingUser ? (
          <form className="add-user-form" onSubmit={handleAddUser}>
            <input
              type="text"
              placeholder="Username"
              value={newUser.username}
              onChange={(e) => setNewUser((prev) => ({ ...prev, username: e.target.value }))}
              minLength={3}
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={newUser.email}
              onChange={(e) => setNewUser((prev) => ({ ...prev, email: e.target.value }))}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={newUser.password}
              onChange={(e) => setNewUser((prev) => ({ ...prev, password: e.target.value }))}
              minLength={8}
              required
            />
            <div className="add-user-form-actions">
              <button type="submit" className="primary-btn" disabled={isSavingNewUser}>
                {isSavingNewUser ? "Saving..." : "Save"}
              </button>
              <button
                type="button"
                className="secondary-btn"
                onClick={() => {
                  setIsAddingUser(false);
                  setNewUser(EMPTY_NEW_USER);
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <button type="button" className="primary-btn" onClick={() => setIsAddingUser(true)}>
            Add User
          </button>
        )}
      </div>
    </div>
  );
}

export default UserTable;
