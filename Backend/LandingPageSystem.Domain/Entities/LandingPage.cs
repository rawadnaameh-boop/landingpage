namespace LandingPageSystem.Domain.Entities;

public class LandingPage
{
    public Guid Id { get; private set; }
    public string CampaignName { get; private set; } = null!;
    public string Slug { get; private set; } = null!;

    // This string will hold our raw JSON configuration
    public string PageConfig { get; private set; } = null!;
    public DateTime CreatedAt { get; private set; }
    public DateTime UpdatedAt { get; private set; }

    // Required by EF Core for loading data
    private LandingPage() { }

    // Constructor to enforce valid state upon creation
    public LandingPage(string campaignName, string slug, string pageConfig)
    {
        Id = Guid.NewGuid();
        CampaignName = campaignName;
        Slug = SanitizeSlug(slug);
        PageConfig = pageConfig;
        CreatedAt = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }

    // Method to update properties safely
    public void UpdateConfiguration(string campaignName, string slug, string pageConfig)
    {
        CampaignName = campaignName;
        Slug = SanitizeSlug(slug);
        PageConfig = pageConfig;
        UpdatedAt = DateTime.UtcNow;
    }

    // Encapsulated business rule to ensure clean, URL-safe slugs
    private static string SanitizeSlug(string rawSlug)
    {
        if (string.IsNullOrWhiteSpace(rawSlug))
            throw new ArgumentException("Slug cannot be empty.");

        return rawSlug.Trim()
                      .ToLowerInvariant()
                      .Replace(" ", "-");
    }
}