using SmartAgent.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
namespace SmartAgent.Services
{

    public class TaskExecutionService : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory;

        public TaskExecutionService(IServiceScopeFactory scopeFactory)
        {
            _scopeFactory = scopeFactory;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                using (var scope = _scopeFactory.CreateScope())
                {
                    var context = scope.ServiceProvider
                        .GetRequiredService<ApplicationDbContext>();

                    var pendingTasks = context.Tasks
                        .Where(t => t.Status == "pending")
                        .ToList();

                    foreach (var task in pendingTasks)
                    {
                        task.Status = "completed";
                    }

                    await context.SaveChangesAsync();
                }

                await Task.Delay(10000);
            }
        }
    }
}