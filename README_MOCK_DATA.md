# Enhanced Mock Data Generation Pipeline v2.0

A comprehensive, modular mock data generator with advanced features, multiple export formats, and sophisticated data relationships for the activist platform.

## 🚀 Latest Improvements (v2.0)

### **Advanced Data Relationships**
- **User Connections**: Networking relationships between activists in same chapters
- **Mentorship System**: Experienced users mentoring newcomers
- **Event Series**: Recurring event patterns and series tracking
- **Skill Progression**: Individual skill tracking and development over time

### **Multiple Export Formats**
- **TypeScript**: Original format with full type safety
- **JSON**: Structured data for API integration
- **CSV**: Spreadsheet-compatible format for analysis
- **SQLite**: Database format for complex queries

### **Predefined Scenarios**
- **small_test**: Quick testing with minimal data (5 chapters, 25 users)
- **large_production**: Production-scale dataset (50 chapters, 1000 users)
- **high_activity**: High engagement patterns (60% high-activity users)
- **international**: Global distribution across 15 countries
- **new_organization**: Simulates startup with mostly pending users

### **Enhanced Features**
- **Event Comments**: Realistic discussions and feedback on events
- **Chapter Join Requests**: Cross-chapter membership requests
- **Performance Profiling**: Detailed timing and optimization metrics
- **Data Consistency Repair**: Automatic detection and fixing of data issues
- **CLI Interface**: Command-line tool for easy usage and automation

## 📁 File Structure

```
mock_data/
├── __init__.py                 # Package initialization
├── config.py                   # Configuration management and constants
├── generators.py               # Core entity generators (users, events, chapters)
├── ancillary_generators.py     # Supporting data generators (announcements, badges, etc.)
├── advanced_generators.py      # Advanced features (comments, relationships, profiling)
├── export_formats.py           # Multiple export format support
├── utils.py                    # Validation, serialization, and utility functions
└── cli.py                      # Command-line interface

generate_mock_data_enhanced.py  # Main orchestrator script
```

## ⚙️ Configuration

The enhanced pipeline uses a comprehensive configuration system:

```python
# Default configuration
CONFIG = {
    "chapters": 20,
    "users": 200,
    "events_per_chapter": 6,
    "announcements": 15,
    "resources": 8,
    # ... and many more options
}

# Environment variable overrides
MOCK_CHAPTERS=25 MOCK_USERS=300 python generate_mock_data_enhanced.py
```

### Key Configuration Options

- **Entity Counts**: Control the number of chapters, users, events, etc.
- **Distribution Patterns**: Configure user activity levels, role distributions
- **Geographic Settings**: Customize countries and cities
- **Data Quality**: Enable/disable realistic relationships and edge cases
- **Output Options**: Configure output format and file paths

## 🎯 Realistic Data Patterns

### **User Activity Levels**
- **High Activity (20%)**: 90% event attendance, 1.5x conversation multiplier
- **Medium Activity (50%)**: 60% event attendance, 1.0x conversation multiplier  
- **Low Activity (30%)**: 20% event attendance, 0.5x conversation multiplier

### **Role Distribution**
- **Confirmed Users**: 80% (eligible for organizer roles)
- **Awaiting Verification**: 5%
- **Pending Review**: 13%
- **Denied**: 2%

### **Geographic Distribution**
- Even distribution of users across chapters
- Realistic city-to-country mapping
- Regional organizers assigned per country
- Chapter organizers (1-3 per chapter)

### **Event Participation**
- Activity-based attendance patterns
- Cross-chapter guest participation
- Realistic role requirements (Equipment, Transport, etc.)
- Proper organizer assignment

## 🔍 Data Validation

The pipeline includes comprehensive validation:

### **Entity Validation**
- Required field presence
- Data type consistency
- Unique ID enforcement
- Email format validation

### **Relationship Validation**
- User-chapter associations
- Event-participant consistency
- Organizer role verification
- Cross-reference integrity

### **Statistical Validation**
- Distribution pattern verification
- Realistic value ranges
- Consistency checks

## 📊 Generated Data Statistics

The enhanced pipeline generates:

- **Users**: Realistic distribution across roles and activity levels
- **Events**: Chapter and regional events with proper participation
- **Outreach Logs**: Activity-based conversation generation
- **Announcements**: Scope-appropriate content from organizers
- **Resources**: Categorized educational materials
- **Accommodation**: Realistic host-guest matching
- **Notifications**: Context-aware user notifications
- **Badges**: Automatic stat-based and manual awards
- **Inventory**: Chapter-specific equipment tracking

## 🚀 Usage

### Basic Usage
```bash
python generate_mock_data_enhanced.py
```

### With Custom Configuration
```bash
MOCK_CHAPTERS=30 MOCK_USERS=500 MOCK_SEED=123 python generate_mock_data_enhanced.py
```

### Programmatic Usage
```python
from mock_data.config import GenerationConfig
from generate_mock_data_enhanced import EnhancedMockDataGenerator

config = GenerationConfig(chapters=25, users=300, seed=42)
generator = EnhancedMockDataGenerator(config)
data = generator.generate_all_data()
```

## 📈 Performance Improvements

- **Modular Generation**: Faster execution through specialized generators
- **Efficient Algorithms**: Optimized data distribution and relationship creation
- **Memory Management**: Reduced memory usage through streaming serialization
- **Progress Tracking**: Real-time feedback on generation progress

## 🔧 Extensibility

The modular architecture makes it easy to:

- **Add New Entity Types**: Create new generators following the base pattern
- **Customize Data Patterns**: Modify configuration and generation logic
- **Add Validation Rules**: Extend the validation framework
- **Support New Output Formats**: Add serializers for different formats

## 🐛 Debugging and Troubleshooting

### Common Issues

1. **Validation Errors**: Check entity relationships and required fields
2. **Memory Issues**: Reduce entity counts in configuration
3. **Performance**: Use smaller datasets for development

### Debug Mode
Set `include_edge_cases: true` in configuration to proceed despite validation warnings.

## 🔄 Migration from Original Pipeline

The enhanced pipeline is backward-compatible and generates the same TypeScript output format. Simply replace:

```bash
# Old
python generate_mock_data.py

# New  
python generate_mock_data_enhanced.py
```

## 📝 Future Enhancements

- **Database Integration**: Direct database seeding support
- **API Integration**: Real-time data generation via API
- **Custom Scenarios**: Predefined data scenarios for testing
- **Performance Profiling**: Built-in performance analysis tools
- **Data Export**: Multiple output formats (JSON, CSV, SQL)

---

**Note**: The enhanced pipeline maintains full compatibility with existing TypeScript types and application code while providing significantly improved data quality and generation capabilities.
