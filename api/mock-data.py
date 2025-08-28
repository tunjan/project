#!/usr/bin/env python3
"""
Vercel serverless function to generate mock data on-demand.
This replaces the need to store large mockData.ts files in the repository.
"""

import json
import sys
import os
from pathlib import Path
from http.server import BaseHTTPRequestHandler
from typing import Dict, Any

# Add the project root to Python path
project_root = Path(__file__).parent.parent.parent
sys.path.insert(0, str(project_root))

try:
    from mock_data.config import GenerationConfig
    from mock_data.export_formats import ScenarioManager
    from generate_mock_data_enhanced import EnhancedMockDataGenerator
except ImportError as e:
    print(f"Import error: {e}")
    # Fallback configuration for when imports fail
    class FallbackConfig:
        def __init__(self):
            self.chapters = 10
            self.users = 100
            self.seed = 42
            self.scenario_name = 'small_test'
            self.export_formats = ['json']
            self.output_path = None
            self.enable_performance_profiling = False
            self.enable_data_repair = True
            self.include_edge_cases = False
            self.validate = lambda: True
    
    GenerationConfig = FallbackConfig
    ScenarioManager = None
    EnhancedMockDataGenerator = None

def generate_mock_data(scenario: str = 'small_test') -> Dict[str, Any]:
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

def handle_request(method: str, path: str, headers: Dict[str, str], body: str = None) -> tuple[int, Dict[str, str], str]:
    """
    Handle HTTP request and return response.
    
    Args:
        method: HTTP method (GET, POST, etc.)
        path: Request path
        headers: Request headers
        body: Request body
        
    Returns:
        Tuple of (status_code, headers, body)
    """
    # Set CORS headers
    response_headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    }
    
    # Handle preflight OPTIONS request
    if method == 'OPTIONS':
        return 200, response_headers, ''
    
    # Only allow GET requests
    if method != 'GET':
        return 405, response_headers, json.dumps({'error': 'Method not allowed'})
    
    # Parse query parameters
    scenario = 'minimal'  # Default to minimal data for faster response
    if 'scenario' in headers.get('query', {}):
        scenario = headers['query']['scenario']
    
    try:
        # Generate mock data
        data = generate_mock_data(scenario)
        
        # Return the data as JSON
        return 200, response_headers, json.dumps(data, default=str)
        
    except Exception as e:
        error_response = {
            'error': 'Failed to generate mock data',
            'message': str(e),
            'fallback_data': generate_mock_data('minimal')
        }
        return 500, response_headers, json.dumps(error_response, default=str)

# Vercel serverless function entry point
def handler(request, context):
    """Main handler for Vercel serverless function."""
    try:
        # Extract request details
        method = request.method
        path = request.url.split('/')[-1] if request.url else '/'
        headers = dict(request.headers) if hasattr(request, 'headers') else {}
        body = request.body.decode('utf-8') if hasattr(request, 'body') and request.body else None
        
        # Handle the request
        status_code, response_headers, response_body = handle_request(method, path, headers, body)
        
        # Return response in Vercel format
        return {
            'statusCode': status_code,
            'headers': response_headers,
            'body': response_body
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Internal server error', 'message': str(e)})
        }

# For local testing
if __name__ == '__main__':
    class MockRequest:
        def __init__(self):
            self.method = 'GET'
            self.url = '/'
            self.headers = {}
            self.body = None
    
    class MockContext:
        pass
    
    request = MockRequest()
    context = MockContext()
    
    result = handler(request, context)
    print(f"Status: {result['statusCode']}")
    print(f"Headers: {result['headers']}")
    print(f"Body: {result['body'][:500]}...")
