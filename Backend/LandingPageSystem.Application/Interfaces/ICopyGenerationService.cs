using LandingPageSystem.Application.DTOs;

namespace LandingPageSystem.Application.Interfaces;

public interface ICopyGenerationService
{
    Task<GenerateCopyResponse> GenerateAsync(
        string topic,
        CancellationToken cancellationToken = default
    );
}