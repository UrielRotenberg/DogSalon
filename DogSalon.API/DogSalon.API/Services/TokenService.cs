using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using DogSalon.API.Models;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace DogSalon.API.Services;

public class JwtOptions
{
    public string Issuer { get; set; } = "";
    public string Audience { get; set; } = "";
    public string Key { get; set; } = "";
}

public interface ITokenService
{
    string CreateToken(User user);
}

public class TokenService : ITokenService
{
    private readonly JwtOptions _options;

    public TokenService(IOptions<JwtOptions> options)
    {
        _options = options.Value;
    }

    public string CreateToken(User user)
    {
        var keyBytes = Encoding.UTF8.GetBytes(_options.Key);
        var signingKey = new SymmetricSecurityKey(keyBytes);
        var creds = new SigningCredentials(signingKey, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new("userId", user.Id.ToString()),
            new(JwtRegisteredClaimNames.UniqueName, user.Username),
            new(ClaimTypes.Role, user.IsAdmin ? "Admin" : "User")
        };

        if (!string.IsNullOrWhiteSpace(user.FirstName))
            claims.Add(new("firstName", user.FirstName));

        var token = new JwtSecurityToken(
            issuer: _options.Issuer,
            audience: _options.Audience,
            claims: claims,
            expires: DateTime.UtcNow.AddHours(8),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}