"""
Specialized data generators for different entity types.
Each generator focuses on creating realistic, consistent data for specific entities.
"""

import random
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional, Tuple
from faker import Faker
from nanoid import generate

from .config import GenerationConfig, BADGE_TEMPLATES, RESOURCE_CATEGORIES, REALISTIC_EVENT_NAMES, CONVERSATION_OUTCOMES_WEIGHTED


class BaseGenerator:
    """Base class for all data generators."""
    
    def __init__(self, config: GenerationConfig):
        self.config = config
        self.fake = Faker()
        self.fake.seed_instance(config.seed)
        random.seed(config.seed)
        self.now = datetime.now()
    
    def _random_date(self, start: datetime, end: datetime) -> datetime:
        """Generate a random datetime between start and end."""
        if start > end:
            start, end = end, start
        delta = end - start
        random_seconds = random.randint(0, int(delta.total_seconds()))
        return start + timedelta(seconds=random_seconds)
    
    def _weighted_choice(self, choices: List[Tuple[Any, float]]) -> Any:
        """Make a weighted random choice from a list of (item, weight) tuples."""
        items, weights = zip(*choices)
        return random.choices(items, weights=weights, k=1)[0]


class ChapterGenerator(BaseGenerator):
    """Generates realistic chapter data with geographic distribution."""
    
    def generate_chapters(self) -> List[Dict[str, Any]]:
        """Generate chapters with realistic geographic distribution."""
        chapters = []
        
        # Ensure we don't exceed available cities
        num_chapters = min(self.config.chapters, len(self.config.cities))
        selected_cities = random.sample(self.config.cities, num_chapters)
        
        for city in selected_cities:
            # Assign country based on city (simplified mapping)
            country = self._get_country_for_city(city)
            
            chapter = {
                'name': city,
                'country': country,
                'lat': float(self.fake.latitude()),
                'lng': float(self.fake.longitude()),
                'instagram': f"@av.{city.lower().replace(' ', '').replace('-', '')}"
            }
            chapters.append(chapter)
        
        return chapters
    
    def _get_country_for_city(self, city: str) -> str:
        """Map cities to countries (simplified)."""
        city_country_map = {
            'London': 'UK', 'Manchester': 'UK', 'Birmingham': 'UK',
            'New York': 'USA', 'Los Angeles': 'USA', 'Chicago': 'USA', 
            'San Francisco': 'USA', 'Boston': 'USA', 'Seattle': 'USA',
            'Portland': 'USA', 'Denver': 'USA', 'Austin': 'USA',
            'Berlin': 'Germany', 'Munich': 'Germany', 'Hamburg': 'Germany',
            'Paris': 'France', 'Lyon': 'France', 'Marseille': 'France',
            'Madrid': 'Spain', 'Barcelona': 'Spain', 'Valencia': 'Spain',
            'Amsterdam': 'Netherlands', 'Rotterdam': 'Netherlands',
            'Stockholm': 'Sweden', 'Gothenburg': 'Sweden',
            'Sydney': 'Australia', 'Melbourne': 'Australia',
            'Toronto': 'Canada', 'Vancouver': 'Canada',
            'Tokyo': 'Japan', 'Osaka': 'Japan',
            'Rome': 'Italy', 'Milan': 'Italy',
            'Vienna': 'Austria', 'Prague': 'Czech Republic',
            'Budapest': 'Hungary', 'Warsaw': 'Poland',
            'Copenhagen': 'Denmark', 'Oslo': 'Norway', 'Helsinki': 'Finland'
        }
        
        return city_country_map.get(city, random.choice(self.config.countries))


