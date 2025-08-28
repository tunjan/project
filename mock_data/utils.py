"""
Utility functions for mock data generation.
Includes validation, serialization, and helper functions.
"""

import json
import copy
from datetime import datetime, date
from typing import Dict, List, Any, Optional
from pathlib import Path


class CustomEncoder(json.JSONEncoder):
    """Custom JSON encoder for datetime and other special types."""
    
    def default(self, obj):
        if isinstance(obj, (datetime, date)):
            return f'new Date("{obj.isoformat()}")'
        # This is a fallback for enums if they are not pre-converted to strings
        if hasattr(obj, 'value'):
             return obj.value
        return super().default(obj)


class DataValidator:
    """Validates generated mock data for consistency and completeness."""
    
    @staticmethod
    def validate_users(users: List[Dict[str, Any]]) -> List[str]:
        """Validate user data and return list of issues found."""
        issues = []
        
        user_ids = set()
        for i, user in enumerate(users):
            # Check required fields
            required_fields = ['id', 'name', 'email', 'role', 'chapters', 'stats']
            for field in required_fields:
                if field not in user:
                    issues.append(f"User {i}: Missing required field '{field}'")
            
            # Check for duplicate IDs
            if user.get('id') in user_ids:
                issues.append(f"User {i}: Duplicate ID '{user.get('id')}'")
            user_ids.add(user.get('id'))
            
            # Validate email format
            email = user.get('email', '')
            if email and '@' not in email:
                issues.append(f"User {i}: Invalid email format '{email}'")
            
            # Validate stats structure
            stats = user.get('stats', {})
            required_stats = ['totalHours', 'cubesAttended', 'veganConversions', 'totalConversations', 'cities']
            for stat in required_stats:
                if stat not in stats:
                    issues.append(f"User {i}: Missing stat '{stat}'")
        
        return issues
    
    @staticmethod
    def validate_events(events: List[Dict[str, Any]], users: List[Dict[str, Any]]) -> List[str]:
        """Validate event data and return list of issues found."""
        issues = []
        user_ids = {u['id'] for u in users}
        
        for i, event in enumerate(events):
            # Check required fields
            required_fields = ['id', 'name', 'city', 'startDate', 'organizer', 'participants', 'status']
            for field in required_fields:
                if field not in event:
                    issues.append(f"Event {i}: Missing required field '{field}'")
            
            # Validate organizer exists
            organizer = event.get('organizer', {})
            if organizer.get('id') not in user_ids:
                issues.append(f"Event {i}: Organizer ID '{organizer.get('id')}' not found in users")
            
            # Validate participants
            participants = event.get('participants', [])
            for j, participant in enumerate(participants):
                user = participant.get('user', {})
                if user.get('id') not in user_ids:
                    issues.append(f"Event {i}, Participant {j}: User ID '{user.get('id')}' not found")
        
        return issues
    
    @staticmethod
    def validate_relationships(data: Dict[str, List[Dict[str, Any]]]) -> List[str]:
        """Validate relationships between different data entities."""
        issues = []
        
        users = data.get('users', [])
        events = data.get('events', [])
        chapters = data.get('chapters', [])
        outreach_logs = data.get('outreach_logs', [])
        
        user_ids = {u['id'] for u in users}
        event_ids = {e['id'] for e in events}
        chapter_names = {c['name'] for c in chapters}
        
        # Validate user chapters exist
        for i, user in enumerate(users):
            for chapter in user.get('chapters', []):
                if chapter not in chapter_names:
                    issues.append(f"User {i}: Chapter '{chapter}' not found")
        
        # Validate outreach logs reference valid users and events
        for i, log in enumerate(outreach_logs):
            if log.get('userId') not in user_ids:
                issues.append(f"Outreach log {i}: User ID '{log.get('userId')}' not found")
            if log.get('eventId') not in event_ids:
                issues.append(f"Outreach log {i}: Event ID '{log.get('eventId')}' not found")
        
        return issues


