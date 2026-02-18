using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DogSalon.API.Models
{
    public class Appointment
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string DogName { get; set; }
        public string DogSize { get; set; }
        public decimal Price { get; set; }
        public int DurationMinutes { get; set; }
        public int Discount { get; set; }
        public DateTime AppointmentDate { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public string Status { get; set; } = "Pending";

        [NotMapped]
        public string? FirstName { get; set; }
    }
}