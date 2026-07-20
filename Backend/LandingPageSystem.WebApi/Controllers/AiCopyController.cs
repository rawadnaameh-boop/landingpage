using LandingPageSystem.Application.DTOs;
using LandingPageSystem.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace LandingPageSystem.WebApi.Controllers;

[ApiController]
[Route("api/ai")]
public sealed class AiCopyController : ControllerBase
{
    private readonly ICopyGenerationService _copyGenerationService;
    private readonly ILogger<AiCopyController> _logger;

    public AiCopyController(
        ICopyGenerationService copyGenerationService,
        ILogger<AiCopyController> logger
    )
    {
        _copyGenerationService = copyGenerationService;
        _logger = logger;
    }

    /// <summary>
    /// Generates landing-page headline and subheadline copy.
    /// </summary>
    [HttpPost("generate-copy")]
    public async Task<ActionResult<GenerateCopyResponse>>
        GenerateCopy(
            [FromBody] GenerateCopyRequest request,
            CancellationToken cancellationToken
        )
    {
        if (string.IsNullOrWhiteSpace(request.Topic))
        {
            return BadRequest(new
            {
                message = "Topic is required."
            });
        }

        if (request.Topic.Trim().Length > 100)
        {
            return BadRequest(new
            {
                message =
                    "Topic cannot exceed 100 characters."
            });
        }

        try
        {
            var generatedCopy =
                await _copyGenerationService.GenerateAsync(
                    request.Topic,
                    cancellationToken
                );

            return Ok(generatedCopy);
        }
        catch (ArgumentException exception)
        {
            return BadRequest(new
            {
                message = exception.Message
            });
        }
        catch (TimeoutException exception)
        {
            _logger.LogError(
                exception,
                "The Python copy-generation request timed out."
            );

            return StatusCode(
                StatusCodes.Status504GatewayTimeout,
                new
                {
                    message =
                        "The AI service took too long to respond."
                }
            );
        }
        catch (HttpRequestException exception)
        {
            _logger.LogError(
                exception,
                "The Python copy-generation service failed."
            );

            return StatusCode(
                StatusCodes.Status502BadGateway,
                new
                {
                    message =
                        "The AI copy service is currently unavailable."
                }
            );
        }
        catch (Exception exception)
        {
            _logger.LogError(
                exception,
                "An unexpected copy-generation error occurred."
            );

            return StatusCode(
                StatusCodes.Status500InternalServerError,
                new
                {
                    message =
                        "An unexpected error occurred while generating copy."
                }
            );
        }
    }
}