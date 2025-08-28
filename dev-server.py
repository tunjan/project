#!/usr/bin/env python3
"""
Simple development server to test the mock data API locally.
This allows you to test the API before deploying to Vercel.
"""

import json
import sys
from pathlib import Path
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs

# Add the project root to Python path
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

try:
    from api.mock_data.index import generate_mock_data
except ImportError:
    print("❌ Could not import mock data generator. Make sure all dependencies are installed.")
    print("Run: pip install -r requirements.txt")
    sys.exit(1)

class MockDataHandler(BaseHTTPRequestHandler):
    """HTTP request handler for the mock data API."""
    
    def do_GET(self):
        """Handle GET requests."""
        # Parse URL and query parameters
        parsed_url = urlparse(self.path)
        query_params = parse_qs(parsed_url.query)
        
        # Get scenario from query params
        scenario = query_params.get('scenario', ['small_test'])[0]
        
        # Set CORS headers
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
        
        try:
            # Generate mock data
            print(f"🚀 Generating mock data for scenario: {scenario}")
            data = generate_mock_data(scenario)
            
            # Convert to JSON and send response
            response = json.dumps(data, default=str)
            self.wfile.write(response.encode('utf-8'))
            
            print(f"✅ Generated {len(data.get('chapters', []))} chapters, {len(data.get('users', []))} users")
            
        except Exception as e:
            print(f"❌ Error generating mock data: {e}")
            error_response = {
                'error': 'Failed to generate mock data',
                'message': str(e)
            }
            self.wfile.write(json.dumps(error_response).encode('utf-8'))
    
    def do_OPTIONS(self):
        """Handle preflight OPTIONS requests."""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
    
    def log_message(self, format, *args):
        """Custom logging to show API requests."""
        print(f"🌐 {format % args}")

def main():
    """Start the development server."""
    port = 3000
    
    try:
        server = HTTPServer(('localhost', port), MockDataHandler)
        print(f"🚀 Mock Data API server starting on http://localhost:{port}")
        print(f"📊 Available endpoints:")
        print(f"   GET /?scenario=small_test")
        print(f"   GET /?scenario=medium_test")
        print(f"   GET /?scenario=high_activity")
        print(f"   GET /?scenario=stress_test")
        print(f"   GET /?scenario=realistic")
        print(f"\n💡 Test with: curl 'http://localhost:{port}/?scenario=small_test'")
        print(f"🔄 Press Ctrl+C to stop the server")
        print("=" * 60)
        
        server.serve_forever()
        
    except KeyboardInterrupt:
        print(f"\n🛑 Server stopped by user")
    except Exception as e:
        print(f"❌ Server error: {e}")

if __name__ == '__main__':
    main()
