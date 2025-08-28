"""
Configuration settings for mock data generation.
Centralized configuration management with validation and extensibility.
"""

from dataclasses import dataclass, field
from typing import Dict, List, Any
from enum import Enum
import os

class Role(Enum):
    APPLICANT = 'Applicant'
    ACTIVIST = 'Activist'
    CONFIRMED_ACTIVIST = 'Activist (Confirmed)'
    CHAPTER_ORGANISER = 'Chapter Organiser'
    REGIONAL_ORGANISER = 'Regional Organiser'
    GLOBAL_ADMIN = 'Global Admin'
    GODMODE = 'Godmode'


@dataclass
class GenerationConfig:
    """Main configuration class for mock data generation."""
    
    # Core entity counts
    chapters: int = 50
    users: int = 1000
    events_per_chapter: int = 20
    special_regional_events: int = 10
    announcements: int = 100
    resources: int = 8
    accommodation_requests_per_event: int = 1
    comments_per_event: int = 3
    badge_awards: int = 100
    chapter_join_requests: int = 25
    challenges: int = 15
    
    # Data quality settings
    seed: int = 42  # For reproducible data generation
    realistic_relationships: bool = True
    include_edge_cases: bool = True
    
    # Geographic distribution
    countries: List[str] = field(default_factory=lambda: [
        'USA', 'UK', 'Germany', 'Australia', 'Canada', 
        'France', 'Spain', 'Mexico', 'Netherlands', 'Sweden'
    ])
    
    cities: List[str] = field(default_factory=lambda: [
        "London", "New York", "Berlin", "Paris", "Tokyo", "Sydney", 
        "Toronto", "Amsterdam", "Barcelona", "Rome", "Madrid", 
        "Vienna", "Prague", "Budapest", "Warsaw", "Stockholm",
        "San Francisco", "Los Angeles", "Chicago", "Boston", 
        "Seattle", "Portland", "Denver", "Austin", "Melbourne",
        "Munich", "Hamburg", "Copenhagen", "Oslo", "Helsinki"
    ])
    
    # User distribution patterns
    user_activity_weights: Dict[str, float] = field(default_factory=lambda: {
        'high': 0.2,    # 20% highly active users
        'medium': 0.5,  # 50% moderately active
        'low': 0.3      # 30% low activity
    })
    user_churn_rate: float = 0.15  # 15% of users will have a leaveDate
    
    # Onboarding status distribution for new users
    onboarding_distribution: Dict[str, float] = field(default_factory=lambda: {
        'confirmed': 0.80,
        'awaiting_verification': 0.10,
        'pending_review': 0.05,
        'denied': 0.05
    })
    
    # Event patterns
    event_attendance_patterns: Dict[str, Dict[str, float]] = field(default_factory=lambda: {
        'high': {'attendance_rate': 0.9, 'conversation_multiplier': 1.5},
        'medium': {'attendance_rate': 0.6, 'conversation_multiplier': 1.0},
        'low': {'attendance_rate': 0.2, 'conversation_multiplier': 0.5}
    })
    
    # Output settings
    output_format: str = 'typescript'
    output_path: str = 'src/mockData.ts'
    include_comments: bool = True
    export_formats: List[str] = field(default_factory=lambda: ['typescript'])
    
    # Advanced features
    enable_performance_profiling: bool = False
    enable_data_repair: bool = True
    scenario_name: str = 'default'
    
    # Event comment settings
    comment_probability: float = 0.4
    comments_per_event_range: tuple = (1, 5)
    
    # Chapter join request settings
    join_request_probability: float = 0.15
    
    def validate(self) -> bool:
        """Validate configuration settings."""
        if self.chapters <= 0 or self.users <= 0:
            raise ValueError("Chapters and users must be positive integers")
        
        if len(self.countries) == 0 or len(self.cities) == 0:
            raise ValueError("Must have at least one country and city")
        
        if sum(self.user_activity_weights.values()) != 1.0:
            raise ValueError("User activity weights must sum to 1.0")
        
        return True
    
    @classmethod
    def from_env(cls) -> 'GenerationConfig':
        """Create configuration from environment variables."""
        config = cls()
        
        # Override with environment variables if present
        if chapters := os.getenv('MOCK_CHAPTERS'):
            config.chapters = int(chapters)
        if users := os.getenv('MOCK_USERS'):
            config.users = int(users)
        if seed := os.getenv('MOCK_SEED'):
            config.seed = int(seed)
        
        config.validate()
        return config


# Predefined data constants
BADGE_TEMPLATES = [
    {
        'name': 'First Cube',
        'description': 'Attended your first Cube of Truth.',
        'icon': 'StarIcon',
        'type': 'stat',
        'criteria': {'cubes_attended': 1}
    },
    {
        'name': 'Road Warrior',
        'description': 'Attended events in 5+ different cities.',
        'icon': 'GlobeAltIcon',
        'type': 'stat',
        'criteria': {'cities_count': 5}
    },
    {
        'name': 'Top Orator',
        'description': 'Logged over 100 conversations.',
        'icon': 'SparklesIcon',
        'type': 'stat',
        'criteria': {'total_conversations': 100}
    },
    {
        'name': 'Veteran Activist',
        'description': 'Contributed over 100 hours of outreach.',
        'icon': 'TrophyIcon',
        'type': 'stat',
        'criteria': {'total_hours': 100}
    },
    {
        'name': 'Community Pillar',
        'description': 'Attended over 25 cubes total.',
        'icon': 'UsersIcon',
        'type': 'stat',
        'criteria': {'cubes_attended': 25}
    },
    {
        'name': 'On Fire',
        'description': 'Attended 5 cubes in a single month.',
        'icon': 'FireIcon',
        'type': 'manual'
    },
    {
        'name': 'Local Legend',
        'description': 'Recognized for exceptional contribution to a chapter.',
        'icon': 'ShieldCheckIcon',
        'type': 'manual'
    },
    {
        'name': 'Mentor',
        'description': 'Provided outstanding guidance to new activists.',
        'icon': 'AcademicCapIcon',
        'type': 'manual'
    },
]

RESOURCE_CATEGORIES = {
    'Document': {
        'icon': 'DocumentTextIcon',
        'titles': [
            'Effective Outreach Strategies',
            'Vegan Nutrition Guide',
            'Event Planning Checklist',
            'Legal Guidelines for Activism',
            'Communication Best Practices'
        ]
    },
    'Video': {
        'icon': 'VideoCameraIcon',
        'titles': [
            'Cube of Truth Setup Tutorial',
            'Handling Difficult Conversations',
            'Animal Rights Documentary Recommendations',
            'Public Speaking for Activists',
            'Digital Outreach Techniques'
        ]
    },
    'Guide': {
        'icon': 'BookOpenIcon',
        'titles': [
            'New Activist Onboarding',
            'Chapter Leadership Handbook',
            'Social Media Strategy Guide',
            'Fundraising for Animal Rights',
            'Building Community Partnerships'
        ]
    }
}

REALISTIC_EVENT_NAMES = [
    "Cube of Truth",
    "Vegan Outreach",
    "Animal Rights Awareness",
    "Truth Cube",
    "Street Outreach",
    "Vegan Education Event",
    "Animal Liberation Outreach",
    "Compassion Cube",
    "Ethical Living Workshop",
    "Plant-Based Advocacy"
]

CONVERSATION_OUTCOMES_WEIGHTED = [
    ('No change / Dismissive', 0.35),
    ('Not sure', 0.25),
    ('Mostly sure', 0.20),
    ('Became vegan', 0.12),
    ('Already vegan, now activist', 0.05),
    ('Became vegan and activist', 0.03)
]
