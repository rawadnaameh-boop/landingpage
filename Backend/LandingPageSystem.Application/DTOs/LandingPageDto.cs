namespace LandingPageSystem.Application.DTOs;

public record LandingPageDto(
    Guid Id,
    string CampaignName,
    string Slug,
    string PageConfig,
    DateTime CreatedAt,
    DateTime UpdatedAt
);

public record CreateLandingPageRequest(
    string CampaignName,
    string Slug,
    string PageConfig
);

public record UpdateLandingPageRequest(
    string CampaignName,
    string Slug,
    string PageConfig
);