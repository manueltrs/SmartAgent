using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartAgent.Data;
using SmartAgent.Models;
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

        var systemPrompt = $"Eres {agent.Name}, un agente de tipo {agent.Type}. Tu descripción: {agent.Description}. Responde de forma concisa y precisa.";

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

    public class ExecuteTaskRequest
    {
        public string TaskName { get; set; } = string.Empty;
        public string Parameters { get; set; } = string.Empty;
    }
}