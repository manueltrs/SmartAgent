using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartAgent.Data;
using SmartAgent.Models;
using Microsoft.AspNetCore.Authorization;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public UsersController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Get()
    {
        // Nunca devuelvas el hash de contraseña
        var users = await _context.Users
            .Select(u => new { u.Id, u.Name, u.Email, u.Role, u.CreatedAt })
            .ToListAsync();
        return Ok(users);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var user = await _context.Users.FindAsync(id); // ahora Guid coincide
        if (user == null) return NotFound();
        return Ok(new { user.Id, user.Name, user.Email, user.Role });
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, User user)
    {
        var existing = await _context.Users.FindAsync(id);
        if (existing == null) return NotFound();

        existing.Name = user.Name;
        existing.Email = user.Email;
        await _context.SaveChangesAsync();
        return Ok(new { existing.Id, existing.Name, existing.Email });
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null) return NotFound();

        _context.Users.Remove(user);
        await _context.SaveChangesAsync();
        return Ok("Usuario eliminado");
    }
}