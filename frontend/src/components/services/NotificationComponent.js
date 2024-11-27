import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:5000'); // Your backend URL

const AlarmNotification = () => {
    const [showAlarm, setShowAlarm] = useState(false);
    const [alarmData, setAlarmData] = useState({});
    const alarmSound = new Audio('/alarm-sound.mp3'); // Use public path

    useEffect(() => {
        socket.on('triggerAlarm', (data) => {
            setAlarmData(data);
            setShowAlarm(true);
            alarmSound.play(); // Play the alarm sound
        });

        return () => {
            socket.off('triggerAlarm');
        };
    }, [alarmSound]);

    const closeAlarm = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/medicines/restore-previous-state/${alarmData.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`, // Include token if needed
                },
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                console.error('Error restoring previous state:', errorData.message);
                alert('Failed to restore the previous state of the medicine.');
                return;
            }
    
            const result = await response.json();
            console.log('Previous state restored:', result.updatedMedicine);
        } catch (error) {
            console.error('Error in closeAlarm:', error.message);
        }
    
        setShowAlarm(false);
        alarmSound.pause(); // Stop the alarm sound
        alarmSound.currentTime = 0; // Reset the sound
    };
    

    return (
        <div>
            
            {showAlarm && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        color: 'white',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 1000,
                    }}
                >
                    <h2>🔔 Alarm Triggered!</h2>
                    <p>
                        It's time to take <strong>{alarmData.name}</strong> at{' '}
                        {new Date(alarmData.time).toLocaleTimeString()}!
                    </p>
                    <button
                        style={{
                            padding: '10px 20px',
                            fontSize: '16px',
                            marginTop: '20px',
                            cursor: 'pointer',
                            backgroundColor: 'green',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                        }}
                        onClick={closeAlarm}
                    >
                        Got it!
                    </button>
                </div>
            )}
        </div>
    );
};

export default AlarmNotification;
