#!/usr/bin/env python3
"""
Enhanced Mock Data Generation Pipeline
=====================================

A comprehensive, modular mock data generator with improved realism,
validation, and extensibility for the activist platform.

Features:
- Modular architecture with specialized generators
- Realistic data relationships and patterns
- Comprehensive validation and error handling
- Flexible configuration management
- Progress tracking and detailed reporting
- TypeScript output with proper type safety
"""

import sys
from pathlib import Path
from datetime import datetime

# Add mock_data package to path
sys.path.insert(0, str(Path(__file__).parent))

from mock_data.config import GenerationConfig
from mock_data.generators import ChapterGenerator, UserGenerator, EventGenerator, OutreachGenerator
from mock_data.ancillary_generators import (
    AnnouncementGenerator, ResourceGenerator, NotificationGenerator,
    BadgeGenerator, InventoryGenerator, AccommodationGenerator
)
from mock_data.advanced_generators import (
    EventCommentGenerator, ChapterJoinRequestGenerator, 
    DataRelationshipEnhancer, PerformanceProfiler
)
from mock_data.export_formats import DataExporter, ScenarioManager, DataConsistencyChecker
from mock_data.utils import (
    DataValidator, DataSerializer, ProgressTracker, 
    calculate_data_stats, format_number
)


