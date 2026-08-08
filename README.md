# Live DNS Explorer

Live DNS Explorer is a simple, modern web application that allows you to query real DNS records directly from your browser using DNS-over-HTTPS (DoH) APIs from Google and Cloudflare. 

It provides an intuitive interface to look up various DNS record types (A, AAAA, CNAME, MX, TXT, NS, SOA, PTR) without needing command-line tools like `dig` or `nslookup`.

## Features
- **Real-time DNS Queries**: Uses Google (8.8.8.8) and Cloudflare (1.1.1.1) DNS-over-HTTPS endpoints.
- **Multiple Record Types**: Supports querying A, AAAA, CNAME, MX, TXT, NS, SOA, and PTR records.
- **Terminal-like Results Viewer**: View raw JSON responses with syntax highlighting in a clean terminal-style output.
- **Quick Actions**: One-click lookup for common domains and records.
- **Copy Functionality**: Easily copy the results to your clipboard.

## Project Structure
```
.
├── index.html
├── assets/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   └── script.js
│   └── images/
│       ├── dns-toolkit-icon.png
│       ├── dns-toolkit-icon.svg
│       └── ...
└── README.md
```

## How to use
Simply open `index.html` in any modern web browser. No server setup or build process is required.

## Technologies Used
- HTML5
- CSS3 (Vanilla CSS with Custom Properties and Modern Layouts)
- JavaScript (Vanilla ES6, Fetch API)
