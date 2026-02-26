using DogSalon.API.Contracts;
using DogSalon.API.Data;
using DogSalon.API.Models;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;

namespace DogSalon.API.Repositories
{
    public class AppointmentsRepository : IAppointmentsRepository
    {
        private readonly AppDbContext _db;

        public AppointmentsRepository(AppDbContext db)
        {
            _db = db;
        }

        public async Task<List<FullAppointmentDetails>> GetQueueAsync(DateTime? from, DateTime? to, string? name, CancellationToken ct)
        {
            var query = _db.FullAppointmentDetails.AsNoTracking().AsQueryable();

            if (from.HasValue)
            {
                query = query.Where(x => x.AppointmentDate >= from.Value.Date);
            }
            else
            {
                query = query.Where(x => x.AppointmentDate >= DateTime.Today);
            }

            if (to.HasValue)
                query = query.Where(x => x.AppointmentDate < to.Value.Date.AddDays(1));

            if (!string.IsNullOrWhiteSpace(name))
                query = query.Where(x => x.CustomerName.Contains(name) || x.DogName.Contains(name));

            return await query.OrderBy(x => x.AppointmentDate).ToListAsync(ct);
        }

        public async Task<List<FullAppointmentDetails>> GetMineAsync(int userId, CancellationToken ct)
        {
            return await _db.FullAppointmentDetails
                .AsNoTracking()
                .Where(x => x.UserId == userId)
                .OrderByDescending(x => x.AppointmentDate)
                .ToListAsync(ct);
        }

        public async Task<Appointment?> GetByIdAsync(int id, CancellationToken ct)
        {
            return await _db.Appointments
                .FirstOrDefaultAsync(x => x.Id == id, ct);
        }

        public async Task<int> GetUserPastAppointmentsCountAsync(int userId, CancellationToken ct)
        {
            var countParam = new SqlParameter
            {
                ParameterName = "Count",
                SqlDbType = System.Data.SqlDbType.Int,
                Direction = System.Data.ParameterDirection.Output
            };

            await _db.Database.ExecuteSqlRawAsync(
                "EXEC GetUserAppointmentCount @UserId = {0}, @Count = @Count OUTPUT",
                parameters: new object[] { userId, countParam },
                cancellationToken: ct);

            return (int)countParam.Value;
        }

        public async Task<int> CreateAsync(int userId, CreateAppointmentRequest req, int durationMinutes, decimal finalPrice, int discount, CancellationToken ct)
        {
            var entity = new Appointment
            {
                UserId = userId,
                DogName = req.DogName.Trim(),
                DogSize = req.DogSize.Trim(),
                AppointmentDate = req.AppointmentDate,
                CreatedAt = DateTime.Now,
                Status = "Pending",
                DurationMinutes = durationMinutes,
                Price = finalPrice,
                Discount = discount
            };

            _db.Appointments.Add(entity);
            await _db.SaveChangesAsync(ct);
            return entity.Id;
        }

        public async Task<int> GetDiscountAsync(int appointmentId, CancellationToken ct)
        {
            return await _db.Appointments
                .AsNoTracking()
                .Where(x => x.Id == appointmentId)
                .Select(x => x.Discount)
                .SingleOrDefaultAsync(ct);
        }

        public async Task UpdateAsync(int userId, int appointmentId, UpdateAppointmentRequest req, int durationMinutes, decimal finalPrice, CancellationToken ct)
        {
            var entity = await _db.Appointments.FindAsync(new object[] { appointmentId }, ct);

            if (entity == null) throw new InvalidOperationException("Appointment not found");

            if (entity.UserId != userId) throw new UnauthorizedAccessException("Forbidden");

            entity.DogName = req.DogName.Trim();
            entity.DogSize = req.DogSize.Trim();
            entity.AppointmentDate = req.AppointmentDate;
            entity.DurationMinutes = durationMinutes;
            entity.Price = finalPrice;

            await _db.SaveChangesAsync(ct);
        }

        public async Task DeleteAsync(int userId, int appointmentId, CancellationToken ct)
        {
            var entity = await _db.Appointments.FindAsync(new object[] { appointmentId }, ct);

            if (entity == null) throw new InvalidOperationException("Appointment not found");
            if (entity.UserId != userId) throw new UnauthorizedAccessException("Forbidden");

            _db.Appointments.Remove(entity);
            await _db.SaveChangesAsync(ct);
        }
    }
}