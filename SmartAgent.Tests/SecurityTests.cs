using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using SmartAgent.Data;
using SmartAgent.Models;
using Moq;
using Xunit;
using System.Security.Claims;
using Microsoft.AspNetCore.Http;

namespace SmartAgent.Tests
{
    public class SecurityTests
    {
        private ApplicationDbContext GetDbContext()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            return new ApplicationDbContext(options);
        }

        private AgentsController CrearController(ApplicationDbContext db, string role = "User")
        {
            var mockFactory = new Mock<IHttpClientFactory>();
            mockFactory.Setup(f => f.CreateClient(It.IsAny<string>()))
                       .Returns(new System.Net.Http.HttpClient());
            var config = new ConfigurationBuilder().Build();
            var controller = new AgentsController(db, config, mockFactory.Object);
            controller.ControllerContext = TestHelpers.CrearContextoConRol(Guid.NewGuid(), role);
            return controller;
        }

        [Fact]
        public async Task UsuarioNoAutenticado_NoDebeVerAgentesDeOtroUsuario()
        {
            var db = GetDbContext();

            // Usuario 1 crea un agente
            var user1Id = Guid.NewGuid();
            db.Users.Add(new User { Id = user1Id, Name = "User1", Email = "user1@test.com", PasswordHash = "hash", Role = "User" });
            db.Agents.Add(new Agent { Id = Guid.NewGuid(), UserId = user1Id, Name = "Agente User1", Type = "Asistente", Description = "Desc" });
            db.SaveChanges();

            // Usuario 2 intenta ver los agentes
            var controllerUser2 = CrearController(db);
            var result = await controllerUser2.Get();

            var ok = Assert.IsType<OkObjectResult>(result);
            var lista = ok.Value as IEnumerable<Agent>;
            Assert.Empty(lista!); // No debe ver agentes de User1
        }

        [Fact]
        public async Task Login_ConPasswordIncorrecta_DebeRetornarUnauthorized()
        {
            var db = GetDbContext();
            var config = new ConfigurationBuilder()
                .AddInMemoryCollection(new Dictionary<string, string?>
                {
                    { "Jwt:Key", "SmartAgent2026ClaveSecreta123456789ABC" },
                    { "Jwt:Issuer", "SmartAgent" },
                    { "Jwt:Audience", "SmartAgentUsers" }
                })
                .Build();

            var controller = new AuthController(db, config);
            await controller.Register(new LoginDto { Email = "user@test.com", Password = "correcta123" });

            var result = controller.Login(new LoginDto { Email = "user@test.com", Password = "incorrecta999" });

            Assert.IsType<UnauthorizedObjectResult>(result);
        }

        [Fact]
        public async Task Register_ConEmailDuplicado_DebeRetornarBadRequest()
        {
            var db = GetDbContext();
            var config = new ConfigurationBuilder()
                .AddInMemoryCollection(new Dictionary<string, string?>
                {
                    { "Jwt:Key", "SmartAgent2026ClaveSecreta123456789ABC" },
                    { "Jwt:Issuer", "SmartAgent" },
                    { "Jwt:Audience", "SmartAgentUsers" }
                })
                .Build();

            var controller = new AuthController(db, config);
            await controller.Register(new LoginDto { Email = "duplicado@test.com", Password = "123456" });
            var result = await controller.Register(new LoginDto { Email = "duplicado@test.com", Password = "otrapass" });

            Assert.IsType<BadRequestObjectResult>(result);
        }

        [Fact]
        public async Task Agente_NoDebeEjecutarse_SiEstaInactivo()
        {
            var db = GetDbContext();
            var userId = Guid.NewGuid();
            db.Users.Add(new User { Id = userId, Name = "User", Email = "u@test.com", PasswordHash = "hash", Role = "User" });

            var agente = new Agent { Id = Guid.NewGuid(), UserId = userId, Name = "Agente", Type = "Asistente", Description = "Desc", IsActive = false };
            db.Agents.Add(agente);
            db.SaveChanges();

            var mockFactory = new Mock<IHttpClientFactory>();
            mockFactory.Setup(f => f.CreateClient(It.IsAny<string>())).Returns(new System.Net.Http.HttpClient());
            var controller = new AgentsController(db, new ConfigurationBuilder().Build(), mockFactory.Object);
            controller.ControllerContext = TestHelpers.CrearContextoConRol(userId, "User");

            var result = await controller.Execute(agente.Id, new AgentsController.ExecuteTaskRequest
            {
                TaskName = "Test",
                Parameters = "Params"
            });

            Assert.IsType<BadRequestObjectResult>(result);
        }
    }
}