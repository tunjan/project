import { render, screen, fireEvent } from '@testing-library/react';
import MemberDirectory from './MemberDirectory';
import {
  User,
  Chapter,
  Role,
  OnboardingStatus,
  ChapterJoinRequest,
} from '@/types';

const mockChapters: Chapter[] = [
  { name: 'Berlin', country: 'Germany', lat: 0, lng: 0 },
  { name: 'Hamburg', country: 'Germany', lat: 0, lng: 0 },
];

const mockMembers: User[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: Role.ACTIVIST,
    chapters: ['Berlin'],
    onboardingStatus: OnboardingStatus.COMPLETED,
    profilePictureUrl: 'test1.jpg',
    stats: {
      totalHours: 0,
      cubesAttended: 0,
      veganConversions: 0,
      totalConversations: 0,
      cities: [],
    },
    badges: [],
    hostingAvailability: false,
    lastLogin: new Date(),
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: Role.CHAPTER_ORGANISER,
    chapters: ['Berlin'],
    onboardingStatus: OnboardingStatus.COMPLETED,
    profilePictureUrl: 'test2.jpg',
    stats: {
      totalHours: 0,
      cubesAttended: 0,
      veganConversions: 0,
      totalConversations: 0,
      cities: [],
    },
    badges: [],
    hostingAvailability: false,
    lastLogin: new Date(),
  },
  {
    id: '3',
    name: 'Bob Wilson',
    email: 'bob@example.com',
    role: Role.ACTIVIST,
    chapters: ['Hamburg'],
    onboardingStatus: OnboardingStatus.AWAITING_FIRST_CUBE,
    profilePictureUrl: 'test3.jpg',
    stats: {
      totalHours: 0,
      cubesAttended: 0,
      veganConversions: 0,
      totalConversations: 0,
      cities: [],
    },
    badges: [],
    hostingAvailability: false,
    lastLogin: new Date(),
  },
];

const mockPendingRequests: ChapterJoinRequest[] = [
  {
    id: 'req1',
    user: {
      id: '4',
      name: 'Alice Brown',
      email: 'alice@example.com',
      role: Role.ACTIVIST,
      chapters: [],
      onboardingStatus: OnboardingStatus.COMPLETED,
      profilePictureUrl: 'test4.jpg',
      stats: {
        totalHours: 0,
        cubesAttended: 0,
        veganConversions: 0,
        totalConversations: 0,
        cities: [],
      },
      badges: [],
      hostingAvailability: false,
      lastLogin: new Date(),
    },
    chapterName: 'Berlin',
    status: 'Pending',
    createdAt: new Date('2024-01-01T00:00:00Z'),
  },
];

