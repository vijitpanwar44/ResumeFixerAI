using Microsoft.AspNetCore.Mvc;
using ResumeFixerAI.Api.Models;
using ResumeFixerAI.Api.Services;
using System.Threading.Tasks;

namespace ResumeFixerAI.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RewriteController : ControllerBase
{
    private readonly IAiService _ai;

    public RewriteController(IAiService ai)
    {
        _ai = ai;
    }

    [HttpPost]
    public async Task<IActionResult> Post([FromBody] ResumeRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.Text))
            return BadRequest("text is required");

        var res = await _ai.RewriteAsync(req);
        return Ok(res);
    }

    [HttpGet("health")]
    public IActionResult Health() => Ok(new { status = "ok" });
}
