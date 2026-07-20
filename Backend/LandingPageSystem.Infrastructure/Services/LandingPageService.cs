using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using LandingPageSystem.Application.DTOs;
using LandingPageSystem.Application.Interfaces;
using LandingPageSystem.Domain.Entities;
using LandingPageSystem.Domain.Repositories;

namespace LandingPageSystem.Application.Services;

public class LandingPageService : ILandingPageService
{
    private readonly ILandingPageRepository _repository;
    private readonly IHttpClientFactory _httpClientFactory;

    // Inject both the repository and the HTTP client factory in the constructor
    public LandingPageService(
        ILandingPageRepository repository,
        IHttpClientFactory httpClientFactory)
    {
        _repository = repository;
        _httpClientFactory = httpClientFactory;
    }

    public async Task<LandingPageDto?> GetByIdAsync(Guid id)
    {
        var page = await _repository.GetByIdAsync(id);
        return page == null ? null : MapToDto(page);
    }

    public async Task<LandingPageDto?> GetBySlugAsync(string slug)
    {
        // Enforce lowercase lookups for URLs
        var normalizedSlug = slug.Trim().ToLowerInvariant();
        var page = await _repository.GetBySlugAsync(normalizedSlug);
        return page == null ? null : MapToDto(page);
    }

    public async Task<LandingPageDto> CreateAsync(CreateLandingPageRequest request)
    {
        // Enforce the unique slug business rule
        var sanitizedSlug = request.Slug.Trim().ToLowerInvariant().Replace(" ", "-");
        if (await _repository.SlugExistsAsync(sanitizedSlug))
        {
            throw new InvalidOperationException($"The URL slug '{sanitizedSlug}' is already in use.");
        }

        // Create the rich entity (the constructor will sanitize the slug again internally)
        var landingPage = new LandingPage(request.CampaignName, request.Slug, request.PageConfig);
        await _repository.AddAsync(landingPage);

        return MapToDto(landingPage);
    }

    public async Task<LandingPageDto?> UpdateAsync(Guid id, UpdateLandingPageRequest request)
    {
        var page = await _repository.GetByIdAsync(id);
        if (page == null) return null;

        // Ensure the updated slug doesn't conflict with *another* page's slug
        var sanitizedSlug = request.Slug.Trim().ToLowerInvariant().Replace(" ", "-");
        if (await _repository.SlugExistsAsync(sanitizedSlug, id))
        {
            throw new InvalidOperationException($"The URL slug '{sanitizedSlug}' is already in use.");
        }

        // Update properties through the domain entity's rich method
        page.UpdateConfiguration(request.CampaignName, request.Slug, request.PageConfig);
        await _repository.UpdateAsync(page);

        return MapToDto(page);
    }

    public async Task<IReadOnlyList<LandingPageDto>> GetAllAsync()
    {
        var pages = await _repository.GetAllAsync();
        return pages.Select(MapToDto).ToList();
    }

    /// <summary>
    /// Calls the Python ML Microservice to extract the top 2 dominant colors from an image.
    /// </summary>
    public async Task<ColorExtractionResponse?> ExtractColorsAsync(string imageUrl)
    {
        var client = _httpClientFactory.CreateClient();

        // Prepare JSON payload
        var payload = new ColorExtractionRequest { Url = imageUrl };
        var jsonPayload = JsonSerializer.Serialize(payload, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        });

        var content = new StringContent(jsonPayload, Encoding.UTF8, "application/json");

        try
        {
            // Pointing to your Python FastAPI microservice
            var response = await client.PostAsync("http://localhost:8000/extract-colors", content);

            if (!response.IsSuccessStatusCode)
            {
                return null;
            }

            var responseString = await response.Content.ReadAsStringAsync();

            // Deserialize the Python response into the C# DTO
            return JsonSerializer.Deserialize<ColorExtractionResponse>(responseString, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });
        }
        catch (HttpRequestException)
        {
            // If the Python server is offline, we fail gracefully instead of breaking the .NET pipeline
            return null;
        }
    }

    // A helper method to map our rich domain model to a clean data contract (DTO)
    private static LandingPageDto MapToDto(LandingPage page)
    {
        return new LandingPageDto(
            page.Id,
            page.CampaignName,
            page.Slug,
            page.PageConfig,
            page.CreatedAt,
            page.UpdatedAt
        );
    }
}