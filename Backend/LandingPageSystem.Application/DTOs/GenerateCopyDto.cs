namespace LandingPageSystem.Application.DTOs;

public sealed record GenerateCopyRequest(
    string Topic
    );
public sealed record GenerateCopyResponse(
    string Headline,
    string Subheadline
    );