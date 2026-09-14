const CONTRACTOR_ID = 'smith-hvac';
let deferredPrompt = null;

const installBtn = document.getElementById('installBtn');
const notifyBtn = document.getElementById('notifyBtn');
const statusEl = document.getElementById('notificationStatus');
const iosModal = document.getElementById('iosModal');
const closeModal = document.getElementById('closeModal');

function setStatus(message, type = '') {
  statusEl.textContent = message;
  statusEl.className = `notification-status ${type}`.trim();
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)));
}

async function getRegistration() {
  if (!('serviceWorker' in navigator)) throw new Error('Service workers are not supported in this browser.');
  await navigator.serviceWorker.register('/sw.js');
  return navigator.serviceWorker.ready;
}

async function refreshNotificationState() {
  if (!('Notification' in window) || !('PushManager' in window)) {
    notifyBtn.disabled = true;
    setStatus('Push notifications are not supported in this browser.', 'error');
    return;
  }

  const registration = await getRegistration();
  const subscription = await registration.pushManager.getSubscription();

  if (Notification.permission === 'granted' && subscription) {
    notifyBtn.textContent = '✓ Notifications Enabled';
    notifyBtn.disabled = true;
    setStatus('This device is subscribed and ready to receive notifications.', 'success');
  } else if (Notification.permission === 'denied') {
    notifyBtn.disabled = true;
    setStatus('Notifications are blocked in browser settings.', 'error');
  }
}

async function enableNotifications() {
  try {
    const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;

    if (isIos && !isStandalone) {
      iosModal.classList.remove('hidden');
      setStatus('On iPhone, add the app to your Home Screen first, then enable notifications.', 'error');
      return;
    }

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      setStatus('Notification permission was not granted.', 'error');
      return;
    }

    setStatus('Creating your secure push subscription…');

    const configRes = await fetch('/api/push-config');
    if (!configRes.ok) throw new Error('Push configuration is not available yet.');
    const { publicKey } = await configRes.json();

    const registration = await getRegistration();
    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey)
      });
    }

    const saveRes = await fetch('/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contractorId: CONTRACTOR_ID,
        subscription,
        userAgent: navigator.userAgent
      })
    });

    if (!saveRes.ok) {
      const errorData = await saveRes.json().catch(() => ({}));
      throw new Error(errorData.error || 'Could not save the push subscription.');
    }

    notifyBtn.textContent = '✓ Notifications Enabled';
    notifyBtn.disabled = true;
    setStatus('Success! This device can now receive Smith Heating & Air notifications.', 'success');
  } catch (error) {
    console.error(error);
    setStatus(error.message || 'Something went wrong enabling notifications.', 'error');
  }
}

const standalone =
  window.matchMedia('(display-mode: standalone)').matches ||
  window.navigator.standalone === true;

if (standalone) {
  installBtn.textContent = '✓ Installed';
  installBtn.disabled = true;
}

window.addEventListener('beforeinstallprompt', event => {
  event.preventDefault();
  deferredPrompt = event;
});

window.addEventListener('appinstalled', () => {
  installBtn.textContent = '✓ Installed';
  installBtn.disabled = true;
  deferredPrompt = null;
});

installBtn.addEventListener('click', async () => {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
    return;
  }
  if (/iphone|ipad|ipod/i.test(navigator.userAgent)) {
    iosModal.classList.remove('hidden');
  } else {
    alert('Use your browser menu and choose “Install app” or “Add to Home screen.”');
  }
});

notifyBtn.addEventListener('click', enableNotifications);
closeModal.addEventListener('click', () => iosModal.classList.add('hidden'));
iosModal.addEventListener('click', e => {
  if (e.target === iosModal) iosModal.classList.add('hidden');
});

refreshNotificationState().catch(console.error);
