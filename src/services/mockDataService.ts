import { type Chapter, type User, type CubeEvent, type OutreachLog, type Announcement, type Resource, type Notification, type BadgeAward, type InventoryItem, type Challenge, Role, OnboardingStatus, EventStatus } from '@/types';

export interface MockDataResponse {
  chapters: Chapter[];
  users: User[];
  events: CubeEvent[];
  outreachLogs: OutreachLog[];
  announcements: Announcement[];
  resources: Resource[];
  notifications: Notification[];
  badges: BadgeAward[];
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
   * Defaults to 'minimal' scenario for fastest response
   */
  async fetchMockData(options: MockDataOptions = {}): Promise<MockDataResponse> {
    const { scenario = 'minimal', cache = true } = options;
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
      // In development, use localhost
      const baseUrl = process.env.NODE_ENV === 'development'
        ? 'http://localhost:3000'
        : '';

      // Skip API call in production if we don't have a baseUrl (Vercel API not working)
      if (!baseUrl) {
        console.log('🌐 Production environment detected, using fallback data');
        return this.getFallbackData();
      }

      console.log('🚀 Fetching fresh mock data from API...');
      const url = `${baseUrl}/api/mock-data?scenario=${scenario}`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);

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
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          console.error('⏰ API request timed out, using fallback data');
        } else {
          console.error('❌ Failed to fetch mock data:', error.message);
        }
      } else {
        console.error('❌ Failed to fetch mock data:', error);
      }

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
   * This provides minimal data for development and testing
   */
  private getFallbackData(): MockDataResponse {
    console.log('🔄 Using minimal fallback mock data');

    return {
      chapters: [
        {
          name: 'London',
          country: 'United Kingdom',
          lat: 51.5074,
          lng: -0.1278,
          instagram: '@london_activists',
        }
      ],
      users: [
        {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          instagram: '@johndoe',
          chapters: ['London'],
          onboardingStatus: OnboardingStatus.CONFIRMED,
          role: Role.ACTIVIST,
          joinDate: new Date(),
          stats: {
            totalHours: 0,
            cubesAttended: 0,
            veganConversions: 0,
            totalConversations: 0,
            cities: ['London'],
          },
          profilePictureUrl: '',
          badges: [],
          hostingAvailability: false,
          lastLogin: new Date(),
        }
      ],
      events: [
        {
          id: '1',
          name: 'Sample Cube Event',
          city: 'London',
          location: 'Central London',
          startDate: new Date(),
          endDate: new Date(Date.now() + 2 * 60 * 60 * 1000),
          scope: 'Chapter' as const,
          organizer: {
            id: '1',
            name: 'John Doe',
            email: 'john@example.com',
            instagram: '@johndoe',
            chapters: ['London'],
            onboardingStatus: OnboardingStatus.CONFIRMED,
            role: Role.ACTIVIST,
            joinDate: new Date(),
            stats: {
              totalHours: 0,
              cubesAttended: 0,
              veganConversions: 0,
              totalConversations: 0,
              cities: ['London'],
            },
            profilePictureUrl: '',
            badges: [],
            hostingAvailability: false,
            lastLogin: new Date(),
          },
          participants: [],
          status: EventStatus.UPCOMING,
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

  async getBadges(): Promise<BadgeAward[]> {
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
