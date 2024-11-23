import React, { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment-timezone';
import './AlarmComponent.css';

const AlarmComponent = () => {
    const [showMedicineList, setShowMedicineList] = useState(false);
    const [showManualAlarmModal, setShowManualAlarmModal] = useState(false); // Modal for manual alarm
    const [allMedicines, setAllMedicines] = useState([]); // All medicines
    const [autoOffMedicines, setAutoOffMedicines] = useState([]); // Medicines in Auto Off
    const [autoAlarms, setAutoAlarms] = useState([]); // Medicines in Auto Alarms
    const [manualMedicines, setManualMedicines] = useState([]); // Medicines in Manual Alarm
    const [selectedMedicineId, setSelectedMedicineId] = useState(null); // To hold the selected medicine ID
    const [selectedDate, setSelectedDate] = useState(''); // Date (YYYY-MM-DD)
    const [selectedTime, setSelectedTime] = useState(''); // Time (hh:mm)
    const [selectedAmPm, setSelectedAmPm] = useState('AM'); // AM/PM selection
    const [selectedDateTime, setSelectedDateTime] = useState(''); // To hold the selected date and time

    const fetchMedicines = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/medicines', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });

            const medicines = response.data;
            setAllMedicines(medicines);
            setAutoOffMedicines(medicines.filter(med => med.state === 'autooff'));
            setAutoAlarms(medicines.filter(med => med.state === 'auto_alarm'));
            setManualMedicines(medicines.filter(med => med.state === 'manual'));
        } catch (error) {
            console.error('Error fetching medicines:', error);
        }
    };

    useEffect(() => {
        if (selectedDate && selectedTime && selectedAmPm) {
            // Combine date, time, and AM/PM to create a full datetime
            const combinedDateTime = `${selectedDate} ${selectedTime} ${selectedAmPm}`;
            setSelectedDateTime(combinedDateTime);
        }
    }, [selectedDate, selectedTime, selectedAmPm]);

    useEffect(() => {
        fetchMedicines();
    }, []);

    const moveToAutoAlarms = async (medicineId) => {
        try {
            const response = await axios.put(
                `http://localhost:5000/api/medicines/move-to-auto-alarm/${medicineId}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );

            const updatedMedicine = response.data.updatedMedicine;
            setAutoOffMedicines(prev => prev.filter(med => med._id !== medicineId));
            setAutoAlarms(prev => [...prev, updatedMedicine]);
            fetchMedicines();
        } catch (error) {
            console.error('Error updating medicine state:', error);
        }
    };

    const handleSetManualAlarm = async () => {
        if (!selectedDateTime || !selectedMedicineId) {
            alert('Please select a date and time and choose a medicine.');
            return;
        }
    
        try {
            // Format selectedDateTime in IST with explicit timezone offset (+05:30)
            const formattedDateTime = moment(selectedDateTime, 'YYYY-MM-DD hh:mm A')
                .tz('Asia/Kolkata', true) // Interpret as IST and keep as is
                .format('YYYY-MM-DDTHH:mm:ss.SSSZ'); // Format in ISO 8601 with timezone offset
    
            const response = await axios.put(
                `http://localhost:5000/api/medicines/move-to-manual-alarm/${selectedMedicineId}`,
                { manualAlarmTime: formattedDateTime },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );
    
            const updatedMedicine = response.data.updatedMedicine;
            setAutoAlarms(prev => prev.filter(med => med._id !== selectedMedicineId));
            setAutoOffMedicines(prev => prev.filter(med => med._id !== selectedMedicineId));
            setManualMedicines(prev => [...prev, updatedMedicine]);
    
            setShowManualAlarmModal(false);
            setSelectedDateTime(null);
            setSelectedMedicineId(null);
        } catch (error) {
            console.error('Error setting manual alarm:', error);
        }
    };
    
    

    const moveToAutoOff = async (medicineId) => {
        try {
            const response = await axios.put(
                `http://localhost:5000/api/medicines/move-to-auto-off/${medicineId}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                }
            );

            const updatedMedicine = response.data.updatedMedicine;
            setAutoAlarms(prev => prev.filter(med => med._id !== medicineId));
            setAutoOffMedicines(prev => [...prev, updatedMedicine]);
        } catch (error) {
            console.error('Error in moving medicine to Auto Off:', error.response || error);
        }
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
                        <td>
                            <button onClick={() => setShowManualAlarmModal(true)}>Add Manual Alarm</button>
                            {manualMedicines.length === 0 ? (
                                <p>No manual alarms set</p>
                            ) : (
                                <ul>
                                    {manualMedicines.map(med => (
                                        <li key={med._id}>{med.name}</li>
                                    ))}
                                </ul>
                            )}
                        </td>
                        <td>
                            <button onClick={() => setShowMedicineList(true)}>Add Auto Alarms</button>
                            {autoAlarms.length === 0 ? (
                                <p>No auto alarms set</p>
                            ) : (
                                <ul>
                                    {autoAlarms.map(med => (
                                        <li key={med._id}>
                                            {med.name}
                                            <button onClick={() => moveToAutoOff(med._id)}>Move to Auto Off</button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </td>
                        <td>
                            {autoOffMedicines.length === 0 ? (
                                <p>No medicines in Auto Off</p>
                            ) : (
                                <ul>
                                    {autoOffMedicines.map(med => (
                                        <li key={med._id}>{med.name}</li>
                                    ))}
                                </ul>
                            )}
                        </td>
                    </tr>
                </tbody>
            </table>

            {showMedicineList && (
                <div className="medicine-list-modal">
                    <div className="modal-content">
                        <h3>Select a Medicine</h3>
                        {autoOffMedicines.length === 0 ? (
                            <p>No medicines available</p>
                        ) : (
                            <ul>
                                {autoOffMedicines.map(med => (
                                    <li key={med._id}>
                                        {med.name}
                                        <button onClick={() => moveToAutoAlarms(med._id)}>Add to Auto Alarms</button>
                                    </li>
                                ))}
                            </ul>
                        )}
                        <button onClick={() => setShowMedicineList(false)}>Close</button>
                    </div>
                </div>
            )}

            {showManualAlarmModal && (
                <div className="medicine-list-modal">
                    <div className="modal-content">
                        <h3>Select a Medicine for Manual Alarm</h3>
                        {allMedicines.length === 0 ? (
                            <p>No medicines available</p>
                        ) : (
                            <ul>
                                {allMedicines
                                    .filter(med => !manualMedicines.some(manualMed => manualMed._id === med._id))
                                    .map(med => (
                                        <li key={med._id}>
                                            <button onClick={() => setSelectedMedicineId(med._id)}>
                                                {med.name}
                                            </button>
                                        </li>
                                    ))}
                            </ul>
                        )}
                        {selectedMedicineId && (
    <>
        <div>
            <label>Select Date: </label>
            <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
            />
        </div>
        <div>
            <label>Select Time: </label>
            <div className="time-selector">
                {/* Hours Dropdown */}
                <select
                    value={selectedTime.split(":")[0] || "12"}
                    onChange={(e) => {
                        const newTime = `${e.target.value}:${selectedTime.split(":")[1] || "00"}`;
                        setSelectedTime(newTime);
                    }}
                >
                    {Array.from({ length: 12 }, (_, i) => (
                        <option key={i + 1} value={String(i + 1).padStart(2, "0")}>
                            {i + 1}
                        </option>
                    ))}
                </select>
                :
                {/* Minutes Dropdown */}
                <select
                    value={selectedTime.split(":")[1] || "00"}
                    onChange={(e) => {
                        const newTime = `${selectedTime.split(":")[0] || "12"}:${e.target.value}`;
                        setSelectedTime(newTime);
                    }}
                >
                    {Array.from({ length: 60 }, (_, i) => (
                        <option key={i} value={String(i).padStart(2, "0")}>
                            {String(i).padStart(2, "0")}
                        </option>
                    ))}
                </select>
                {/* AM/PM Selector */}
                <select
                    value={selectedAmPm}
                    onChange={(e) => setSelectedAmPm(e.target.value)}
                >
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                </select>
            </div>
        </div>
        <button onClick={handleSetManualAlarm}>Set Manual Alarm</button>
    </>
)}

                        <button onClick={() => setShowManualAlarmModal(false)}>Close</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AlarmComponent;