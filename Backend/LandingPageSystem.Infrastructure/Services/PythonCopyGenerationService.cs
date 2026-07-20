using System.Net.Http.Json;
using System.Text.Json;
using LandingPageSystem.Application.DTOs;
using LandingPageSystem.Application.Interfaces;
using Microsoft.Extensions.Logging;

namespace LandingPageSystem.Infrastructure.Services;

public sealed class PythonCopyGenerationService
    : ICopyGenerationService
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<PythonCopyGenerationService> _logger;

    public PythonCopyGenerationService(
        HttpClient httpClient,
        ILogger<PythonCopyGenerationService> logger
    )
    {
        _httpClient = httpClient;
        _logger = logger;
    }

    public async Task<GenerateCopyResponse> GenerateAsync(
        string topic,
        CancellationToken cancellationToken = default
    )
    {
        var normalizedTopic = topic.Trim();

        if (string.IsNullOrWhiteSpace(normalizedTopic))
        {
            throw new ArgumentException(
                "Topic is required.",
                nameof(topic)
            );
        }

        if (normalizedTopic.Length > 100)
        {
            throw new ArgumentException(
                "Topic cannot exceed 100 characters.",
                nameof(topic)
            );
        }

        var request = new GenerateCopyRequest(normalizedTopic);

        HttpResponseMessage response;

        try
        {
            response = await _httpClient.PostAsJsonAsync(
                "generate-copy",
                request,
                cancellationToken
            );
        }
        catch (OperationCanceledException)
            when (!cancellationToken.IsCancellationRequested)
        {
            throw new TimeoutException(
                "The Python AI service took too long to respond."
            );
        }

        using (response)
        {
            if (!response.IsSuccessStatusCode)
            {
                var errorDetails =
                    await ReadPythonErrorAsync(
                        response,
                        cancellationToken
                    );

                _logger.LogError(
                    "Python service returned status {StatusCode}: {Error}",
                    (int)response.StatusCode,
                    errorDetails
                );

                throw new HttpRequestException(
                    $"The Python AI service returned status " +
                    $"{(int)response.StatusCode}: {errorDetails}",
                    null,
                    response.StatusCode
                );
            }

            var generatedCopy =
                await response.Content
                    .ReadFromJsonAsync<GenerateCopyResponse>(
                        cancellationToken: cancellationToken
                    );

            if (generatedCopy is null)
            {
                throw new HttpRequestException(
                    "The Python AI service returned an empty response."
                );
            }

            if (
                string.IsNullOrWhiteSpace(generatedCopy.Headline) ||
                string.IsNullOrWhiteSpace(generatedCopy.Subheadline)
            )
            {
                throw new HttpRequestException(
                    "The Python AI service returned incomplete copy."
                );
            }

            return new GenerateCopyResponse(
                generatedCopy.Headline.Trim(),
                generatedCopy.Subheadline.Trim()
            );
        }
    }

    private static async Task<string> ReadPythonErrorAsync(
        HttpResponseMessage response,
        CancellationToken cancellationToken
    )
    {
        var responseText =
            await response.Content.ReadAsStringAsync(
                cancellationToken
            );

        if (string.IsNullOrWhiteSpace(responseText))
        {
            return "No error details were provided.";
        }

        try
        {
            using var document =
                JsonDocument.Parse(responseText);

            if (
                document.RootElement.TryGetProperty(
                    "detail",
                    out var detailElement
                )
            )
            {
                if (
                    detailElement.ValueKind ==
                    JsonValueKind.String
                )
                {
                    return detailElement.GetString()
                        ?? responseText;
                }

                return detailElement.GetRawText();
            }
        }
        catch (JsonException)
        {
            // The Python response was not JSON.
        }

        return responseText;
    }
}