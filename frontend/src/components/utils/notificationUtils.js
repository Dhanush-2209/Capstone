// src/utils/notificationUtils.js

export const showAlarmNotification = (medicineName) => {
    if (Notification.permission === 'granted') {
      new Notification(`Time to take your medicine: ${medicineName}`, {
        body: 'Click here to open the app.',
        icon: 'path/to/icon.png', // Optional: Add an icon for the notification
        tag: 'medicine-alarm' // Optional: Helps to group notifications
      });
    } else {
      console.log('Notification permission not granted');
    }
  };
  