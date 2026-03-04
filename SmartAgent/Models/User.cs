using System.ComponentModel.DataAnnotations;

namespace SmartAgent.Models
{
    public class User
    {
        public Guid Id { get; set; }

        [Required]
        public string Name { get; set; }

        [Required]
        public string Email { get; set; }

        [Required]
        public string PasswordHash { get; set; }

        public string Role { get; set; } = "User";

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public ICollection<Agent>? Agents { get; set; }
    }
}