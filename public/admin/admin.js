const adminKey = document.getElementById('adminKey');
const titleInput = document.getElementById('title');
const bodyInput = document.getElementById('body');
const urlInput = document.getElementById('url');
const contractorInput = document.getElementById('contractorId');
const sendBtn = document.getElementById('sendBtn');
const sendStatus = document.getElementById('sendStatus');

adminKey.value = sessionStorage.getItem('contractorPushAdminKey') || '';
contractorInput.value = sessionStorage.getItem('contractorPushLastId') || contractorInput.value;

function status(message, type = '') {
  sendStatus.textContent = message;
  sendStatus.className = `send-status ${type}`.trim();
}

sendBtn.addEventListener('click', async () => {
  const key = adminKey.value.trim();
  const contractorId = contractorInput.value.trim();
  const title = titleInput.value.trim();
  const body = bodyInput.value.trim();
  const url = urlInput.value.trim();

  if (!contractorId) {
    status('Enter a contractor ID.', 'error');
    contractorInput.focus();
    return;
  }
  if (!title || !body) {
    status('Enter a notification title and message.', 'error');
    return;
  }
  if (!key) {
    status('Enter the ADMIN_SECRET you configured in Netlify.', 'error');
    adminKey.focus();
    return;
  }

  sessionStorage.setItem('contractorPushAdminKey', key);
  sessionStorage.setItem('contractorPushLastId', contractorId);
  sendBtn.disabled = true;
  sendBtn.textContent = 'Sending…';
  status(`Sending to ${contractorId}…`);

  try {
    const response = await fetch('/api/send-push', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': key
      },
      body: JSON.stringify({ contractorId, title, body, url: url || '/' })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Send failed.');

    if (!data.subscribers) {
      status(`No subscribers were found for ${contractorId}.`, 'error');
      return;
    }

    status(
      `Found ${data.subscribers} subscriber(s). Sent to ${data.sent} device(s).` +
      (data.failed ? ` ${data.failed} failed.` : ''),
      data.sent ? 'success' : 'error'
    );
  } catch (error) {
    status(error.message || 'Could not send the push notification.', 'error');
  } finally {
    sendBtn.disabled = false;
    sendBtn.textContent = 'Send Push Notification';
  }
});
