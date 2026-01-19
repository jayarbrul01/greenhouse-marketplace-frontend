// Service Worker for Firebase Cloud Messaging
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyDo7ZU5lBD54wCpDszcOIxbT-dVpsguOLA",
  authDomain: "mail-authentication-d0a3b.firebaseapp.com",
  projectId: "mail-authentication-d0a3b",
  storageBucket: "mail-authentication-d0a3b.firebasestorage.app",
  messagingSenderId: "174719131752",
  appId: "1:174719131752:web:7cf2a657ff7423c5d75bdd",
  measurementId: "G-8BT6TJ6035"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification?.title || 'New Notification';
  const notificationOptions = {
    body: payload.notification?.body || '',
    icon: '/logo_2.png',
    badge: '/logo_2.png',
    data: payload.data,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const data = event.notification.data;
  if (data?.postId) {
    event.waitUntil(
      clients.openWindow(`/products/${data.postId}`)
    );
  } else {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});
