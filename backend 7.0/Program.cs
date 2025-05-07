using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using PortfolioTrackerApi.Services;
using PortfolioTrackerApi.Models;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// -------------------- CONFIGURE SERVICES --------------------

builder.Services.AddControllers();

// Register HTTP client for Finnhub service
builder.Services.AddHttpClient<IFinnhubService, FinnhubService>();

// Register other services
builder.Services.AddSingleton<IEmailVerificationService, EmailVerificationService>();
builder.Services.AddScoped<IJwtTokenService, JwtTokenService>();
builder.Services.AddScoped<IUserService, UserService>(); // ✅ Register UserService
builder.Services.AddSingleton<IInvestmentService, InvestmentService>();

// Enable CORS for Angular
builder.Services.AddCors();

// Add Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// JWT Authentication config
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = jwtSettings["SecretKey"];

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false; // Set true in production
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidAudience = jwtSettings["Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey!))
    };
});

var app = builder.Build();

// -------------------- CONFIGURE MIDDLEWARE --------------------

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Enable CORS for Angular frontend
app.UseCors(policy =>
    policy.WithOrigins("http://localhost:4200")
          .AllowAnyHeader()
          .AllowAnyMethod());

app.UseHttpsRedirection();

// Add JWT Authentication and Authorization middleware
app.UseAuthentication(); // ✅ Important
app.UseAuthorization();

app.MapControllers();

app.Run();
