using System.ComponentModel.DataAnnotations;

namespace DogSalon.API.Contracts;

public record RegisterRequest(
    [Required] string Username,
    [Required] string Password,
    [Required] string FirstName,
    string? Role,
    string? AdminCode
);

public record LoginRequest(
    [Required] string Username,
    [Required] string Password
);

public record AuthResponse(
    int UserId,
    string FirstName,
    string Token
);