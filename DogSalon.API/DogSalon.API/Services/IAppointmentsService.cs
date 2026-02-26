using DogSalon.API.Contracts;

namespace DogSalon.API.Services
{
    public interface IAppointmentsService
    {
        Task<IEnumerable<FullAppointmentDetailsDto>> GetQueueAsync(int currentUserId, bool isAdmin, DateTime? from, DateTime? to, string? name, CancellationToken ct);
        Task<IEnumerable<FullAppointmentDetailsDto>> GetMineAsync(int userId, CancellationToken ct);
        Task<(int appointmentId, decimal price, int discount)> CreateAsync(int userId, CreateAppointmentRequest req, CancellationToken ct);
        Task<decimal> UpdateAsync(int userId, int id, UpdateAppointmentRequest req, CancellationToken ct);
        Task DeleteAsync(int userId, int id, CancellationToken ct);
    }
}