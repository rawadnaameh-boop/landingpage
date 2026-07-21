using System.Text.Json.Serialization;

namespace LandingPageSystem.Application.DTOs;

public class UrgencyScoreResponse
{
    public int Score { get; set; }

    public string Level { get; set; } = string.Empty;

    public UrgencyLabelScores Labels { get; set; } = new();
}


public class UrgencyLabelScores
{
    public double Urgent { get; set; }

    [JsonPropertyName("call_to_action")]
    public double CallToAction { get; set; }

    public double Passive { get; set; }

    public double Descriptive { get; set; }
}