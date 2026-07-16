using LandingPageSystem.Domain.Entities;

namespace LandingPageSystem.Domain.Repositories;

public interface ILandingPageRepository
{
    Task<LandingPage?> GetByIdAsync(Guid id);
    Task<LandingPage?> GetBySlugAsync(string slug);
    Task<IReadOnlyList<LandingPage>> GetAllAsync();
    Task AddAsync(LandingPage landingPage);
    Task UpdateAsync(LandingPage landingPage);
    Task<bool> SlugExistsAsync(string slug, Guid? excludeId = null);
}