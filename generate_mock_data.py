import json
import random
from datetime import datetime, date, timedelta
from faker import Faker
from nanoid import generate
from pathlib import Path
import copy

print("Starting enhanced mock data generation with Python...")

# --- CONFIGURATION ---
CONFIG = {
    "chapters": 20,
    "users": 200,
    "events_per_chapter": 6,
    "special_regional_events": 5,
    "announcements": 15,
    "resources": 8,
    "accommodation_requests_per_event": 1,
    "comments_per_event": 3,
    "badge_awards": 40,
    "chapter_join_requests": 10,
}

# --- ENUM-LIKE CONSTANTS (to match TypeScript) ---
class Role:
    ACTIVIST = 'Activist'
    CONFIRMED_ACTIVIST = 'Activist (Confirmed)'
    CHAPTER_ORGANISER = 'Chapter Organiser'
    REGIONAL_ORGANISER = 'Regional Organiser'
    GLOBAL_ADMIN = 'Global Admin'
    GODMODE = 'Godmode'

class OnboardingStatus:
    PENDING_APPLICATION_REVIEW = 'Pending Application Review'
    AWAITING_VERIFICATION = 'Awaiting Verification'
    CONFIRMED = 'Confirmed'
    DENIED = 'Denied'
    INACTIVE = 'Inactive'

class EventRole:
    ORGANIZER = 'Organizer'
    ACTIVIST = 'Activist'
    VOLUNTEER = 'Volunteer'
    OUTREACH = 'Outreach'
    TRANSPORT = 'Transport'
    EQUIPMENT = 'Equipment'

class EventStatus:
    UPCOMING = 'Upcoming'
    ONGOING = 'Ongoing'
    FINISHED = 'Finished'
    CANCELLED = 'Cancelled'

class ParticipantStatus:
    PENDING = 'Pending'
    ATTENDING = 'Attending'

class OutreachOutcome:
    BECAME_VEGAN_ACTIVIST = 'Became vegan and activist'
    BECAME_VEGAN = 'Became vegan'
    ALREADY_VEGAN_NOW_ACTIVIST = 'Already vegan, now activist'
    MOSTLY_SURE = 'Mostly sure'
    NOT_SURE = 'Not sure'
    NO_CHANGE = 'No change / Dismissive'

class AnnouncementScope:
    GLOBAL = 'Global'
    REGIONAL = 'Regional'
    CHAPTER = 'Chapter'

class ResourceType:
    DOCUMENT = 'Document'
    VIDEO = 'Video'
    GUIDE = 'Guide'

class SkillLevel:
    BEGINNER = 'Beginner'
    INTERMEDIATE = 'Intermediate'
    ADVANCED = 'Advanced'

class NotificationType:
    NEW_ANNOUNCEMENT = 'New Announcement'
    ACCOMMODATION_REQUEST = 'Accommodation Request'
    REQUEST_ACCEPTED = 'Request Accepted'
    REQUEST_DENIED = 'Request Denied'
    BADGE_AWARDED = 'Badge Awarded'
    BADGE_AWARD_ACCEPTED = 'Badge Award Accepted'
    BADGE_AWARD_REJECTED = 'Badge Award Rejected'
    NEW_APPLICANT = 'New Applicant'
    CHAPTER_JOIN_REQUEST = 'Chapter Join Request'
    CHAPTER_JOIN_APPROVED = 'Chapter Join Approved'
    RSVP_REQUEST = 'RSVP Request'
    EVENT_CANCELLED = 'Event Cancelled'


VALID_OUTREACH_OUTCOMES = [v for k, v in OutreachOutcome.__dict__.items() if not k.startswith('__')]
VALID_RESOURCE_TYPES = [v for k, v in ResourceType.__dict__.items() if not k.startswith('__')]
VALID_SKILL_LEVELS = [v for k, v in SkillLevel.__dict__.items() if not k.startswith('__')]

