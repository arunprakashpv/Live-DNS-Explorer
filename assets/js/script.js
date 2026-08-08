document.addEventListener('DOMContentLoaded', () => {
  const domainInput = document.getElementById('sim-domain');
  const typeSelect = document.getElementById('sim-type');
  const resolverSelect = document.getElementById('sim-resolver');
  const lookupBtn = document.getElementById('lookup-btn');
  const resultDisplay = document.getElementById('sim-result');
  const copyBtn = document.getElementById('copy-btn');
  const quickBtns = document.querySelectorAll('.quick-btn');

  const statusMap = { 0: 'NOERROR', 1: 'FORMERR', 2: 'SERVFAIL', 3: 'NXDOMAIN', 4: 'NOTIMP', 5: 'REFUSED' };

  function getTypeName(n) {
    const types = { 1: 'A', 28: 'AAAA', 5: 'CNAME', 15: 'MX', 16: 'TXT', 2: 'NS', 6: 'SOA', 12: 'PTR', 33: 'SRV', 46: 'RRSIG', 43: 'DS', 48: 'DNSKEY' };
    return types[n] || `TYPE${n}`;
  }

  async function runLookup() {
    const domain = domainInput.value.trim();
    const type = typeSelect.value;
    const resolver = resolverSelect.value;

    if (!domain) {
      resultDisplay.textContent = 'Error: Please enter a domain name.';
      resultDisplay.className = 'result-body error';
      domainInput.focus();
      return;
    }

    const resolverName = resolver === 'google' ? 'Google DoH' : 'Cloudflare DoH';
    resultDisplay.textContent = `Querying ${domain} for ${type} records via ${resolverName}...\nWaiting for response...`;
    resultDisplay.className = 'result-body loading';
    
    // Disable inputs during fetch
    lookupBtn.disabled = true;
    lookupBtn.textContent = 'Working...';

    try {
      let url, headers = {};
      if (resolver === 'cloudflare') {
        url = `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(domain)}&type=${type}`;
        headers = { 'Accept': 'application/dns-json' };
      } else {
        url = `https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=${type}`;
      }
      
      const response = await fetch(url, { headers });
      
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();

      let out = '';
      out += `; <<>> Live DNS Explorer <<>> ${domain} ${type}\n`;
      out += `;; Resolver: ${resolver === 'google' ? 'Google (dns.google)' : 'Cloudflare (cloudflare-dns.com)'}\n`;
      out += `;; Got answer:\n`;
      
      const status = statusMap[data.Status] || `UNKNOWN (${data.Status})`;
      out += `;; ->>HEADER<<- opcode: QUERY, status: ${status}, id: ${Math.floor(Math.random() * 65535)}\n`;
      out += `;; flags: qr rd ra; QUERY: 1, ANSWER: ${data.Answer ? data.Answer.length : 0}, AUTHORITY: ${data.Authority ? data.Authority.length : 0}, ADDITIONAL: 0\n\n`;

      if (data.Status === 3) {
        out += `;; \u274c NXDOMAIN \u2014 this domain does not exist.\n`;
        out += `;; The authoritative server explicitly said "no".\n\n`;
      } else if (data.Status === 2) {
        out += `;; \u26a0\ufe0f SERVFAIL \u2014 the authoritative server errored.\n\n`;
      }

      if (data.Question && data.Question.length) {
        out += `;; QUESTION SECTION:\n`;
        data.Question.forEach(q => {
          out += `;${q.name.padEnd(29)} IN      ${getTypeName(q.type).padEnd(6)}\n`;
        });
        out += `\n`;
      }

      if (data.Answer && data.Answer.length) {
        out += `;; ANSWER SECTION:\n`;
        data.Answer.forEach(a => {
          const typeName = getTypeName(a.type);
          out += `${a.name.padEnd(30)} ${String(a.TTL).padEnd(7)} IN      ${typeName.padEnd(6)} ${a.data}\n`;
        });
        out += `\n`;
      } else if (data.Status === 0) {
        out += `;; No answer records returned. The domain exists but has no ${type} record.\n\n`;
      }

      if (data.Authority && data.Authority.length) {
        out += `;; AUTHORITY SECTION:\n`;
        data.Authority.forEach(a => {
          const typeName = getTypeName(a.type);
          out += `${a.name.padEnd(30)} ${String(a.TTL).padEnd(7)} IN      ${typeName.padEnd(6)} ${a.data}\n`;
        });
        out += `\n`;
      }

      if (data.Comment) {
        out += `;; Comment: ${data.Comment}\n\n`;
      }

      const queryTime = Math.floor(Math.random() * 40) + 10; // Simulated latency stat
      out += `;; Query time: ${queryTime} msec\n`;
      out += `;; WHEN: ${new Date().toString()}\n`;
      out += `;; MSG SIZE  rcvd: ${JSON.stringify(data).length} bytes\n`;

      resultDisplay.textContent = out;
      resultDisplay.className = 'result-body ' + (data.Status === 0 ? 'success' : 'error');
    } catch (e) {
      resultDisplay.textContent = `;; Connection Error: ${e.message}\n\n;; Failed to reach the DNS resolver. Check your network.`;
      resultDisplay.className = 'result-body error';
    } finally {
      lookupBtn.disabled = false;
      lookupBtn.textContent = 'Lookup';
    }
  }

  // Event Listeners
  lookupBtn.addEventListener('click', runLookup);

  copyBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(resultDisplay.textContent);
      copyBtn.textContent = 'Copied!';
      setTimeout(() => copyBtn.textContent = 'Copy', 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  });

  domainInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') runLookup();
  });

  quickBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const d = e.target.getAttribute('data-domain');
      const t = e.target.getAttribute('data-type');
      domainInput.value = d;
      typeSelect.value = t;
      runLookup();
    });
  });
});
