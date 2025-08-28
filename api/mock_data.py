#!/usr/bin/env python3
"""
Vercel serverless function to generate mock data on-demand.
This replaces the need to store large mockData.ts files in the repository.
"""

import json
import sys
from pathlib import Path
from http.server import BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs

# Add the project root to Python path for Vercel's environment
# When this file runs, its path is /var/task/api/mock_data.py
# The project root is /var/task/, so we go up two levels.
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

# Import the generation logic from your existing scripts
try:
    from mock_data.config import GenerationConfig
    from mock_data.export_formats import ScenarioManager
    from generate_mock_data_enhanced import EnhancedMockDataGenerator
except ImportError as e:
    print(f"❌ Could not import mock data generator: {e}")
    # Define a dummy function if import fails, so the server doesn't crash
    def generate_mock_data(scenario='minimal'):
        return {"error": "Failed to import generator", "details": str(e)}

def generate_mock_data(scenario: str = 'minimal'):
    """
    Generate mock data using the existing generator infrastructure.
    
    Args:
        scenario: The scenario to use for data generation
        
    Returns:
        Dictionary containing all generated mock data
    """
    try:
        # Create configuration
        config = GenerationConfig()
        config.scenario_name = scenario
        config.export_formats = ['json']
        config.output_path = None  # Don't write to file
        
        # Apply scenario configuration if available
        if ScenarioManager and config.scenario_name != 'default':
            config = ScenarioManager.get_scenario_config(config.scenario_name, config)
        
        # Validate configuration
        if hasattr(config, 'validate'):
            config.validate()
        
        # Generate data
        generator = EnhancedMockDataGenerator(config)
        data = generator.generate_all_data()
        
        # Validate and check consistency
        if hasattr(generator, 'validate_data'):
            generator.validate_data()
        if hasattr(generator, 'check_consistency'):
            generator.check_consistency()
        
        return data
        
    except Exception as e:
        print(f"Error generating mock data: {e}")
        # Return minimal fallback data
        return {
            "chapters": [],
            "users": [],
            "events": [],
            "outreachLogs": [],
            "announcements": [],
            "resources": [],
            "notifications": [],
            "badges": [],
            "inventory": [],
            "challenges": [],
            "error": str(e)
        }

# Vercel expects a class named "handler" that inherits from BaseHTTPRequestHandler
class handler(BaseHTTPRequestHandler):
    """Handles incoming requests for the mock data API on Vercel."""

    def do_GET(self):
        """Handle GET requests."""
        parsed_url = urlparse(self.path)
        query_params = parse_qs(parsed_url.query)
        
        # Get scenario from query params, default to 'minimal' for speed
        scenario = query_params.get('scenario', ['minimal'])[0]
        
        try:
            # Generate mock data
            data = generate_mock_data(scenario)
            
            # Send success response
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            response_body = json.dumps(data, default=str)
            self.wfile.write(response_body.encode('utf-8'))
            
        except Exception as e:
            # Send error response
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            error_response = json.dumps({'error': 'Failed to generate data', 'details': str(e)})
            self.wfile.write(error_response.encode('utf-8'))

    def do_OPTIONS(self):
        """Handle preflight OPTIONS requests for CORS."""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
