"""
Command-line interface for the enhanced mock data generator.
Provides easy access to scenarios, export formats, and configuration options.
"""

import argparse
import sys
from pathlib import Path
from typing import List

# Add mock_data package to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from mock_data.config import GenerationConfig
from mock_data.export_formats import ScenarioManager
from generate_mock_data_enhanced import EnhancedMockDataGenerator


def create_parser() -> argparse.ArgumentParser:
    """Create command-line argument parser."""
    parser = argparse.ArgumentParser(
        description="Enhanced Mock Data Generator v2.0",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python -m mock_data.cli --scenario small_test
  python -m mock_data.cli --chapters 30 --users 500 --export json csv
  python -m mock_data.cli --scenario high_activity --profile --export typescript json
  python -m mock_data.cli --list-scenarios
        """
    )
    
    # Core configuration
    parser.add_argument('--chapters', type=int, help='Number of chapters to generate')
    parser.add_argument('--users', type=int, help='Number of users to generate')
    parser.add_argument('--seed', type=int, help='Random seed for reproducible generation')
    
    # Scenario management
    parser.add_argument('--scenario', choices=list(ScenarioManager.SCENARIOS.keys()),
                       default='default', help='Predefined scenario to use')
    parser.add_argument('--list-scenarios', action='store_true',
                       help='List available scenarios and exit')
    
    # Export options
    parser.add_argument('--export', nargs='+', 
                       choices=['typescript', 'json', 'csv', 'sql'],
                       default=['typescript'],
                       help='Export formats (default: typescript)')
    parser.add_argument('--output-dir', default='src',
                       help='Output directory (default: src)')
    
    # Advanced features
    parser.add_argument('--profile', action='store_true',
                       help='Enable performance profiling')
    parser.add_argument('--no-repair', action='store_true',
                       help='Disable automatic data consistency repair')
    parser.add_argument('--no-relationships', action='store_true',
                       help='Disable advanced relationship enhancement')
    
    # Verbosity
    parser.add_argument('--quiet', action='store_true',
                       help='Suppress progress output')
    parser.add_argument('--verbose', action='store_true',
                       help='Show detailed progress information')
    
    return parser


def list_scenarios():
    """List all available scenarios."""
    print("Available Scenarios:")
    print("=" * 50)
    
    scenarios = ScenarioManager.list_scenarios()
    for name, description in scenarios.items():
        print(f"  {name:20} - {description}")
    
    print(f"\nUse --scenario <name> to select a scenario")


def main():
    """Main CLI entry point."""
    parser = create_parser()
    args = parser.parse_args()
    
    # Handle special commands
    if args.list_scenarios:
        list_scenarios()
        return 0
    
    try:
        # Create configuration
        config = GenerationConfig()
        
        # Apply command-line overrides
        if args.chapters:
            config.chapters = args.chapters
        if args.users:
            config.users = args.users
        if args.seed:
            config.seed = args.seed
        
        # Set scenario
        config.scenario_name = args.scenario
        
        # Set export formats
        config.export_formats = args.export
        config.output_path = f"{args.output_dir}/mockData.ts"
        
        # Advanced features
        config.enable_performance_profiling = args.profile
        config.enable_data_repair = not args.no_repair
        
        # Apply scenario configuration
        if config.scenario_name != 'default':
            config = ScenarioManager.get_scenario_config(config.scenario_name, config)
        
        # Validate configuration
        config.validate()
        
        # Suppress output if quiet mode
        if args.quiet:
            import os
            import contextlib
            
            with open(os.devnull, 'w') as devnull:
                with contextlib.redirect_stdout(devnull):
                    generator = EnhancedMockDataGenerator(config)
                    data = generator.generate_all_data()
                    generator.validate_data()
                    generator.check_consistency()
                    generator.serialize_and_export()
        else:
            # Normal execution
            generator = EnhancedMockDataGenerator(config)
            
            # Generate all data
            data = generator.generate_all_data()
            
            # Validate data
            is_valid = generator.validate_data()
            if not is_valid and config.include_edge_cases:
                print("⚠️  Proceeding despite validation issues")
            
            # Check and repair consistency
            consistency_report = generator.check_consistency()
            
            # Serialize and export
            exported_files = generator.serialize_and_export()
            
            # Print summary
            if not args.quiet:
                generator.print_summary()
                
                if args.verbose and config.enable_performance_profiling:
                    report = generator.generate_report()
                    if 'performance' in report:
                        print(f"\n🔍 Performance Report:")
                        perf = report['performance']
                        print(f"Total time: {perf['total_generation_time']:.3f}s")
                        print("Slowest operations:")
                        for op, time in perf['slowest_operations']:
                            print(f"  • {op}: {time:.3f}s")
        
        return 0
        
    except KeyboardInterrupt:
        print("\n❌ Generation cancelled by user")
        return 1
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        if args.verbose:
            import traceback
            traceback.print_exc()
        return 1


if __name__ == '__main__':
    sys.exit(main())