describe('<MemberDirectory />', () => {
  const mockOnSelectUser = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all members by default', () => {
    render(
      <MemberDirectory
        members={mockMembers}
        onSelectUser={mockOnSelectUser}
        filterableChapters={mockChapters}
        pendingRequests={mockPendingRequests}
      />
    );

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('Bob Wilson')).toBeInTheDocument();
    expect(screen.getByText('Showing 4 of 4 members')).toBeInTheDocument();
  });

  it('filters members by search term', async () => {
    render(
      <MemberDirectory
        members={mockMembers}
        onSelectUser={mockOnSelectUser}
        filterableChapters={mockChapters}
        pendingRequests={mockPendingRequests}
      />
    );

    const searchInput = screen.getByPlaceholderText(
      'Search members by name...'
    );
    fireEvent.change(searchInput, { target: { value: 'John' } });

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
    expect(screen.queryByText('Bob Wilson')).not.toBeInTheDocument();
    expect(screen.getByText('Showing 1 of 4 members')).toBeInTheDocument();
  });

  it('filters members by chapter', async () => {
    render(
      <MemberDirectory
        members={mockMembers}
        onSelectUser={mockOnSelectUser}
        filterableChapters={mockChapters}
        pendingRequests={mockPendingRequests}
      />
    );

    const chapterSelect = screen.getByLabelText('Chapter');
    fireEvent.change(chapterSelect, { target: { value: 'Berlin' } });

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('Alice Brown')).toBeInTheDocument(); // Has pending request for Berlin
    expect(screen.queryByText('Bob Wilson')).not.toBeInTheDocument();
    expect(screen.getByText('Showing 3 of 4 members')).toBeInTheDocument();
  });

  it('filters members by role', async () => {
    render(
      <MemberDirectory
        members={mockMembers}
        onSelectUser={mockOnSelectUser}
        filterableChapters={mockChapters}
        pendingRequests={mockPendingRequests}
      />
    );

    const roleSelect = screen.getByLabelText('Role');
    fireEvent.change(roleSelect, { target: { value: Role.CHAPTER_ORGANISER } });

    expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.queryByText('Bob Wilson')).not.toBeInTheDocument();
    expect(screen.getByText('Showing 1 of 4 members')).toBeInTheDocument();
  });

  it('filters members by onboarding status', async () => {
    render(
      <MemberDirectory
        members={mockMembers}
        onSelectUser={mockOnSelectUser}
        filterableChapters={mockChapters}
        pendingRequests={mockPendingRequests}
      />
    );

    const statusSelect = screen.getByLabelText('Status');
    fireEvent.change(statusSelect, {
      target: { value: OnboardingStatus.AWAITING_FIRST_CUBE },
    });

    expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
    expect(screen.getByText('Bob Wilson')).toBeInTheDocument();
    expect(screen.getByText('Showing 1 of 4 members')).toBeInTheDocument();
  });

  it('shows pending chapter join requests in chapter filter', async () => {
    render(
      <MemberDirectory
        members={mockMembers}
        onSelectUser={mockOnSelectUser}
        filterableChapters={mockChapters}
        pendingRequests={mockPendingRequests}
      />
    );

    const chapterSelect = screen.getByLabelText('Chapter');
    fireEvent.change(chapterSelect, { target: { value: 'Berlin' } });

    // Should show members of Berlin chapter plus Alice Brown who has a pending request
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('Alice Brown')).toBeInTheDocument();
    expect(screen.queryByText('Bob Wilson')).not.toBeInTheDocument();
    expect(screen.getByText('Showing 3 of 4 members')).toBeInTheDocument();
  });

  it('combines multiple filters correctly', async () => {
    render(
      <MemberDirectory
        members={mockMembers}
        onSelectUser={mockOnSelectUser}
        filterableChapters={mockChapters}
        pendingRequests={mockPendingRequests}
      />
    );

    // Filter by chapter: Berlin
    const chapterSelect = screen.getByLabelText('Chapter');
    fireEvent.change(chapterSelect, { target: { value: 'Berlin' } });

    // Filter by role: ACTIVIST
    const roleSelect = screen.getByLabelText('Role');
    fireEvent.change(roleSelect, { target: { value: Role.ACTIVIST } });

    // Should show John Doe (Berlin + ACTIVIST) and Alice Brown (pending request for Berlin + ACTIVIST)
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Alice Brown')).toBeInTheDocument(); // Has pending request for Berlin + is ACTIVIST
    expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument(); // CHAPTER_ORGANISER
    expect(screen.queryByText('Bob Wilson')).not.toBeInTheDocument(); // Hamburg
    expect(screen.getByText('Showing 2 of 4 members')).toBeInTheDocument();
  });

  it('calls onSelectUser when a member is clicked', async () => {
    render(
      <MemberDirectory
        members={mockMembers}
        onSelectUser={mockOnSelectUser}
        filterableChapters={mockChapters}
        pendingRequests={mockPendingRequests}
      />
    );

    const johnDoeButton = screen.getByText('John Doe').closest('button');
    expect(johnDoeButton).toBeInTheDocument();

    fireEvent.click(johnDoeButton!);

    expect(mockOnSelectUser).toHaveBeenCalledWith(mockMembers[0]);
  });

  it('shows pending status for members with pending requests', () => {
    render(
      <MemberDirectory
        members={mockMembers}
        onSelectUser={mockOnSelectUser}
        filterableChapters={mockChapters}
        pendingRequests={mockPendingRequests}
      />
    );

    // Alice Brown should show pending status
    expect(
      screen.getByText('⏳ Pending Chapter Join Request')
    ).toBeInTheDocument();
  });

  it('shows awaiting first cube badge for appropriate members', () => {
    render(
      <MemberDirectory
        members={mockMembers}
        onSelectUser={mockOnSelectUser}
        filterableChapters={mockChapters}
        pendingRequests={mockPendingRequests}
      />
    );

    expect(screen.getByText('AWAITING FIRST CUBE')).toBeInTheDocument();
  });

  it('handles empty members list', () => {
    render(
      <MemberDirectory
        members={[]}
        onSelectUser={mockOnSelectUser}
        filterableChapters={mockChapters}
        pendingRequests={[]}
      />
    );

    expect(screen.getByText('Showing 0 of 0 members')).toBeInTheDocument();
  });

  it('handles empty filterableChapters', () => {
    render(
      <MemberDirectory
        members={mockMembers}
        onSelectUser={mockOnSelectUser}
        filterableChapters={[]}
        pendingRequests={mockPendingRequests}
      />
    );

    // Should not show chapter filter when no chapters are available
    expect(screen.queryByLabelText('Chapter')).not.toBeInTheDocument();
  });

  it('resets filters when search term is cleared', async () => {
    render(
      <MemberDirectory
        members={mockMembers}
        onSelectUser={mockOnSelectUser}
        filterableChapters={mockChapters}
        pendingRequests={mockPendingRequests}
      />
    );

    const searchInput = screen.getByPlaceholderText(
      'Search members by name...'
    );

    // Add search term
    fireEvent.change(searchInput, { target: { value: 'John' } });
    expect(screen.getByText(/Showing 1 of 4 members/)).toBeInTheDocument();

    // Clear search term
    fireEvent.change(searchInput, { target: { value: '' } });
    expect(screen.getByText(/Showing 4 of 4 members/)).toBeInTheDocument();
  });
});
