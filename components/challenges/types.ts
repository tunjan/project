export interface ChallengeParticipant {
    id: string;
    name: string;
    progress: number; // Current value for the metric being tracked
}

export interface Challenge {
    id: string;
    title: string;
    description: string;
    metric: string; // e.g., 'Hours of Outreach', 'Vegan Conversions'
    goal: number;
    participants: ChallengeParticipant[];
    endDate: Date;
}