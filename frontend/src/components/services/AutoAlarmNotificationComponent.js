import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:5000'); // Your backend URL

const AutoAlarmNotification = () => {
    const [showAlarm, setShowAlarm] = useState(false);
    const [alarmData, setAlarmData] = useState({});
    const alarmSound = new Audio('/alarm-sound.mp3'); // Ensure this is in the public folder
    const [audioAllowed, setAudioAllowed] = useState(false); // Track if audio can be played

    useEffect(() => {
        // Request permission to play sound when notification is clicked
        const handleNotificationClick = () => {
            setAudioAllowed(true);  // Allow audio playback after clicking the notification
            playAlarmSound(); // Play the sound
            setShowAlarm(true); // Show the alarm overlay
        };

        socket.on('triggerAutoAlarm', (data) => {
            setAlarmData(data);
            // Display the browser notification when the alarm triggers
            if (Notification.permission === 'granted') {
                const notification = new Notification('Alarm Triggered!', {
                    body: `It's time to take ${data.name} `,
                    icon: '/alarm-icon.png',  // Optional: Add an icon to the notification
                });

                // When the notification is clicked, trigger the alarm overlay
                notification.onclick = handleNotificationClick;
            } else {
                Notification.requestPermission().then(permission => {
                    if (permission === 'granted') {
                        const notification = new Notification('Alarm Triggered!', {
                            body: `It's time to take ${data.name} `,
                            icon: '/alarm-icon.png', // Optional: Add an icon to the notification
                        });

                        // When the notification is clicked, trigger the alarm overlay
                        notification.onclick = handleNotificationClick;
                    }
                });
            }
        });

        return () => {
            socket.off('triggerAutoAlarm');
        };
    }, []);

    // Function to play the alarm sound with AudioContext only after user gesture
    const playAlarmSound = () => {
        if (audioAllowed) {
            alarmSound.play().catch(error => {
                console.error('Error playing sound:', error); // Catch errors if the sound is blocked
            });
        }
    };

    // Function to close the alarm notification and stop the sound
    const closeAlarm = () => {
        setShowAlarm(false);
        alarmSound.pause();  // Stop the alarm sound
        alarmSound.currentTime = 0; // Reset the sound to the start
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
                        It's time to take <strong>{alarmData.name}</strong> 
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

export default AutoAlarmNotification;
