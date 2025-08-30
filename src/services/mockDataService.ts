import {
  type Announcement,
  type BadgeAward,
  type Challenge,
  type Chapter,
  type CubeEvent,
  type InventoryItem,
  type Notification,
  OnboardingStatus,
  type OutreachLog,
  type Resource,
  Role,
  type User,
} from '@/types';

import { generateAvatarUrl } from '../utils/user';

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
   * Fetch mock data from static generated data
   * No more broken API calls - uses local data directly
   */
  async fetchMockData(
    options: MockDataOptions = {}
  ): Promise<MockDataResponse> {
    const { scenario = 'default', cache = true } = options;
    const cacheKey = `mock_data_${scenario}`;

    // Check cache first
    if (cache && this.isCacheValid(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (cached) {
        return cached;
      }
    }

    try {
      // Import the static mock data directly
      const mockData = await import('../data/mockData');

      const data: MockDataResponse = {
        chapters: mockData.chapters || [],
        users: mockData.users || [],
        events: mockData.events || [],
        outreachLogs: mockData.outreachLogs || [],
        announcements: mockData.announcements || [],
        resources: mockData.resources || [],
        notifications: mockData.notifications || [],
        badges: mockData.badgeAwards || [],
        inventory: mockData.inventory || [],
        challenges: mockData.challenges || [],
      };

      // Cache the response
      if (cache) {
        this.cache.set(cacheKey, data);
        this.cacheTimestamps.set(cacheKey, Date.now());
      }

      return data;
    } catch (error) {
      console.error('❌ Failed to load mock data:', error);

      // Return fallback data if import fails
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
  }

  /**
   * Get fallback data if everything else fails
   */
  private getFallbackData(): MockDataResponse {
    return {
      chapters: [
        {
          name: 'Fallback Chapter',
          country: 'United States',
          lat: 40.7128,
          lng: -74.006,
          instagram: '@fallback_chapter',
        },
      ],
      users: [
        {
          id: 'fallback-user',
          name: 'Fallback User',
          email: 'fallback@example.com',
          role: Role.ACTIVIST,
          chapters: ['Fallback Chapter'],
          onboardingStatus: OnboardingStatus.CONFIRMED,
          profilePictureUrl: generateAvatarUrl('fallback'),
          joinDate: new Date('2023-01-01'),
          lastLogin: new Date(),
          stats: {
            totalHours: 10,
            cubesAttended: 2,
            veganConversions: 1,
            totalConversations: 5,
            cities: ['Fallback Chapter'],
          },
          badges: [],
          hostingAvailability: false,
          hostingCapacity: 1,
        },
      ],
      events: [],
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
