using System.Net.Http.Json;
using LandingPageSystem.Application.DTOs;
using LandingPageSystem.Application.Interfaces;

namespace LandingPageSystem.Infrastructure.Services;

public class UrgencyScoringService : IUrgencyScoringService
{
    private readonly HttpClient _httpClient;

    public UrgencyScoringService(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    public async Task<UrgencyScoreResponse> ScoreUrgencyAsync(
        UrgencyScoreRequest request,
        CancellationToken cancellationToken = default
    )
    {
        using HttpResponseMessage response =
            await _httpClient.PostAsJsonAsync(
                "score-urgency",
                request,
                cancellationToken
            );

        if (!response.IsSuccessStatusCode)
        {
            string errorBody =
                await response.Content.ReadAsStringAsync(
                    cancellationToken
                );

            throw new HttpRequestException(
                $"Python urgency service returned " +
                $"{(int)response.StatusCode}: {errorBody}"
            );
        }

        UrgencyScoreResponse? result =
            await response.Content.ReadFromJsonAsync<UrgencyScoreResponse>(
                cancellationToken: cancellationToken
            );

        if (result is null)
        {
            throw new InvalidOperationException(
                "Python urgency service returned an empty response."
            );
        }

        return result;
    }
}