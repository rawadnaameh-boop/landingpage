namespace LandingPageSystem.Application.DTOs
{
    public class ColorExtractionRequest
    {
        public string Url { get; set; } = string.Empty;
    }

    public class ColorExtractionResponse
    {
        public string Primary { get; set; } = string.Empty;
        public string Accent { get; set; } = string.Empty;
    }
}