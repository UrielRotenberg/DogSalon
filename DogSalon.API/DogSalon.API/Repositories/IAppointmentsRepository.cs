using DogSalon.API.Contracts;
using DogSalon.API.Models;

namespace DogSalon.API.Repositories;

public interface IAppointmentsRepository
{
    Task<List<FullAppointmentDetails>> GetQueueAsync(DateTime? from, DateTime? to, string? name, CancellationToken ct);
    Task<List<FullAppointmentDetails>> GetMineAsync(int userId, CancellationToken ct);
    Task<Appointment?> GetByIdAsync(int id, CancellationToken ct);
    Task<int> GetUserPastAppointmentsCountAsync(int userId, CancellationToken ct);
    Task<int> CreateAsync(int userId, CreateAppointmentRequest req, int durationMinutes, decimal finalPrice, int discount, CancellationToken ct);
    Task<int> GetDiscountAsync(int appointmentId, CancellationToken ct);
    Task UpdateAsync(int userId, int appointmentId, UpdateAppointmentRequest req, int durationMinutes, decimal finalPrice, CancellationToken ct);
    Task DeleteAsync(int userId, int appointmentId, CancellationToken ct);
}