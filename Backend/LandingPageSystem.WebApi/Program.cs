using LandingPageSystem.Application.Interfaces;
using LandingPageSystem.Application.Services;
using LandingPageSystem.Domain.Repositories;
using LandingPageSystem.Infrastructure.Data;
using LandingPageSystem.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);
const string FrontendCorsPolicy = "FrontendCors";

// 1. Add services to the container.
builder.Services.AddControllers();

// Configure Swagger/OpenAPI for testing endpoints
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddCors(options =>
{
    options.AddPolicy(FrontendCorsPolicy, policy =>
    {
        policy.WithOrigins("http://localhost:3000", "http://localhost:3001")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// 2. Configure EF Core with MySQL (Pomelo)
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseMySql(
        connectionString,
        ServerVersion.AutoDetect(connectionString),
        b => b.MigrationsAssembly("LandingPageSystem.Infrastructure")
    ));

// 3. Register Onion Architecture Layers for Dependency Injection
// This maps our Domain contracts to our Application/Infrastructure services
builder.Services.AddScoped<ILandingPageRepository, MySqlLandingPageRepository>();
builder.Services.AddScoped<ILandingPageService, LandingPageService>();

var app = builder.Build();

// 4. Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UseCors(FrontendCorsPolicy);

app.UseAuthorization();

app.MapControllers();

app.Run();