export interface UrgencyLabelScores{
    urgent: number;
    callToAction: number;
    passive: number;
    descriptive: number;
}
export interface UrgencyScoreResponse{
    score: number;
    level: string;
    labels: UrgencyLabelScores;
}