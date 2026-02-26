using DogSalon.API.Contracts;
using DogSalon.API.Data;
using DogSalon.API.Models;
using DogSalon.API.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DogSalon.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ITokenService _tokenService;

        public AuthController(AppDbContext context, ITokenService tokenService)
        {
            _context = context;
            _tokenService = tokenService;
        }

        [HttpPost("register")]
        public async Task<ActionResult<AuthResponse>> Register([FromBody] RegisterRequest req)
        {
            if (!ModelState.IsValid) return ValidationProblem(ModelState);

            if (await _context.Users.AnyAsync(u => u.Username == req.Username))
                return BadRequest(new ProblemDetails { Title = "Username already exists" });

            bool adminStatus = false;
            if (req.Role == "admin")
            {
                if (req.AdminCode == "DS2026")
                {
                    adminStatus = true;
                }
                else
                {
                    return BadRequest(new ProblemDetails { Title = "קוד אישור מנהל אינו תקין 🛑" });
                }
            }

            var user = new User
            {
                Username = req.Username.Trim(),
                FirstName = req.FirstName.Trim(),
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.Password),
                IsAdmin = adminStatus 
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            var token = _tokenService.CreateToken(user);

            return Ok(new AuthResponse(user.Id, user.FirstName ?? "", token));
        }

        [HttpPost("login")]
        public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest req)
        {
            if (!ModelState.IsValid) return ValidationProblem(ModelState);

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Username == req.Username);

            if (user == null || !BCrypt.Net.BCrypt.Verify(req.Password, user.PasswordHash))
                return Unauthorized(new ProblemDetails { Title = "Invalid username or password" });

            var token = _tokenService.CreateToken(user);

            return Ok(new AuthResponse(user.Id, user.FirstName ?? "", token));
        }
    }
}