class UserGenerator(BaseGenerator):
    """Generates realistic user data with proper role distribution and relationships."""
    
    def __init__(self, config: GenerationConfig, chapters: List[Dict[str, Any]]):
        super().__init__(config)
        self.chapters = chapters
        self.users = []
    
    def generate_users(self) -> List[Dict[str, Any]]:
        """Generate users with realistic distribution across chapters and roles."""
        # Create chapter assignment pool for even distribution
        chapter_pool = self._create_chapter_assignment_pool()
        
        for i in range(self.config.users):
            user = self._create_base_user(i, chapter_pool)
            self.users.append(user)
        
        # Assign special roles after all users are created
        self._assign_organizer_roles()
        
        return self.users
    
    def _create_chapter_assignment_pool(self) -> List[str]:
        """Create a pool of chapter assignments for even distribution."""
        pool = []
        users_per_chapter = max(1, self.config.users // len(self.chapters))
        
        for chapter in self.chapters:
            pool.extend([chapter['name']] * users_per_chapter)
        
        # Fill remaining slots
        while len(pool) < self.config.users:
            remaining = self.config.users - len(pool)
            additional = min(len(self.chapters), remaining)
            pool.extend([ch['name'] for ch in random.sample(self.chapters, additional)])
        
        random.shuffle(pool)
        return pool
    
    def _create_base_user(self, index: int, chapter_pool: List[str]) -> Dict[str, Any]:
        """Create a single user with base attributes."""
        # Determine onboarding status
        status_weights = [
            ('Confirmed', self.config.role_distribution['confirmed']),
            ('Awaiting Verification', self.config.role_distribution['awaiting_verification']),
            ('Pending Application Review', self.config.role_distribution['pending_review']),
            ('Denied', self.config.role_distribution['denied'])
        ]
        onboarding_status = self._weighted_choice(status_weights)
        
        # Assign chapters (1-2 per user)
        num_chapters = random.choices([1, 2], weights=[0.7, 0.3], k=1)[0]
        user_chapters = []
        for _ in range(num_chapters):
            if chapter_pool:
                user_chapters.append(chapter_pool.pop())
        
        # Remove duplicates
        user_chapters = list(set(user_chapters))
        if not user_chapters:  # Fallback
            user_chapters = [random.choice(self.chapters)['name']]
        
        # Determine activity level
        activity_weights = [(k, v) for k, v in self.config.user_activity_weights.items()]
        activity_level = self._weighted_choice(activity_weights)
        
        # Set join date
        join_date = self._random_date(
            self.now - timedelta(days=730),
            self.now - timedelta(days=30)
        )
        
        # Create user
        user = {
            'id': generate(),
            'name': self.fake.name(),
            'email': self.fake.email(),
            'role': 'Activist (Confirmed)' if onboarding_status == 'Confirmed' else 'Activist',
            'instagram': self.fake.user_name(),
            'chapters': user_chapters,
            'stats': {
                'totalHours': 0,
                'cubesAttended': 0,
                'veganConversions': 0,
                'totalConversations': 0,
                'cities': []
            },
            'profilePictureUrl': f"https://i.pravatar.cc/150?u={generate()}",
            'badges': [],
            'hostingAvailability': random.random() < 0.3,
            'hostingCapacity': random.randint(1, 4) if random.random() < 0.3 else 0,
            'onboardingStatus': onboarding_status,
            'onboardingAnswers': {
                'veganReason': self.fake.paragraph(nb_sentences=3),
                'abolitionistAlignment': random.random() < 0.8,
                'customAnswer': self.fake.sentence()
            },
            'joinDate': join_date,
            'lastLogin': self._random_date(join_date, self.now),
            'organizerNotes': [],
            'activity_level': activity_level,
            'leaveDate': self._random_date(join_date, self.now) if random.random() < self.config.user_churn_rate else None
        }
        
        return user
    
    def _assign_organizer_roles(self):
        """Assign organizer roles to confirmed users."""
        confirmed_users = [u for u in self.users if u['onboardingStatus'] == 'Confirmed']
        
        if not confirmed_users:
            return
        
        # Assign one global admin
        global_admin = random.choice(confirmed_users)
        global_admin['role'] = 'Global Admin'
        
        # Assign regional organizers (one per country)
        countries = list(set(ch['country'] for ch in self.chapters))
        for country in countries:
            country_chapters = [ch['name'] for ch in self.chapters if ch['country'] == country]
            candidates = [u for u in confirmed_users 
                         if any(ch in u['chapters'] for ch in country_chapters)
                         and u['role'] not in ['Global Admin', 'Godmode']]
            
            if candidates:
                organizer = random.choice(candidates)
                organizer['role'] = 'Regional Organiser'
                organizer['managedCountry'] = country
        
        # Assign chapter organizers
        for chapter in self.chapters:
            candidates = [u for u in confirmed_users 
                         if chapter['name'] in u['chapters']
                         and u['role'] not in ['Regional Organiser', 'Global Admin', 'Godmode']]
            
            if candidates:
                num_organizers = random.randint(1, min(3, len(candidates)))
                organizers = random.sample(candidates, num_organizers)
                
                for organizer in organizers:
                    organizer['role'] = 'Chapter Organiser'
                    organizer.setdefault('organiserOf', []).append(chapter['name'])
                    organizer['organiserOf'] = list(set(organizer['organiserOf']))


class EventGenerator(BaseGenerator):
    """Generates realistic events with proper participant distribution."""
    
    def __init__(self, config: GenerationConfig, chapters: List[Dict[str, Any]], users: List[Dict[str, Any]]):
        super().__init__(config)
        self.chapters = chapters
        self.users = users
        self.confirmed_users = [u for u in users if u['onboardingStatus'] == 'Confirmed']
    
    def generate_events(self) -> List[Dict[str, Any]]:
        """Generate events for all chapters."""
        events = []
        
        for chapter in self.chapters:
            chapter_events = self._generate_chapter_events(chapter)
            events.extend(chapter_events)
        
        # Generate some regional events
        regional_events = self._generate_regional_events()
        events.extend(regional_events)
        
        return events
    
    def _generate_chapter_events(self, chapter: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate events for a specific chapter."""
        events = []
        chapter_members = [u for u in self.confirmed_users if chapter['name'] in u['chapters']]
        
        if not chapter_members:
            return events
        
        # Find organizer for this chapter
        organizer = next(
            (u for u in chapter_members if u.get('organiserOf') and chapter['name'] in u['organiserOf']),
            random.choice(chapter_members)
        )
        
        for _ in range(self.config.events_per_chapter):
            event = self._create_event(chapter, organizer, chapter_members)
            events.append(event)
        
        return events
    
    def _create_event(self, chapter: Dict[str, Any], organizer: Dict[str, Any], 
                     chapter_members: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Create a single event."""
        # Generate event date
        event_date = self._random_date(
            self.now - timedelta(days=365),
            self.now + timedelta(days=60)
        )
        
        # Determine event status
        if event_date > self.now:
            status = 'Upcoming'
            if random.random() < 0.05:  # 5% chance of cancellation
                status = 'Cancelled'
        else:
            status = 'Finished'
        
        # Select participants based on activity levels
        participants = self._select_participants(chapter_members, organizer)
        
        # Add some guests from other chapters
        guests = self._select_guests(chapter['name'])
        participants.extend(guests)
        
        event = {
            'id': generate(),
            'name': random.choice(REALISTIC_EVENT_NAMES),
            'city': chapter['name'],
            'location': self.fake.street_address(),
            'startDate': event_date,
            'scope': 'Chapter',
            'organizer': organizer,
            'participants': participants,
            'status': status,
            'cancellationReason': self.fake.sentence() if status == 'Cancelled' else None,
            'roleRequirements': self._generate_role_requirements()
        }
        
        return event
    
    def _select_participants(self, chapter_members: List[Dict[str, Any]], 
                           organizer: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Select participants based on their activity levels."""
        participants = []
        
        for member in chapter_members:
            activity_pattern = self.config.event_attendance_patterns[member['activity_level']]
            if random.random() < activity_pattern['attendance_rate']:
                role = 'Organizer' if member['id'] == organizer['id'] else 'Activist'
                participants.append({
                    'user': member,
                    'eventRole': role,
                    'status': 'Attending'
                })
        
        # Ensure organizer is always included
        if not any(p['user']['id'] == organizer['id'] for p in participants):
            participants.append({
                'user': organizer,
                'eventRole': 'Organizer',
                'status': 'Attending'
            })
        
        return participants
    
    def _select_guests(self, chapter_name: str) -> List[Dict[str, Any]]:
        """Select guests from other chapters."""
        guests = []
        other_chapter_users = [u for u in self.confirmed_users if chapter_name not in u['chapters']]
        
        if other_chapter_users:
            num_guests = random.randint(0, min(4, len(other_chapter_users)))
            selected_guests = random.sample(other_chapter_users, num_guests)
            
            for guest in selected_guests:
                status = random.choices(['Pending', 'Attending'], weights=[0.3, 0.7], k=1)[0]
                guests.append({
                    'user': guest,
                    'eventRole': 'Activist',
                    'status': status
                })
        
        return guests
    
    def _generate_role_requirements(self) -> List[Dict[str, Any]]:
        """Generate role requirements for events."""
        if random.random() > 0.3:  # 70% of events have no special requirements
            return []
        
        requirements = []
        possible_roles = ['Equipment', 'Transport', 'Volunteer']
        
        for role in random.sample(possible_roles, random.randint(1, 2)):
            requirements.append({
                'role': role,
                'needed': random.randint(2, 5),
                'filled': 0,
                'description': f"{role} support needed"
            })
        
        return requirements
    
    def _generate_regional_events(self) -> List[Dict[str, Any]]:
        """Generate regional events that span multiple chapters."""
        events = []
        countries = list(set(ch['country'] for ch in self.chapters))
        
        for _ in range(min(self.config.special_regional_events, len(countries))):
            country = random.choice(countries)
            country_chapters = [ch for ch in self.chapters if ch['country'] == country]
            
            if len(country_chapters) < 2:
                continue
            
            host_chapter = random.choice(country_chapters)
            regional_organizer = next(
                (u for u in self.users if u.get('managedCountry') == country),
                None
            )
            
            if not regional_organizer:
                continue
            
            event_date = self._random_date(
                self.now - timedelta(days=180),
                self.now + timedelta(days=90)
            )
            
            # Gather participants from all chapters in the country
            participants = []
            for chapter in country_chapters:
                chapter_members = [u for u in self.confirmed_users if chapter['name'] in u['chapters']]
                selected = random.sample(chapter_members, min(len(chapter_members), random.randint(2, 8)))
                
                for member in selected:
                    role = 'Organizer' if member['id'] == regional_organizer['id'] else 'Activist'
                    participants.append({
                        'user': member,
                        'eventRole': role,
                        'status': 'Attending'
                    })
            
            event = {
                'id': generate(),
                'name': f"Regional {random.choice(REALISTIC_EVENT_NAMES)}",
                'city': host_chapter['name'],
                'location': self.fake.street_address(),
                'startDate': event_date,
                'scope': 'Regional',
                'targetRegion': country,
                'organizer': regional_organizer,
                'participants': participants,
                'status': 'Finished' if event_date < self.now else 'Upcoming',
                'roleRequirements': []
            }
            
            events.append(event)
        
        return events


class OutreachGenerator(BaseGenerator):
    """Generates realistic outreach logs and updates user statistics."""
    
    def __init__(self, config: GenerationConfig, events: List[Dict[str, Any]], users: List[Dict[str, Any]]):
        super().__init__(config)
        self.events = events
        self.users = users
        self.user_lookup = {u['id']: u for u in users}
    
    def generate_outreach_data(self) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
        """Generate outreach logs and update user statistics."""
        outreach_logs = []
        
        finished_events = [e for e in self.events if e['status'] == 'Finished']
        
        for event in finished_events:
            # Generate event report
            hours = random.randint(2, 5)
            attendance = {}
            
            for participant in event['participants']:
                user_id = participant['user']['id']
                # High probability of attendance for committed participants
                attended = random.choices(['Attended', 'Absent'], weights=[9, 1], k=1)[0]
                attendance[user_id] = attended
                
                if attended == 'Attended':
                    user = self.user_lookup[user_id]
                    self._update_user_stats(user, event, hours)
                    
                    # Generate outreach logs for this user
                    user_logs = self._generate_user_outreach_logs(user, event)
                    outreach_logs.extend(user_logs)
            
            event['report'] = {
                'hours': hours,
                'attendance': attendance
            }
        
        return outreach_logs, self.users
    
    def _update_user_stats(self, user: Dict[str, Any], event: Dict[str, Any], hours: int):
        """Update user statistics based on event attendance."""
        user['stats']['totalHours'] += hours
        user['stats']['cubesAttended'] += 1
        
        if event['city'] not in user['stats']['cities']:
            user['stats']['cities'].append(event['city'])
    
    def _generate_user_outreach_logs(self, user: Dict[str, Any], event: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate outreach logs for a user at an event."""
        logs = []
        
        # Number of conversations based on activity level
        activity_multiplier = self.config.event_attendance_patterns[user['activity_level']]['conversation_multiplier']
        base_conversations = random.randint(5, 20)
        num_conversations = int(base_conversations * activity_multiplier)
        
        for _ in range(num_conversations):
            outcome = self._weighted_choice(CONVERSATION_OUTCOMES_WEIGHTED)
            
            log = {
                'id': generate(),
                'userId': user['id'],
                'eventId': event['id'],
                'outcome': outcome,
                'notes': self.fake.sentence() if random.random() < 0.2 else None,
                'createdAt': event['startDate']
            }
            
            logs.append(log)
            
            # Update user stats
            user['stats']['totalConversations'] += 1
            if outcome in ['Became vegan', 'Became vegan and activist']:
                user['stats']['veganConversions'] += 1
        
        return logs
