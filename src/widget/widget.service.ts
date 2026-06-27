import { Injectable } from '@nestjs/common';

@Injectable()
export class WidgetService {
  getEmbedScript(campaignId: string, businessName: string): string {
    return `
(function() {
  var container = document.getElementById('referloop-widget');
  if (!container) {
    container = document.createElement('div');
    container.id = 'referloop-widget';
    document.body.appendChild(container);
  }

  var apiUrl = 'http://localhost:4000/api';

  container.innerHTML = [
    '<div style="font-family:Arial,sans-serif;max-width:400px;margin:20px auto;padding:24px;border:1px solid #e2e8f0;border-radius:12px;background:#fff;box-shadow:0 4px 6px -1px rgba(0,0,0,0.1);">',
    '  <h3 style="margin:0 0 8px;font-size:18px;color:#1a202c;">Refer a Friend</h3>',
    '  <p style="margin:0 0 16px;font-size:14px;color:#718096;">Share ${JSON.stringify(businessName)} with friends and earn rewards!</p>',
    '  <div style="margin-bottom:12px;">',
    '    <label style="display:block;font-size:13px;font-weight:600;color:#4a5568;margin-bottom:4px;">Friend\\'s Email</label>',
    '    <input id="ref-email" type="email" placeholder="friend@example.com" style="width:100%;padding:10px 12px;border:1px solid #e2e8f0;border-radius:8px;font-size:14px;box-sizing:border-box;" />',
    '  </div>',
    '  <div style="margin-bottom:16px;">',
    '    <label style="display:block;font-size:13px;font-weight:600;color:#4a5568;margin-bottom:4px;">Your Referral Code</label>',
    '    <input id="ref-code" type="text" placeholder="Enter your code" style="width:100%;padding:10px 12px;border:1px solid #e2e8f0;border-radius:8px;font-size:14px;box-sizing:border-box;" />',
    '  </div>',
    '  <button id="ref-submit" style="width:100%;padding:12px;background:#6366f1;color:white;border:none;border-radius:8px;font-size:15px;font-weight:600;cursor:pointer;">Send Referral</button>',
    '  <p id="ref-message" style="margin:12px 0 0;font-size:13px;text-align:center;color:#718096;"></p>',
    '</div>'
  ].join('\\n');

  document.getElementById('ref-submit').addEventListener('click', function() {
    var email = document.getElementById('ref-email').value;
    var code = document.getElementById('ref-code').value;
    var msg = document.getElementById('ref-message');

    if (!email || !code) {
      msg.style.color = '#e53e3e';
      msg.textContent = 'Please fill in both fields.';
      return;
    }

    fetch(apiUrl + '/referrals/convert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: code, referredEmail: email })
    })
    .then(function(r) { return r.json(); })
    .then(function(data) {
      if (data.statusCode && data.statusCode >= 400) {
        msg.style.color = '#e53e3e';
        msg.textContent = data.message || 'Something went wrong.';
      } else {
        msg.style.color = '#38a169';
        msg.textContent = 'Referral sent! Your friend will receive a reward.';
        document.getElementById('ref-email').value = '';
        document.getElementById('ref-code').value = '';
      }
    })
    .catch(function() {
      msg.style.color = '#e53e3e';
      msg.textContent = 'Network error. Please try again.';
    });
  });
})();
`;
  }
}
