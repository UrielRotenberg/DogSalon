using System.ComponentModel.DataAnnotations;

namespace DogSalon.API.Models
{
    public class Appointment
    {
        [Key]
        public int Id { get; set; }
        [Required]
        public int UserId { get; set; }
        [Required]
        public string DogName { get; set; } = string.Empty;
        public string ServiceType { get; set; } = "תספורת";
        public DateTime AppointmentDate { get; set; }
        public string Status { get; set; } = "Pending";
    }
}