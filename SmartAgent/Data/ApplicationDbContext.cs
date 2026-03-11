using Microsoft.EntityFrameworkCore;
using SmartAgent.Models;

namespace SmartAgent.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Agent> Agents { get; set; }
        public DbSet<TaskItem> Tasks { get; set; }
    }
}
