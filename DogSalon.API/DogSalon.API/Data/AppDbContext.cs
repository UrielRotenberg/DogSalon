using DogSalon.API.Models;
using Microsoft.EntityFrameworkCore;

namespace DogSalon.API.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }
        public DbSet<User> Users { get; set; }
        public DbSet<Appointment> Appointments { get; set; }
        public DbSet<FullAppointmentDetails> FullAppointmentDetails => Set<FullAppointmentDetails>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<FullAppointmentDetails>()
                .ToView("vw_FullAppointmentDetails")
                .HasNoKey();

            modelBuilder.Entity<Appointment>()
                .Property(x => x.Price)
                .HasPrecision(10, 2);
        }
    }
}