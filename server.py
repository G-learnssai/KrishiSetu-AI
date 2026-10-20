#!/usr/bin/env python3
"""
KrishiSetu AI - Local Development Server
Zero-dependency HTTP server using Python's built-in standard library.
"""

import http.server
import socketserver
import webbrowser
import os
import sys

# Ensure UTF-8 output on Windows consoles
if sys.platform.startswith("win"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

PORT = 8000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

def run():
    os.chdir(DIRECTORY)
    # Allow port reuse immediately if restarted
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        url = f"http://localhost:{PORT}"
        print("=" * 60)
        print("  KrishiSetu AI - Bridging Farmers to Prosperity")
        print("=" * 60)
        print(f"  [+] Server running at: {url}")
        print(f"  [+] Serving directory: {DIRECTORY}")
        print("  [+] Opening web browser automatically...")
        print("  [+] Press Ctrl+C in this terminal to stop the server.")
        print("=" * 60)
        try:
            webbrowser.open(url)
        except Exception:
            pass
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n  [!] KrishiSetu AI server stopped. Happy Farming!")
            sys.exit(0)

if __name__ == "__main__":
    run()
