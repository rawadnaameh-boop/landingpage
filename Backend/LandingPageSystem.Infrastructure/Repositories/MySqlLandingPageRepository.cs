using LandingPageSystem.Domain.Entities;
using LandingPageSystem.Domain.Repositories;
using LandingPageSystem.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace LandingPageSystem.Infrastructure.Repositories;

public class MySqlLandingPageRepository : ILandingPageRepository
{
    private readonly AppDbContext _context;

    public MySqlLandingPageRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<LandingPage?> GetByIdAsync(Guid id)
    {
        return await _context.LandingPages.FindAsync(id);
    }

    public async Task<LandingPage?> GetBySlugAsync(string slug)
    {
        return await _context.LandingPages
            .FirstOrDefaultAsync(p => p.Slug == slug);
    }

    public async Task AddAsync(LandingPage landingPage)
    {
        await _context.LandingPages.AddAsync(landingPage);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(LandingPage landingPage)
    {
        _context.LandingPages.Update(landingPage);
        await _context.SaveChangesAsync();
    }

    public async Task<bool> SlugExistsAsync(string slug, Guid? excludeId = null)
    {
        return await _context.LandingPages
            .AnyAsync(p => p.Slug == slug && p.Id != excludeId);
    }

    public async Task<IReadOnlyList<LandingPage>> GetAllAsync()
    {
        return await _context.LandingPages
            .OrderByDescending(p => p.CreatedAt) // Optional: show newest first!
            .ToListAsync();
    }
}