using Microsoft.EntityFrameworkCore;
using DogSalon.API.Models;

namespace DogSalon.API.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }
        public DbSet<User> Users { get; set; }
    }
}