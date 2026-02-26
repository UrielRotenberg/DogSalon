using Microsoft.EntityFrameworkCore;

namespace DogSalon.API.Models
{
    [Keyless]
    public class FullAppointmentDetails
    {
        public int Id { get; set; }
        public string CustomerName { get; set; } = "";
        public string DogName { get; set; } = "";
        public string DogSize { get; set; } = "";
        public DateTime AppointmentDate { get; set; }
        public DateTime EndTime { get; set; }
        public decimal Price { get; set; }
        public int Discount { get; set; }
        public string Status { get; set; } = "";
        public DateTime CreatedAt { get; set; }
        public int UserId { get; set; }
    }
}