using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Moq;
using NBomber.Contracts;
using NBomber.CSharp;
using SmartAgent.Data;
using SmartAgent.Models;
using Xunit;

namespace SmartAgent.Tests
{
    public class LoadTests
    {
        private DbContextOptions<ApplicationDbContext> _dbOptions;
        private Guid _userId;

        private DbContextOptions<ApplicationDbContext> GetDbOptions(string name)
        {
            return new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: name)
                .Options;
        }

        private AgentsController CrearController(DbContextOptions<ApplicationDbContext> options, Guid userId)
        {
            var db = new ApplicationDbContext(options);
            var mockFactory = new Mock<IHttpClientFactory>();
            mockFactory.Setup(f => f.CreateClient(It.IsAny<string>()))
                       .Returns(new System.Net.Http.HttpClient());
            var config = new ConfigurationBuilder().Build();
            var controller = new AgentsController(db, config, mockFactory.Object);
            controller.ControllerContext = TestHelpers.CrearContextoConRol(userId, "User");
            return controller;
        }

        [Fact]
        public void CargaConcurrente_CrearAgentes_DebeCompletarSinErrores()
        {
            var dbName = "load_crear_" + Guid.NewGuid();
            var options = GetDbOptions(dbName);
            var userId = Guid.NewGuid();

            using (var db = new ApplicationDbContext(options))
            {
                db.Users.Add(new User { Id = userId, Name = "User", Email = "load@test.com", PasswordHash = "hash", Role = "User" });
                db.SaveChanges();
            }

            var scenario = Scenario.Create("crear_agentes", async context =>
            {
                var controller = CrearController(options, userId);
                var result = await controller.Create(new Agent
                {
                    Name = $"Agente {context.InvocationNumber}",
                    Type = "Asistente",
                    Description = "Prueba de carga"
                });
                return result != null ? Response.Ok() : Response.Fail();
            })
            .WithoutWarmUp()
            .WithLoadSimulations(
                Simulation.Inject(rate: 5, interval: TimeSpan.FromSeconds(1), during: TimeSpan.FromSeconds(10))
            );

            var stats = NBomberRunner
                .RegisterScenarios(scenario)
                .Run();

            var scenarioStats = stats.ScenarioStats[0];
            Assert.Equal(0, scenarioStats.Fail.Request.Count);
        }

        [Fact]
        public void CargaConcurrente_ObtenerAgentes_DebeCompletarSinErrores()
        {
            var dbName = "load_obtener_" + Guid.NewGuid();
            var options = GetDbOptions(dbName);
            var userId = Guid.NewGuid();

            using (var db = new ApplicationDbContext(options))
            {
                db.Users.Add(new User { Id = userId, Name = "User", Email = "load2@test.com", PasswordHash = "hash", Role = "User" });
                db.SaveChanges();
            }

            var scenario = Scenario.Create("obtener_agentes", async context =>
            {
                var controller = CrearController(options, userId);
                var result = await controller.Get();
                return result != null ? Response.Ok() : Response.Fail();
            })
            .WithoutWarmUp()
            .WithLoadSimulations(
                Simulation.Inject(rate: 10, interval: TimeSpan.FromSeconds(1), during: TimeSpan.FromSeconds(10))
            );

            var stats = NBomberRunner
                .RegisterScenarios(scenario)
                .Run();

            var scenarioStats = stats.ScenarioStats[0];
            Assert.Equal(0, scenarioStats.Fail.Request.Count);
        }
    }
}
