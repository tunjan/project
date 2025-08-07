export interface ChallengeParticipant {
    id: string;
    name: string;
    progress: number;
}

export interface Challenge {
    id: string;
    title: string;
    description: string;
    metric: string;
    goal: number;
    participants: ChallengeParticipant[];
    endDate: Date;
}