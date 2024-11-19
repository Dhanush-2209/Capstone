import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import UploadComponent from './UploadComponent'; // Import the UploadComponent
import AddMedicineForm from './AddMedicineForm';
import AlarmComponent from './AlarmComponent'; // Import the AlarmComponent
import './dashboard.css';

const MedicineTable = ({ medicines, currentSession, calculateRemainingDays }) => {
    const uniqueMedicines = medicines.filter((med, index, self) =>
        index === self.findIndex((m) => m._id === med._id)
    );

    const sessionName = uniqueMedicines.length > 0 
        ? uniqueMedicines[0]?.session.charAt(0).toUpperCase() + uniqueMedicines[0]?.session.slice(1) 
        : currentSession.charAt(0).toUpperCase() + currentSession.slice(1);

    return (
        <div className="session-medicines-table">
            <h2>
                Medicines for {sessionName}
            </h2>
            {uniqueMedicines.length > 0 ? (
                <table>
                    <thead>
                        <tr>
                            <th>Medicine Name</th>
                            <th>Time</th>
                            <th>Remaining Days</th>
                            <th>Saved Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {uniqueMedicines.map((med) => (
                            <tr key={med._id}>
                                <td>{med.name}</td>
                                <td>{med.time}</td>
                                <td>{calculateRemainingDays(med.addedAt, med.days)}</td>
                                <td>{new Date(med.addedAt).toLocaleDateString('en-GB')}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p>No medicines scheduled for this session.</p>
            )}
        </div>
    );
};

const SavedMedicinesTable = ({ savedMedicines, calculateRemainingDays }) => {
    

    return (
        <div className="saved-medicines-table">
            <h2>Saved Medicines</h2>
            <table>
                <thead>
                    <tr>
                        <th>Medicine Name</th>
                        <th>Saved Date</th>
                        <th>Session</th>
                        <th>Taking Time</th>
                        <th>Total Days</th>
                        <th>Remaining Days</th>
                    </tr>
                </thead>
                <tbody>
                    {savedMedicines.length > 0 ? (
                        savedMedicines.map((med) => (
                            <tr key={med._id}>
                                <td>{med.name}</td>
                                <td>{new Date(med.addedAt).toLocaleDateString('en-GB')}</td>
                                <td>{med.session}</td>
                                <td>{med.time}</td>
                                <td>{med.days}</td>
                                <td>{calculateRemainingDays(med.addedAt, med.days)}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="6">No saved medicines available.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

const UpdateSavedMedicinesTable = ({ savedMedicines, calculateRemainingDays, onDeleteMedicine, fetchMedicines }) => {
    const [editingId, setEditingId] = useState(null);
    const [editFormData, setEditFormData] = useState({
        session: '',
        hours: '',
        minutes: '',
        ampm: 'AM',
        days: ''
    });

    const handleEditClick = (medicine) => {
        setEditingId(medicine._id);
    
        // Parse the existing time string
        const timeString = medicine.time; // "1h 2m AM"
        const timeParts = timeString.match(/(\d+)h (\d+)m (\w{2})/); // RegEx to extract hours, minutes, and AM/PM
    
        if (timeParts) {
            const [ , hours, minutes, ampm ] = timeParts; // Destructure the values
    
            setEditFormData({
                session: medicine.session,
                hours: parseInt(hours, 10), // Convert hour to integer
                minutes: parseInt(minutes, 10), // Convert minutes to integer
                ampm: ampm, // AM/PM part
                days: medicine.days
            });
        }
    };
    
    

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setEditFormData({
            ...editFormData,
            [name]: value,
        });
    };

    const handleSaveClick = async () => {
        try {
            const { session, hours, minutes, ampm, days } = editFormData;
            
            // Create time string in "1h 1m AM" format
            const formattedTime = `${hours}h ${minutes}m ${ampm}`;
    
            const updatedMedicine = {
                session,
                time: formattedTime, // Save as formatted string
                days
            };
    
            const token = localStorage.getItem('token');
            if (!token) {
                console.error('No token found');
                return;
            }
    
            // Send the updated medicine with formatted time
            await axios.put(`http://localhost:5000/api/auth/medicines/${editingId}`, updatedMedicine, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
    
            setEditingId(null); // Exit editing mode
            fetchMedicines(); // Fetch the updated medicines
        } catch (error) {
            console.error('Error updating medicine:', error);
        }
    };
    
    

    return (
        <div className="update-saved-medicines-table">
            <h2>Update Saved Medicines</h2>
            <table>
                <thead>
                    <tr>
                        <th>Medicine Name</th>
                        <th>Session</th>
                        <th>Taking Time</th>
                        <th>Total Days</th>
                        <th>Remaining Days</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {savedMedicines.map((med) => (
                        <tr key={med._id}>
                            <td>{med.name}</td>
                            <td>
                                {editingId === med._id ? (
                                    <select
                                        name="session"
                                        value={editFormData.session}
                                        onChange={handleFormChange}
                                    >
                                        <option value="morning">Morning</option>
                                        <option value="afternoon">Afternoon</option>
                                        <option value="evening">Evening</option>
                                        <option value="night">Night</option>
                                    </select>
                                ) : (
                                    med.session
                                )}
                            </td>
                            <td>
                                {editingId === med._id ? (
                                    <>
                                        <input
                                            type="number"
                                            name="hours"
                                            min="1"
                                            max="12"
                                            value={editFormData.hours}
                                            onChange={handleFormChange}
                                        />
                                        :
                                        <input
                                            type="number"
                                            name="minutes"
                                            min="0"
                                            max="59"
                                            value={editFormData.minutes}
                                            onChange={handleFormChange}
                                        />
                                        <select
                                            name="ampm"
                                            value={editFormData.ampm}
                                            onChange={handleFormChange}
                                        >
                                            <option value="AM">AM</option>
                                            <option value="PM">PM</option>
                                        </select>
                                    </>
                                ) : (
                                    <span>{med.time}</span>
                                )}
                            </td>
                            <td>
                                {editingId === med._id ? (
                                    <input
                                        type="number"
                                        name="days"
                                        min="1"
                                        value={editFormData.days}
                                        onChange={handleFormChange}
                                    />
                                ) : (
                                    med.days
                                )}
                            </td>
                            <td>{calculateRemainingDays(med.addedAt, med.days)}</td>
                            <td>
                                {editingId === med._id ? (
                                    <button onClick={handleSaveClick}>Save</button>
                                ) : (
                                    <button onClick={() => handleEditClick(med)}>Edit</button>
                                )}
                                <button onClick={() => onDeleteMedicine(med._id)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};



const Dashboard = () => {
    const navigate = useNavigate();
    const userId = localStorage.getItem('userId');
    const userName = localStorage.getItem('userName');
    const token = localStorage.getItem('token');
    
    const [showManageMedicines, setShowManageMedicines] = useState(false);
    const [showSavedMedicines, setShowSavedMedicines] = useState(false);
    const [showUpdateSavedMedicines, setShowUpdateSavedMedicines] = useState(false);
    const [medicines, setMedicines] = useState([]);
    const [savedMedicines, setSavedMedicines] = useState([]);
    const [currentDate, setCurrentDate] = useState('');
    const [currentTime, setCurrentTime] = useState('');
    const [currentSession, setCurrentSession] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [uploadedImage, setUploadedImage] = useState(null);
    const [showAddMedicineForm, setShowAddMedicineForm] = useState(false);
  const [recentMedicines, setRecentMedicines] = useState([]);
  const [sortedMedicines, setSortedMedicines] = useState([]);
  


    const sessionTimes = {
        morning: { start: 6, end: 12 },
        afternoon: { start: 12, end: 17 },
        evening: { start: 17, end: 21 },
        night: { start: 21, end: 24 },
    };

    const updateDateTime = () => {
        const now = new Date();
        setCurrentDate(now.toLocaleDateString());
        setCurrentTime(now.toLocaleTimeString());
        determineSession(now.getHours());
    };

    const determineSession = (hour) => {
        const sessionKeys = Object.keys(sessionTimes);
        const currentSessionKey = sessionKeys.find((key) => hour >= sessionTimes[key].start && hour < sessionTimes[key].end);
        setCurrentSession(currentSessionKey || 'night');
    };

    useEffect(() => {
        updateDateTime();
        const intervalId = setInterval(updateDateTime, 1000);
        return () => clearInterval(intervalId);
    }, []);

     useEffect(() => {
    const storedMedicines = JSON.parse(localStorage.getItem('recentMedicines')) || [];
    
    setRecentMedicines(storedMedicines);  // Set recentMedicines from localStorage
    setSavedMedicines(storedMedicines);   // Optionally update savedMedicines as well if needed
}, []);

useEffect(() => {
    // Load recent medicines from local storage when the component mounts
    const storedMedicines = localStorage.getItem('recentMedicines');
    if (storedMedicines) {
        setRecentMedicines(JSON.parse(storedMedicines));
    }
}, []);

useEffect(() => {
    // Load saved medicines from localStorage when the component mounts
    const savedMedicines = JSON.parse(localStorage.getItem('savedMedicines')) || [];
    setSavedMedicines(savedMedicines);
}, []);

    useEffect(() => {
        if (token) {
            fetchMedicines();
        }
    }, [token]);

    const fetchMedicines = async () => {
    try {
        const response = await axios.get('http://localhost:5000/api/auth/medicines', {
            headers: { Authorization: `Bearer ${token}` },
        });

        // Sort the medicines using the sort function
        const sortedMedicines = sortMedicinesByRemainingDays(response.data, calculateRemainingDays);

        // Update state with sorted medicines
        setMedicines(sortedMedicines);
        setSavedMedicines(sortedMedicines); // Ensure sorted data is passed here
    } catch (error) {
        console.error('Error fetching medicines:', error);
    }
};
    

    const calculateRemainingDays = (addedAt, totalDays) => {
        if (!addedAt || !totalDays) return 0;
        const addedDate = new Date(addedAt);
        const currentDate = new Date();
        const daysDifference = Math.floor((currentDate - addedDate) / (1000 * 60 * 60 * 24));
        return Math.max(totalDays - daysDifference, 0);
    };

   // In dashboard.js

const sortMedicinesByRemainingDays = (medicines, calculateRemainingDays) => {
    return medicines.sort((a, b) => {
        const remainingDaysA = calculateRemainingDays(a.addedAt, a.days);
        const remainingDaysB = calculateRemainingDays(b.addedAt, b.days);
        return remainingDaysA - remainingDaysB; // Ascending order: sooner expiry first
    });
};

    
    const handleLogout = async () => {
        if (!token) {
            alert('You are not logged in. Please log in again.');
            navigate('/login');
            return;
        }
        try {
            await axios.post('http://localhost:5000/api/auth/logout', {}, {
                headers: { Authorization: `Bearer ${token}` },
            });
            // Clear both token and recentMedicines from localStorage
            localStorage.removeItem('token');
            localStorage.removeItem('userId');
            localStorage.removeItem('userName');
            localStorage.removeItem('recentMedicines'); // Clear recentMedicines on logout
            navigate('/login');
        } catch (error) {
            console.error('Logout error:', error);
            alert('Logout failed. Please try again.');
        }
    };
    

    const handleImageUpload = (imageFile) => {
        setUploadedImage(imageFile);       // Set the uploaded image file
        setShowAddMedicineForm(true);      // Show the form once an image is uploaded
    };

    const handleAddMedicine = (newMedicine) => {
        // Optionally update the saved medicines list here
        const updatedMedicines = [...savedMedicines, newMedicine];
        updatedMedicines.sort((a, b) => new Date(a.addedAt) - new Date(b.addedAt)); // Sorting by addedAt field
        setSavedMedicines(updatedMedicines);
    
        // Update localStorage with new list
        localStorage.setItem('savedMedicines', JSON.stringify(updatedMedicines));
    };

       // Function to convert "1h 1m PM" to minutes from midnight
const convertTimeToMinutes = (timeString) => {
    const timeParts = timeString.match(/(\d+)h (\d+)m (\w{2})/); // Extract hours, minutes, and AM/PM
    if (timeParts) {
        let [ , hours, minutes, ampm ] = timeParts;
        hours = parseInt(hours, 10);
        minutes = parseInt(minutes, 10);

        if (ampm === 'PM' && hours !== 12) hours += 12; // Convert PM times
        if (ampm === 'AM' && hours === 12) hours = 0; // Convert 12 AM to 0 hours

        return hours * 60 + minutes; // Return total minutes from midnight
    }
    return 0; // If time is invalid, return 0
};

// Function to filter and sort medicines by session
const sortMedicinesBySession = (medicines, session) => {
    // Filter medicines by the given session (e.g., 'morning', 'afternoon', 'evening', 'night')
    const filteredMedicines = medicines.filter(medicine => medicine.session === session);

    // Sort the filtered list by time
    const sortedMedicines = filteredMedicines.sort((a, b) => {
        const timeA = convertTimeToMinutes(a.time);
        const timeB = convertTimeToMinutes(b.time);
        return timeA - timeB; // Sort in ascending order (earlier times first)
    });

    return sortedMedicines;
};


const sessionMedicines = sortMedicinesBySession(medicines, currentSession); // Sorting by session and time


    const handleUpdateSavedMedicines = async () => {
        await fetchMedicines();
        setShowUpdateSavedMedicines(prev => !prev); // Toggle visibility
    };

    const onDeleteMedicine = async (medicineId) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this medicine?");
        if (confirmDelete) {
            try {
                // Step 1: Delete the medicine from the server
                await axios.delete(`http://localhost:5000/api/auth/medicines/${medicineId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
    
                // Step 2: Remove from the local state
                setSavedMedicines((prev) => prev.filter(med => med._id !== medicineId));
                setMedicines((prev) => prev.filter(med => med._id !== medicineId));
    
                // Step 3: Remove from recentMedicines in localStorage
                const storedMedicines = JSON.parse(localStorage.getItem('recentMedicines')) || [];
                const updatedRecentMedicines = storedMedicines.filter(med => med._id !== medicineId);
                localStorage.setItem('recentMedicines', JSON.stringify(updatedRecentMedicines));
    
                // Step 4: Force a UI refresh
                setRecentMedicines([]);  // Temporarily empty the state
                setTimeout(() => {
                    const updatedRecentMedicines = JSON.parse(localStorage.getItem('recentMedicines')) || [];
                    setRecentMedicines(updatedRecentMedicines);  // Reset with updated data
                }, 0); // Use 0 to ensure it happens after the state update
                setRecentMedicines(updatedRecentMedicines);
                setSuccessMessage('Medicine successfully removed.');
                setTimeout(() => setSuccessMessage(''), 3000); // Clear message after 3 seconds
            } catch (error) {
                console.error('Error deleting medicine:', error);
                alert('Failed to delete medicine. Please try again.');
            }
        }
    };
    
    
    

    return (
        <div className="dashboard">
            <header className="dashboard-header">
                <div className="date-time">
                    <strong>Date: {currentDate}</strong><br />
                    <strong>Time: {currentTime}</strong>
                </div>
                <h1>Dashboard</h1>
                <div className="user-info">
                    <div className="user-details">
                        <span className="user-name-label">Username: {userName}</span>
                        <br />
                        <span className="user-id-label">User ID: {userId}</span>
                    </div>
                    <button onClick={handleLogout} className="logout-button">Logout</button>
                </div>
            </header>

            <div className="content-container">
                <div className="left-half">
                <UploadComponent onAddMedicine={handleAddMedicine} />
                     
                </div>
                

                <div className="right-half">
                    <h2>Add Medicine Manually</h2>
                    <p>Prefer adding medication details manually? Click below to enter your medicine information and keep track with ease.</p>
                    <div
                        className="manual-entry-container"
                        onClick={() => setShowManageMedicines((prev) => !prev)}
                    >
                        {showManageMedicines ? 'Hide Medicine Entry' : 'Add Medicine'}
                    </div>
                    {showManageMedicines && (
                        <div className="add-medicine-form-container">
                            <AddMedicineForm onAddMedicine={handleAddMedicine} />
                        </div>
                    )}
                </div>
            </div>

            <div className="medicines-section">
                <MedicineTable 
                    medicines={sessionMedicines} 
                    currentSession={currentSession} 
                    calculateRemainingDays={calculateRemainingDays} 
                />
                 {/* Adding AlarmComponent here, between the table and the button */}
                <AlarmComponent />
                <button
                    onClick={() => setShowSavedMedicines((prev) => !prev)}
                    className="show-saved-medicines-button"
                    style={{ marginLeft: '625px' }}
                >
                    {showSavedMedicines ? 'Hide Saved Medicines' : 'Show Saved Medicines'}
                </button>

                {showSavedMedicines && (
                    <div>
                        <SavedMedicinesTable
                            savedMedicines={savedMedicines}
                            calculateRemainingDays={calculateRemainingDays}
                        />
                        {successMessage && <div className="success-message">{successMessage}</div>}
                        <button
                            onClick={handleUpdateSavedMedicines}
                            className="update-saved-medicines-button"
                            style={{ display: 'block', marginTop: '15px', marginLeft: '625px' }}
                        >
                            {showUpdateSavedMedicines ? 'Hide Update Saved Medicines' : 'Update Saved Medicines'}
                        </button>
                        {showUpdateSavedMedicines && (
                <UpdateSavedMedicinesTable
                    savedMedicines={savedMedicines}
                    calculateRemainingDays={calculateRemainingDays}
                    onDeleteMedicine={onDeleteMedicine}
                    fetchMedicines={fetchMedicines} // <-- Add this line here
                />
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