COUNTRIES = ['USA', 'UK', 'Germany', 'Australia', 'Canada', 'France', 'Spain', 'Mexico']
ALL_BADGE_TEMPLATES = [
    {'name': 'First Cube', 'description': 'Attended your first Cube of Truth.', 'icon': 'StarIcon', 'type': 'stat'},
    {'name': 'Road Warrior', 'description': 'Attended events in 5+ different cities.', 'icon': 'GlobeAltIcon', 'type': 'stat'},
    {'name': 'Top Orator', 'description': 'Logged over 100 conversations.', 'icon': 'SparklesIcon', 'type': 'stat'},
    {'name': 'Veteran Activist', 'description': 'Contributed over 100 hours of outreach.', 'icon': 'TrophyIcon', 'type': 'stat'},
    {'name': 'Community Pillar', 'description': 'Attended over 25 cubes total.', 'icon': 'UsersIcon', 'type': 'stat'},
    {'name': 'On Fire', 'description': 'Attended 5 cubes in a single month.', 'icon': 'FireIcon', 'type': 'manual'},
    {'name': 'Local Legend', 'description': 'Recognized for exceptional contribution to a chapter.', 'icon': 'ShieldCheckIcon', 'type': 'manual'},
    {'name': 'Mentor', 'description': 'Provided outstanding guidance to new activists.', 'icon': 'AcademicCapIcon', 'type': 'manual'},
]
RESOURCE_ICONS = {
    ResourceType.DOCUMENT: 'DocumentTextIcon',
    ResourceType.VIDEO: 'VideoCameraIcon',
    ResourceType.GUIDE: 'BookOpenIcon',
}
REALISTIC_CITIES = [
    "London", "New York", "Berlin", "Paris", "Tokyo", "Sydney", "Toronto", "Amsterdam",
    "Barcelona", "Rome", "Madrid", "Vienna", "Prague", "Budapest", "Warsaw", "Stockholm",
    "San Francisco", "Los Angeles", "Chicago", "Boston", "Seattle", "Portland", "Denver", "Austin"
]

