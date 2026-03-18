using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using SmartAgent.Data;
using SmartAgent.Models;
using Moq;
using Xunit;

namespace SmartAgent.Tests
{
    public class AgentsControllerTests
    {
        private ApplicationDbContext GetDbContext()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            return new ApplicationDbContext(options);
        }

        private AgentsController CrearController(ApplicationDbContext db)
        {
            var mockFactory = new Mock<IHttpClientFactory>();
            mockFactory.Setup(f => f.CreateClient(It.IsAny<string>()))
                       .Returns(new System.Net.Http.HttpClient());
            var config = new ConfigurationBuilder().Build();
            return new AgentsController(db, config, mockFactory.Object);
        }

        private User CrearUsuario(ApplicationDbContext db)
        {
            var user = new User
            {
                Id = Guid.NewGuid(),
                Name = "Test User",
                Email = "test@test.com",
                PasswordHash = "hash",
                Role = "User"
            };
            db.Users.Add(user);
            db.SaveChanges();
            return user;
        }

        [Fact]
        public async Task CrearAgente_DebeRetornarOk_CuandoDatosValidos()
        {
            var db = GetDbContext();
            var user = CrearUsuario(db);
            var controller = CrearController(db);
            controller.ControllerContext = TestHelpers.CrearContexto(user.Id);

            var result = await controller.Create(new Agent
            {
                Name = "Agente Test",
                Type = "Asistente",
                Description = "Descripcion de prueba del agente"
            });

            Assert.IsType<OkObjectResult>(result);
        }

        [Fact]
        public async Task ObtenerAgentes_DebeRetornarListaVacia_CuandoNoHayAgentes()
        {
            var db = GetDbContext();
            var user = CrearUsuario(db);
            var controller = CrearController(db);
            controller.ControllerContext = TestHelpers.CrearContexto(user.Id);

            var result = await controller.Get();

            var ok = Assert.IsType<OkObjectResult>(result);
            var lista = ok.Value as IEnumerable<Agent>;
            Assert.Empty(lista!);
        }

        [Fact]
        public async Task ObtenerAgentes_DebeRetornarAgentes_CuandoExisten()
        {
            var db = GetDbContext();
            var user = CrearUsuario(db);
            var controller = CrearController(db);
            controller.ControllerContext = TestHelpers.CrearContexto(user.Id);

            await controller.Create(new Agent
            {
                Name = "Agente Test",
                Type = "Asistente",
                Description = "Descripcion de prueba del agente"
            });

            var result = await controller.Get();

            var ok = Assert.IsType<OkObjectResult>(result);
            var lista = ok.Value as IEnumerable<Agent>;
            Assert.Single(lista!);
        }
    }
}