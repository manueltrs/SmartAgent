namespace SmartAgent.Models
{
    public class Agent
    {
        public Guid Id { get; set; }

        public Guid UserId { get; set; }
        public User? User { get; set; }

        public string Name { get; set; }

        public string Type { get; set; }

        public string Description { get; set; }

        public bool IsActive { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public ICollection<TaskItem>? Tasks { get; set; }
    }
}
