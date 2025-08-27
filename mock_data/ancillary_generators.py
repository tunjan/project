"""
Generators for ancillary data like announcements, resources, notifications, etc.
These generators create supporting data that enhances the realism of the mock dataset.
"""

import random
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from faker import Faker
from nanoid import generate

from .config import GenerationConfig, BADGE_TEMPLATES, RESOURCE_CATEGORIES
from .generators import BaseGenerator


class AnnouncementGenerator(BaseGenerator):
    """Generates realistic announcements from organizers."""
    
    def __init__(self, config: GenerationConfig, users: List[Dict[str, Any]], chapters: List[Dict[str, Any]]):
        super().__init__(config)
        self.users = users
        self.chapters = chapters
        self.organizers = [u for u in users if u['role'] in [
            'Chapter Organiser', 'Regional Organiser', 'Global Admin', 'Godmode'
        ]]
    
    def generate_announcements(self) -> List[Dict[str, Any]]:
        """Generate announcements with appropriate scope and targeting."""
        announcements = []
        
        if not self.organizers:
            return announcements
        
        for _ in range(self.config.announcements):
            announcement = self._create_announcement()
            announcements.append(announcement)
        
        return announcements
    
    def _create_announcement(self) -> Dict[str, Any]:
        """Create a single announcement."""
        author = random.choice(self.organizers)
        
        # Determine scope based on author's role
        if author['role'] == 'Global Admin' or author['role'] == 'Godmode':
            scope_weights = [('Global', 0.4), ('Regional', 0.3), ('Chapter', 0.3)]
        elif author['role'] == 'Regional Organiser':
            scope_weights = [('Regional', 0.6), ('Chapter', 0.4)]
        else:  # Chapter Organiser
            scope_weights = [('Chapter', 0.8), ('Regional', 0.2)]
        
        scope = self._weighted_choice(scope_weights)
        
        # Generate content based on scope
        title, content = self._generate_announcement_content(scope)
        
        announcement = {
            'id': generate(),
            'author': author,
            'scope': scope,
            'title': title,
            'content': content,
            'createdAt': self._random_date(
                self.now - timedelta(days=90),
                self.now - timedelta(days=1)
            )
        }
        
        # Add scope-specific targeting
        if scope == 'Chapter':
            available_chapters = author.get('organiserOf', [ch['name'] for ch in self.chapters])
            if available_chapters:
                announcement['chapter'] = random.choice(available_chapters)
        elif scope == 'Regional':
            if author.get('managedCountry'):
                announcement['country'] = author['managedCountry']
            else:
                # Fallback for chapter organizers making regional announcements
                user_countries = list(set(
                    ch['country'] for ch in self.chapters 
                    if ch['name'] in author.get('organiserOf', [])
                ))
                if user_countries:
                    announcement['country'] = random.choice(user_countries)
        
        return announcement
    
    def _generate_announcement_content(self, scope: str) -> tuple[str, str]:
        """Generate realistic announcement titles and content."""
        
        global_topics = [
            ("Global Campaign Launch", "We're excited to announce our new global campaign focusing on corporate accountability. This initiative will coordinate efforts across all regions to maximize impact."),
            ("Annual Conference Registration", "Registration is now open for our annual international conference. Join activists from around the world for three days of workshops, networking, and strategic planning."),
            ("New Resource Library", "We've launched an expanded resource library with training materials, legal guides, and outreach tools available in multiple languages."),
            ("Policy Update", "Important updates to our organizational policies regarding event safety protocols and volunteer guidelines. Please review the attached documents."),
        ]
        
        regional_topics = [
            ("Regional Training Workshop", "Join us for a comprehensive training workshop covering advanced outreach techniques and local legal considerations for our region."),
            ("Cross-Chapter Collaboration", "We're organizing collaborative events between chapters in our region. This is a great opportunity to share resources and strategies."),
            ("Regional Coordinator Meeting", "Monthly meeting for all chapter organizers in the region. We'll discuss upcoming campaigns and resource allocation."),
            ("Local Media Strategy", "New guidelines for engaging with local media outlets and building relationships with journalists in our region."),
        ]
        
        chapter_topics = [
            ("Weekly Cube Schedule", "Updated schedule for our weekly Cube of Truth events. New volunteers are always welcome - no experience necessary!"),
            ("Chapter Meeting Reminder", "Don't forget about our monthly chapter meeting this Saturday. We'll be planning upcoming events and discussing local outreach strategies."),
            ("Equipment Update", "We've received new equipment including additional masks and signs. Thanks to everyone who contributed to our fundraising efforts."),
            ("Volunteer Appreciation", "A huge thank you to all our dedicated volunteers who made last week's event such a success. Your commitment makes a real difference."),
            ("New Member Welcome", "Please join me in welcoming our newest chapter members. Looking forward to working together to create positive change."),
        ]
        
        if scope == 'Global':
            return random.choice(global_topics)
        elif scope == 'Regional':
            return random.choice(regional_topics)
        else:  # Chapter
            return random.choice(chapter_topics)


