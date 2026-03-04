using Microsoft.EntityFrameworkCore;
using SmartAgent.Data;
using SmartAgent.Models;
using System.Text;
using System.Text.Json;

namespace SmartAgent.Services
{
    public class TaskExecutionService : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly ILogger<TaskExecutionService> _logger;
        private readonly IConfiguration _config;

        public TaskExecutionService(
            IServiceScopeFactory scopeFactory,
            ILogger<TaskExecutionService> logger,
            IConfiguration config)
        {
            _scopeFactory = scopeFactory;
            _logger = logger;
            _config = config;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("TaskExecutionService iniciado");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await ProcessPendingTasksAsync();
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error procesando tareas pendientes");
                }

                await Task.Delay(15000, stoppingToken); // cada 15 segundos
            }
        }

        private async Task ProcessPendingTasksAsync()
        {
            using var scope = _scopeFactory.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            // Nota: "Pending" con P mayúscula — debe coincidir con tu modelo
            var pendingTasks = await context.Tasks
                .Where(t => t.Status == "Pending")
                .Include(t => t.Agent)
                .ToListAsync();

            if (!pendingTasks.Any()) return;

            _logger.LogInformation($"Procesando {pendingTasks.Count} tareas pendientes");

            using var httpClient = new HttpClient();
            var apiKey = _config["Groq:ApiKey"];

            foreach (var task in pendingTasks)
            {
                task.Status = "Running";
                await context.SaveChangesAsync();

                try
                {
                    task.Result = await ExecuteWithClaudeAsync(httpClient, apiKey!, task);
                    task.Status = "Completed";
                    _logger.LogInformation($"Tarea {task.Id} completada");
                }
                catch (Exception ex)
                {
                    task.Status = "Failed";
                    task.Result = ex.Message;
                    _logger.LogError(ex, $"Tarea {task.Id} falló");
                }

                await context.SaveChangesAsync();
            }
        }

        private async Task<string> ExecuteWithClaudeAsync(
    HttpClient client, string groqKey, TaskItem task)
        {
            var url = "https://api.groq.com/openai/v1/chat/completions";

            var body = new
            {
                model = "llama-3.3-70b-versatile",
                messages = new[]
                {
            new { role = "user", content = $"Ejecuta esta tarea: {task.TaskName}. Parámetros: {task.Parameters}" }
        }
            };

            var content = new StringContent(
                JsonSerializer.Serialize(body), Encoding.UTF8, "application/json");

            client.DefaultRequestHeaders.Clear();
            client.DefaultRequestHeaders.Add("Authorization", $"Bearer {groqKey}");

            var response = await client.PostAsync(url, content);
            var json = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
                throw new Exception($"Error API: {json}");

            using var doc = JsonDocument.Parse(json);
            return doc.RootElement
                .GetProperty("choices")[0]
                .GetProperty("message")
                .GetProperty("content")
                .GetString() ?? "Sin respuesta";
        }
    }
}