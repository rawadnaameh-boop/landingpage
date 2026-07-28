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
using Microsoft.Extensions.Configuration; // Added for IConfiguration

namespace LandingPageSystem.Application.Services;

public class LandingPageService : ILandingPageService
{
    private readonly ILandingPageRepository _repository;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IConfiguration _configuration; // 1. Add IConfiguration field

    // Inject repository, HTTP client factory, and configuration
    public LandingPageService(
        ILandingPageRepository repository,
        IHttpClientFactory httpClientFactory,
        IConfiguration configuration) // 2. Inject IConfiguration
    {
        _repository = repository;
        _httpClientFactory = httpClientFactory;
        _configuration = configuration;
    }

    public async Task<LandingPageDto?> GetByIdAsync(Guid id)
    {
        var page = await _repository.GetByIdAsync(id);
        return page == null ? null : MapToDto(page);
    }

    public async Task<LandingPageDto?> GetBySlugAsync(string slug)
    {
        var normalizedSlug = slug.Trim().ToLowerInvariant();
        var page = await _repository.GetBySlugAsync(normalizedSlug);
        return page == null ? null : MapToDto(page);
    }

    public async Task<LandingPageDto> CreateAsync(CreateLandingPageRequest request)
    {
        var sanitizedSlug = request.Slug.Trim().ToLowerInvariant().Replace(" ", "-");
        if (await _repository.SlugExistsAsync(sanitizedSlug))
        {
            throw new InvalidOperationException($"The URL slug '{sanitizedSlug}' is already in use.");
        }

        var landingPage = new LandingPage(request.CampaignName, request.Slug, request.PageConfig);
        await _repository.AddAsync(landingPage);

        return MapToDto(landingPage);
    }

    public async Task<LandingPageDto?> UpdateAsync(Guid id, UpdateLandingPageRequest request)
    {
        var page = await _repository.GetByIdAsync(id);
        if (page == null) return null;

        var sanitizedSlug = request.Slug.Trim().ToLowerInvariant().Replace(" ", "-");
        if (await _repository.SlugExistsAsync(sanitizedSlug, id))
        {
            throw new InvalidOperationException($"The URL slug '{sanitizedSlug}' is already in use.");
        }

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
    /// Calls the Python ML Microservice to extract dominant colors from an image.
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
            // 3. Resolve base URL dynamically from config (or default to Docker container service name)
            var baseUrl = _configuration["MLService:BaseUrl"]
                       ?? _configuration["MLServiceUrl"]
                       ?? "http://ml-color-service:8000/";

            var endpoint = $"{baseUrl.TrimEnd('/')}/extract-colors";

            var response = await client.PostAsync(endpoint, content);

            if (!response.IsSuccessStatusCode)
            {
                return null;
            }

            var responseString = await response.Content.ReadAsStringAsync();

            return JsonSerializer.Deserialize<ColorExtractionResponse>(responseString, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });
        }
        catch (HttpRequestException)
        {
            return null;
        }
    }

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