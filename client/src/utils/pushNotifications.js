import axiosInstance from "./axiosInstance";
import { API_PATH } from "./apiPath";

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export const subscribeToPushNotifications = async () => {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('Push messaging is not supported');
    return;
  }

  try {
    // `/sw.js` is the generated worker and it is the only registration allowed
    // at scope "/": it imports the push handlers from /service-worker.js.
    // Registering that file directly used to replace this worker (and drop the
    // subscription with it) or be replaced by it, so push stopped arriving.
    // The generated worker does not exist in dev, where the plain handler file
    // is the only worker.
    const swUrl = import.meta.env.DEV ? '/service-worker.js' : '/sw.js';
    const registration = await navigator.serviceWorker.register(swUrl);
    console.log('Service Worker registered!', swUrl);

    // Only prompt when the permission was never decided. Asking again on loads
    // and on background events (online/visibility) gets auto-denied.
    let permission = Notification.permission;
    if (permission === 'default') {
      permission = await Notification.requestPermission();
    }
    if (permission !== 'granted') {
      console.warn('Push notification permission denied');
      return;
    }

    const publicVapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
    if (!publicVapidKey) {
        console.error('VITE_VAPID_PUBLIC_KEY is not set');
        return;
    }

    // Reuse the current subscription when one exists. Subscribing only when
    // there is none, then always re-posting it, is what re-syncs the server
    // after the browser rotated the endpoint while the device was offline.
    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
      });
    }

    // Send the subscription to our backend
    await axiosInstance.post(API_PATH.NOTIFICATIONS.PUSH_SUBSCRIBE, {
      subscription: subscription
    });
    console.log('Push subscription saved to server');

  } catch (error) {
    console.error('Error during service worker registration or push subscription:', error);
  }
};
