using System.Security.Claims;
using DogSalon.API.Contracts;
using DogSalon.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DogSalon.API.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class AppointmentsController : ControllerBase
    {
        private readonly IAppointmentsService _service;

        public AppointmentsController(IAppointmentsService service)
        {
            _service = service;
        }

        private bool TryGetUserIdFromToken(out int userId)
        {
            var claim = User.FindFirstValue("userId") ?? User.FindFirstValue(ClaimTypes.NameIdentifier);
            return int.TryParse(claim, out userId);
        }

        [HttpGet("queue")]
        public async Task<IActionResult> GetQueue([FromQuery] DateTime? from, [FromQuery] DateTime? to, [FromQuery] string? name, CancellationToken ct)
        {
            if (!TryGetUserIdFromToken(out var userId)) return Unauthorized();
            var isAdmin = User.IsInRole("Admin");
            var result = await _service.GetQueueAsync(userId, isAdmin, from, to, name, ct);
            return Ok(result);
        }

        [HttpGet("me")]
        public async Task<IActionResult> GetMyAppointments(CancellationToken ct)
        {
            if (!TryGetUserIdFromToken(out var userId)) return Unauthorized();
            var result = await _service.GetMineAsync(userId, ct);
            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> CreateAppointment([FromBody] CreateAppointmentRequest req, CancellationToken ct)
        {
            if (!ModelState.IsValid) return ValidationProblem(ModelState);
            if (!TryGetUserIdFromToken(out var userId)) return Unauthorized();

            var result = await _service.CreateAsync(userId, req, ct);

            return Ok(new
            {
                message = "התור נקבע בהצלחה!",
                appointmentId = result.appointmentId,
                price = result.price,
                discount = result.discount
            });
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> UpdateAppointment(int id, [FromBody] UpdateAppointmentRequest req, CancellationToken ct)
        {
            if (!ModelState.IsValid) return ValidationProblem(ModelState);
            if (!TryGetUserIdFromToken(out var userId)) return Unauthorized();
            var price = await _service.UpdateAsync(userId, id, req, ct);
            return Ok(new { message = "התור עודכן בהצלחה", price });
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> DeleteAppointment(int id, CancellationToken ct)
        {
            if (!TryGetUserIdFromToken(out var userId)) return Unauthorized();
            await _service.DeleteAsync(userId, id, ct);
            return Ok(new { message = "התור בוטל" });
        }
    }
}