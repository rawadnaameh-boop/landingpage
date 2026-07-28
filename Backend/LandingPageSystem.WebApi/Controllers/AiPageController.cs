using System.Net.Http.Json;
using LandingPageSystem.Application.DTOs;
using Microsoft.AspNetCore.Mvc;

namespace LandingPageSystem.WebApi.Controllers;

[ApiController]
[Route("api/ai")]
public class AiPageController : ControllerBase
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly ILogger<AiPageController> _logger;

    public AiPageController(
        IHttpClientFactory httpClientFactory,
        ILogger<AiPageController> logger)
    {
        _httpClientFactory = httpClientFactory;
        _logger = logger;
    }

    [HttpPost("generate-page-layout")]
    public async Task<IActionResult> GeneratePageLayout(
        [FromBody] GeneratePageLayoutRequest request,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Prompt))
        {
            return BadRequest(new
            {
                message = "A page-generation prompt is required."
            });
        }

        try
        {
            var client = _httpClientFactory.CreateClient("MlService");

            var pythonResponse = await client.PostAsJsonAsync(
                "generate-page-layout",
                new
                {
                    prompt = request.Prompt.Trim()
                },
                cancellationToken
            );

            var responseBody = await pythonResponse.Content.ReadAsStringAsync(
                cancellationToken
            );

            return new ContentResult
            {
                StatusCode = (int)pythonResponse.StatusCode,
                ContentType = "application/json",
                Content = responseBody
            };
        }
        catch (HttpRequestException exception)
        {
            _logger.LogError(
                exception,
                "The Python page-layout service could not be reached."
            );

            return StatusCode(
                StatusCodes.Status503ServiceUnavailable,
                new
                {
                    message = "The AI page-generation service is unavailable."
                }
            );
        }
        catch (TaskCanceledException exception)
        {
            _logger.LogError(
                exception,
                "The Python page-layout request timed out."
            );

            return StatusCode(
                StatusCodes.Status504GatewayTimeout,
                new
                {
                    message = "The AI page-generation request timed out."
                }
            );
        }
    }
}