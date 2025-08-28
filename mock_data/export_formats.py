"""
Multiple export format support for mock data.
Supports TypeScript, JSON, CSV, and SQL formats with proper serialization.
"""

import json
import csv
from pathlib import Path
from typing import Dict, List, Any, Optional
from datetime import datetime, date
import sqlite3

from .utils import CustomEncoder


class DataExporter:
    """Handles exporting data to multiple formats."""
    
    def __init__(self, data: Dict[str, List[Dict[str, Any]]], output_dir: str = "output"):
        self.data = data
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(exist_ok=True)
    
    def export_all_formats(self, formats: List[str]) -> Dict[str, str]:
        """Export data to all specified formats."""
        exported_files = {}
        
        for format_name in formats:
            if format_name == 'typescript':
                exported_files['typescript'] = self.export_typescript()
            elif format_name == 'json':
                exported_files['json'] = self.export_json()
            elif format_name == 'csv':
                exported_files['csv'] = self.export_csv()
            elif format_name == 'sql':
                exported_files['sql'] = self.export_sql()
        
        return exported_files
    
    def export_typescript(self) -> str:
        """Export to TypeScript format (existing functionality)."""
        from .utils import DataSerializer
        
        serializer = DataSerializer()
        serialized_data = serializer.prepare_for_serialization(self.data)
        output_path = self.output_dir / "mockData.ts"
        
        return serializer.write_typescript_file(serialized_data, str(output_path))
    
    def export_json(self) -> str:
        """Export to JSON format."""
        output_path = self.output_dir / "mockData.json"
        
        # Prepare data for JSON serialization
        json_data = {}
        for key, items in self.data.items():
            json_data[key] = self._prepare_for_json(items)
        
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(json_data, f, cls=CustomEncoder, indent=2, ensure_ascii=False)
        
        return str(output_path.absolute())
    
    def export_csv(self) -> str:
        """Export to CSV format (separate files per entity type)."""
        csv_dir = self.output_dir / "csv"
        csv_dir.mkdir(exist_ok=True)
        
        exported_files = []
        
        for entity_type, items in self.data.items():
            if not items:
                continue
            
            csv_path = csv_dir / f"{entity_type}.csv"
            self._write_csv_file(items, csv_path)
            exported_files.append(str(csv_path))
        
        return f"CSV files exported to {csv_dir}"
    
    def export_sql(self) -> str:
        """Export to SQLite database."""
        db_path = self.output_dir / "mockData.db"
        
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        try:
            # Create tables and insert data
            for entity_type, items in self.data.items():
                if not items:
                    continue
                
                self._create_sql_table(cursor, entity_type, items)
                self._insert_sql_data(cursor, entity_type, items)
            
            conn.commit()
        finally:
            conn.close()
        
        return str(db_path.absolute())
    
    def _prepare_for_json(self, items: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Prepare items for JSON serialization by flattening complex objects."""
        prepared_items = []
        
        for item in items:
            prepared_item = {}
            for key, value in item.items():
                if isinstance(value, dict) and 'id' in value:
                    # Replace object references with IDs
                    prepared_item[f"{key}_id"] = value['id']
                elif isinstance(value, list) and value and isinstance(value[0], dict) and 'id' in value[0]:
                    # Replace list of objects with list of IDs
                    prepared_item[f"{key}_ids"] = [obj['id'] for obj in value]
                else:
                    prepared_item[key] = value
            
            prepared_items.append(prepared_item)
        
        return prepared_items
    
    def _write_csv_file(self, items: List[Dict[str, Any]], file_path: Path):
        """Write items to CSV file."""
        if not items:
            return
        
        # Flatten nested objects for CSV
        flattened_items = []
        for item in items:
            flattened_item = self._flatten_dict(item)
            flattened_items.append(flattened_item)
        
        # Get all possible fieldnames
        fieldnames = set()
        for item in flattened_items:
            fieldnames.update(item.keys())
        
        fieldnames = sorted(list(fieldnames))
        
        with open(file_path, 'w', newline='', encoding='utf-8') as csvfile:
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            writer.writeheader()
            
            for item in flattened_items:
                # Convert datetime objects to strings
                csv_item = {}
                for key, value in item.items():
                    if isinstance(value, (datetime, date)):
                        csv_item[key] = value.isoformat()
                    elif isinstance(value, list):
                        csv_item[key] = json.dumps(value)
                    elif isinstance(value, dict):
                        csv_item[key] = json.dumps(value)
                    else:
                        csv_item[key] = value
                
                writer.writerow(csv_item)
    
    def _flatten_dict(self, d: Dict[str, Any], parent_key: str = '', sep: str = '_') -> Dict[str, Any]:
        """Flatten nested dictionary for CSV export."""
        items = []
        
        for k, v in d.items():
            new_key = f"{parent_key}{sep}{k}" if parent_key else k
            
            if isinstance(v, dict) and 'id' in v:
                # Replace object with ID reference
                items.append((f"{new_key}_id", v['id']))
                items.append((f"{new_key}_name", v.get('name', '')))
            elif isinstance(v, dict):
                items.extend(self._flatten_dict(v, new_key, sep=sep).items())
            elif isinstance(v, list) and v and isinstance(v[0], dict) and 'id' in v[0]:
                # Replace list of objects with comma-separated IDs
                items.append((f"{new_key}_ids", ','.join(obj['id'] for obj in v)))
            else:
                items.append((new_key, v))
        
        return dict(items)
    
    def _create_sql_table(self, cursor: sqlite3.Cursor, table_name: str, items: List[Dict[str, Any]]):
        """Create SQL table for entity type."""
        if not items:
            return
        
        # Analyze first item to determine schema
        sample_item = items[0]
        columns = []
        
        for key, value in sample_item.items():
            if key == 'id':
                columns.append(f"{key} TEXT PRIMARY KEY")
            elif isinstance(value, str):
                columns.append(f"{key} TEXT")
            elif isinstance(value, int):
                columns.append(f"{key} INTEGER")
            elif isinstance(value, float):
                columns.append(f"{key} REAL")
            elif isinstance(value, bool):
                columns.append(f"{key} BOOLEAN")
            elif isinstance(value, (datetime, date)):
                columns.append(f"{key} DATETIME")
            elif isinstance(value, dict) and 'id' in value:
                columns.append(f"{key}_id TEXT")
            elif isinstance(value, list):
                columns.append(f"{key} TEXT")  # Store as JSON
            else:
                columns.append(f"{key} TEXT")
        
        create_sql = f"CREATE TABLE IF NOT EXISTS {table_name} ({', '.join(columns)})"
        cursor.execute(create_sql)
    
    def _insert_sql_data(self, cursor: sqlite3.Cursor, table_name: str, items: List[Dict[str, Any]]):
        """Insert data into SQL table."""
        if not items:
            return
        
        for item in items:
            # Prepare item for SQL insertion
            sql_item = {}
            for key, value in item.items():
                if isinstance(value, dict) and 'id' in value:
                    sql_item[f"{key}_id"] = value['id']
                elif isinstance(value, (list, dict)):
                    sql_item[key] = json.dumps(value, cls=CustomEncoder)
                elif isinstance(value, (datetime, date)):
                    sql_item[key] = value.isoformat()
                else:
                    sql_item[key] = value
            
            # Create INSERT statement
            columns = list(sql_item.keys())
            placeholders = ['?' for _ in columns]
            values = [sql_item[col] for col in columns]
            
            insert_sql = f"INSERT OR REPLACE INTO {table_name} ({', '.join(columns)}) VALUES ({', '.join(placeholders)})"
            cursor.execute(insert_sql, values)


class ScenarioManager:
    """Manages predefined data generation scenarios for testing."""
    
    SCENARIOS = {
        'default': {
            'description': 'Standard balanced dataset for general use',
            'config_overrides': {}
        },
        'small_test': {
            'description': 'Small dataset for quick testing',
            'config_overrides': {
                'chapters': 5,
                'users': 25,
                'events_per_chapter': 3,
                'announcements': 5,
                'resources': 3
            }
        },
        'large_production': {
            'description': 'Large dataset simulating production environment',
            'config_overrides': {
                'chapters': 50,
                'users': 1000,
                'events_per_chapter': 10,
                'announcements': 50,
                'resources': 25,
                'badge_awards': 100
            }
        },
        'high_activity': {
            'description': 'Dataset with high user activity and engagement',
            'config_overrides': {
                'user_activity_weights': {'high': 0.6, 'medium': 0.3, 'low': 0.1},
                'comment_probability': 0.8,
                'join_request_probability': 0.3
            }
        },
        'international': {
            'description': 'Global dataset with diverse geographic distribution',
            'config_overrides': {
                'chapters': 30,
                'countries': [
                    'USA', 'UK', 'Germany', 'Australia', 'Canada', 'France', 
                    'Spain', 'Mexico', 'Netherlands', 'Sweden', 'Italy', 
                    'Japan', 'Brazil', 'India', 'South Africa'
                ]
            }
        },
        'new_organization': {
            'description': 'Simulates a new organization with mostly pending users',
            'config_overrides': {
                'role_distribution': {
                    'confirmed': 0.40,
                    'awaiting_verification': 0.25,
                    'pending_review': 0.30,
                    'denied': 0.05
                }
            }
        }
    }
    
    @classmethod
    def get_scenario_config(cls, scenario_name: str, base_config) -> 'GenerationConfig':
        """Get configuration for a specific scenario."""
        if scenario_name not in cls.SCENARIOS:
            raise ValueError(f"Unknown scenario: {scenario_name}")
        
        scenario = cls.SCENARIOS[scenario_name]
        
        # Apply overrides to base config
        for key, value in scenario['config_overrides'].items():
            if hasattr(base_config, key):
                setattr(base_config, key, value)
        
        return base_config
    
    @classmethod
    def list_scenarios(cls) -> Dict[str, str]:
        """List all available scenarios with descriptions."""
        return {name: data['description'] for name, data in cls.SCENARIOS.items()}


class DataConsistencyChecker:
    """Checks and repairs data consistency issues."""
    
    def __init__(self, data: Dict[str, List[Dict[str, Any]]]):
        self.data = data
        self.issues = []
        self.repairs = []
    
    def check_and_repair(self) -> Dict[str, Any]:
        """Check for consistency issues and attempt repairs."""
        self.issues = []
        self.repairs = []
        
        # Check user-event consistency
        self._check_user_event_consistency()
        
        # Check organizer assignments
        self._check_organizer_assignments()
        
        # Check badge consistency
        self._check_badge_consistency()
        
        # Check notification references
        self._check_notification_references()
        
        return {
            'issues_found': len(self.issues),
            'repairs_made': len(self.repairs),
            'issues': self.issues,
            'repairs': self.repairs
        }
    
    def _check_user_event_consistency(self):
        """Check that event participants exist in users list."""
        user_ids = {u['id'] for u in self.data['users']}
        
        for event in self.data['events']:
            # Check organizer
            if event['organizer']['id'] not in user_ids:
                self.issues.append(f"Event {event['id']}: Organizer {event['organizer']['id']} not found in users")
            
            # Check participants
            for participant in event['participants']:
                if participant['user']['id'] not in user_ids:
                    self.issues.append(f"Event {event['id']}: Participant {participant['user']['id']} not found in users")
    
    def _check_organizer_assignments(self):
        """Check that organizer roles are properly assigned."""
        for user in self.data['users']:
            if user['role'] in ['Chapter Organiser', 'Regional Organiser']:
                if 'organiserOf' not in user or not user['organiserOf']:
                    self.issues.append(f"User {user['id']}: Has organizer role but no organiserOf assignment")
                    
                    # Repair: Assign to their first chapter
                    if user['chapters']:
                        user['organiserOf'] = [user['chapters'][0]]
                        self.repairs.append(f"Assigned {user['id']} as organizer of {user['chapters'][0]}")
    
    def _check_badge_consistency(self):
        """Check that badge awards reference valid users and badges."""
        user_ids = {u['id'] for u in self.data['users']}
        
        for award in self.data.get('badge_awards', []):
            if award['recipient']['id'] not in user_ids:
                self.issues.append(f"Badge award {award['id']}: Recipient {award['recipient']['id']} not found")
            
            if award['awarder']['id'] not in user_ids:
                self.issues.append(f"Badge award {award['id']}: Awarder {award['awarder']['id']} not found")
    
    def _check_notification_references(self):
        """Check that notifications reference valid users."""
        user_ids = {u['id'] for u in self.data['users']}
        
        for notification in self.data.get('notifications', []):
            if notification['userId'] not in user_ids:
                self.issues.append(f"Notification {notification.get('id', 'unknown')}: User {notification['userId']} not found")
            
            if notification.get('relatedUser') and notification['relatedUser']['id'] not in user_ids:
                self.issues.append(f"Notification {notification.get('id', 'unknown')}: Related user {notification['relatedUser']['id']} not found")
