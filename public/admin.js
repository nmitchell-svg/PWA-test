const adminKey = document.getElementById('adminKey');
const titleInput = document.getElementById('title');
const bodyInput = document.getElementById('body');
const urlInput = document.getElementById('url');
const contractorInput = document.getElementById('contractorId');
const sendBtn = document.getElementById('sendBtn');
const sendStatus = document.getElementById('sendStatus');

adminKey.value = sessionStorage.getItem('pushDemoAdminKey') || '';

function status(message, type='') {
  sendStatus.textContent = message;
  sendStatus.className = `send-status ${type}`.trim();
}

sendBtn.addEventListener('click', async () => {
  const key = adminKey.value.trim();
  if (!key) {
    status('Enter the ADMIN_SECRET you configured in Netlify.', 'error');
    return;
  }

  sessionStorage.setItem('pushDemoAdminKey', key);
  sendBtn.disabled = true;
  sendBtn.textContent = 'Sending…';
  status('Sending notification…');

  try {
    const response = await fetch('/api/send-push', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': key
      },
      body: JSON.stringify({
        contractorId: contractorInput.value,
        title: titleInput.value.trim(),
        body: bodyInput.value.trim(),
        url: urlInput.value.trim() || '/'
      })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Send failed.');

    status(`Sent to ${data.sent} device(s).${data.failed ? ` ${data.failed} failed.` : ''}`, 'success');
  } catch (error) {
    status(error.message || 'Could not send the push notification.', 'error');
  } finally {
    sendBtn.disabled = false;
    sendBtn.textContent = 'Send Push Notification';
  }
});
