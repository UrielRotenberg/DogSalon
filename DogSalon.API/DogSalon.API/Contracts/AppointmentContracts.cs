using System.ComponentModel.DataAnnotations;

namespace DogSalon.API.Contracts;

public class CreateAppointmentRequest
{
    [Required(ErrorMessage = "שם הכלב הוא שדה חובה")]
    [StringLength(50, MinimumLength = 2, ErrorMessage = "שם הכלב חייב להכיל לפחות 2 תווים")]
    public string DogName { get; set; } = string.Empty;

    [Required(ErrorMessage = "יש לבחור סוג כלב")]
    [RegularExpression("^(קטן|בינוני|גדול)$", ErrorMessage = "סוג כלב חייב להיות: קטן, בינוני או גדול")]
    public string DogSize { get; set; } = string.Empty;

    [Required(ErrorMessage = "יש לבחור תאריך ושעה לתור")]
    public DateTime AppointmentDate { get; set; }
}

public class UpdateAppointmentRequest
{
    [Required(ErrorMessage = "שם הכלב הוא שדה חובה")]
    [StringLength(50, MinimumLength = 2)]
    public string DogName { get; set; } = string.Empty;

    [Required]
    public string DogSize { get; set; } = string.Empty;

    [Required]
    public DateTime AppointmentDate { get; set; }
}

public sealed class FullAppointmentDetailsDto
{
    public int Id { get; init; }
    public int UserId { get; init; }
    public string CustomerName { get; init; } = "";
    public string DogName { get; init; } = "";
    public string DogSize { get; init; } = "";
    public DateTime AppointmentDate { get; init; }
    public DateTime EndTime { get; init; }
    public string Status { get; init; } = "";
    public DateTime CreatedAt { get; init; }
    public decimal? Price { get; init; }
    public int? Discount { get; init; }
}