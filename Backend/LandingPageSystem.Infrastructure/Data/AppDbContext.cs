using LandingPageSystem.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace LandingPageSystem.Infrastructure.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<LandingPage> LandingPages => Set<LandingPage>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<LandingPage>(entity =>
        {
            // Explicitly name the table
            entity.ToTable("LandingPages");

            // Define the Primary Key
            entity.HasKey(e => e.Id);

            entity.Property(e => e.CampaignName)
                .IsRequired()
                .HasMaxLength(255);

            entity.Property(e => e.Slug)
                .IsRequired()
                .HasMaxLength(100);

            // Crucial Index: This makes GET searches by slug incredibly fast 
            // and guarantees no duplicate slugs exist in the DB.
            entity.HasIndex(e => e.Slug)
                .IsUnique();

            // Backend Ignorance meets MySQL Optimization: 
            // This maps our C# string directly to a native MySQL JSON binary column.
            entity.Property(e => e.PageConfig)
                .HasColumnType("json")
                .IsRequired();

            entity.Property(e => e.CreatedAt)
                .IsRequired();

            entity.Property(e => e.UpdatedAt)
                .IsRequired();
        });
    }
}