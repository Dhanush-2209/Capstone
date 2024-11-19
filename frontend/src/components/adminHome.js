import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // Import axios for making API requests
import "./adminHome.css";
import UploadComponent from "./UploadComponent";
import AddMedicineManually from "./AddMedicineForm";

const AdminHome = () => {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  const userName = localStorage.getItem("userName");
  const adminToken = localStorage.getItem("adminToken") || ""; // Ensure adminToken is not undefined or null

  const [medicinesData, setMedicinesData] = useState([]);
  const [savedMedicines, setSavedMedicines] = useState([]);
  const [usersData, setUsersData] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newUser, setNewUser] = useState({ username: "", email: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [editingUser, setEditingUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const backendUrl = "http://localhost:5000"; // Update base URL to the correct backend port
  

  useEffect(() => {
    // Fetch users on load
    const fetchUsers = async () => {
      try {
        console.log('Admin token used for request:', adminToken);
        const response = await axios.get(`${backendUrl}/api/admin/users`, {

          headers: {
            Authorization: `Bearer ${adminToken}`, // Pass token in header
            
          },
          
        });
        setUsersData(response.data); // Set users data
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();

    const interval = setInterval(() => setCurrentDateTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, [adminToken]);

  useEffect(() => {
    // Fetch medicines when a user is selected
    if (selectedUser) {
      const fetchMedicines = async () => {
        try {
          const response = await axios.get(`${backendUrl}/api/admin/user/${selectedUser.userId}/medicines`, {
            headers: {
              Authorization: `Bearer ${adminToken}`, // Pass token in header
            },
          });
          setMedicinesData(response.data); // Set medicines data for the selected user
        } catch (error) {
          console.error("Error fetching medicines:", error);
        }
      };

      fetchMedicines();
    }
  }, [selectedUser, adminToken]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (editingUser) {
      // Update user logic (you can implement a PUT request to update user data)
      setUsersData((prevUsers) =>
        prevUsers.map((user) =>
          user.userId === editingUser.userId ? { ...editingUser, ...newUser } : user
        )
      );
      setEditingUser(null);
    } else {
      try {
        const response = await axios.post(
          "/api/admin/users",
          newUser,
          {
            headers: {
              Authorization: `Bearer ${adminToken}`,
            },
          }
        );
        setUsersData((prev) => [...prev, response.data]);
      } catch (error) {
        console.error("Error adding user:", error);
      }
    }
    setNewUser({ username: "", email: "" });
    setShowForm(false);
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setNewUser({ username: user.username, email: user.email });
    setShowForm(true);
  };

  const handleDeleteUser = async (userId) => {
    try {
      await axios.delete(`${backendUrl}/api/admin/user/${userId}`, {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });
      setUsersData((prev) => prev.filter((user) => user.userId !== userId));
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const handleUserClick = (user) => {
    setSelectedUser(user);
  };

  const handleAddMedicine = async (medicine) => {
    try {
      const response = await axios.post(
        `${backendUrl}/api/admin/user/${selectedUser.userId}/medicines`,
        medicine,
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        }
      );
      setMedicinesData((prev) => [...prev, response.data]);
    } catch (error) {
      console.error("Error adding medicine:", error);
    }
  };

  const filteredUsers = usersData.filter((user) =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-left">
          <div className="date-time">
            <div className="date">{currentDateTime.toLocaleDateString()}</div>
            <div className="time">{currentDateTime.toLocaleTimeString()}</div>
          </div>
        </div>
        <div className="header-right">
          <div className="user-info">
            <span className="user-name-label">Username: {userName}</span>
            <span className="user-id-label">User ID: {userId}</span>
            <button onClick={handleLogout} className="logout-button">
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="medicines-table-container">
        <h2>Medicines for the Session</h2>
        <table className="medicines-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Medicine Name</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {medicinesData.map((medicine, index) => (
              <tr key={index}>
                <td>{medicine.username}</td>
                <td>{medicine.medicineName}</td>
                <td>{medicine.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="add-user-container">
        <h2>{editingUser ? "Edit User" : "Add New User"}</h2>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingUser(null);
          }}
          className="add-user-button"
        >
          {showForm ? "Hide Form" : "Add User"}
        </button>
        {showForm && (
          <form className="add-user-form" onSubmit={handleFormSubmit}>
            <input
              type="text"
              placeholder="Username"
              name="username"
              value={newUser.username}
              onChange={handleInputChange}
              required
            />
            <input
              type="email"
              placeholder="Email"
              name="email"
              value={newUser.email}
              onChange={handleInputChange}
              required
            />
            <button type="submit" className="submit-button">
              {editingUser ? "Update" : "Submit"}
            </button>
          </form>
        )}
      </div>

      <div className="user-list-container">
        <h2>List of Users</h2>
        <input
          type="text"
          className="search-bar"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="user-list">
          {filteredUsers.map((user) => (
            <div
              key={user.userId}
              className="user-item"
              onClick={() => handleUserClick(user)}
            >
              <span>ID: {user.userId}</span>
              <span>{user.username}</span>
              <button
                className="edit-button"
                onClick={() => handleEditUser(user)}
              >
                Edit
              </button>
              <button
                className="delete-button"
                onClick={() => handleDeleteUser(user.userId)}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>

      {selectedUser && (
        <div className="selected-user-section">
          <h2>Details for {selectedUser.username}</h2>
          <div className="dashboard-content">
            <div className="upload-box">
              <h3>Search any image with PillPerfect</h3>
              <UploadComponent />
            </div>
            <div className="add-medicine-box">
              <h3>Add Medicine Manually</h3>
              <AddMedicineManually onAddMedicine={handleAddMedicine} />
            </div>
          </div>

          <div className="medicine-session">
            <h3>Medicines for Session</h3>
            <ul>
              {medicinesData.map((med, index) => (
                <li key={index}>{med.medicineName}</li>
              ))}
            </ul>
          </div>

          <div className="saved-medicines">
            <h3>Saved Medicines</h3>
            <table>
              <thead>
                <tr>
                  <th>Medicine Name</th>
                  <th>Session</th>
                  <th>Added Date</th>
                </tr>
              </thead>
              <tbody>
                {savedMedicines.map((med, index) => (
                  <tr key={index}>
                    <td>{med.name}</td>
                    <td>{med.session}</td>
                    <td>{med.addedAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminHome;
