using LandingPageSystem.Application.DTOs;
using LandingPageSystem.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace LandingPageSystem.WebApi.Controllers;

[ApiController]
[Route("api/pages")]
public class LandingPagesController : ControllerBase
{
    private readonly ILandingPageService _service;

    public LandingPagesController(ILandingPageService service)
    {
        _service = service;
    }

    // 1. GET: api/pages/slug/{slug}
    [HttpGet("slug/{slug}")]
    public async Task<ActionResult<LandingPageDto>> GetBySlug(string slug)
    {
        var page = await _service.GetBySlugAsync(slug);

        if (page == null)
        {
            return NotFound(new { message = $"Landing page with slug '{slug}' not found." });
        }

        return Ok(page);
    }

    // 2. POST: api/pages
    [HttpPost]
    public async Task<ActionResult<LandingPageDto>> Create([FromBody] CreateLandingPageRequest request)
    {
        try
        {
            var createdPage = await _service.CreateAsync(request);

            // Return 201 Created, pointing to our GET-by-slug endpoint
            return CreatedAtAction(
                nameof(GetBySlug),
                new { slug = createdPage.Slug },
                createdPage
            );
        }
        catch (InvalidOperationException ex)
        {
            // Handles cases where the slug is already in use
            return BadRequest(new { message = ex.Message });
        }
        catch (ArgumentException ex)
        {
            // Handles cases where validation fails (e.g., empty slug)
            return BadRequest(new { message = ex.Message });
        }
    }

    // 3. PUT: api/pages/{id}
    [HttpPut("{id:guid}")]
    public async Task<ActionResult<LandingPageDto>> Update(Guid id, [FromBody] UpdateLandingPageRequest request)
    {
        try
        {
            var updatedPage = await _service.UpdateAsync(id, request);

            if (updatedPage == null)
            {
                return NotFound(new { message = $"Landing page with ID '{id}' not found." });
            }

            return Ok(updatedPage);
        }
        catch (InvalidOperationException ex)
        {
            // Handles cases where the updated slug is already taken by another page
            return BadRequest(new { message = ex.Message });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // 4. GET: api/pages
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<LandingPageDto>>> GetAll()
    {
        var pages = await _service.GetAllAsync();
        return Ok(pages);
    }
}