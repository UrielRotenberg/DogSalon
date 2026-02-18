using DogSalon.API.Data;
using DogSalon.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Data.SqlClient;

namespace DogSalon.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AppointmentsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AppointmentsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("all")]
        public async Task<IActionResult> GetAllAppointments()
        {
            var appointments = await (from app in _context.Appointments
                                      join user in _context.Users on app.UserId equals user.Id into userJoin
                                      from u in userJoin.DefaultIfEmpty()
                                      select new Appointment
                                      {
                                          Id = app.Id,
                                          UserId = app.UserId,
                                          DogName = app.DogName,
                                          DogSize = app.DogSize,
                                          AppointmentDate = app.AppointmentDate,
                                          Status = app.Status,
                                          CreatedAt = app.CreatedAt,
                                          Price = app.Price,
                                          Discount = app.Discount,
                                          DurationMinutes = app.DurationMinutes,
                                          FirstName = u != null ? u.FirstName : "אורח"
                                      }).ToListAsync();

            return Ok(appointments);
        }

        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetUserAppointments(int userId)
        {
            var appointments = await _context.Appointments
                .Where(a => a.UserId == userId)
                .OrderByDescending(a => a.AppointmentDate)
                .ToListAsync();

            return Ok(appointments);
        }

        [HttpPost]
        public async Task<IActionResult> CreateAppointment(Appointment appointment)
        {
            switch (appointment.DogSize)
            {
                case "קטן": appointment.Price = 100; appointment.DurationMinutes = 30; break;
                case "בינוני": appointment.Price = 150; appointment.DurationMinutes = 60; break;
                case "גדול": appointment.Price = 200; appointment.DurationMinutes = 90; break;
                default: appointment.Price = 100; appointment.DurationMinutes = 30; break;
            }

            appointment.Discount = 0;

            var countParam = new SqlParameter
            {
                ParameterName = "Count",
                SqlDbType = System.Data.SqlDbType.Int,
                Direction = System.Data.ParameterDirection.Output
            };

            await _context.Database.ExecuteSqlRawAsync(
                "EXEC GetUserAppointmentCount @UserId = {0}, @Count = @Count OUTPUT",
                appointment.UserId, countParam);

            int pastAppsCount = (int)countParam.Value;

            if (pastAppsCount >= 3)
            {
                appointment.Discount = 10;
                appointment.Price = appointment.Price * 0.9m;
            }

            appointment.CreatedAt = DateTime.Now;
            _context.Appointments.Add(appointment);
            await _context.SaveChangesAsync();

            return Ok(new { message = "התור נקבע בהצלחה!", price = appointment.Price, discount = appointment.Discount });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateAppointment(int id, Appointment updatedApp)
        {
            var appointment = await _context.Appointments.FindAsync(id);
            if (appointment == null) return NotFound();
            if (appointment.UserId != updatedApp.UserId) return Forbid();

            if (appointment.AppointmentDate.Date == DateTime.Today)
            {
                return BadRequest("לא ניתן לערוך תור שנקבע להיום.");
            }

            appointment.DogName = updatedApp.DogName;
            appointment.DogSize = updatedApp.DogSize;
            appointment.AppointmentDate = updatedApp.AppointmentDate;

            if (updatedApp.DogSize == "קטן") { appointment.Price = 100; appointment.DurationMinutes = 30; }
            else if (updatedApp.DogSize == "בינוני") { appointment.Price = 150; appointment.DurationMinutes = 60; }
            else { appointment.Price = 200; appointment.DurationMinutes = 90; }

            if (appointment.Discount > 0) appointment.Price *= 0.9m;

            await _context.SaveChangesAsync();
            return Ok(new { message = "התור עודכן בהצלחה", price = appointment.Price });
        }

        [HttpDelete("{id}/{userId}")]
        public async Task<IActionResult> DeleteAppointment(int id, int userId)
        {
            var appointment = await _context.Appointments.FindAsync(id);
            if (appointment == null) return NotFound();
            if (appointment.UserId != userId) return Forbid("אין לך הרשאה למחוק תור זה.");

            if (appointment.AppointmentDate.Date == DateTime.Today)
            {
                return BadRequest("לא ניתן לבטל תור שנקבע להיום.");
            }

            _context.Appointments.Remove(appointment);
            await _context.SaveChangesAsync();
            return Ok(new { message = "התור בוטל" });
        }
    }
}