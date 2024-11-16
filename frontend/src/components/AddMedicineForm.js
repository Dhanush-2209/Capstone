import React, { useState, useEffect } from 'react';
import './addMedicineForm.css';

const AddMedicineForm = ({ onAddMedicine, prefilledMedicineName = '' }) => {
  const [medicineName, setMedicineName] = useState('');
  const [session, setSession] = useState('morning');
  const [takingHours, setTakingHours] = useState('');
  const [takingMinutes, setTakingMinutes] = useState('');
  const [amPm, setAmPm] = useState('AM');
  const [totalDays, setTotalDays] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [currentMedicine, setCurrentMedicine] = useState(null);
  const [isMedicineVisible, setIsMedicineVisible] = useState(true);
  const [recentMedicines, setRecentMedicines] = useState([]);
  const [showRecent, setShowRecent] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);


  useEffect(() => {
    const storedMedicines = localStorage.getItem('recentMedicines');
    if (storedMedicines) {
        setRecentMedicines(JSON.parse(storedMedicines));
    }
}, []);  // Fetch recent medicines from localStorage on component mount

  useEffect(() => {
    updateAmPm();
  }, [session, takingHours, takingMinutes]);

  useEffect(() => {
    // Prefill the medicine name if prefilledMedicineName prop is provided
    if (prefilledMedicineName) {
      setMedicineName(prefilledMedicineName);
    }
  }, [prefilledMedicineName]);

  useEffect(() => {
    const storedMedicines = localStorage.getItem('recentMedicines');
    if (storedMedicines) {
        setRecentMedicines(JSON.parse(storedMedicines));
    }
}, []); // only run once when the component mounts


  const updateAmPm = () => {
    if (session === 'morning') {
      setAmPm('AM');
    } else if (session === 'afternoon' || session === 'evening') {
      setAmPm('PM');
    } else if (session === 'night') {
      const hour = parseInt(takingHours, 10);
      const minute = parseInt(takingMinutes, 10);
      if (hour >= 9 && hour <= 11 && minute >= 0 && minute <= 59) {
        setAmPm('PM');
      } else if (hour >= 12 && hour <= 23) {
        setAmPm('PM');
      } else if (hour >= 0 && hour <= 5 && minute >= 0 && minute <= 59) {
        setAmPm('AM');
      } else if (hour === 6 && minute === 0) {
        setAmPm('AM');
      } else {
        setAmPm('PM');
      }
    }
  };

  const checkMedicineExists = async (name) => {
    try {
      const response = await fetch(`http://localhost:5000/api/medicines/check?name=${name}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        return data.exists;
      } else {
        console.error('Failed to check medicine existence');
        return false;
      }
    } catch (error) {
      console.error('Error checking medicine existence:', error);
      return false;
    }
  };

  const handleAddMedicine = async () => {
    if (medicineName && takingHours && takingMinutes && totalDays) {
      const isDuplicateInRecent = recentMedicines.some(
        (med) => med.name.toLowerCase() === medicineName.toLowerCase()
      );

      const isDuplicateInDatabase = await checkMedicineExists(medicineName);

      if (isDuplicateInRecent || isDuplicateInDatabase) {
        setErrorMessage(`Medicine "${medicineName}" is already in the list.`);
        setTimeout(() => setErrorMessage(''), 3000);
        return;
      }

      const takingTime = `${takingHours}h ${takingMinutes}m ${amPm}`;
      const timestamp = new Date();
      const newMedicine = {
        name: medicineName,
        session,
        time: takingTime,
        days: totalDays,
        addedAt: timestamp.toISOString(),
      };

      try {
        // Disable the button during the addition process
        setIsProcessing(true);
        const response = await fetch('http://localhost:5000/api/medicines', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify(newMedicine),
        });

        if (response.ok) {
          // Update recent medicines in localStorage
          const storedMedicines = JSON.parse(localStorage.getItem('recentMedicines')) || [];
          const updatedMedicines = [...storedMedicines, newMedicine];
          localStorage.setItem('recentMedicines', JSON.stringify(updatedMedicines));

          // Update saved medicines list in localStorage (if necessary)
          const savedMedicines = JSON.parse(localStorage.getItem('savedMedicines')) || [];
          savedMedicines.push(newMedicine);
          localStorage.setItem('savedMedicines', JSON.stringify(savedMedicines));

          setRecentMedicines(updatedMedicines);  // Update recent medicines state

          setSuccessMessage(`Medicine "${medicineName}" added successfully!`);
          resetFormFields();
          setTimeout(() => setSuccessMessage(''), 3000);

          // Trigger the callback to update the parent component (if needed)
          onAddMedicine(newMedicine);
      } else {
          alert('Failed to add medicine. Please try again.');
      }
  } catch (error) {
      console.error('Error adding medicine:', error);
      alert('Error occurred while adding the medicine.');
  }
  finally {
    setIsProcessing(false); // Reset button state after operation
}
} else {
  alert('Please fill in all fields!');
}
};

  const calculateRemainingDays = (addedAt, totalDays) => {
    if (!addedAt || !totalDays) return 0;
    const addedDate = new Date(addedAt);
    const endDate = new Date(addedDate);
    endDate.setDate(addedDate.getDate() + parseInt(totalDays, 10));
    const remainingDays = Math.ceil((endDate - new Date()) / (1000 * 60 * 60 * 24));
    return remainingDays > 0 ? remainingDays : 0;
  };

  const resetFormFields = () => {
    setMedicineName('');
    setTakingHours('');
    setTakingMinutes('');
    setTotalDays('');
    setSession('morning');
    setAmPm('AM');
  };

  const handleHideMedicine = () => setIsMedicineVisible(false);
  const handleShowMedicine = () => setIsMedicineVisible(true);
  const toggleRecentMedicines = () => setShowRecent((prev) => !prev);

  const handleHourChange = (e) => {
    const value = e.target.value;
    if (value === '' || /^[1][0-2]$|^[1-9]$/.test(value)) {
      setTakingHours(value);
      if (value && value >= 2 && value <= 9) {
        document.getElementById('minutesInput').focus();
      }
    }
  };
  const handleMinutesChange = (value) => {
    // Check if the value is a valid number between 0 and 59
    if (value === '' || (value >= 0 && value <= 59 && /^[0-9]+$/.test(value))) {
      setTakingMinutes(value);
    } else {
      // Optionally, you can set an error state or display a message for invalid input
      alert('Please enter a valid minute value between 0 and 59.');
    }
  };
  

  return (
    <div className="add-medicine-form">
      <h2>Add Medicine</h2>
      <input
        type="text"
        placeholder="Medicine Name"
        value={medicineName}
        onChange={(e) => setMedicineName(e.target.value)}
      />
      <div className="input-group">
        <label>Session:</label>
        <select value={session} onChange={(e) => setSession(e.target.value)}>
          <option value="morning">Morning</option>
          <option value="afternoon">Afternoon</option>
          <option value="evening">Evening</option>
          <option value="night">Night</option>
        </select>
      </div>
      <div className="input-group">
        <label>Taking Time:</label>
        <div className="time-inputs">
          <input
            type="number"
            placeholder="Hours"
            value={takingHours}
            onChange={handleHourChange}
            min="1"
            max="12"
            required
            style={{ width: '60px', marginRight: '5px' }}
          />
         <input
  type="number"
  id="minutesInput"
  placeholder="Minutes"
  value={takingMinutes}
  onChange={(e) => handleMinutesChange(e.target.value)} // Use the new handler here
  min="0"
  max="59"
  required
  style={{ width: '60px', marginRight: '5px' }}
/>

          <select value={amPm} onChange={(e) => setAmPm(e.target.value)}>
            <option value="AM">AM</option>
            <option value="PM">PM</option>
          </select>
        </div>
      </div>
      <input
        type="number"
        placeholder="Total Days"
        value={totalDays}
        onChange={(e) => setTotalDays(e.target.value)}
      />
     <button onClick={handleAddMedicine} disabled={isProcessing}>
    {isProcessing ? 'Adding...' : 'Add Medicine'}
</button>

      {successMessage && <div className="success-message">{successMessage}</div>}
      {errorMessage && <div className="error-message">{errorMessage}</div>}

      {isMedicineVisible && currentMedicine && (
        <div className="current-medicine">
          <h3>Current Medicine:</h3>
          <p>Name: {currentMedicine.name}</p>
          <p>Session: {currentMedicine.session}</p>
          <p>Taking Time: {currentMedicine.time}</p>
          <p>Total Days: {currentMedicine.days}</p>
          <button onClick={handleHideMedicine}>Hide Medicine</button>
        </div>
      )}

      <button onClick={toggleRecentMedicines}>
        {showRecent ? 'Hide Recent Medicines' : 'Show Recent Medicines'}
      </button>
      {showRecent && recentMedicines.length > 0 && (
        <div className="recent-medicines">
          <h3>Recent Medicines</h3>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Session</th>
                <th>Taking Time</th>
                <th>Total Days</th>
                <th>Added On</th>
                <th>Remaining Days</th>
              </tr>
            </thead>
            <tbody>
              {recentMedicines.map((med, index) => (
                <tr key={index}>
                  <td>{med.name}</td>
                  <td>{med.session}</td>
                  <td>{med.time}</td>
                  <td>{med.days}</td>
                  <td>{new Date(med.addedAt).toLocaleString()}</td>
                  <td>{calculateRemainingDays(med.addedAt, med.days)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AddMedicineForm;
