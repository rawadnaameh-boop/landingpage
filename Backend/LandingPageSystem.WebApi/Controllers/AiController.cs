using LandingPageSystem.Application.DTOs;
using LandingPageSystem.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace LandingPageSystem.WebApi.Controllers;

[ApiController]
[Route("api/ai")]
public class AiController : ControllerBase
{
    private readonly IUrgencyScoringService _urgencyScoringService;
    private readonly ILogger<AiController> _logger;

    public AiController(
        IUrgencyScoringService urgencyScoringService,
        ILogger<AiController> logger
    )
    {
        _urgencyScoringService = urgencyScoringService;
        _logger = logger;
    }

    [HttpPost("score-urgency")]
    public async Task<ActionResult<UrgencyScoreResponse>> ScoreUrgency(
        [FromBody] UrgencyScoreRequest request,
        CancellationToken cancellationToken
    )
    {
        if (string.IsNullOrWhiteSpace(request.Headline))
        {
            return BadRequest(
                new
                {
                    message = "Headline cannot be empty."
                }
            );
        }

        try
        {
            UrgencyScoreResponse result =
                await _urgencyScoringService.ScoreUrgencyAsync(
                    request,
                    cancellationToken
                );

            return Ok(result);
        }
        catch (HttpRequestException exception)
        {
            _logger.LogError(
                exception,
                "The Python urgency service could not be reached."
            );

            return StatusCode(
                StatusCodes.Status503ServiceUnavailable,
                new
                {
                    message =
                        "The urgency scoring service is currently unavailable."
                }
            );
        }
        catch (TaskCanceledException exception)
        {
            _logger.LogError(
                exception,
                "The Python urgency request timed out."
            );

            return StatusCode(
                StatusCodes.Status504GatewayTimeout,
                new
                {
                    message =
                        "The urgency scoring service took too long to respond."
                }
            );
        }
        catch (Exception exception)
        {
            _logger.LogError(
                exception,
                "An unexpected urgency scoring error occurred."
            );

            return StatusCode(
                StatusCodes.Status500InternalServerError,
                new
                {
                    message =
                        "An unexpected error occurred while scoring the headline."
                }
            );
        }
    }
}