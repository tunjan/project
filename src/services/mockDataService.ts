import { type Chapter, type User, type CubeEvent, type OutreachLog, type Announcement, type Resource, type Notification, type Badge, type InventoryItem, type Challenge } from '@/types';

export interface MockDataResponse {
  chapters: Chapter[];
  users: User[];
  events: CubeEvent[];
  outreachLogs: OutreachLog[];
  announcements: Announcement[];
  resources: Resource[];
  notifications: Notification[];
  badges: Badge[];
  inventory: InventoryItem[];
  challenges: Challenge[];
  error?: string;
}

export interface MockDataOptions {
  scenario?: string;
  cache?: boolean;
}

class MockDataService {
  private cache: Map<string, MockDataResponse> = new Map();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes
  private cacheTimestamps: Map<string, number> = new Map();

  /**
   * Fetch mock data from the Vercel API
   */
  async fetchMockData(options: MockDataOptions = {}): Promise<MockDataResponse> {
    const { scenario = 'small_test', cache = true } = options;
    const cacheKey = `mock_data_${scenario}`;

    // Check cache first
    if (cache && this.isCacheValid(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (cached) {
        console.log('📦 Using cached mock data');
        return cached;
      }
    }

    try {
      console.log('🚀 Fetching fresh mock data from API...');
      
      // In development, use localhost
      const baseUrl = process.env.NODE_ENV === 'development' 
        ? 'http://localhost:3000' 
        : '';
      
      const url = `${baseUrl}/api/mock-data?scenario=${scenario}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: MockDataResponse = await response.json();

      // Cache the response
      if (cache) {
        this.cache.set(cacheKey, data);
        this.cacheTimestamps.set(cacheKey, Date.now());
        console.log('💾 Mock data cached');
      }

      return data;

    } catch (error) {
      console.error('❌ Failed to fetch mock data:', error);
      
      // Return fallback data if API fails
      return this.getFallbackData();
    }
  }

  /**
   * Check if cached data is still valid
   */
  private isCacheValid(cacheKey: string): boolean {
    const timestamp = this.cacheTimestamps.get(cacheKey);
    if (!timestamp) return false;
    
    return Date.now() - timestamp < this.cacheTimeout;
  }

  /**
   * Clear the cache
   */
  clearCache(): void {
    this.cache.clear();
    this.cacheTimestamps.clear();
    console.log('🗑️ Mock data cache cleared');
  }

  /**
   * Get fallback data when API is unavailable
   */
  private getFallbackData(): MockDataResponse {
    console.log('🔄 Using fallback mock data');
    
    return {
      chapters: [
        {
          id: '1',
          name: 'London',
          country: 'United Kingdom',
          lat: 51.5074,
          lng: -0.1278,
          instagram: '@london_activists',
          description: 'London chapter for animal rights activism',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '2',
          name: 'New York',
          country: 'United States',
          lat: 40.7128,
          lng: -74.0060,
          instagram: '@nyc_activists',
          description: 'New York chapter for animal rights activism',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      ],
      users: [
        {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          instagram: '@johndoe',
          chapters: ['London'],
          onboardingStatus: 'Confirmed',
          role: 'Member',
          joinDate: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '2',
          name: 'Jane Smith',
          email: 'jane@example.com',
          instagram: '@janesmith',
          chapters: ['New York'],
          onboardingStatus: 'Confirmed',
          role: 'Organizer',
          joinDate: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      ],
      events: [
        {
          id: '1',
          title: 'Sample Cube Event',
          description: 'A sample cube event for testing',
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
          city: 'London',
          status: 'UPCOMING',
          organizerId: '2',
          maxParticipants: 20,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      ],
      outreachLogs: [],
      announcements: [],
      resources: [],
      notifications: [],
      badges: [],
      inventory: [],
      challenges: [],
    };
  }

  /**
   * Get specific data types with caching
   */
  async getChapters(): Promise<Chapter[]> {
    const data = await this.fetchMockData();
    return data.chapters;
  }

  async getUsers(): Promise<User[]> {
    const data = await this.fetchMockData();
    return data.users;
  }

  async getEvents(): Promise<CubeEvent[]> {
    const data = await this.fetchMockData();
    return data.events;
  }

  async getOutreachLogs(): Promise<OutreachLog[]> {
    const data = await this.fetchMockData();
    return data.outreachLogs;
  }

  async getAnnouncements(): Promise<Announcement[]> {
    const data = await this.fetchMockData();
    return data.announcements;
  }

  async getResources(): Promise<Resource[]> {
    const data = await this.fetchMockData();
    return data.resources;
  }

  async getNotifications(): Promise<Notification[]> {
    const data = await this.fetchMockData();
    return data.notifications;
  }

  async getBadges(): Promise<Badge[]> {
    const data = await this.fetchMockData();
    return data.badges;
  }

  async getInventory(): Promise<InventoryItem[]> {
    const data = await this.fetchMockData();
    return data.inventory;
  }

  async getChallenges(): Promise<Challenge[]> {
    const data = await this.fetchMockData();
    return data.challenges;
  }
}

// Export singleton instance
export const mockDataService = new MockDataService();

// Export individual functions for convenience
export const {
  fetchMockData,
  getChapters,
  getUsers,
  getEvents,
  getOutreachLogs,
  getAnnouncements,
  getResources,
  getNotifications,
  getBadges,
  getInventory,
  getChallenges,
  clearCache,
} = mockDataService;
