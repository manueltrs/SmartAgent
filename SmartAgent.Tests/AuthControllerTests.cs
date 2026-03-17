using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using SmartAgent.Data;
using SmartAgent.Models;
using Xunit;
using Microsoft.Extensions.Configuration;

namespace SmartAgent.Tests
{
    public class AuthControllerTests
    {
        private ApplicationDbContext GetDbContext()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            return new ApplicationDbContext(options);
        }

        private IConfiguration GetConfiguration()
        {
            var config = new Dictionary<string, string?>
            {
                { "Jwt:Key", "SmartAgent2026ClaveSecreta123456789ABC" },
                { "Jwt:Issuer", "SmartAgent" },
                { "Jwt:Audience", "SmartAgentUsers" }
            };
            return new ConfigurationBuilder()
                .AddInMemoryCollection(config)
                .Build();
        }

        [Fact]
        public async Task Register_DebeRetornarOk_CuandoDatosValidos()
        {
            var db = GetDbContext();
            var config = GetConfiguration();
            var controller = new AuthController(db, config);
            var dto = new LoginDto { Email = "test@test.com", Password = "123456" };

            var result = await controller.Register(dto);

            Assert.IsType<OkObjectResult>(result);
        }

        [Fact]
        public async Task Register_DebeRetornarBadRequest_CuandoEmailYaExiste()
        {
            var db = GetDbContext();
            var config = GetConfiguration();
            var controller = new AuthController(db, config);
            var dto = new LoginDto { Email = "test@test.com", Password = "123456" };

            await controller.Register(dto);
            var result = await controller.Register(dto);

            Assert.IsType<BadRequestObjectResult>(result);
        }

        [Fact]
        public async Task Login_DebeRetornarUnauthorized_CuandoCredencialesInvalidas()
        {
            var db = GetDbContext();
            var config = GetConfiguration();
            var controller = new AuthController(db, config);
            var dto = new LoginDto { Email = "noexiste@test.com", Password = "wrongpass" };

            var result = controller.Login(dto);

            Assert.IsType<UnauthorizedObjectResult>(result);
        }
    }
}