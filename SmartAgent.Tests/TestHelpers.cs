using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace SmartAgent.Tests
{
    public static class TestHelpers
    {
        public static ControllerContext CrearContexto(Guid userId)
        {
            return CrearContextoConRol(userId, "User");
        }

        public static ControllerContext CrearContextoConRol(Guid userId, string role)
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
                new Claim(ClaimTypes.Role, role)
            };
            var identity = new ClaimsIdentity(claims, "Test");
            var principal = new ClaimsPrincipal(identity);
            return new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = principal }
            };
        }
    }
}