class EnhancedMockDataGenerator:
    """Main orchestrator for the enhanced mock data generation pipeline."""
    
    def __init__(self, config: GenerationConfig = None):
        self.config = config or GenerationConfig.from_env()
        
        # Apply scenario configuration if specified
        if self.config.scenario_name != 'default':
            self.config = ScenarioManager.get_scenario_config(self.config.scenario_name, self.config)
        
        self.progress = ProgressTracker()
        self.profiler = PerformanceProfiler() if self.config.enable_performance_profiling else None
        self.data = {}
        
        # Initialize progress tracking
        self._setup_progress_tracking()
        
        print("🚀 Enhanced Mock Data Generator v2.0")
        print("=" * 50)
        print(f"Scenario: {self.config.scenario_name}")
        print(f"Configuration: {self.config.chapters} chapters, {self.config.users} users")
        print(f"Seed: {self.config.seed} (reproducible: {self.config.seed != 42})")
        if self.config.enable_performance_profiling:
            print("Performance profiling: ENABLED")
        print()
    
    def _setup_progress_tracking(self):
        """Setup progress tracking steps."""
        steps = [
            ("Generate Chapters", "Creating geographic chapter distribution"),
            ("Generate Users", "Creating users with realistic role distribution"),
            ("Generate Events", "Creating events with proper participation patterns"),
            ("Generate Outreach Data", "Creating outreach logs and updating statistics"),
            ("Generate Announcements", "Creating announcements from organizers"),
            ("Generate Resources", "Creating educational and training resources"),
            ("Generate Accommodation", "Creating accommodation requests"),
            ("Generate Event Comments", "Creating event discussions and feedback"),
            ("Generate Chapter Join Requests", "Creating chapter membership requests"),
            ("Generate Notifications", "Creating user notifications"),
            ("Generate Badges", "Awarding badges and creating nominations"),
            ("Generate Inventory", "Creating chapter inventory items"),
            ("Enhance Relationships", "Adding advanced cross-references and connections"),
            ("Validate Data", "Running comprehensive data validation"),
            ("Check Consistency", "Checking and repairing data consistency"),
            ("Serialize Data", "Preparing data for output"),
            ("Export Data", "Writing to multiple output formats")
        ]
        
        for name, description in steps:
            self.progress.add_step(name, description)
    
    def generate_all_data(self) -> dict:
        """Generate all mock data using the modular pipeline."""
        try:
            # Step 1: Generate Chapters
            self.progress.start_step(0)
            chapter_gen = ChapterGenerator(self.config)
            self.data['chapters'] = chapter_gen.generate_chapters()
            self.progress.complete_step(0, f"Generated {len(self.data['chapters'])} chapters")
            
            # Step 2: Generate Users
            self.progress.start_step(1)
            user_gen = UserGenerator(self.config, self.data['chapters'])
            self.data['users'] = user_gen.generate_users()
            self.progress.complete_step(1, f"Generated {len(self.data['users'])} users with role assignments")
            
            # Step 3: Generate Events
            self.progress.start_step(2)
            event_gen = EventGenerator(self.config, self.data['chapters'], self.data['users'])
            self.data['events'] = event_gen.generate_events()
            self.progress.complete_step(2, f"Generated {len(self.data['events'])} events")
            
            # Step 4: Generate Outreach Data
            self.progress.start_step(3)
            outreach_gen = OutreachGenerator(self.config, self.data['events'], self.data['users'])
            self.data['outreach_logs'], self.data['users'] = outreach_gen.generate_outreach_data()
            self.progress.complete_step(3, f"Generated {len(self.data['outreach_logs'])} outreach logs")
            
            # Step 5: Generate Announcements
            self.progress.start_step(4)
            announcement_gen = AnnouncementGenerator(self.config, self.data['users'], self.data['chapters'])
            self.data['announcements'] = announcement_gen.generate_announcements()
            self.progress.complete_step(4, f"Generated {len(self.data['announcements'])} announcements")
            
            # Step 6: Generate Resources
            self.progress.start_step(5)
            resource_gen = ResourceGenerator(self.config)
            self.data['resources'] = resource_gen.generate_resources()
            self.progress.complete_step(5, f"Generated {len(self.data['resources'])} resources")
            
            # Step 7: Generate Accommodation Requests
            self.progress.start_step(6)
            if self.profiler: self.profiler.start_timing('accommodation')
            accommodation_gen = AccommodationGenerator(self.config, self.data['users'], self.data['events'])
            self.data['accommodation_requests'] = accommodation_gen.generate_accommodation_requests()
            if self.profiler: self.profiler.end_timing('accommodation')
            self.progress.complete_step(6, f"Generated {len(self.data['accommodation_requests'])} accommodation requests")
            
            # Step 8: Generate Event Comments
            self.progress.start_step(7)
            if self.profiler: self.profiler.start_timing('event_comments')
            comment_gen = EventCommentGenerator(self.config, self.data['events'], self.data['users'])
            self.data['event_comments'] = comment_gen.generate_event_comments()
            if self.profiler: self.profiler.end_timing('event_comments')
            self.progress.complete_step(7, f"Generated {len(self.data['event_comments'])} event comments")
            
            # Step 9: Generate Chapter Join Requests
            self.progress.start_step(8)
            if self.profiler: self.profiler.start_timing('chapter_join_requests')
            join_gen = ChapterJoinRequestGenerator(self.config, self.data['users'], self.data['chapters'])
            self.data['chapter_join_requests'] = join_gen.generate_chapter_join_requests()
            if self.profiler: self.profiler.end_timing('chapter_join_requests')
            self.progress.complete_step(8, f"Generated {len(self.data['chapter_join_requests'])} chapter join requests")
            
            # Step 10: Generate Notifications (depends on accommodation requests)
            self.progress.start_step(9)
            if self.profiler: self.profiler.start_timing('notifications')
            notification_gen = NotificationGenerator(
                self.config, self.data['users'], self.data['events'], self.data['accommodation_requests']
            )
            base_notifications = notification_gen.generate_notifications()
            
            # Step 11: Generate Badges (also creates notifications)
            self.progress.start_step(10)
            if self.profiler: self.profiler.start_timing('badges')
            badge_gen = BadgeGenerator(self.config, self.data['users'])
            badge_notifications, self.data['badge_awards'] = badge_gen.generate_badges_and_awards()
            
            # Combine all notifications
            self.data['notifications'] = base_notifications + badge_notifications
            if self.profiler: self.profiler.end_timing('badges')
            if self.profiler: self.profiler.end_timing('notifications')
            self.progress.complete_step(10, f"Generated {len(self.data['badge_awards'])} badge awards")
            
            # Step 12: Generate Inventory
            self.progress.start_step(11)
            if self.profiler: self.profiler.start_timing('inventory')
            inventory_gen = InventoryGenerator(self.config, self.data['chapters'])
            self.data['inventory'] = inventory_gen.generate_inventory()
            if self.profiler: self.profiler.end_timing('inventory')
            self.progress.complete_step(11, f"Generated {len(self.data['inventory'])} inventory items")
            
            # Step 13: Enhance Relationships
            self.progress.start_step(12)
            if self.profiler: self.profiler.start_timing('relationships')
            relationship_enhancer = DataRelationshipEnhancer(self.config, self.data)
            self.data = relationship_enhancer.enhance_relationships()
            if self.profiler: self.profiler.end_timing('relationships')
            self.progress.complete_step(12, "Enhanced data relationships and cross-references")
            
            # Add empty collections for completeness
            self.data['challenges'] = []  # Placeholder for future implementation
            
            return self.data
            
        except Exception as e:
            print(f"❌ Error during data generation: {str(e)}")
            raise
    
    def validate_data(self) -> bool:
        """Validate generated data for consistency and completeness."""
        self.progress.start_step(13)
        
        validator = DataValidator()
        all_issues = []
        
        # Validate individual entity types
        user_issues = validator.validate_users(self.data['users'])
        event_issues = validator.validate_events(self.data['events'], self.data['users'])
        relationship_issues = validator.validate_relationships(self.data)
        
        all_issues.extend(user_issues)
        all_issues.extend(event_issues)
        all_issues.extend(relationship_issues)
        
        if all_issues:
            print("⚠️  Validation Issues Found:")
            for issue in all_issues[:10]:  # Show first 10 issues
                print(f"   • {issue}")
            if len(all_issues) > 10:
                print(f"   ... and {len(all_issues) - 10} more issues")
            
            self.progress.complete_step(13, f"Found {len(all_issues)} validation issues")
            return False
        else:
            self.progress.complete_step(13, "All validation checks passed")
            return True
    
    def check_consistency(self) -> dict:
        """Check and repair data consistency issues."""
        self.progress.start_step(14)
        
        if self.config.enable_data_repair:
            checker = DataConsistencyChecker(self.data)
            consistency_report = checker.check_and_repair()
            self.progress.complete_step(14, f"Checked consistency: {consistency_report['issues_found']} issues, {consistency_report['repairs_made']} repairs")
            return consistency_report
        else:
            self.progress.complete_step(14, "Consistency checking disabled")
            return {'issues_found': 0, 'repairs_made': 0}
    
    def serialize_and_export(self) -> dict:
        """Serialize data and export to multiple formats."""
        # Step 15: Serialize Data
        self.progress.start_step(15)
        serializer = DataSerializer()
        serialized_data = serializer.prepare_for_serialization(self.data)
        self.progress.complete_step(15, "Data serialization completed")
        
        # Step 16: Export Data
        self.progress.start_step(16)
        exporter = DataExporter(serialized_data, str(Path(self.config.output_path).parent))
        exported_files = exporter.export_all_formats(self.config.export_formats)
        
        export_summary = ", ".join(f"{fmt}: {path}" for fmt, path in exported_files.items())
        self.progress.complete_step(16, f"Exported to: {export_summary}")
        
        return exported_files
    
    def generate_report(self) -> dict:
        """Generate a comprehensive report of the generated data."""
        stats = calculate_data_stats(self.data)
        
        report = {
            'generation_time': datetime.now().isoformat(),
            'config': {
                'scenario': self.config.scenario_name,
                'chapters': self.config.chapters,
                'users': self.config.users,
                'seed': self.config.seed,
                'realistic_relationships': self.config.realistic_relationships,
                'export_formats': self.config.export_formats
            },
            'statistics': stats,
            'progress': self.progress.get_progress()
        }
        
        if self.profiler:
            report['performance'] = self.profiler.get_performance_report()
        
        return report
    
    def print_summary(self):
        """Print a summary of the generated data."""
        stats = calculate_data_stats(self.data)
        
        print("\n📊 Generation Summary")
        print("=" * 50)
        
        # Entity counts
        print("Entity Counts:")
        for entity_type, stat in stats.items():
            if entity_type.startswith('_'):
                continue
            print(f"  • {entity_type.replace('_', ' ').title()}: {format_number(stat['count'])}")
        
        print(f"\nTotal Entities: {format_number(stats['_totals']['total_entities'])}")
        print(f"Output Size: {stats['_totals']['total_size_mb']:.2f} MB")
        
        # User distribution
        confirmed_users = len([u for u in self.data['users'] if u['onboardingStatus'] == 'Confirmed'])
        organizers = len([u for u in self.data['users'] if 'Organiser' in u['role'] or u['role'] in ['Global Admin', 'Godmode']])
        
        print(f"\nUser Distribution:")
        print(f"  • Confirmed Users: {format_number(confirmed_users)} ({confirmed_users/len(self.data['users'])*100:.1f}%)")
        print(f"  • Organizers: {format_number(organizers)} ({organizers/len(self.data['users'])*100:.1f}%)")
        
        # Event distribution
        finished_events = len([e for e in self.data['events'] if e['status'] == 'Finished'])
        upcoming_events = len([e for e in self.data['events'] if e['status'] == 'Upcoming'])
        
        print(f"\nEvent Distribution:")
        print(f"  • Finished Events: {format_number(finished_events)}")
        print(f"  • Upcoming Events: {format_number(upcoming_events)}")
        
        # Geographic distribution
        countries = len(set(ch['country'] for ch in self.data['chapters']))
        print(f"\nGeographic Coverage:")
        print(f"  • Countries: {countries}")
        print(f"  • Cities: {len(self.data['chapters'])}")
        
        print(f"\n✅ Mock data generation completed successfully!")
        print(f"Output file: {self.config.output_path}")


def main():
    """Main entry point for the enhanced mock data generator."""
    try:
        # Load configuration
        config = GenerationConfig.from_env()
        config.validate()
        
        # Create generator
        generator = EnhancedMockDataGenerator(config)
        
        # Generate all data
        data = generator.generate_all_data()
        
        # Validate data
        is_valid = generator.validate_data()
        if not is_valid and config.include_edge_cases:
            print("⚠️  Proceeding despite validation issues (edge cases enabled)")
        
        # Check and repair consistency
        consistency_report = generator.check_consistency()
        
        # Serialize and export to multiple formats
        exported_files = generator.serialize_and_export()
        
        # Print summary
        generator.print_summary()
        
        return True
        
    except KeyboardInterrupt:
        print("\n❌ Generation cancelled by user")
        return False
    except Exception as e:
        print(f"\n❌ Generation failed: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
