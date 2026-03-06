using System.ComponentModel.DataAnnotations;

namespace SmartAgent.Models
{
    public class Agent
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public User? User { get; set; }

        [Required(ErrorMessage = "El nombre es requerido")]
        [MaxLength(100, ErrorMessage = "El nombre no puede tener más de 100 caracteres")]
        public string Name { get; set; } = string.Empty;

        [Required(ErrorMessage = "El tipo es requerido")]
        [RegularExpression("^(Asistente|Resumidor|Traductor|Analista|Programador)$",
            ErrorMessage = "El tipo debe ser: Asistente, Resumidor, Traductor, Analista o Programador")]
        public string Type { get; set; } = string.Empty;

        [Required(ErrorMessage = "La descripción es requerida")]
        [MaxLength(500, ErrorMessage = "La descripción no puede tener más de 500 caracteres")]
        public string Description { get; set; } = string.Empty;

        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public ICollection<TaskItem>? Tasks { get; set; }
    }
}