class ResourceGenerator(BaseGenerator):
    """Generates educational and training resources."""
    
    def generate_resources(self) -> List[Dict[str, Any]]:
        """Generate educational resources with realistic categories and content."""
        resources = []
        
        for _ in range(self.config.resources):
            resource = self._create_resource()
            resources.append(resource)
        
        return resources
    
    def _create_resource(self) -> Dict[str, Any]:
        """Create a single resource."""
        # Select resource type and corresponding data
        resource_type = random.choice(list(RESOURCE_CATEGORIES.keys()))
        type_data = RESOURCE_CATEGORIES[resource_type]
        
        title = random.choice(type_data['titles'])
        skill_level = random.choice(['Beginner', 'Intermediate', 'Advanced'])
        
        # Generate description based on type and skill level
        description = self._generate_resource_description(resource_type, skill_level)
        
        resource = {
            'id': generate(),
            'title': title,
            'description': description,
            'type': resource_type,
            'skillLevel': skill_level,
            'language': random.choices(['English', 'Spanish', 'German', 'French'], weights=[0.7, 0.1, 0.1, 0.1], k=1)[0],
            'url': self.fake.url(),
            'icon': type_data['icon']
        }
        
        return resource
    
    def _generate_resource_description(self, resource_type: str, skill_level: str) -> str:
        """Generate contextual descriptions for resources."""
        descriptions = {
            'Document': {
                'Beginner': "A comprehensive introduction covering fundamental concepts and basic techniques. Perfect for newcomers to activism.",
                'Intermediate': "Detailed guidance for activists with some experience. Includes advanced strategies and real-world case studies.",
                'Advanced': "In-depth analysis and sophisticated approaches for experienced organizers and leaders."
            },
            'Video': {
                'Beginner': "Step-by-step video tutorial with clear explanations and practical demonstrations. Ideal for visual learners.",
                'Intermediate': "Professional training video featuring expert insights and advanced techniques for effective activism.",
                'Advanced': "Masterclass-level content with complex scenarios and strategic decision-making frameworks."
            },
            'Guide': {
                'Beginner': "Easy-to-follow guide with checklists and templates. Everything you need to get started successfully.",
                'Intermediate': "Comprehensive handbook with detailed procedures and troubleshooting advice for common challenges.",
                'Advanced': "Strategic guide for leaders covering complex organizational and tactical considerations."
            }
        }
        
        return descriptions[resource_type][skill_level]


