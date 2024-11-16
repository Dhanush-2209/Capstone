import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AlarmComponent.css';

const AlarmComponent = () => {
    const [manualAlarms, setManualAlarms] = useState([]);
    const [autoAlarms, setAutoAlarms] = useState([]);
    const [autoOff, setAutoOff] = useState([]); // Auto Off Medicines
    const [showMedicineList, setShowMedicineList] = useState(false);
    const [error, setError] = useState('');
    const [selectedMedicine, setSelectedMedicine] = useState(null);  // Store selected medicine

    useEffect(() => {
        const fetchAlarmsAndMedicines = async () => {
            const token = localStorage.getItem('authToken');
            
            if (!token) {
                console.error('No token found in localStorage.');
                setError('No authentication token found. Please log in.');
                return;
            }
    
            try {
                const response = await axios.get('http://localhost:5000/api/alarms', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
    
                console.log('API Response:', response.data); // Add this log to check the API response
    
                const { alarms, medicines } = response.data;
                setManualAlarms(alarms.filter((alarm) => alarm.type === 'manual'));
                setAutoAlarms(alarms.filter((alarm) => alarm.type === 'auto'));
                setAutoOff(medicines);
            } catch (error) {
                console.error('Error fetching alarms or medicines:', error.response?.data || error.message);
                setError(error.response?.data?.message || 'Error fetching alarms or medicines');
            }
        };
    
        fetchAlarmsAndMedicines();
    }, []);  // Dependency array ensures this runs on mount
    

    // Add to Auto Alarm
    const addToAutoAlarm = (medicine) => {
        console.log('Medicine being sent:', medicine);
    
        const token = localStorage.getItem('authToken');
        if (!token) {
            console.error('No token found in localStorage.');
            setError('No authentication token found. Please log in.');
            return;
        }
    
        // Send the medicine data in the POST request
        axios.post('http://localhost:5000/api/alarms', {
            name: medicine.name,
            session: medicine.session,
            time: medicine.time,
            days: medicine.days,
        }, {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        })
        .then(response => {
            console.log('Medicine added to auto alarm:', response.data);

            // Update the autoAlarms state with the newly added medicine
            setAutoAlarms(prevAutoAlarms => [...prevAutoAlarms, response.data]);

            // Remove the medicine from the Auto Off list after adding it
            setAutoOff(prevAutoOff => prevAutoOff.filter(med => med._id !== medicine._id));
        })
        .catch(error => {
            console.error('Error adding to auto alarm:', error.response?.data || error.message);
            setError('Failed to add medicine to auto alarm');
        });
    };

    // Function to fetch auto alarms
    const fetchAutoAlarms = () => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            console.error('No token found in localStorage.');
            setError('No authentication token found. Please log in.');
            return;
        }

        axios.get('http://localhost:5000/api/alarms', {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        })
        .then(response => {
            // Update the state with the latest auto alarms
            setAutoAlarms(response.data.alarms);  // Assuming you are storing alarms in state
            console.log('Auto Alarms updated:', response.data.alarms);
        })
        .catch(error => {
            console.error('Error fetching auto alarms:', error.response?.data || error.message);
        });
    };

    return (
        <div className="alarm-component">
            <h2>Set Alarms</h2>
            <table className="alarm-settings-table">
                <thead>
                    <tr>
                        <th>Manual</th>
                        <th>Auto Alarms</th>
                        <th>Auto Off</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        {/* Manual Alarms Column */}
                        <td>
                            {manualAlarms.length > 0 ? (
                                manualAlarms.map((alarm) => (
                                    <div key={alarm._id}>
                                        {alarm.name} - {alarm.time}
                                    </div>
                                ))
                            ) : (
                                <p>No manual alarms set</p>
                            )}
                        </td>

                        {/* Auto Alarms Column */}
                        <td>
                            <button onClick={() => setShowMedicineList(true)}>Add Auto Alarms</button>
                            {autoAlarms.length > 0 ? (
                                autoAlarms.map((alarm) => (
                                    <div key={alarm._id}>
                                        {alarm.name} - {alarm.session} - {alarm.time}
                                    </div>
                                ))
                            ) : (
                                <p>No auto alarms set</p>
                            )}
                        </td>

                        {/* Auto Off Column */}
                        <td>
                            {autoOff.length > 0 ? (
                                autoOff.map((medicine) => (
                                    <div key={medicine._id}>
                                        <strong>{medicine.name}</strong>
                                        <button onClick={() => setSelectedMedicine(medicine)}>Select</button>
                                    </div>
                                ))
                            ) : (
                                <p>No medicines in Auto Off</p>
                            )}
                        </td>
                    </tr>
                </tbody>
            </table>

            {/* Medicine List Modal */}
            {showMedicineList && (
                <div className="medicine-list-modal">
                    <div className="modal-content">
                        <h3>Select a Medicine</h3>
                        <ul>
                            {autoOff.length === 0 ? (
                                <li>No medicines found</li>
                            ) : (
                                autoOff.map((medicine) => (
                                    <li key={medicine._id} onClick={() => setSelectedMedicine(medicine)}>
                                        {medicine.name} - {medicine.session} - {medicine.time}
                                    </li>
                                ))
                            )}
                        </ul>
                        {error && <p style={{ color: 'red' }}>{error}</p>}
                        <button onClick={() => setShowMedicineList(false)}>Close</button>
                        <button onClick={() => selectedMedicine && addToAutoAlarm(selectedMedicine)}>Add to Auto Alarm</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AlarmComponent;
