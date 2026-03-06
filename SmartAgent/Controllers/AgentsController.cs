using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartAgent.Data;
using SmartAgent.Models;
using System.ComponentModel.DataAnnotations;
using System.Security.Claims;
using System.Text;
using System.Text.Json;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AgentsController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IConfiguration _config;
    private readonly HttpClient _httpClient;

    public AgentsController(ApplicationDbContext context, IConfiguration config, IHttpClientFactory httpClientFactory)
    {
        _context = context;
        _config = config;
        _httpClient = httpClientFactory.CreateClient("AnthropicClient");
    }

    private Guid GetCurrentUserId() =>
        Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    // GET: api/agents — listar agentes del usuario autenticado
    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var userId = GetCurrentUserId();
        var agents = await _context.Agents
            .Where(a => a.UserId == userId)
            .ToListAsync();
        return Ok(agents);
    }

    // POST: api/agents — crear un agente
    [HttpPost]
    public async Task<IActionResult> Create(Agent agent)
    {
        agent.Id = Guid.NewGuid();
        agent.UserId = GetCurrentUserId();
        agent.CreatedAt = DateTime.UtcNow;
        agent.IsActive = true;

        _context.Agents.Add(agent);
        await _context.SaveChangesAsync();
        return Ok(agent);
    }

    // POST: api/agents/{id}/execute — ejecutar una tarea con el agente
    [HttpPost("{id:guid}/execute")]
    public async Task<IActionResult> Execute(Guid id, [FromBody] ExecuteTaskRequest request)
    {
        var userId = GetCurrentUserId();
        var agent = await _context.Agents
            .FirstOrDefaultAsync(a => a.Id == id && a.UserId == userId);

        if (agent == null) return NotFound("Agente no encontrado");
        if (!agent.IsActive) return BadRequest("El agente está inactivo");

        // Crear el registro de la tarea
        var taskItem = new TaskItem
        {
            Id = Guid.NewGuid(),
            AgentId = agent.Id,
            TaskName = request.TaskName,
            Parameters = request.Parameters,
            Status = "Running",
            CreatedAt = DateTime.UtcNow
        };
        _context.Tasks.Add(taskItem);
        await _context.SaveChangesAsync();

        try
        {
            // Llamar a Claude API
            var result = await CallClaudeAsync(agent, request);

            taskItem.Status = "Completed";
            taskItem.Result = result;
        }
        catch (Exception ex)
        {
            taskItem.Status = "Failed";
            taskItem.Result = $"Error: {ex.Message}";
        }

        await _context.SaveChangesAsync();
        return Ok(taskItem);
    }

    // GET: api/agents/{id}/tasks — historial de tareas
    [HttpGet("{id:guid}/tasks")]
    public async Task<IActionResult> GetTasks(Guid id)
    {
        var userId = GetCurrentUserId();
        var agent = await _context.Agents
            .FirstOrDefaultAsync(a => a.Id == id && a.UserId == userId);
        if (agent == null) return NotFound();

        var tasks = await _context.Tasks
            .Where(t => t.AgentId == id)
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync();
        return Ok(tasks);
    }

    private async Task<string> CallClaudeAsync(Agent agent, ExecuteTaskRequest request)
    {
        var apiKey = _config["Groq:ApiKey"]
            ?? throw new Exception("API Key de Groq no configurada");

        var url = "https://api.groq.com/openai/v1/chat/completions";

        var systemPrompt = agent.Type.ToLower() switch
        {
        "resumidor" => $"""
            Eres {agent.Name}, un agente especializado en resumir textos.
            Tu trabajo es crear resúmenes claros, concisos y bien estructurados.
            Extrae los puntos más importantes y preséntelos de forma ordenada.
            Siempre indica al final cuántas palabras tiene el resumen.
            """,

        "traductor" => $"""
            Eres {agent.Name}, un agente especializado en traducción de idiomas.
            Traduce el texto al idioma solicitado de forma precisa y natural.
            Si no se especifica idioma, traduce al inglés.
            Indica siempre el idioma origen y el idioma destino.
            """,

        "analista" => $"""
            Eres {agent.Name}, un agente especializado en análisis de datos y situaciones.
            Analiza la información proporcionada, identifica patrones y tendencias.
            Presenta tus conclusiones con datos concretos y recomendaciones accionables.
            Usa un formato estructurado con secciones claras.
            """,

        "programador" => $"""
            Eres {agent.Name}, un agente especializado en programación y desarrollo de software.
            Ayuda con código, explica errores, sugiere mejoras y buenas prácticas.
            Siempre incluye ejemplos de código cuando sea relevante.
            Especifica el lenguaje de programación utilizado.
            """,

        "asistente" => $"""
            Eres {agent.Name}, un asistente virtual inteligente y amable.
            Tu descripción: {agent.Description}
            Responde preguntas generales de forma clara, amigable y detallada.
            Si no sabes algo, indícalo honestamente y sugiere dónde encontrar la información.
            """,
            _ => $"""
            Eres {agent.Name}, un agente de tipo {agent.Type}.
            Tu descripción: {agent.Description}
            Responde de forma concisa y precisa a las tareas que te asignen.
            """
        };

        var body = new
        {
            model = "llama-3.3-70b-versatile",
            messages = new[]
            {
            new { role = "system", content = systemPrompt },
            new { role = "user", content = $"Tarea: {request.TaskName}\nParámetros: {request.Parameters}" }
        }
        };

        var json = JsonSerializer.Serialize(body);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        _httpClient.DefaultRequestHeaders.Clear();
        _httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {apiKey}");

        var response = await _httpClient.PostAsync(url, content);
        var responseBody = await response.Content.ReadAsStringAsync();

        if (!response.IsSuccessStatusCode)
            throw new Exception($"Groq API error: {responseBody}");

        using var doc = JsonDocument.Parse(responseBody);
        return doc.RootElement
            .GetProperty("choices")[0]
            .GetProperty("message")
            .GetProperty("content")
            .GetString() ?? "Sin respuesta";
    }

    // GET: api/agents/all — solo Admin ve todos los agentes
    [HttpGet("all")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAll()
    {
        var agents = await _context.Agents
            .Include(a => a.User)
            .Select(a => new {
                a.Id,
                a.Name,
                a.Type,
                a.IsActive,
                a.CreatedAt,
                Owner = a.User!.Email
            })
            .ToListAsync();
        return Ok(agents);
    }

    // GET: api/agents/all-tasks — solo Admin ve todas las tareas
    [HttpGet("all-tasks")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAllTasks()
    {
        var tasks = await _context.Tasks
            .Include(t => t.Agent)
            .OrderByDescending(t => t.CreatedAt)
            .Select(t => new {
                t.Id,
                t.TaskName,
                t.Status,
                t.Result,
                t.CreatedAt,
                Agent = t.Agent!.Name,
                AgentType = t.Agent.Type
            })
            .ToListAsync();
        return Ok(tasks);
    }

    // PUT: api/agents/{id}/toggle — Admin puede activar/desactivar agentes
    [HttpPut("{id:guid}/toggle")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Toggle(Guid id)
    {
        var agent = await _context.Agents.FindAsync(id);
        if (agent == null) return NotFound();

        agent.IsActive = !agent.IsActive;
        await _context.SaveChangesAsync();

        return Ok(new
        {
            agent.Id,
            agent.Name,
            agent.IsActive,
            message = agent.IsActive ? "Agente activado" : "Agente desactivado"
        });
    }

    public class ExecuteTaskRequest
    {
        [Required(ErrorMessage = "El nombre de la tarea es requerido")]
        [MaxLength(200, ErrorMessage = "El nombre no puede tener más de 200 caracteres")]
        public string TaskName { get; set; } = string.Empty;

        [Required(ErrorMessage = "Los parámetros son requeridos")]
        [MaxLength(2000, ErrorMessage = "Los parámetros no pueden tener más de 2000 caracteres")]
        public string Parameters { get; set; } = string.Empty;
    }
}