# --- SCRIPT LOGIC ---
class MockDataGenerator:
    def __init__(self, config):
        self.config = config
        self.fake = Faker()
        self.now = datetime.now()
        # Data stores
        self.chapters, self.users, self.events, self.outreach_logs = [], [], [], []
        self.announcements, self.resources, self.accommodation_requests = [], [], []
        self.notifications, self.event_comments, self.challenges, self.badge_awards = [], [], [], []
        self.inventory, self.chapter_join_requests = [], []

    def _get_random_date(self, start, end):
        if start > end:
            start, end = end, start
        return start + timedelta(seconds=random.randint(0, int((end - start).total_seconds())))

    def generate_chapters(self):
        chapters = [{'name': name, 'country': random.choice(COUNTRIES), 'lat': float(self.fake.latitude()), 'lng': float(self.fake.longitude()), 'instagram': f"@av.{name.lower().replace(' ', '')}"} for name in random.sample(REALISTIC_CITIES, k=min(len(REALISTIC_CITIES), self.config['chapters']))]
        self.chapters = chapters
        print(f"Generated {len(self.chapters)} chapters.")

    def generate_users_and_roles(self):
        # 1. Generate Users with better chapter distribution
        # Create a pool of chapter assignments to ensure even distribution
        chapter_assignments = []
        for chapter in self.chapters:
            # Assign approximately users_per_chapter users to each chapter
            users_per_chapter = max(1, self.config['users'] // len(self.chapters))
            chapter_assignments.extend([chapter['name']] * users_per_chapter)
        
        # Shuffle the assignments to randomize
        random.shuffle(chapter_assignments)
        
        # Ensure we have enough assignments for all users
        while len(chapter_assignments) < self.config['users']:
            chapter_assignments.extend([random.choice(self.chapters)['name'] for _ in range(min(len(self.chapters), self.config['users'] - len(chapter_assignments)))])
        
        for i in range(self.config['users']):
            status = random.choices([OnboardingStatus.CONFIRMED, OnboardingStatus.AWAITING_VERIFICATION, OnboardingStatus.PENDING_APPLICATION_REVIEW, OnboardingStatus.DENIED], weights=[80, 5, 13, 2], k=1)[0]
            
            # Assign 1-2 chapters from the pre-distributed pool
            num_chapters = random.randint(1, 2)
            user_chapters = []
            for _ in range(num_chapters):
                if chapter_assignments:
                    user_chapters.append(chapter_assignments.pop())
                else:
                    # Fallback if we run out of assignments
                    user_chapters.append(random.choice(self.chapters)['name'])
            
            # Ensure unique chapters
            user_chapters = list(set(user_chapters))
            
            join_date = self._get_random_date(self.now - timedelta(days=730), self.now - timedelta(days=30))
            self.users.append({
                'id': generate(), 'name': self.fake.name(), 'email': self.fake.email(),
                'role': Role.CONFIRMED_ACTIVIST if status == OnboardingStatus.CONFIRMED else Role.ACTIVIST,
                'instagram': self.fake.user_name(), 'chapters': user_chapters,
                'stats': {'totalHours': 0, 'cubesAttended': 0, 'veganConversions': 0, 'totalConversations': 0, 'cities': []},
                'profilePictureUrl': f"https://i.pravatar.cc/150?u={generate()}", 'badges': [],
                'hostingAvailability': random.random() < 0.3, 'hostingCapacity': random.randint(1, 4), 'onboardingStatus': status,
                'onboardingAnswers': {'veganReason': self.fake.paragraph(), 'abolitionistAlignment': random.random() < 0.8, 'customAnswer': self.fake.sentence()},
                'joinDate': join_date, 'lastLogin': self._get_random_date(join_date, self.now), 'organizerNotes': [],
                'activity_level': random.choices(['high', 'medium', 'low'], weights=[2, 5, 3], k=1)[0]
            })
        print(f"Generated {len(self.users)} users.")

        # 2. Assign Organizer Roles & One Global Admin
        confirmed_users = [u for u in self.users if u['onboardingStatus'] == OnboardingStatus.CONFIRMED]
        if confirmed_users:
            global_admin_candidate = random.choice(confirmed_users)
            global_admin_candidate['role'] = Role.GLOBAL_ADMIN

        for country in COUNTRIES:
            candidates = [u for u in confirmed_users if any(c['country'] == country for c in self.chapters if c['name'] in u['chapters'])]
            if candidates:
                organiser = random.choice(candidates)
                if organiser['role'] not in [Role.GLOBAL_ADMIN, Role.GODMODE]:
                    organiser['role'] = Role.REGIONAL_ORGANISER
                    organiser['managedCountry'] = country

        for chapter in self.chapters:
            candidates = [u for u in confirmed_users if chapter['name'] in u['chapters']]
            if candidates:
                num_organisers = random.randint(1, 3)
                organisers_to_assign = random.sample(candidates, k=min(len(candidates), num_organisers))
                for organiser in organisers_to_assign:
                    if organiser['role'] not in [Role.REGIONAL_ORGANISER, Role.GLOBAL_ADMIN, Role.GODMODE]:
                        organiser['role'] = Role.CHAPTER_ORGANISER
                    organiser.setdefault('organiserOf', []).append(chapter['name'])
                    organiser['organiserOf'] = list(set(organiser['organiserOf']))
        print("Assigned organizer roles.")

        # 3. Create NEW_APPLICANT notifications
        applicant_users = [u for u in self.users if u['onboardingStatus'] == OnboardingStatus.PENDING_APPLICATION_REVIEW]
        chapter_organisers = [u for u in self.users if u['role'] == Role.CHAPTER_ORGANISER]
        for applicant in applicant_users:
            for chapter_name in applicant['chapters']:
                organisers = [org for org in chapter_organisers if chapter_name in org.get('organiserOf', [])]
                for organiser in organisers:
                    self.notifications.append({
                        'userId': organiser['id'], 'type': NotificationType.NEW_APPLICANT,
                        'message': f"{applicant['name']} has applied to join the {chapter_name} chapter.",
                        'linkTo': f'/manage/member/{applicant["id"]}', 'isRead': random.random() > 0.6,
                        'createdAt': applicant['joinDate'], 'relatedUser': applicant
                    })

    def generate_events(self):
        all_confirmed_users = [u for u in self.users if u['onboardingStatus'] == OnboardingStatus.CONFIRMED]
        for chapter in self.chapters:
            members = [u for u in all_confirmed_users if chapter['name'] in u['chapters']]
            if not members:
                continue
            organiser = next((u for u in members if u.get('organiserOf') and chapter['name'] in u['organiserOf']), random.choice(members))
            for _ in range(self.config['events_per_chapter']):
                dt = self._get_random_date(self.now - timedelta(days=365), self.now + timedelta(days=30))
                status = EventStatus.UPCOMING if dt > self.now else EventStatus.FINISHED
                if status == EventStatus.UPCOMING and random.random() < 0.05:
                    status = EventStatus.CANCELLED
                
                # Make participation based on activity level
                participants_sample = [p for p in members if random.random() < {'high': 0.9, 'medium': 0.6, 'low': 0.2}[p['activity_level']]]
                if len(participants_sample) < 3:
                    participants_sample = random.sample(members, k=min(len(members), 3))
                if organiser not in participants_sample:
                    participants_sample.append(organiser)
                
                # Add some guests from other chapters
                guests = random.sample([u for u in all_confirmed_users if chapter['name'] not in u['chapters']], k=random.randint(0,4))
                
                participants_with_status = [{'user': p, 'eventRole': EventRole.ORGANIZER if p['id'] == organiser['id'] else EventRole.ACTIVIST, 'status': ParticipantStatus.ATTENDING} for p in participants_sample]
                for guest in guests:
                    guest_status = random.choice([ParticipantStatus.PENDING, ParticipantStatus.ATTENDING])
                    participants_with_status.append({'user': guest, 'eventRole': EventRole.ACTIVIST, 'status': guest_status})
                    if guest_status == ParticipantStatus.PENDING:
                        self.notifications.append({'userId': organiser['id'], 'type': NotificationType.RSVP_REQUEST, 'message': f"{guest['name']} requested to join {chapter['name']}'s event.", 'linkTo': f"/cubes/{generate()}", 'isRead': True, 'createdAt': dt - timedelta(days=2), 'relatedUser': guest})

                self.events.append({
                    'id': generate(), 'name': self.fake.bs().title(), 'city': chapter['name'], 'location': self.fake.street_address(),
                    'startDate': dt, 'scope': 'Chapter', 'organizer': organiser, 'participants': participants_with_status, 'status': status,
                    'cancellationReason': self.fake.sentence() if status == EventStatus.CANCELLED else None,
                    'roleRequirements': [] if random.random() > 0.3 else [{'role': random.choice([EventRole.EQUIPMENT, EventRole.TRANSPORT]), 'needed': random.randint(2,5), 'filled': 0}]
                })
        print(f"Generated {len(self.events)} chapter events.")

    def generate_post_event_data(self):
        past_events = [e for e in self.events if e['status'] == EventStatus.FINISHED]
        for event in past_events:
            hours = random.randint(2, 5)
            event['report'] = {'hours': hours, 'attendance': {p['user']['id']: random.choices(['Attended', 'Absent'], weights=[9, 1], k=1)[0] for p in event['participants']}}
            attending_users = [p['user'] for p in event['participants'] if event['report']['attendance'][p['user']['id']] == 'Attended']
            for user in attending_users:
                user['stats']['totalHours'] += hours
                user['stats']['cubesAttended'] += 1
                if event['city'] not in user['stats']['cities']:
                    user['stats']['cities'].append(event['city'])
                
                # More logs for high-activity users
                num_convos = int(random.randint(5, 20) * {'high': 1.5, 'medium': 1.0, 'low': 0.5}[user['activity_level']])
                for _ in range(num_convos):
                    outcome = random.choice(VALID_OUTREACH_OUTCOMES)
                    self.outreach_logs.append({'id': generate(), 'userId': user['id'], 'eventId': event['id'], 'outcome': outcome, 'notes': self.fake.sentence() if random.random() < 0.2 else None, 'createdAt': event['startDate']})
                    user['stats']['totalConversations'] += 1
                    if outcome in [OutreachOutcome.BECAME_VEGAN, OutreachOutcome.BECAME_VEGAN_ACTIVIST]:
                        user['stats']['veganConversions'] += 1
        print("Generated reports, logs, and calculated user stats.")

    def generate_ancillary_data(self):
        organizers = [u for u in self.users if u['role'] in [Role.CHAPTER_ORGANISER, Role.REGIONAL_ORGANISER, Role.GLOBAL_ADMIN, Role.GODMODE]]
        if not organizers:
            return
        
        # Announcements
        for _ in range(self.config['announcements']):
            author = random.choice(organizers)
            # ... (announcement logic from original script)
            scope = random.choice([s for s in AnnouncementScope.__dict__.values() if isinstance(s, str)])
            self.announcements.append({'id': generate(), 'author': author, 'scope': scope, 'title': self.fake.bs().title(), 'content': self.fake.paragraph(nb_sentences=5), 'createdAt': self._get_random_date(self.now - timedelta(days=90), self.now), 'chapter': random.choice(author.get('organiserOf', [c['name'] for c in self.chapters])) if scope==AnnouncementScope.CHAPTER else None, 'country': author.get('managedCountry') if scope==AnnouncementScope.REGIONAL else None})
        
        # Resources
        for _ in range(self.config['resources']):
            res_type = random.choice(VALID_RESOURCE_TYPES)
            self.resources.append({'id': generate(), 'title': self.fake.catch_phrase(), 'description': self.fake.text(max_nb_chars=150), 'type': res_type, 'skillLevel': random.choice(VALID_SKILL_LEVELS), 'language': 'English', 'url': self.fake.url(), 'icon': RESOURCE_ICONS.get(res_type, 'BookOpenIcon')})
        
        # Accommodation Requests & Notifications
        upcoming_events = [e for e in self.events if e['status'] == EventStatus.UPCOMING]
        for event in upcoming_events:
            hosts = [u for u in self.users if event['city'] in u['chapters'] and u['hostingAvailability']]
            guests = [p['user'] for p in event['participants'] if event['city'] not in p['user']['chapters']]
            if hosts and guests and random.random() < 0.5:
                # ... (accommodation logic from original script)
                requester, host = random.choice(guests), random.choice(hosts)
                if requester['id'] == host['id']:
                    continue
                status = random.choices(['Pending', 'Accepted', 'Denied'], weights=[6, 2, 2], k=1)[0]
                self.accommodation_requests.append({'id': generate(), 'requester': requester, 'host': host, 'event': event, 'startDate': event['startDate'], 'endDate': event.get('endDate') or event['startDate'], 'message': self.fake.paragraph(), 'status': status, 'hostReply': None, 'createdAt': self.now - timedelta(days=random.randint(1,5))})

        # Event Comments
        for event in self.events:
            if random.random() < 0.4 and event['participants']:
                for _ in range(random.randint(1, self.config['comments_per_event'])):
                    author = random.choice(event['participants'])['user']
                    self.event_comments.append({'id': generate(), 'eventId': event['id'], 'author': author, 'content': self.fake.sentence(), 'createdAt': self._get_random_date(event['startDate'], (event.get('endDate') or event['startDate']))})

        # Data-driven Badge Awards
        for user in self.users:
            if user['onboardingStatus'] != OnboardingStatus.CONFIRMED:
                continue
            user_badges = set(b['name'] for b in user['badges'])
            # Stat-based badges
            if user['stats']['cubesAttended'] >= 1 and 'First Cube' not in user_badges:
                self._award_badge(user, 'First Cube')
            if len(user['stats']['cities']) >= 5 and 'Road Warrior' not in user_badges:
                self._award_badge(user, 'Road Warrior')
            if user['stats']['totalConversations'] >= 100 and 'Top Orator' not in user_badges:
                self._award_badge(user, 'Top Orator')
            if user['stats']['totalHours'] >= 100 and 'Veteran Activist' not in user_badges:
                self._award_badge(user, 'Veteran Activist')
            if user['stats']['cubesAttended'] >= 25 and 'Community Pillar' not in user_badges:
                self._award_badge(user, 'Community Pillar')
        
        # Manual/random awards
        for _ in range(self.config['badge_awards']):
             awarder, recipient = random.sample([u for u in self.users if u['role'] in [Role.CHAPTER_ORGANISER, Role.REGIONAL_ORGANISER, Role.GLOBAL_ADMIN]], k=2)
             badge_template = random.choice([b for b in ALL_BADGE_TEMPLATES if b['type'] == 'manual'])
             if any(b['name'] == badge_template['name'] for b in recipient['badges']):
                 continue
             award = {'id': generate(), 'awarder': awarder, 'recipient': recipient, 'badge': badge_template, 'status': 'Pending', 'createdAt': self.now}
             self.badge_awards.append(award)

        print("Generated ancillary data (announcements, resources, awards, etc.).")
    
    def _award_badge(self, user, badge_name):
        badge_template = next(b for b in ALL_BADGE_TEMPLATES if b['name'] == badge_name)
        awarded_at = self._get_random_date(user['joinDate'], self.now)
        user['badges'].append({ 'id': generate(), **badge_template, 'awardedAt': awarded_at })

    def generate_inventory(self):
        for chapter in self.chapters:
            self.inventory.append({'id': generate(), 'chapterName': chapter['name'], 'category': 'Masks', 'quantity': random.randint(10, 50)})
            self.inventory.append({'id': generate(), 'chapterName': chapter['name'], 'category': 'TVs', 'quantity': random.randint(1, 5)})
            self.inventory.append({'id': generate(), 'chapterName': chapter['name'], 'category': 'Signs', 'quantity': random.randint(5, 20)})
        print(f"Generated {len(self.inventory)} inventory items.")

    def generate_chapter_join_requests(self):
        eligible_users = [u for u in self.users if u['onboardingStatus'] == OnboardingStatus.CONFIRMED]
        for _ in range(self.config['chapter_join_requests']):
            if not eligible_users:
                break
            user = random.choice(eligible_users)
            user_chapter_names = set(user['chapters'])
            possible_chapters = [c for c in self.chapters if c['name'] not in user_chapter_names]
            if not possible_chapters:
                continue
            target_chapter = random.choice(possible_chapters)

            req = {'id': generate(), 'user': user, 'chapterName': target_chapter['name'], 'status': 'Pending', 'createdAt': self.now - timedelta(days=random.randint(1,10))}
            self.chapter_join_requests.append(req)

            # Notify organisers of that chapter
            organisers = [u for u in self.users if target_chapter['name'] in u.get('organiserOf', [])]
            for org in organisers:
                self.notifications.append({'userId': org['id'], 'type': NotificationType.CHAPTER_JOIN_REQUEST, 'message': f"{user['name']} wants to join {target_chapter['name']}.", 'linkTo': '/manage', 'isRead': False, 'createdAt': req['createdAt'], 'relatedUser': user})
        print(f"Generated {len(self.chapter_join_requests)} chapter join requests.")

    def write_to_file(self):
        def create_lite_user(user): return {'id': user['id'], 'name': user['name'], 'role': user['role'], 'profilePictureUrl': user['profilePictureUrl']} if user else None
        def create_lite_event(event): return {'id': event['id'], 'city': event['city'], 'location': event['location'], 'startDate': event['startDate']} if event else None

        # Deepcopy to avoid modifying original data during serialization
        events_s = copy.deepcopy(self.events)
        for event in events_s:
            event['organizer'] = create_lite_user(event['organizer'])
            for p in event['participants']:
                p['user'] = create_lite_user(p['user'])
        
        announcements_s = [dict(a, author=create_lite_user(a['author'])) for a in self.announcements]
        accomm_req_s = [dict(r, requester=create_lite_user(r['requester']), host=create_lite_user(r['host']), event=create_lite_event(r['event'])) for r in self.accommodation_requests]
        event_comments_s = [dict(c, author=create_lite_user(c['author'])) for c in self.event_comments]
        notifications_s = [dict(n, relatedUser=create_lite_user(n.get('relatedUser'))) for n in self.notifications]
        badge_awards_s = [dict(b, awarder=create_lite_user(b['awarder']), recipient=create_lite_user(b['recipient'])) for b in self.badge_awards]
        chapter_join_req_s = [dict(r, user=create_lite_user(r['user'])) for r in self.chapter_join_requests]

        class DateTimeEncoder(json.JSONEncoder):
            def default(self, o):
                if isinstance(o, (datetime, date)):
                    return o.isoformat()
                return super().default(o)

        def write_data(data, name, type_name):
            return f"export const MOCK_{name.upper()}: {type_name}[] = {json.dumps(data, cls=DateTimeEncoder, indent=2)};"

        file_content = f"""
// This file is auto-generated by generate_mock_data.py. Do not edit manually.
import {{
  User, Chapter, CubeEvent, Announcement, Resource, OutreachLog, AccommodationRequest, EventComment, Challenge, Notification, BadgeAward, InventoryItem, ChapterJoinRequest
}} from './types';

{write_data(self.users, 'users', 'User')}
{write_data(self.chapters, 'chapters', 'Chapter')}
{write_data(events_s, 'cube_events', 'CubeEvent')}
{write_data(announcements_s, 'announcements', 'Announcement')}
{write_data(self.resources, 'resources', 'Resource')}
{write_data(self.outreach_logs, 'outreach_logs', 'OutreachLog')}
{write_data(accomm_req_s, 'accommodation_requests', 'AccommodationRequest')}
{write_data(event_comments_s, 'event_comments', 'EventComment')}
{write_data(self.challenges, 'challenges', 'Challenge')}
{write_data(notifications_s, 'notifications', 'Notification')}
{write_data(badge_awards_s, 'badge_awards', 'BadgeAward')}
{write_data(self.inventory, 'inventory', 'InventoryItem')}
{write_data(chapter_join_req_s, 'chapter_join_requests', 'ChapterJoinRequest')}
"""
        output_path = Path(__file__).parent / 'src' / 'mockData.ts'
        output_path.write_text(file_content, encoding='utf-8')
        print(f"   Output file: {output_path}")

    def run(self):
        self.generate_chapters()
        self.generate_users_and_roles()
        self.generate_events()
        self.generate_post_event_data()
        self.generate_ancillary_data()
        self.generate_inventory()
        self.generate_chapter_join_requests()
        self.write_to_file()

if __name__ == "__main__":
    generator = MockDataGenerator(CONFIG)
    generator.run()
    print("\n✅ Successfully generated mock data!")