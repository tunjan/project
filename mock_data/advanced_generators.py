"""
Advanced generators for complex data relationships and missing entities.
Includes event comments, chapter join requests, and sophisticated cross-references.
"""

import random
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional, Tuple
from faker import Faker
from nanoid import generate

from .config import GenerationConfig
from .generators import BaseGenerator


class EventCommentGenerator(BaseGenerator):
    """Generates realistic event comments with threading and engagement patterns."""
    
    def __init__(self, config: GenerationConfig, events: List[Dict[str, Any]], users: List[Dict[str, Any]]):
        super().__init__(config)
        self.events = events
        self.users = users
        self.user_lookup = {u['id']: u for u in users}
    
    def generate_event_comments(self) -> List[Dict[str, Any]]:
        """Generate comments for events with realistic engagement patterns."""
        comments = []
        
        for event in self.events:
            if random.random() > self.config.comment_probability:
                continue
            
            event_comments = self._generate_comments_for_event(event)
            comments.extend(event_comments)
        
        return comments
    
    def _generate_comments_for_event(self, event: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate comments for a specific event."""
        comments = []
        participants = [p['user'] for p in event['participants'] if p['status'] == 'Attending']
        
        if not participants:
            return comments
        
        # Determine number of comments based on event size and status
        base_comments = random.randint(*self.config.comments_per_event_range)
        if event['status'] == 'Finished':
            base_comments = int(base_comments * 1.5)  # More comments on finished events
        
        num_comments = min(base_comments, len(participants))
        
        # Generate root comments
        comment_authors = random.sample(participants, num_comments)
        root_comments = []
        
        for i, author in enumerate(comment_authors):
            comment_time = self._get_comment_time(event, i == 0)
            content = self._generate_comment_content(event, author, is_root=True)
            
            comment = {
                'id': generate(),
                'eventId': event['id'],
                'author': author,
                'content': content,
                'createdAt': comment_time,
                'parentId': None
            }
            
            comments.append(comment)
            root_comments.append(comment)
        
        # Generate reply threads (30% chance per root comment)
        for root_comment in root_comments:
            if random.random() < 0.3:
                replies = self._generate_comment_replies(event, root_comment, participants)
                comments.extend(replies)
        
        return comments
    
    def _generate_comment_replies(self, event: Dict[str, Any], parent_comment: Dict[str, Any], 
                                 participants: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Generate replies to a parent comment."""
        replies = []
        num_replies = random.randint(1, 3)
        
        # Exclude parent author from potential repliers
        potential_repliers = [p for p in participants if p['id'] != parent_comment['author']['id']]
        if not potential_repliers:
            return replies
        
        reply_authors = random.sample(potential_repliers, min(num_replies, len(potential_repliers)))
        
        for i, author in enumerate(reply_authors):
            reply_time = parent_comment['createdAt'] + timedelta(
                minutes=random.randint(5, 120)
            )
            
            content = self._generate_comment_content(event, author, is_root=False, parent_author=parent_comment['author'])
            
            reply = {
                'id': generate(),
                'eventId': event['id'],
                'author': author,
                'content': content,
                'createdAt': reply_time,
                'parentId': parent_comment['id']
            }
            
            replies.append(reply)
        
        return replies
    
    def _get_comment_time(self, event: Dict[str, Any], is_first: bool) -> datetime:
        """Get realistic comment timing based on event status."""
        if event['status'] == 'Upcoming':
            # Comments before the event (planning, questions)
            start_time = event['startDate'] - timedelta(days=7)
            end_time = event['startDate'] - timedelta(hours=1)
        elif event['status'] == 'Finished':
            # Comments after the event (feedback, thanks)
            start_time = event['startDate'] + timedelta(hours=1)
            end_time = event['startDate'] + timedelta(days=3)
        else:  # Ongoing or cancelled
            start_time = event['startDate'] - timedelta(days=2)
            end_time = event['startDate'] + timedelta(hours=6)
        
        if is_first:
            # First comment tends to be closer to the event
            if event['status'] == 'Upcoming':
                start_time = event['startDate'] - timedelta(days=3)
        
        return self._random_date(start_time, end_time)
    
    def _generate_comment_content(self, event: Dict[str, Any], author: Dict[str, Any], 
                                 is_root: bool = True, parent_author: Dict[str, Any] = None) -> str:
        """Generate realistic comment content based on context."""
        
        if event['status'] == 'Upcoming':
            if is_root:
                upcoming_comments = [
                    f"Looking forward to this event! Will there be equipment available?",
                    f"First time joining in {event['city']} - any tips for newcomers?",
                    f"Great location choice! Easy to get to by public transport.",
                    f"Should we coordinate carpools for this one?",
                    f"Weather forecast looks good for Saturday!",
                    f"I can bring extra masks if needed.",
                    f"What time should we arrive for setup?",
                ]
                return random.choice(upcoming_comments)
            else:
                reply_comments = [
                    f"@{parent_author['name'].split()[0]} I can help with that!",
                    f"Thanks for organizing this {parent_author['name'].split()[0]}!",
                    f"Good point! I'll bring some extra supplies.",
                    f"Count me in for the carpool!",
                    f"I'll be there 30 minutes early to help set up.",
                ]
                return random.choice(reply_comments)
        
        elif event['status'] == 'Finished':
            if is_root:
                finished_comments = [
                    f"Amazing turnout today! Great work everyone.",
                    f"Had some really meaningful conversations. Thanks for organizing!",
                    f"The new location worked really well - good visibility.",
                    f"Special thanks to everyone who stayed to help clean up.",
                    f"Already looking forward to the next one!",
                    f"Managed to have {random.randint(8, 25)} conversations today.",
                    f"Met some wonderful people who were genuinely interested.",
                ]
                return random.choice(finished_comments)
            else:
                reply_comments = [
                    f"Agreed! {parent_author['name'].split()[0]} did an excellent job organizing.",
                    f"Thanks for the encouragement {parent_author['name'].split()[0]}!",
                    f"Your outreach technique was really inspiring to watch.",
                    f"Same here! The energy was fantastic today.",
                    f"Let's definitely use this spot again.",
                ]
                return random.choice(reply_comments)
        
        else:  # Cancelled or other
            cancelled_comments = [
                f"Sorry to hear this was cancelled. Hope everyone is okay!",
                f"Thanks for the advance notice. See you at the next one!",
                f"Weather can be unpredictable. Safety first!",
                f"Looking forward to the rescheduled date.",
            ]
            return random.choice(cancelled_comments)


class ChapterJoinRequestGenerator(BaseGenerator):
    """Generates realistic chapter join requests from confirmed users."""
    
    def __init__(self, config: GenerationConfig, users: List[Dict[str, Any]], chapters: List[Dict[str, Any]]):
        super().__init__(config)
        self.users = users
        self.chapters = chapters
        self.confirmed_users = [u for u in users if u['onboardingStatus'] == 'Confirmed']
    
    def generate_chapter_join_requests(self) -> List[Dict[str, Any]]:
        """Generate chapter join requests with realistic patterns."""
        requests = []
        
        # Calculate number of requests based on probability
        num_requests = int(len(self.confirmed_users) * self.config.join_request_probability)
        
        for _ in range(num_requests):
            request = self._create_join_request()
            if request:
                requests.append(request)
        
        return requests
    
    def _create_join_request(self) -> Optional[Dict[str, Any]]:
        """Create a single chapter join request."""
        if not self.confirmed_users:
            return None
        
        # Select a user who could join additional chapters
        eligible_users = [u for u in self.confirmed_users if len(u['chapters']) < 3]  # Max 3 chapters per user
        
        if not eligible_users:
            return None
        
        user = random.choice(eligible_users)
        user_chapters = set(user['chapters'])
        
        # Find chapters the user could join
        available_chapters = [ch for ch in self.chapters if ch['name'] not in user_chapters]
        
        if not available_chapters:
            return None
        
        # Prefer chapters in same country or nearby
        user_countries = set(ch['country'] for ch in self.chapters if ch['name'] in user['chapters'])
        
        # Weight chapters by preference (same country = higher weight)
        weighted_chapters = []
        for chapter in available_chapters:
            weight = 3 if chapter['country'] in user_countries else 1
            weighted_chapters.extend([chapter] * weight)
        
        target_chapter = random.choice(weighted_chapters)
        
        # Determine request status and timing
        status_weights = [('Pending', 0.6), ('Approved', 0.3), ('Denied', 0.1)]
        status = self._weighted_choice(status_weights)
        
        created_at = self._random_date(
            self.now - timedelta(days=30),
            self.now - timedelta(days=1)
        )
        
        request = {
            'id': generate(),
            'user': user,
            'chapterName': target_chapter['name'],
            'status': status,
            'createdAt': created_at,
            'reason': self._generate_join_reason(user, target_chapter)
        }
        
        return request
    
    def _generate_join_reason(self, user: Dict[str, Any], chapter: Dict[str, Any]) -> str:
        """Generate realistic reasons for joining a chapter."""
        reasons = [
            f"I'm relocating to {chapter['name']} for work and would love to continue my activism there.",
            f"I have family in {chapter['name']} and visit frequently. Would like to participate when I'm in town.",
            f"I'm studying in {chapter['name']} for the next year and want to get involved with the local community.",
            f"I've been following your chapter's work on social media and am impressed by your impact.",
            f"I travel to {chapter['name']} regularly for business and would like to join events when possible.",
            f"Some friends recommended your chapter and I'd love to contribute to your efforts.",
            f"I'm passionate about expanding our movement and think I could help grow activism in {chapter['name']}.",
        ]
        
        return random.choice(reasons)


class DataRelationshipEnhancer(BaseGenerator):
    """Enhances data with sophisticated cross-references and relationships."""
    
    def __init__(self, config: GenerationConfig, data: Dict[str, List[Dict[str, Any]]]):
        super().__init__(config)
        self.data = data
    
    def enhance_relationships(self) -> Dict[str, List[Dict[str, Any]]]:
        """Add sophisticated relationships and cross-references."""
        enhanced_data = self.data.copy()
        
        # Add user networking relationships
        enhanced_data['users'] = self._add_user_connections(enhanced_data['users'])
        
        # Add event series and recurring patterns
        enhanced_data['events'] = self._add_event_series(enhanced_data['events'])
        
        # Add mentor-mentee relationships
        enhanced_data['users'] = self._add_mentorship_relationships(enhanced_data['users'])
        
        # Add skill tracking and development
        enhanced_data['users'] = self._add_skill_progression(enhanced_data['users'])
        
        return enhanced_data
    
    def _add_user_connections(self, users: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Add networking connections between users."""
        for user in users:
            if user['onboardingStatus'] != 'Confirmed':
                continue
            
            # Find potential connections (same chapters, similar activity levels)
            potential_connections = []
            for other_user in users:
                if (other_user['id'] != user['id'] and 
                    other_user['onboardingStatus'] == 'Confirmed' and
                    any(ch in other_user['chapters'] for ch in user['chapters'])):
                    potential_connections.append(other_user['id'])
            
            # Add 2-5 connections per user
            num_connections = min(random.randint(2, 5), len(potential_connections))
            if num_connections > 0:
                connections = random.sample(potential_connections, num_connections)
                user['connections'] = connections
            else:
                user['connections'] = []
        
        return users
    
    def _add_event_series(self, events: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Add event series and recurring event patterns."""
        # Group events by city for series detection
        city_events = {}
        for event in events:
            city = event['city']
            if city not in city_events:
                city_events[city] = []
            city_events[city].append(event)
        
        # Add series information
        for city, city_event_list in city_events.items():
            # Sort by date
            city_event_list.sort(key=lambda e: e['startDate'])
            
            # Create series for regular events
            series_id = generate()
            series_number = 1
            
            for event in city_event_list:
                if event['name'] == 'Cube of Truth':  # Regular weekly events
                    event['seriesId'] = series_id
                    event['seriesNumber'] = series_number
                    series_number += 1
        
        return events
    
    def _add_mentorship_relationships(self, users: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Add mentor-mentee relationships."""
        experienced_users = [u for u in users if u['stats']['cubesAttended'] >= 10]
        new_users = [u for u in users if u['stats']['cubesAttended'] <= 3 and u['onboardingStatus'] == 'Confirmed']
        
        for new_user in new_users:
            if random.random() < 0.3:  # 30% of new users get mentors
                # Find mentor in same chapters
                potential_mentors = [u for u in experienced_users 
                                   if any(ch in u['chapters'] for ch in new_user['chapters'])]
                
                if potential_mentors:
                    mentor = random.choice(potential_mentors)
                    new_user['mentorId'] = mentor['id']
                    
                    # Add to mentor's mentee list
                    if 'mentees' not in mentor:
                        mentor['mentees'] = []
                    mentor['mentees'].append(new_user['id'])
        
        return users
    
    def _add_skill_progression(self, users: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Add skill tracking and progression data."""
        skills = ['outreach', 'organization', 'public_speaking', 'social_media', 'event_planning']
        
        for user in users:
            if user['onboardingStatus'] != 'Confirmed':
                continue
            
            user_skills = {}
            base_level = min(user['stats']['cubesAttended'] // 5, 10)  # Base skill from experience
            
            for skill in skills:
                # Add some randomness to skill levels
                skill_level = max(1, base_level + random.randint(-2, 3))
                skill_level = min(skill_level, 10)  # Cap at 10
                
                user_skills[skill] = {
                    'level': skill_level,
                    'experience_points': skill_level * 100 + random.randint(0, 99),
                    'last_updated': self._random_date(user['joinDate'], self.now)
                }
            
            user['skills'] = user_skills
        
        return users


class PerformanceProfiler:
    """Profiles performance of data generation operations."""
    
    def __init__(self):
        self.timings = {}
        self.memory_usage = {}
        self.start_times = {}
    
    def start_timing(self, operation: str):
        """Start timing an operation."""
        self.start_times[operation] = datetime.now()
    
    def end_timing(self, operation: str):
        """End timing an operation."""
        if operation in self.start_times:
            duration = (datetime.now() - self.start_times[operation]).total_seconds()
            self.timings[operation] = duration
            del self.start_times[operation]
    
    def get_performance_report(self) -> Dict[str, Any]:
        """Get a performance report."""
        total_time = sum(self.timings.values())
        
        report = {
            'total_generation_time': total_time,
            'operation_timings': self.timings,
            'slowest_operations': sorted(
                self.timings.items(), 
                key=lambda x: x[1], 
                reverse=True
            )[:5]
        }
        
        return report
