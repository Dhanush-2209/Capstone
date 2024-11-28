import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:5000'); // Your backend URL

const AlarmNotification = () => {
    const [showAlarm, setShowAlarm] = useState(false);
    const [alarmData, setAlarmData] = useState({});
    const alarmSound = new Audio('/alarm-sound.mp3'); // Ensure this is in the public folder
    const [audioAllowed, setAudioAllowed] = useState(false); // Track if audio can be played
    let audioContext = null; // Declare AudioContext here

    // Function to play sound with AudioContext (avoids autoplay restrictions)
    const playAlarmSound = () => {
        if (audioAllowed) {
            // Create a new AudioContext inside the click handler
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const source = audioContext.createMediaElementSource(alarmSound);
            source.connect(audioContext.destination);

            alarmSound.play().catch(error => {
                console.error('Error playing sound:', error);
            });
        }
    };

    // Handle the notification click, allow audio playback, and show the alarm overlay
    const handleNotificationClick = () => {
        setAudioAllowed(true);  // Allow audio playback after clicking the notification
        playAlarmSound(); // Play the sound
        setShowAlarm(true); // Show the alarm overlay
    };

    useEffect(() => {
        socket.on('triggerAlarm', (data) => {
            setAlarmData(data);
            // Display the browser notification when the alarm triggers
            if (Notification.permission === 'granted') {
                const notification = new Notification('Alarm Triggered!', {
                    body: `It's time to take ${data.name} at ${new Date(data.time).toLocaleTimeString()}`,
                    icon: '/alarm-icon.png',  // Optional: Add an icon to the notification
                });

                // When the notification is clicked, trigger the alarm overlay
                notification.onclick = handleNotificationClick;
            } else {
                Notification.requestPermission().then(permission => {
                    if (permission === 'granted') {
                        const notification = new Notification('Alarm Triggered!', {
                            body: `It's time to take ${data.name} at ${new Date(data.time).toLocaleTimeString()}`,
                            icon: '/alarm-icon.png', // Optional: Add an icon to the notification
                        });

                        // When the notification is clicked, trigger the alarm overlay
                        notification.onclick = handleNotificationClick;
                    }
                });
            }
        });

        return () => {
            socket.off('triggerAlarm');
        };
    }, []);

    const closeAlarm = async () => {
        try {
            // API call to restore the previous state (if needed)
            const response = await fetch(`http://localhost:5000/api/medicines/restore-previous-state/${alarmData.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
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
    
            // Update local state after the API response to reflect the restored state
            setAlarmData({
                ...result.updatedMedicine,
                manualAlarmTime: null, // Reset the manual alarm time to null
            });
    
            // Close the overlay and stop the sound
            setShowAlarm(false);  // Hide the alarm overlay
            alarmSound.pause();  // Stop the alarm sound
            alarmSound.currentTime = 0; // Reset the sound to the start
        } catch (error) {
            console.error('Error in closeAlarm:', error.message);
        }
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