class DataSerializer:
    """Handles serialization of mock data to different formats."""
    
    @staticmethod
    def create_lite_user(user: Optional[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
        """Create a lightweight user object for references."""
        if not user:
            return None
        
        return user
    
    @staticmethod
    def create_lite_event(event: Optional[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
        """Create a lightweight event object for references."""
        if not event:
            return None
        
        return {
            'id': event['id'],
            'city': event['city'],
            'location': event['location'],
            'startDate': event['startDate']
        }
    
    @staticmethod
    def prepare_for_serialization(data: Dict[str, List[Dict[str, Any]]]) -> Dict[str, List[Dict[str, Any]]]:
        """Prepare data for serialization by creating lite references."""
        # Deep copy to avoid modifying original data
        serialized_data = {}
        
        # Users don't need modification
        serialized_data['users'] = copy.deepcopy(data['users'])
        serialized_data['chapters'] = copy.deepcopy(data['chapters'])
        serialized_data['resources'] = copy.deepcopy(data['resources'])
        serialized_data['outreach_logs'] = copy.deepcopy(data['outreach_logs'])
        serialized_data['inventory'] = copy.deepcopy(data['inventory'])
        serialized_data['challenges'] = copy.deepcopy(data['challenges'])
        
        # Events need organizer and participant references converted
        serialized_data['events'] = []
        for event in data['events']:
            event_copy = copy.deepcopy(event)
            event_copy['organizer'] = DataSerializer.create_lite_user(event['organizer'])
            
            for participant in event_copy['participants']:
                participant['user'] = DataSerializer.create_lite_user(participant['user'])
            
            serialized_data['events'].append(event_copy)
        
        # Announcements need author references
        serialized_data['announcements'] = []
        for announcement in data.get('announcements', []):
            ann_copy = copy.deepcopy(announcement)
            ann_copy['author'] = DataSerializer.create_lite_user(announcement['author'])
            serialized_data['announcements'].append(ann_copy)
        
        # Accommodation requests need user and event references
        serialized_data['accommodation_requests'] = []
        for request in data.get('accommodation_requests', []):
            req_copy = copy.deepcopy(request)
            req_copy['requester'] = DataSerializer.create_lite_user(request['requester'])
            req_copy['host'] = DataSerializer.create_lite_user(request['host'])
            req_copy['event'] = DataSerializer.create_lite_event(request['event'])
            serialized_data['accommodation_requests'].append(req_copy)
        
        # Event comments need author references
        serialized_data['event_comments'] = []
        for comment in data.get('event_comments', []):
            comment_copy = copy.deepcopy(comment)
            comment_copy['author'] = DataSerializer.create_lite_user(comment['author'])
            serialized_data['event_comments'].append(comment_copy)
        
        # Notifications need related user references
        serialized_data['notifications'] = []
        for notification in data.get('notifications', []):
            notif_copy = copy.deepcopy(notification)
            notif_copy['relatedUser'] = DataSerializer.create_lite_user(notification.get('relatedUser'))
            serialized_data['notifications'].append(notif_copy)
        
        # Badge awards need awarder and recipient references
        serialized_data['badge_awards'] = []
        for award in data.get('badge_awards', []):
            award_copy = copy.deepcopy(award)
            award_copy['awarder'] = DataSerializer.create_lite_user(award['awarder'])
            award_copy['recipient'] = DataSerializer.create_lite_user(award['recipient'])
            serialized_data['badge_awards'].append(award_copy)
        
        # Chapter join requests need user references
        serialized_data['chapter_join_requests'] = []
        for request in data.get('chapter_join_requests', []):
            req_copy = copy.deepcopy(request)
            req_copy['user'] = DataSerializer.create_lite_user(request['user'])
            serialized_data['chapter_join_requests'].append(req_copy)
        
        return serialized_data
    
    @staticmethod
    def write_typescript_file(data: Dict[str, List[Dict[str, Any]]], output_path: str):
        """Write data to TypeScript file format."""

        def to_ts(obj, indent=2):
            if obj is None:
                return 'null'
            if isinstance(obj, bool):
                return 'true' if obj else 'false'
            if isinstance(obj, (int, float)):
                return str(obj)
            if isinstance(obj, (datetime, date)):
                return f'new Date("{obj.isoformat()}")'
            if 'Role' in str(type(obj)): # For Role Enums
                return f'Role.{obj.name}'
            if isinstance(obj, str):
                return json.dumps(obj, ensure_ascii=False)

            if isinstance(obj, list):
                if not obj:
                    return '[]'
                items = [to_ts(item, indent + 2) for item in obj]
                return f'[{', '.join(items)}]' # Keep simple arrays on one line

            if isinstance(obj, dict):
                if not obj:
                    return '{}'
                
                indent_str = ' ' * indent
                indent_str_inner = ' ' * (indent + 2)
                items = []
                for k, v in obj.items():
                    key_str = json.dumps(k, ensure_ascii=False)
                    val_str = to_ts(v, indent + 2)
                    items.append(f'{indent_str_inner}{key_str}: {val_str}')
                
                return f'{{\n' + ',\n'.join(items) + f'\n{indent_str}}}'

            return json.dumps(str(obj)) # Fallback

        def write_data_export(data_list: List[Dict[str, Any]], name: str, type_name: str) -> str:
            ts_str = to_ts(data_list)
            return f"export const MOCK_{name.upper()}: {type_name}[] = {ts_str};"

        # Generate TypeScript content
        content = """// This file is auto-generated by the enhanced mock data generator. Do not edit manually.
import {
  User, Chapter, CubeEvent, Announcement, Resource, OutreachLog, 
  AccommodationRequest, EventComment, Challenge, Notification, 
  BadgeAward, InventoryItem, ChapterJoinRequest, Role
} from './types';

"""
        
        # Add each data export
        exports = [
            (data['users'], 'users', 'User'),
            (data['chapters'], 'chapters', 'Chapter'),
            (data['events'], 'cube_events', 'CubeEvent'),
            (data.get('announcements', []), 'announcements', 'Announcement'),
            (data['resources'], 'resources', 'Resource'),
            (data['outreach_logs'], 'outreach_logs', 'OutreachLog'),
            (data.get('accommodation_requests', []), 'accommodation_requests', 'AccommodationRequest'),
            (data.get('event_comments', []), 'event_comments', 'EventComment'),
            (data.get('challenges', []), 'challenges', 'Challenge'),
            (data.get('notifications', []), 'notifications', 'Notification'),
            (data.get('badge_awards', []), 'badge_awards', 'BadgeAward'),
            (data['inventory'], 'inventory', 'InventoryItem'),
            (data.get('chapter_join_requests', []), 'chapter_join_requests', 'ChapterJoinRequest')
        ]
        
        for data_list, name, type_name in exports:
            if data_list:
                content += write_data_export(data_list, name, type_name) + "\n\n"
        
        # Write to file
        output_file = Path(output_path)
        output_file.parent.mkdir(parents=True, exist_ok=True)
        output_file.write_text(content, encoding='utf-8')
        
        return str(output_file.absolute())


class ProgressTracker:
    """Tracks and reports progress during data generation."""
    
    def __init__(self):
        self.steps = []
        self.current_step = 0
    
    def add_step(self, name: str, description: str = ""):
        """Add a step to track."""
        self.steps.append({
            'name': name,
            'description': description,
            'completed': False,
            'start_time': None,
            'end_time': None
        })
    
    def start_step(self, step_index: int):
        """Mark a step as started."""
        if 0 <= step_index < len(self.steps):
            self.steps[step_index]['start_time'] = datetime.now()
            self.current_step = step_index
    
    def complete_step(self, step_index: int, message: str = ""):
        """Mark a step as completed."""
        if 0 <= step_index < len(self.steps):
            step = self.steps[step_index]
            step['completed'] = True
            step['end_time'] = datetime.now()
            
            if step['start_time']:
                duration = (step['end_time'] - step['start_time']).total_seconds()
                print(f"✅ {step['name']} completed in {duration:.2f}s")
                if message:
                    print(f"   {message}")
            else:
                print(f"✅ {step['name']} completed")
    
    def get_progress(self) -> Dict[str, Any]:
        """Get current progress information."""
        completed = sum(1 for step in self.steps if step['completed'])
        total = len(self.steps)
        
        return {
            'completed_steps': completed,
            'total_steps': total,
            'progress_percentage': (completed / total * 100) if total > 0 else 0,
            'current_step': self.current_step,
            'steps': self.steps
        }


def format_number(num: int) -> str:
    """Format numbers with thousand separators."""
    return f"{num:,}"


def calculate_data_stats(data: Dict[str, List[Dict[str, Any]]]) -> Dict[str, Any]:
    """Calculate statistics about the generated data."""
    stats = {}
    
    for key, items in data.items():
        stats[key] = {
            'count': len(items),
            'size_kb': len(json.dumps(items, cls=CustomEncoder)) / 1024
        }
    
    # Calculate total statistics
    total_entities = sum(stat['count'] for stat in stats.values())
    total_size_kb = sum(stat['size_kb'] for stat in stats.values())
    
    stats['_totals'] = {
        'total_entities': total_entities,
        'total_size_kb': total_size_kb,
        'total_size_mb': total_size_kb / 1024
    }
    
    return stats
