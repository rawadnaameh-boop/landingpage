using LandingPageSystem.Application.Interfaces;
using LandingPageSystem.Application.Services;
using LandingPageSystem.Domain.Repositories;
using LandingPageSystem.Infrastructure.Data;
using LandingPageSystem.Infrastructure.Repositories;
using LandingPageSystem.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

const string FrontendCorsPolicy = "FrontendCors";

// 1. Add framework services
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddAuthorization();

// 2. Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy(FrontendCorsPolicy, policy =>
    {
        policy
            .WithOrigins(
                "http://localhost:3000",
                "http://localhost:3001"
            )
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

// 3. Configure EF Core with MySQL RDS
string connectionString =
    builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException(
        "The DefaultConnection connection string is missing."
    );

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseMySql(
        connectionString,
        ServerVersion.AutoDetect(connectionString),
        mysqlOptions =>
            mysqlOptions.MigrationsAssembly(
                "LandingPageSystem.Infrastructure"
            )
    )
);

// 4. Register application and infrastructure services
builder.Services.AddScoped<
    ILandingPageRepository,
    MySqlLandingPageRepository
>();

builder.Services.AddScoped<
    ILandingPageService,
    LandingPageService
>();

// 5. Read the Python service URL with fallbacks & trailing slash formatting
string pythonServiceBaseUrl =
    builder.Configuration["MLService:BaseUrl"]
    ?? builder.Configuration["PythonService:BaseUrl"]
    ?? builder.Configuration["MLServiceUrl"]
    ?? "http://ml-color-service:8000/";

if (!pythonServiceBaseUrl.EndsWith("/"))
{
    pythonServiceBaseUrl += "/";
}

// AI copy-generation client
builder.Services.AddHttpClient<
    ICopyGenerationService,
    PythonCopyGenerationService
>(client =>
{
    client.BaseAddress = new Uri(pythonServiceBaseUrl);
    client.Timeout = TimeSpan.FromSeconds(30);
});

// Urgency-scoring client
builder.Services.AddHttpClient<
    IUrgencyScoringService,
    UrgencyScoringService
>(client =>
{
    client.BaseAddress = new Uri(pythonServiceBaseUrl);
    client.Timeout = TimeSpan.FromMinutes(2);
});

var app = builder.Build();

// 6. Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
else
{
    app.UseHttpsRedirection();
}

app.UseCors(FrontendCorsPolicy);
app.UseAuthorization();
app.MapControllers();

// NOTE: Auto-migrations disabled because we manually imported and aligned 
// the AWS RDS schema and tables.

app.Run();