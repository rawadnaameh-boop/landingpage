using LandingPageSystem.Application.DTOs;

namespace LandingPageSystem.Application.Interfaces;

public interface ILandingPageService
{
    Task<LandingPageDto?> GetByIdAsync(Guid id);
    Task<LandingPageDto?> GetBySlugAsync(string slug);
    Task<IReadOnlyList<LandingPageDto>> GetAllAsync();
    Task<LandingPageDto> CreateAsync(CreateLandingPageRequest request);
    Task<LandingPageDto?> UpdateAsync(Guid id, UpdateLandingPageRequest request);
}