class NotificationGenerator(BaseGenerator):
    """Generates realistic notifications for various user interactions."""
    
    def __init__(self, config: GenerationConfig, users: List[Dict[str, Any]], 
                 events: List[Dict[str, Any]], accommodation_requests: List[Dict[str, Any]]):
        super().__init__(config)
        self.users = users
        self.events = events
        self.accommodation_requests = accommodation_requests
        self.user_lookup = {u['id']: u for u in users}
    
    def generate_notifications(self) -> List[Dict[str, Any]]:
        """Generate various types of notifications."""
        notifications = []
        
        # Generate notifications for accommodation requests
        notifications.extend(self._generate_accommodation_notifications())
        
        # Generate RSVP notifications for events
        notifications.extend(self._generate_rsvp_notifications())
        
        # Generate applicant notifications
        notifications.extend(self._generate_applicant_notifications())
        
        # Generate badge award notifications
        notifications.extend(self._generate_badge_notifications())
        
        return notifications
    
    def _generate_accommodation_notifications(self) -> List[Dict[str, Any]]:
        """Generate notifications for accommodation requests."""
        notifications = []
        
        for request in self.accommodation_requests:
            # Notify host about new request
            if request['status'] == 'Pending':
                notifications.append({
                    'id': generate(),
                    'userId': request['host']['id'],
                    'type': 'Accommodation Request',
                    'message': f"{request['requester']['name']} has requested accommodation for an event in {request['event']['city']}.",
                    'linkTo': f"/accommodation/{request['id']}",
                    'isRead': random.random() > 0.4,
                    'createdAt': request['createdAt'],
                    'relatedUser': request['requester']
                })
            
            # Notify requester about status changes
            elif request['status'] in ['Accepted', 'Denied']:
                notifications.append({
                    'id': generate(),
                    'userId': request['requester']['id'],
                    'type': f"Request {request['status']}",
                    'message': f"Your accommodation request has been {request['status'].lower()} by {request['host']['name']}.",
                    'linkTo': f"/accommodation/{request['id']}",
                    'isRead': random.random() > 0.2,
                    'createdAt': request['createdAt'] + timedelta(hours=random.randint(1, 48)),
                    'relatedUser': request['host']
                })
        
        return notifications
    
    def _generate_rsvp_notifications(self) -> List[Dict[str, Any]]:
        """Generate RSVP-related notifications."""
        notifications = []
        
        for event in self.events:
            if event['status'] != 'Upcoming':
                continue
            
            organizer = event['organizer']
            pending_participants = [p for p in event['participants'] if p['status'] == 'Pending']
            
            for participant in pending_participants:
                # Notify organizer about RSVP request
                notifications.append({
                    'id': generate(),
                    'userId': organizer['id'],
                    'type': 'RSVP Request',
                    'message': f"{participant['user']['name']} requested to join your event in {event['city']}.",
                    'linkTo': f"/events/{event['id']}",
                    'isRead': random.random() > 0.3,
                    'createdAt': event['startDate'] - timedelta(days=random.randint(1, 14)),
                    'relatedUser': participant['user']
                })
        
        return notifications
    
    def _generate_applicant_notifications(self) -> List[Dict[str, Any]]:
        """Generate notifications for new applicants."""
        notifications = []
        
        applicants = [u for u in self.users if u['onboardingStatus'] == 'Pending Application Review']
        organizers = [u for u in self.users if u['role'] == 'Chapter Organiser']
        
        for applicant in applicants:
            for chapter_name in applicant['chapters']:
                # Find organizers for this chapter
                chapter_organizers = [org for org in organizers 
                                    if chapter_name in org.get('organiserOf', [])]
                
                for organizer in chapter_organizers:
                    notifications.append({
                        'id': generate(),
                        'userId': organizer['id'],
                        'type': 'New Applicant',
                        'message': f"{applicant['name']} has applied to join the {chapter_name} chapter.",
                        'linkTo': f"/manage/member/{applicant['id']}",
                        'isRead': random.random() > 0.4,
                        'createdAt': applicant['joinDate'],
                        'relatedUser': applicant
                    })
        
        return notifications
    
    def _generate_badge_notifications(self) -> List[Dict[str, Any]]:
        """Generate notifications for badge awards."""
        notifications = []
        
        # This will be populated by the badge generator
        # For now, return empty list as badges are generated separately
        return notifications


