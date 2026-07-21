using LandingPageSystem.Application.DTOs;

namespace LandingPageSystem.Application.Interfaces;

public interface IUrgencyScoringService
{
    Task<UrgencyScoreResponse> ScoreUrgencyAsync(
        UrgencyScoreRequest request,
        CancellationToken cancellationToken = default
    );
}