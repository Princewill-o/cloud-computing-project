#!/usr/bin/env python3
"""
GitHub Webhook Server for Auto-Updates
This creates a webhook endpoint that GitHub can call when code is pushed
"""

import os
import sys
import json
import hmac
import hashlib
import subprocess
import threading
from datetime import datetime
from http.server import HTTPServer, BaseHTTPRequestHandler

# Configuration
WEBHOOK_PORT = 9000
WEBHOOK_SECRET = os.environ.get('WEBHOOK_SECRET', 'your-webhook-secret-here')
ALLOWED_BRANCHES = ['main', 'master', 'develop']  # Branches that trigger updates

class WebhookHandler(BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        """Custom logging with timestamps"""
        timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        print(f"[{timestamp}] {format % args}")

    def do_POST(self):
        """Handle POST requests from GitHub webhooks"""
        if self.path != '/webhook':
            self.send_response(404)
            self.end_headers()
            return

        # Get content length
        content_length = int(self.headers.get('Content-Length', 0))
        if content_length == 0:
            self.send_response(400)
            self.end_headers()
            return

        # Read the payload
        payload = self.rfile.read(content_length)
        
        # Verify GitHub signature if secret is set
        if WEBHOOK_SECRET and WEBHOOK_SECRET != 'your-webhook-secret-here':
            signature = self.headers.get('X-Hub-Signature-256', '')
            if not self.verify_signature(payload, signature):
                self.log_message("❌ Invalid signature")
                self.send_response(401)
                self.end_headers()
                return

        try:
            # Parse JSON payload
            data = json.loads(payload.decode('utf-8'))
            
            # Check if this is a push event
            if self.headers.get('X-GitHub-Event') != 'push':
                self.log_message("ℹ️  Ignoring non-push event: %s", self.headers.get('X-GitHub-Event'))
                self.send_response(200)
                self.end_headers()
                return

            # Get branch name
            ref = data.get('ref', '')
            branch = ref.replace('refs/heads/', '') if ref.startswith('refs/heads/') else ''
            
            if branch not in ALLOWED_BRANCHES:
                self.log_message("ℹ️  Ignoring push to branch: %s", branch)
                self.send_response(200)
                self.end_headers()
                return

            self.log_message("🔄 Received push to %s branch", branch)
            
            # Trigger update in background thread
            threading.Thread(target=self.trigger_update, args=(data,)).start()
            
            # Send success response
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            response = {
                'status': 'success',
                'message': f'Update triggered for branch {branch}',
                'timestamp': datetime.now().isoformat()
            }
            self.wfile.write(json.dumps(response).encode('utf-8'))
            
        except json.JSONDecodeError:
            self.log_message("❌ Invalid JSON payload")
            self.send_response(400)
            self.end_headers()
        except Exception as e:
            self.log_message("❌ Error processing webhook: %s", str(e))
            self.send_response(500)
            self.end_headers()

    def do_GET(self):
        """Handle GET requests for health check"""
        if self.path == '/health':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            response = {
                'status': 'healthy',
                'service': 'CV Paraphrasing Platform Webhook',
                'timestamp': datetime.now().isoformat(),
                'allowed_branches': ALLOWED_BRANCHES
            }
            self.wfile.write(json.dumps(response, indent=2).encode('utf-8'))
        else:
            self.send_response(404)
            self.end_headers()

    def verify_signature(self, payload, signature):
        """Verify GitHub webhook signature"""
        if not signature.startswith('sha256='):
            return False
        
        expected_signature = 'sha256=' + hmac.new(
            WEBHOOK_SECRET.encode('utf-8'),
            payload,
            hashlib.sha256
        ).hexdigest()
        
        return hmac.compare_digest(signature, expected_signature)

    def trigger_update(self, webhook_data):
        """Trigger the update process"""
        try:
            self.log_message("🚀 Starting auto-update process...")
            
            # Run the auto-update script
            result = subprocess.run(
                ['./auto-update.sh'],
                capture_output=True,
                text=True,
                cwd=os.path.dirname(os.path.abspath(__file__))
            )
            
            if result.returncode == 0:
                self.log_message("✅ Auto-update completed successfully")
                if result.stdout:
                    print(result.stdout)
            else:
                self.log_message("❌ Auto-update failed with code %d", result.returncode)
                if result.stderr:
                    print("Error output:", result.stderr)
                    
        except Exception as e:
            self.log_message("❌ Error running auto-update: %s", str(e))

def main():
    """Start the webhook server"""
    print(f"🚀 Starting CV Paraphrasing Platform Webhook Server")
    print(f"📡 Listening on port {WEBHOOK_PORT}")
    print(f"🌿 Monitoring branches: {', '.join(ALLOWED_BRANCHES)}")
    print(f"🔐 Webhook secret: {'✅ Configured' if WEBHOOK_SECRET != 'your-webhook-secret-here' else '⚠️  Using default (insecure)'}")
    print(f"🏥 Health check: http://localhost:{WEBHOOK_PORT}/health")
    print(f"🪝 Webhook URL: http://localhost:{WEBHOOK_PORT}/webhook")
    print("Press Ctrl+C to stop")
    
    server = HTTPServer(('0.0.0.0', WEBHOOK_PORT), WebhookHandler)
    
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n🛑 Shutting down webhook server...")
        server.shutdown()

if __name__ == '__main__':
    main()