class BadgeGenerator(BaseGenerator):
    """Generates badge awards and manages badge logic."""
    
    def __init__(self, config: GenerationConfig, users: List[Dict[str, Any]]):
        super().__init__(config)
        self.users = users
        self.organizers = [u for u in users if u['role'] in [
            'Chapter Organiser', 'Regional Organiser', 'Global Admin'
        ]]
    
    def generate_badges_and_awards(self) -> tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
        """Generate automatic badge awards and manual badge nominations."""
        notifications = []
        badge_awards = []
        
        # Award automatic badges based on stats
        for user in self.users:
            if user['onboardingStatus'] != 'Confirmed':
                continue
            
            user_badges = {b['name'] for b in user['badges']}
            
            # Check each badge template for automatic awards
            for template in BADGE_TEMPLATES:
                if template['type'] != 'stat' or template['name'] in user_badges:
                    continue
                
                if self._user_qualifies_for_badge(user, template):
                    self._award_badge_to_user(user, template)
                    
                    # Create notification
                    notifications.append({
                        'id': generate(),
                        'userId': user['id'],
                        'type': 'Badge Awarded',
                        'message': f"Congratulations! You've earned the '{template['name']}' badge.",
                        'linkTo': f"/profile/{user['id']}",
                        'isRead': False,
                        'createdAt': self._random_date(user['joinDate'], self.now),
                        'relatedUser': None
                    })
        
        # Generate manual badge nominations
        if self.organizers:
            for _ in range(self.config.badge_awards):
                if len(self.organizers) < 2:
                    break
                
                awarder, recipient = random.sample(self.organizers, 2)
                manual_badges = [b for b in BADGE_TEMPLATES if b['type'] == 'manual']
                
                if not manual_badges:
                    continue
                
                badge_template = random.choice(manual_badges)
                
                # Check if recipient already has this badge
                recipient_badges = {b['name'] for b in recipient['badges']}
                if badge_template['name'] in recipient_badges:
                    continue
                
                award = {
                    'id': generate(),
                    'awarder': awarder,
                    'recipient': recipient,
                    'badge': badge_template,
                    'status': random.choices(['Pending', 'Accepted', 'Rejected'], weights=[0.6, 0.3, 0.1], k=1)[0],
                    'createdAt': self._random_date(self.now - timedelta(days=30), self.now)
                }
                
                badge_awards.append(award)
                
                # Create notification for recipient
                notifications.append({
                    'id': generate(),
                    'userId': recipient['id'],
                    'type': 'Badge Awarded',
                    'message': f"{awarder['name']} has nominated you for the '{badge_template['name']}' badge.",
                    'linkTo': f"/badges/{award['id']}",
                    'isRead': random.random() > 0.3,
                    'createdAt': award['createdAt'],
                    'relatedUser': awarder
                })
        
        return notifications, badge_awards
    
    def _user_qualifies_for_badge(self, user: Dict[str, Any], template: Dict[str, Any]) -> bool:
        """Check if user qualifies for a specific badge."""
        criteria = template.get('criteria', {})
        stats = user['stats']
        
        for criterion, required_value in criteria.items():
            if criterion == 'cubes_attended' and stats['cubesAttended'] < required_value:
                return False
            elif criterion == 'cities_count' and len(stats['cities']) < required_value:
                return False
            elif criterion == 'total_conversations' and stats['totalConversations'] < required_value:
                return False
            elif criterion == 'total_hours' and stats['totalHours'] < required_value:
                return False
        
        return True
    
    def _award_badge_to_user(self, user: Dict[str, Any], template: Dict[str, Any]):
        """Award a badge to a user."""
        awarded_at = self._random_date(user['joinDate'], self.now)
        
        badge = {
            'id': generate(),
            'name': template['name'],
            'description': template['description'],
            'icon': template['icon'],
            'awardedAt': awarded_at
        }
        
        user['badges'].append(badge)


