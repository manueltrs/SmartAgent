namespace SmartAgent.Models
{
    public class TaskItem
    {
        public Guid Id { get; set; }

        public Guid AgentId { get; set; }
        public Agent? Agent { get; set; }

        public string TaskName { get; set; }

        public string Parameters { get; set; }

        public string Status { get; set; } = "Pending";

        public string? Result { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}