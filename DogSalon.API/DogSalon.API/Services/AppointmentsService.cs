using DogSalon.API.Contracts;
using DogSalon.API.Repositories;
using DogSalon.API.Models;
using DogSalon.API.Exceptions;
using Microsoft.EntityFrameworkCore;
using DogSalon.API.Data;

namespace DogSalon.API.Services
{
    public class AppointmentsService : IAppointmentsService
    {
        private readonly IAppointmentsRepository _repo;
        private readonly AppDbContext _db;

        public AppointmentsService(IAppointmentsRepository repo, AppDbContext db)
        {
            _repo = repo;
            _db = db;
        }

        public async Task<IEnumerable<FullAppointmentDetailsDto>> GetQueueAsync(int currentUserId, bool isAdmin, DateTime? from, DateTime? to, string? name, CancellationToken ct)
        {
            var rows = await _repo.GetQueueAsync(from, to, name, ct);
            return rows.Select(x => MapToFullDto(x, currentUserId, isAdmin));
        }

        public async Task<IEnumerable<FullAppointmentDetailsDto>> GetMineAsync(int userId, CancellationToken ct)
        {
            var rows = await _repo.GetMineAsync(userId, ct);
            return rows.Select(x => MapToFullDto(x, userId, false));
        }

        public async Task<(int appointmentId, decimal price, int discount)> CreateAsync(int userId, CreateAppointmentRequest req, CancellationToken ct)
        {
            if (req.AppointmentDate < DateTime.Now)
                throw new BadRequestException("לא ניתן לקבוע תור לעבר 🕒");

            var (basePrice, durationMinutes) = GetPricing(req.DogSize);
            var endTime = req.AppointmentDate.AddMinutes(durationMinutes);

            bool isOccupied = await _db.Appointments.AnyAsync(a =>
                a.AppointmentDate < endTime &&
                req.AppointmentDate < a.AppointmentDate.AddMinutes(a.DurationMinutes), ct);

            if (isOccupied)
                throw new BadRequestException("הזמן שנבחר כבר נתפס על ידי לקוח אחר. אנא בחר זמן חדש.");

            var pastCount = await _repo.GetUserPastAppointmentsCountAsync(userId, ct);
            int discount = pastCount >= 3 ? 10 : 0;
            decimal finalPrice = discount > 0 ? basePrice * 0.9m : basePrice;

            var id = await _repo.CreateAsync(userId, req, durationMinutes, finalPrice, discount, ct);
            return (id, finalPrice, discount);
        }

        public async Task<decimal> UpdateAsync(int userId, int id, UpdateAppointmentRequest req, CancellationToken ct)
        {
            var existing = await _db.Appointments.FirstOrDefaultAsync(x => x.Id == id, ct);

            if (existing == null || existing.UserId != userId)
                throw new NotFoundException("התור לא נמצא או שאין לך הרשאה לערוך אותו");

            if (existing.AppointmentDate.Date == DateTime.Today)
                throw new BadRequestException("לא ניתן לערוך תור ביום האירוע 🛑");

            var (basePrice, durationMinutes) = GetPricing(req.DogSize);
            decimal finalPrice = existing.Discount > 0 ? basePrice * 0.9m : basePrice;

            await _repo.UpdateAsync(userId, id, req, durationMinutes, finalPrice, ct);
            return finalPrice;
        }

        public async Task DeleteAsync(int userId, int id, CancellationToken ct)
        {
            var existing = await _db.Appointments.FirstOrDefaultAsync(x => x.Id == id, ct);

            if (existing == null || existing.UserId != userId)
                throw new NotFoundException("התור לא נמצא או שאין לך הרשאה לבטלו");

            if (existing.AppointmentDate.Date == DateTime.Today)
                throw new BadRequestException("לא ניתן לבטל תור ביום האירוע. יש ליצור קשר טלפוני 📞");

            await _repo.DeleteAsync(userId, id, ct);
        }

        private static (decimal price, int durationMinutes) GetPricing(string dogSize)
        {
            return dogSize switch
            {
                "קטן" => (100m, 30),
                "בינוני" => (150m, 60),
                "גדול" => (200m, 90),
                _ => (100m, 30)
            };
        }

        private static FullAppointmentDetailsDto MapToFullDto(FullAppointmentDetails x, int currentUserId, bool isAdmin)
        {
            return new FullAppointmentDetailsDto
            {
                Id = x.Id,
                UserId = x.UserId,
                CustomerName = x.CustomerName,
                DogName = x.DogName,
                DogSize = x.DogSize,
                AppointmentDate = x.AppointmentDate,
                EndTime = x.EndTime,
                Status = x.Status,
                CreatedAt = x.CreatedAt,
                Price = (isAdmin || x.UserId == currentUserId) ? x.Price : null,
                Discount = (isAdmin || x.UserId == currentUserId) ? (int?)x.Discount : null
            };
        }
    }
}