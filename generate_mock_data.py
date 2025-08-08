import json
import random
from datetime import datetime, date, timedelta
from faker import Faker
from nanoid import generate
from pathlib import Path
import copy

print("Starting mock data generation with Python...")

# --- CONFIGURATION ---
CONFIG = {
    "chapters": 20,
    "users": 200,
    "events_per_chapter": 6,
    "special_regional_events": 5,
    "announcements": 10,
    "resources": 5,
    "accommodation_requests_per_event": 1,
    "comments_per_event": 3,
    "badge_awards": 40,
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
    # REMOVED: PENDING_ONBOARDING_CALL = 'Pending Onboarding Call'
    AWAITING_VERIFICATION = 'Awaiting Verification'
    CONFIRMED = 'Confirmed'
    DENIED = 'Denied'
    INACTIVE = 'Inactive'

class EventRole:
    ORGANIZER = 'Organizer'
    ACTIVIST = 'Activist'

class EventStatus:
    UPCOMING = 'Upcoming'
    ONGOING = 'Ongoing'
    FINISHED = 'Finished'

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
    ACCOMMODATION_REQUEST = 'Accommodation Request'
    REQUEST_ACCEPTED = 'Request Accepted'
    REQUEST_DENIED = 'Request Denied'
    BADGE_AWARDED = 'Badge Awarded'
    BADGE_AWARD_ACCEPTED = 'Badge Award Accepted'
    BADGE_AWARD_REJECTED = 'Badge Award Rejected'

VALID_OUTREACH_OUTCOMES = [v for k, v in OutreachOutcome.__dict__.items() if not k.startswith('__')]
VALID_RESOURCE_TYPES = [v for k, v in ResourceType.__dict__.items() if not k.startswith('__')]
VALID_SKILL_LEVELS = [v for k, v in SkillLevel.__dict__.items() if not k.startswith('__')]

COUNTRIES = ['USA', 'UK', 'Germany', 'Australia', 'Canada', 'France', 'Spain', 'Mexico']
ALL_BADGE_TEMPLATES = [
    {'name': 'First Cube', 'description': 'Attended your first Cube of Truth.', 'icon': 'StarIcon'},
    {'name': 'Road Warrior', 'description': 'Attended events in 5+ different cities.', 'icon': 'GlobeAltIcon'},
    {'name': 'Top Orator', 'description': 'Logged over 100 conversations.', 'icon': 'SparklesIcon'},
    {'name': 'Veteran Activist', 'description': 'Contributed over 100 hours of outreach.', 'icon': 'TrophyIcon'},
    {'name': 'On Fire', 'description': 'Attended 5 cubes in a single month.', 'icon': 'FireIcon'},
    {'name': 'Community Pillar', 'description': 'Attended over 25 cubes total.', 'icon': 'UsersIcon'},
    {'name': 'Local Legend', 'description': 'Recognized for exceptional contribution to a chapter.', 'icon': 'ShieldCheckIcon'},
    {'name': 'Mentor', 'description': 'Provided outstanding guidance to new activists.', 'icon': 'AcademicCapIcon'},
]
RESOURCE_ICONS = {
    ResourceType.DOCUMENT: 'DocumentTextIcon',
    ResourceType.VIDEO: 'VideoCameraIcon',
    ResourceType.GUIDE: 'BookOpenIcon',
}

# --- SCRIPT LOGIC ---
fake = Faker()
now = datetime.now()

def get_random_date(start, end):
    if start > end:
        start, end = end, start
    return start + timedelta(seconds=random.randint(0, int((end - start).total_seconds())))

# 1. Generate Chapters
chapters = [{
    'name': fake.city(),
    'country': random.choice(COUNTRIES),
    'lat': float(fake.latitude()),
    'lng': float(fake.longitude()),
    'instagram': f"@av.{fake.city().lower().replace(' ', '')}"
} for _ in range(CONFIG['chapters'])]
print(f"Generated {len(chapters)} chapters.")

# 2. Generate Users
users = []
for _ in range(CONFIG['users']):
    # CHANGED: Simplified the onboarding status generation
    status = random.choices(
        [OnboardingStatus.CONFIRMED, OnboardingStatus.AWAITING_VERIFICATION, OnboardingStatus.PENDING_APPLICATION_REVIEW],
        weights=[85, 10, 5], k=1)[0]
    user_chapters = random.sample(chapters, k=random.randint(1, 3))
    users.append({
        'id': generate(),
        'name': fake.name(),
        'email': fake.email(), # NEW: Added email
        'role': Role.CONFIRMED_ACTIVIST if status == OnboardingStatus.CONFIRMED else Role.ACTIVIST,
        'instagram': fake.user_name(),
        'chapters': [c['name'] for c in user_chapters],
        'stats': {'totalHours': 0, 'cubesAttended': 0, 'veganConversions': 0, 'totalConversations': 0, 'cities': []},
        'profilePictureUrl': f"https://i.pravatar.cc/150?u={generate()}",
        'badges': [],
        'hostingAvailability': random.random() < 0.3,
        'hostingCapacity': random.randint(1, 4),
        'onboardingStatus': status,
        'onboardingAnswers': {
            'veganReason': fake.paragraph(),
            'abolitionistAlignment': random.random() < 0.8,
            'customAnswer': fake.sentence()
        },
        'joinDate': fake.past_datetime(start_date='-2y'),
        'organizerNotes': []
    })
print(f"Generated {len(users)} users.")

# 3. Assign Organizer Roles & One Global Admin
regional_organisers = {}
confirmed_users = [u for u in users if u['onboardingStatus'] == OnboardingStatus.CONFIRMED]
if confirmed_users:
    global_admin_candidate = random.choice(confirmed_users)
    global_admin_candidate['role'] = Role.GLOBAL_ADMIN

for country in COUNTRIES:
    candidates = [u for u in users if any(c['country'] == country for c in chapters if c['name'] in u['chapters']) and u['onboardingStatus'] == OnboardingStatus.CONFIRMED]
    if candidates:
        organiser = random.choice(candidates)
        if organiser['role'] not in [Role.GLOBAL_ADMIN, Role.GODMODE]:
            organiser['role'] = Role.REGIONAL_ORGANISER
            organiser['managedCountry'] = country
            regional_organisers[country] = organiser

for chapter in chapters:
    candidates = [u for u in users if chapter['name'] in u['chapters'] and u['onboardingStatus'] == OnboardingStatus.CONFIRMED]
    if candidates:
        organiser = random.choice(candidates)
        if organiser['role'] not in [Role.REGIONAL_ORGANISER, Role.GLOBAL_ADMIN, Role.GODMODE]:
            organiser['role'] = Role.CHAPTER_ORGANISER
        if 'organiserOf' not in organiser:
            organiser['organiserOf'] = []
        if chapter['name'] not in organiser['organiserOf']:
            organiser['organiserOf'].append(chapter['name'])
print("Assigned organizer roles.")

# 4. Generate Events
events = []
for chapter in chapters:
    members = [u for u in users if chapter['name'] in u['chapters'] and u['onboardingStatus'] == OnboardingStatus.CONFIRMED]
    if not members: continue
    organiser = next((u for u in members if u.get('organiserOf') and chapter['name'] in u['organiserOf']), random.choice(members))
    for _ in range(CONFIG['events_per_chapter']):
        dt = get_random_date(now - timedelta(days=365), now + timedelta(days=60))
        participants_sample = random.sample(members, k=min(len(members), random.randint(3, 25)))
        if organiser not in participants_sample:
            participants_sample.append(organiser)
        events.append({
            'id': generate(),
            'city': chapter['name'],
            'location': f"{chapter['name']} Cube of Truth",
            'startDate': dt,
            'scope': 'Chapter',
            'organizer': organiser,
            'participants': [{'user': p, 'eventRole': EventRole.ORGANIZER if p['id'] == organiser['id'] else EventRole.ACTIVIST} for p in participants_sample],
            'status': EventStatus.UPCOMING if dt > now else EventStatus.FINISHED
        })

regional_organisers_list = [u for u in users if u['role'] == Role.REGIONAL_ORGANISER]
for _ in range(CONFIG['special_regional_events']):
    if not regional_organisers_list: break
    organiser = random.choice(regional_organisers_list)
    region = organiser['managedCountry']
    region_chapters = [c for c in chapters if c['country'] == region]
    if not region_chapters: continue
    host_chapter = random.choice(region_chapters)

    start_dt = get_random_date(now, now + timedelta(days=90))
    end_dt = start_dt + timedelta(days=random.randint(2, 6))

    all_region_members = [u for u in users if any(c['country'] == region for c in chapters if c['name'] in u['chapters']) and u['onboardingStatus'] == OnboardingStatus.CONFIRMED]
    participants_sample = random.sample(all_region_members, k=min(len(all_region_members), random.randint(15, 50)))
    if organiser not in participants_sample:
            participants_sample.append(organiser)

    events.append({
        'id': generate(),
        'city': host_chapter['name'],
        'location': f"{region} Regional Action Week",
        'startDate': start_dt,
        'endDate': end_dt,
        'scope': 'Regional',
        'targetRegion': region,
        'organizer': organiser,
        'participants': [{'user': p, 'eventRole': EventRole.ORGANIZER if p['id'] == organiser['id'] else EventRole.ACTIVIST} for p in participants_sample],
        'status': EventStatus.UPCOMING if start_dt > now else EventStatus.FINISHED
    })

print(f"Generated {len(events)} total events.")

# 5. Generate Interconnected Data from Past Events
outreach_logs = []
past_events = [e for e in events if e['status'] == EventStatus.FINISHED]
for event in past_events:
    hours = random.randint(2, 5)
    event['report'] = {'hours': hours, 'attendance': {p['user']['id']: random.choices(['Attended', 'Absent'], weights=[9, 1], k=1)[0] for p in event['participants']}}
    for p_data in event['participants']:
        user = p_data['user']
        if event['report']['attendance'][user['id']] == 'Attended':
            user['stats']['totalHours'] += hours
            user['stats']['cubesAttended'] += 1
            if event['city'] not in user['stats']['cities']:
                user['stats']['cities'].append(event['city'])
            for _ in range(random.randint(0, 15)):
                outcome = random.choice(VALID_OUTREACH_OUTCOMES)
                outreach_logs.append({'id': generate(), 'userId': user['id'], 'eventId': event['id'], 'outcome': outcome, 'notes': fake.sentence() if random.random() < 0.4 else None, 'createdAt': event['startDate']})
                user['stats']['totalConversations'] += 1
                if outcome in [OutreachOutcome.BECAME_VEGAN, OutreachOutcome.BECAME_VEGAN_ACTIVIST]:
                    user['stats']['veganConversions'] += 1

print("Generated reports, logs, and calculated user stats.")

# 6. Generate Announcements
announcements = []
organizers = [u for u in users if u['role'] in [Role.CHAPTER_ORGANISER, Role.REGIONAL_ORGANISER, Role.GLOBAL_ADMIN, Role.GODMODE]]
if organizers:
    for _ in range(CONFIG['announcements']):
        author = random.choice(organizers)
        possible_scopes = []
        if author['role'] in [Role.GODMODE, Role.GLOBAL_ADMIN]:
            possible_scopes.extend([AnnouncementScope.GLOBAL, AnnouncementScope.REGIONAL, AnnouncementScope.CHAPTER])
        elif author['role'] == Role.REGIONAL_ORGANISER:
            possible_scopes.extend([AnnouncementScope.REGIONAL, AnnouncementScope.CHAPTER])
        elif author['role'] == Role.CHAPTER_ORGANISER:
            possible_scopes.append(AnnouncementScope.CHAPTER)

        if not possible_scopes: continue
        scope = random.choice(possible_scopes)
        announcement = {
            'id': generate(), 'author': author, 'scope': scope,
            'title': fake.bs().title(),
            'content': fake.paragraph(nb_sentences=random.randint(4, 10)),
            'createdAt': get_random_date(now - timedelta(days=90), now),
        }
        if scope == AnnouncementScope.CHAPTER:
            target_chapters = author.get('organiserOf') or author.get('chapters')
            if target_chapters: announcement['chapter'] = random.choice(target_chapters)
            else: continue
        elif scope == AnnouncementScope.REGIONAL:
            announcement['country'] = author.get('managedCountry') or random.choice(COUNTRIES)
        announcements.append(announcement)
print(f"Generated {len(announcements)} announcements.")

# 7. Generate Resources
resources = []
for _ in range(CONFIG['resources']):
    res_type = random.choice(VALID_RESOURCE_TYPES)
    resources.append({
        'id': generate(), 'title': fake.catch_phrase(), 'description': fake.text(max_nb_chars=150),
        'type': res_type,
        'skillLevel': random.choice(VALID_SKILL_LEVELS),
        'language': random.choice(['English', 'German', 'French', 'Spanish']),
        'url': fake.url(), 'icon': RESOURCE_ICONS.get(res_type, 'BookOpenIcon')
    })
print(f"Generated {len(resources)} resources.")

# 8. Generate Organizer Notes
organizer_list = [u for u in users if u['role'] in [Role.CHAPTER_ORGANISER, Role.REGIONAL_ORGANISER, Role.GLOBAL_ADMIN]]
if organizer_list:
    for user in users:
        if random.random() < 0.2:
            for _ in range(random.randint(1, 3)):
                author = random.choice(organizer_list)
                if 'organizerNotes' not in user: user['organizerNotes'] = []
                user['organizerNotes'].append({
                    'id': generate(), 'authorId': author['id'], 'authorName': author['name'],
                    'content': fake.paragraph(nb_sentences=2), 'createdAt': get_random_date(user.get('joinDate', now - timedelta(days=365)), now)
                })
    print("Generated organizer notes for some users.")

# 9. Accommodation Requests & Notifications
accommodation_requests = []
notifications = []
upcoming_events = [e for e in events if e['status'] == EventStatus.UPCOMING]

for event in upcoming_events:
    if not event['participants']: continue
    hosts = [u for u in users if event['city'] in u['chapters'] and u['hostingAvailability']]
    guests = [p['user'] for p in event['participants'] if not p['user']['hostingAvailability']]

    if hosts and guests:
        for _ in range(random.randint(0, CONFIG['accommodation_requests_per_event'])):
            requester = random.choice(guests)
            host = random.choice(hosts)
            if requester['id'] == host['id']: continue

            status = random.choices(['Pending', 'Accepted', 'Denied'], weights=[6, 2, 2], k=1)[0]
            req_date = get_random_date(now - timedelta(days=7), now)
            request = {
                'id': generate(), 'requester': requester, 'host': host, 'event': event,
                'startDate': event['startDate'] - timedelta(days=random.randint(0,1)),
                'endDate': (event.get('endDate') or event['startDate']) + timedelta(days=random.randint(1,2)),
                'message': fake.paragraph(nb_sentences=3), 'status': status,
                'hostReply': fake.sentence() if status != 'Pending' else None,
                'createdAt': req_date
            }
            accommodation_requests.append(request)

            notifications.append({
                'userId': host['id'], 'type': NotificationType.ACCOMMODATION_REQUEST,
                'message': f"{requester['name']} requested to stay for the {event['location']} event.",
                'linkTo': '/dashboard', 'isRead': random.random() > 0.5,
                'createdAt': req_date, 'relatedUser': requester
            })
            if status != 'Pending':
                notif_type = NotificationType.REQUEST_ACCEPTED if status == 'Accepted' else NotificationType.REQUEST_DENIED
                notifications.append({
                    'userId': requester['id'], 'type': notif_type,
                    'message': f"{host['name']} {status.lower()} your accommodation request.",
                    'linkTo': '/dashboard', 'isRead': random.random() > 0.5,
                    'createdAt': get_random_date(req_date, now), 'relatedUser': host
                })
print(f"Generated {len(accommodation_requests)} accommodation requests and related notifications.")

# 10. Generate Event Comments
event_comments = []
for event in events:
    if random.random() < 0.4 and event['participants']:
        for _ in range(random.randint(1, CONFIG['comments_per_event'])):
            author = random.choice(event['participants'])['user']
            event_comments.append({
                'id': generate(), 'eventId': event['id'], 'author': author, 'content': fake.sentence(),
                'createdAt': get_random_date(event['startDate'] - timedelta(days=5), (event.get('endDate') or event['startDate']) + timedelta(days=5)),
                'parentId': None
            })
print(f"Generated {len(event_comments)} event comments.")

# 11. Generate Challenges
chapter_stats_for_challenge = []
for chapter in chapters:
    chapter_users = [u for u in users if chapter['name'] in u['chapters']]
    total_hours = sum(u['stats']['totalHours'] for u in chapter_users)
    chapter_stats_for_challenge.append({'name': chapter['name'], 'totalHours': total_hours})

challenges = []
if chapter_stats_for_challenge:
    challenges.append({'id': 'challenge-1', 'title': 'Q3 Outreach Hours Challenge', 'description': 'Chapter with the most hours wins.', 'metric': 'Outreach Hours', 'goal': 5000, 'endDate': datetime(2025, 9, 30), 'participants': sorted([{'id': c['name'], 'name': c['name'], 'progress': c['totalHours']} for c in random.sample(chapter_stats_for_challenge, k=min(len(chapter_stats_for_challenge), 10))], key=lambda x: x['progress'], reverse=True)})
print(f"Generated {len(challenges)} challenges with dynamic progress.")

# 12. Generate Badge Awards
badge_awards = []
organizers = [u for u in users if u['role'] in [Role.CHAPTER_ORGANISER, Role.REGIONAL_ORGANISER, Role.GLOBAL_ADMIN]]
confirmed_activists = [u for u in users if u['onboardingStatus'] == OnboardingStatus.CONFIRMED]

if organizers and confirmed_activists:
    for _ in range(CONFIG['badge_awards']):
        awarder = random.choice(organizers)
        recipient = random.choice(confirmed_activists)
        if awarder['id'] == recipient['id']: continue
        badge_template = random.choice(ALL_BADGE_TEMPLATES)
        if any(b['name'] == badge_template['name'] for b in recipient['badges']): continue
        status = random.choices(['Pending', 'Accepted', 'Rejected'], weights=[5, 4, 1], k=1)[0]
        created_at = get_random_date(recipient.get('joinDate', now - timedelta(days=365)), now)
        award = {
            'id': generate(), 'awarder': awarder, 'recipient': recipient, 'badge': badge_template, 'status': status, 'createdAt': created_at
        }
        badge_awards.append(award)
        if status == 'Accepted':
            recipient['badges'].append({ 'id': generate(), **badge_template, 'awardedAt': created_at })
print(f"Generated {len(badge_awards)} badge awards.")

# --- SERIALIZATION PREPARATION ---
def create_lite_user(user):
    if not user: return None
    return {'id': user['id'], 'name': user['name'], 'role': user['role'], 'profilePictureUrl': user['profilePictureUrl']}

def create_lite_event(event):
    if not event: return None
    return {'id': event['id'], 'city': event['city'], 'location': event['location'], 'startDate': event['startDate']}

events_to_serialize = copy.deepcopy(events)
for event in events_to_serialize:
    event['organizer'] = create_lite_user(event['organizer'])
    for p in event['participants']:
        p['user'] = create_lite_user(p['user'])

announcements_to_serialize = copy.deepcopy(announcements)
for ann in announcements_to_serialize:
    ann['author'] = create_lite_user(ann['author'])

accommodation_requests_to_serialize = copy.deepcopy(accommodation_requests)
for req in accommodation_requests_to_serialize:
    req['requester'] = create_lite_user(req['requester'])
    req['host'] = create_lite_user(req['host'])
    req['event'] = create_lite_event(req['event'])

event_comments_to_serialize = copy.deepcopy(event_comments)
for comment in event_comments_to_serialize:
    comment['author'] = create_lite_user(comment['author'])

notifications_to_serialize = copy.deepcopy(notifications)
for notif in notifications_to_serialize:
    if 'relatedUser' in notif and notif['relatedUser']:
        notif['relatedUser'] = create_lite_user(notif['relatedUser'])

badge_awards_to_serialize = copy.deepcopy(badge_awards)
for award in badge_awards_to_serialize:
    award['awarder'] = create_lite_user(award['awarder'])
    award['recipient'] = create_lite_user(award['recipient'])

# --- JSON SERIALIZATION & FILE OUTPUT ---
class DateTimeEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, (datetime, date)):
            return o.isoformat()
        return super().default(o)

def write_data_to_file(data, name, type_name): # Add type_name parameter
    return f"export const MOCK_{name.upper()}: {type_name}[] = {json.dumps(data, cls=DateTimeEncoder, indent=2)};"
    
file_content = f"""
// This file is auto-generated by generate_mock_data.py. Do not edit manually.
{write_data_to_file(users, 'users')}
{write_data_to_file(chapters, 'chapters')}
{write_data_to_file(events_to_serialize, 'cube_events')}
{write_data_to_file(announcements_to_serialize, 'announcements')}
{write_data_to_file(resources, 'resources')}
{write_data_to_file(outreach_logs, 'outreach_logs')}
{write_data_to_file(accommodation_requests_to_serialize, 'accommodation_requests')}
{write_data_to_file(event_comments_to_serialize, 'event_comments')}
{write_data_to_file(challenges, 'challenges')}
{write_data_to_file(notifications_to_serialize, 'notifications')}
{write_data_to_file(badge_awards_to_serialize, 'badge_awards')}
"""

output_path = Path(__file__).parent / 'src' / 'mockData.ts'
output_path.write_text(file_content, encoding='utf-8')

print(f"\n✅ Successfully generated mock data!")
print(f"   Output file: {output_path}")