class InventoryGenerator(BaseGenerator):
    """Generates inventory items for chapters."""
    
    def __init__(self, config: GenerationConfig, chapters: List[Dict[str, Any]]):
        super().__init__(config)
        self.chapters = chapters
    
    def generate_inventory(self) -> List[Dict[str, Any]]:
        """Generate inventory items for all chapters."""
        inventory = []
        
        categories = ['Masks', 'TVs', 'Signs']
        
        for chapter in self.chapters:
            for category in categories:
                quantity = self._get_realistic_quantity(category)
                
                inventory.append({
                    'id': generate(),
                    'chapterName': chapter['name'],
                    'category': category,
                    'quantity': quantity
                })
        
        return inventory
    
    def _get_realistic_quantity(self, category: str) -> int:
        """Get realistic quantities based on item category."""
        if category == 'Masks':
            return random.randint(10, 50)
        elif category == 'TVs':
            return random.randint(1, 5)
        elif category == 'Signs':
            return random.randint(5, 20)
        else:
            return random.randint(1, 10)


class AccommodationGenerator(BaseGenerator):
    """Generates accommodation requests between users."""
    
    def __init__(self, config: GenerationConfig, users: List[Dict[str, Any]], events: List[Dict[str, Any]]):
        super().__init__(config)
        self.users = users
        self.events = events
    
    def generate_accommodation_requests(self) -> List[Dict[str, Any]]:
        """Generate realistic accommodation requests."""
        requests = []
        
        upcoming_events = [e for e in self.events if e['status'] == 'Upcoming']
        
        for event in upcoming_events:
            if random.random() > 0.3:  # Not all events have accommodation requests
                continue
            
            # Find potential hosts and guests
            hosts = [u for u in self.users 
                    if event['city'] in u['chapters'] and u['hostingAvailability']]
            
            guests = [p['user'] for p in event['participants'] 
                     if event['city'] not in p['user']['chapters']]
            
            if not hosts or not guests:
                continue
            
            # Create 1-2 accommodation requests per event
            num_requests = min(random.randint(1, 2), len(hosts), len(guests))
            
            for _ in range(num_requests):
                if not hosts or not guests:
                    break
                
                requester = random.choice(guests)
                host = random.choice(hosts)
                
                # Avoid self-requests
                if requester['id'] == host['id']:
                    continue
                
                # Remove selected users to avoid duplicates
                guests.remove(requester)
                
                status = random.choices(['Pending', 'Accepted', 'Denied'], weights=[0.6, 0.3, 0.1], k=1)[0]
                
                request = {
                    'id': generate(),
                    'requester': requester,
                    'host': host,
                    'event': event,
                    'startDate': event['startDate'],
                    'endDate': event.get('endDate', event['startDate']),
                    'message': self._generate_request_message(),
                    'status': status,
                    'hostReply': self._generate_host_reply(status) if status != 'Pending' else None,
                    'createdAt': event['startDate'] - timedelta(days=random.randint(3, 21))
                }
                
                requests.append(request)
        
        return requests
    
    def _generate_request_message(self) -> str:
        """Generate realistic accommodation request messages."""
        messages = [
            "Hi! I'm traveling to your city for the upcoming event and would really appreciate a place to stay. I'm a quiet, respectful guest and happy to help with any household tasks.",
            "Hello! I'm looking for accommodation for the event next week. I can bring my own sleeping bag and just need a floor space. Thanks for considering!",
            "Hi there! I'm coming from out of town for the cube and wondering if you might have space for me to crash? I'm flexible with arrangements and very grateful for any help.",
            "Hello! I'm an activist visiting for the event and would love to connect with local community members. Would you be able to host me for a night or two?",
        ]
        return random.choice(messages)
    
    def _generate_host_reply(self, status: str) -> Optional[str]:
        """Generate host replies based on request status."""
        if status == 'Accepted':
            replies = [
                "Absolutely! You're welcome to stay. I have a spare room available. Looking forward to meeting you!",
                "Of course! I'd be happy to host you. I have a couch available and we can coordinate the details closer to the event.",
                "Yes, I can accommodate you! I have space and it'll be great to have another activist around. Let's connect before the event.",
            ]
        elif status == 'Denied':
            replies = [
                "I'm sorry, but I won't be able to host at that time. I hope you find alternative accommodation!",
                "Unfortunately, I already have other guests that weekend. Best of luck finding a place to stay!",
                "I'd love to help but my living situation doesn't allow for guests right now. Sorry!",
            ]
        else:
            return None
        
        return random.choice(replies)
