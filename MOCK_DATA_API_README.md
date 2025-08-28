# Mock Data API System

This project now uses an on-demand mock data generation system instead of storing large static files in the repository. This approach:

- ✅ **Reduces repository size** (was 166MB, now ~0MB)
- ✅ **Generates fresh data** on each request
- ✅ **Supports multiple scenarios** (small_test, medium_test, high_activity, etc.)
- ✅ **Includes caching** for better performance
- ✅ **Provides fallback data** when API is unavailable

## 🚀 Quick Start

### 1. Install Python Dependencies

```bash
pip install -r requirements.txt
```

### 2. Test Locally

Start the development server:

```bash
python dev-server.py
```

The API will be available at `http://localhost:3000/api/mock-data`

### 3. Test the API

```bash
# Get small test data
curl "http://localhost:3000/api/mock-data?scenario=small_test"

# Get medium test data
curl "http://localhost:3000/api/mock-data?scenario=medium_test"

# Get high activity data
curl "http://localhost:3000/api/mock-data?scenario=high_activity"
```

## 📊 Available Scenarios

| Scenario | Description | Chapters | Users | Events |
|----------|-------------|----------|-------|---------|
| `small_test` | Minimal data for quick testing | 5 | 50 | 20 |
| `medium_test` | Balanced data for development | 15 | 200 | 100 |
| `high_activity` | High-volume data for stress testing | 30 | 500 | 300 |
| `stress_test` | Maximum data for performance testing | 50 | 1000 | 500 |
| `realistic` | Realistic production-like data | 25 | 400 | 200 |

## 🔧 Usage in Frontend

### Replace Static Imports

**Before (old way):**
```typescript
import { chapters, users, events } from '@/mockData';
```

**After (new way):**
```typescript
import { getChapters, getUsers, getEvents } from '@/services/mockDataService';

// In your component
const [chapters, setChapters] = useState<Chapter[]>([]);

useEffect(() => {
  getChapters().then(setChapters);
}, []);
```

### Available Service Functions

```typescript
import { 
  fetchMockData,        // Get all data at once
  getChapters,          // Get chapters only
  getUsers,             // Get users only
  getEvents,            // Get events only
  getOutreachLogs,      // Get outreach logs only
  getAnnouncements,     // Get announcements only
  getResources,         // Get resources only
  getNotifications,     // Get notifications only
  getBadges,            // Get badges only
  getInventory,         // Get inventory only
  getChallenges,        // Get challenges only
  clearCache,           // Clear the cache
} from '@/services/mockDataService';
```

### Advanced Usage

```typescript
// Get data with specific scenario
const data = await fetchMockData({ 
  scenario: 'high_activity',
  cache: true 
});

// Clear cache when needed
clearCache();
```

## 🌐 Vercel Deployment

### 1. Update Vercel Configuration

The `vercel.json` file is already configured to support Python serverless functions:

```json
{
  "functions": {
    "api/mock-data/index.py": {
      "runtime": "python3.9"
    }
  }
}
```

### 2. Deploy to Vercel

```bash
vercel --prod
```

### 3. API Endpoints

Once deployed, your API will be available at:
- `https://your-project.vercel.app/api/mock-data`
- `https://your-project.vercel.app/api/mock-data?scenario=high_activity`

## 🧪 Testing

### Test Different Scenarios

```bash
# Test small data
curl "https://your-project.vercel.app/api/mock-data?scenario=small_test"

# Test high activity
curl "https://your-project.vercel.app/api/mock-data?scenario=high_activity"

# Test with custom parameters
curl "https://your-project.vercel.app/api/mock-data?scenario=realistic"
```

### Monitor Performance

The API includes performance profiling when enabled:

```typescript
// Enable profiling in development
const data = await fetchMockData({ 
  scenario: 'stress_test',
  cache: false 
});
```

## 🔄 Migration Guide

### 1. Update Store Files

Replace static imports in your store files:

**Before:**
```typescript
// src/store/initialData.ts
import { chapters, users, events } from '@/mockData';

export const initialData = {
  chapters,
  users,
  events,
  // ...
};
```

**After:**
```typescript
// src/store/initialData.ts
import { mockDataService } from '@/services/mockDataService';

export const getInitialData = async () => {
  const data = await mockDataService.fetchMockData();
  return {
    chapters: data.chapters,
    users: data.users,
    events: data.events,
    // ...
  };
};
```

### 2. Update Components

Replace static data usage with async data fetching:

**Before:**
```typescript
const chapters = useChapters(); // Static data
```

**After:**
```typescript
const [chapters, setChapters] = useState<Chapter[]>([]);

useEffect(() => {
  getChapters().then(setChapters);
}, []);
```

## 🚨 Troubleshooting

### Common Issues

1. **Import Errors**: Make sure all Python dependencies are installed
2. **API Timeouts**: Large data generation may take time, consider using smaller scenarios
3. **Memory Issues**: Use `small_test` or `medium_test` scenarios for development

### Fallback Data

The system includes fallback data that will be used if:
- The API is unavailable
- Data generation fails
- Network issues occur

### Cache Management

- Data is cached for 5 minutes by default
- Use `clearCache()` to force fresh data
- Set `cache: false` to bypass caching

## 📈 Performance Benefits

- **Repository size**: Reduced from 166MB to ~0MB
- **Build time**: Faster builds without large file processing
- **Deployment**: Faster deployments to Vercel
- **Flexibility**: Easy to switch between data scenarios
- **Maintenance**: No need to manually update static data files

## 🔮 Future Enhancements

- [ ] Add data validation endpoints
- [ ] Support for custom data generation parameters
- [ ] Real-time data streaming for large datasets
- [ ] Integration with external data sources
- [ ] Advanced caching strategies

---

For questions or issues, check the existing mock data documentation or create an issue in the repository.
