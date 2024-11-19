import React, { useState } from 'react';
import './AlarmComponent.css';

const AlarmComponent = () => {
    const [showMedicineList, setShowMedicineList] = useState(false);
    const [selectedMedicine, setSelectedMedicine] = useState(null);  // Store selected medicine

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
                            <p>No manual alarms set</p>
                        </td>

                        {/* Auto Alarms Column */}
                        <td>
                            <button onClick={() => setShowMedicineList(true)}>Add Auto Alarms</button>
                            <p>No auto alarms set</p>
                        </td>

                        {/* Auto Off Column */}
                        <td>
                            <p>No medicines in Auto Off</p>
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
                            <li>No medicines found</li>
                        </ul>
                        <button onClick={() => setShowMedicineList(false)}>Close</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AlarmComponent;
