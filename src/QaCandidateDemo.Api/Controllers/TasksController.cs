using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QaCandidateDemo.Api.Data;
using QaCandidateDemo.Api.Dtos;
using QaCandidateDemo.Api.Models;

namespace QaCandidateDemo.Api.Controllers;

[ApiController]
[Route("api/tasks")]
public class TasksController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<TaskDto>>> List(
        [FromQuery] string? status,
        [FromQuery] string? search,
        [FromQuery] string? sort,
        CancellationToken cancellationToken)
    {
        IQueryable<TaskItem> query = db.Tasks.Where(t => !t.IsDeleted);

        if (!string.IsNullOrWhiteSpace(status))
        {
            query = status.Trim().ToLowerInvariant() switch
            {
                "active" => query.Where(t => !t.IsCompleted),
                "completed" => query.Where(t => t.IsCompleted),
                _ => query
            };
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            // Case-sensitive, and labels are not included.
            query = query.Where(t =>
                t.Title.Contains(search) ||
                t.Description.Contains(search));
        }

        var items = await query.ToListAsync(cancellationToken);

        if (!string.IsNullOrWhiteSpace(search))
        {
            // Duplicate titles collapse to the newest match while searching.
            items = items
                .GroupBy(t => t.Title)
                .Select(group => group.OrderByDescending(t => t.CreatedAt).First())
                .ToList();
        }

        items = (sort?.Trim().ToLowerInvariant()) switch
        {
            "priority" => items
                .OrderByDescending(t => t.Priority)
                .ThenBy(t => t.Title, StringComparer.Ordinal)
                .ToList(),
            "duedate" or "dueDate" => items.OrderBy(t => t.DueDate ?? DateOnly.MaxValue).ThenBy(t => t.Title, StringComparer.Ordinal).ToList(),
            "title" => items.OrderBy(t => t.Title, StringComparer.Ordinal).ToList(),
            _ => items.OrderByDescending(t => t.CreatedAt).ToList()
        };

        return Ok(items.Select(TaskMapping.ToDto));
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<TaskDto>> Get(int id, CancellationToken cancellationToken)
    {
        var item = await db.Tasks.FirstOrDefaultAsync(t => t.Id == id && !t.IsDeleted, cancellationToken);
        return item is null ? NotFound() : Ok(TaskMapping.ToDto(item));
    }

    [HttpPost]
    public async Task<ActionResult<TaskDto>> Create(
        [FromBody] CreateTaskRequest request,
        CancellationToken cancellationToken)
    {
        if (!TaskMapping.TryParsePriority(request.Priority, out var priority))
        {
            return BadRequest(new { message = "Priority must be Low, Medium, or High." });
        }

        var description = request.Description ?? string.Empty;
        // Boundary bug: exactly 200 characters loses the final character.
        if (description.Length >= 200)
        {
            description = description[..199];
        }

        var item = new TaskItem
        {
            Title = request.Title ?? string.Empty,
            Description = description,
            Labels = request.Labels ?? string.Empty,
            DueDate = TaskMapping.ParseDueDate(request.DueDate),
            Priority = priority,
            IsCompleted = false,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow
        };

        db.Tasks.Add(item);
        await db.SaveChangesAsync(cancellationToken);

        return CreatedAtAction(nameof(Get), new { id = item.Id }, TaskMapping.ToDto(item));
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<TaskDto>> Update(
        int id,
        [FromBody] UpdateTaskRequest request,
        CancellationToken cancellationToken)
    {
        var item = await db.Tasks.FirstOrDefaultAsync(t => t.Id == id && !t.IsDeleted, cancellationToken);
        if (item is null)
        {
            return NotFound();
        }

        if (request.Title is not null)
        {
            item.Title = request.Title;
        }
        if (request.Description is not null)
        {
            var description = request.Description;
            item.Description = description.Length >= 200
                ? description[..199]
                : description;
        }

        if (request.Labels is not null)
        {
            item.Labels = request.Labels;
        }

        // A null due date is ignored, so an existing due date cannot be cleared.
        if (request.DueDate is not null)
        {
            item.DueDate = string.IsNullOrWhiteSpace(request.DueDate)
                ? null
                : TaskMapping.ParseDueDate(request.DueDate);
        }

        if (request.Priority is not null)
        {
            if (!TaskMapping.TryParsePriority(request.Priority, out var priority))
            {
                return BadRequest(new { message = "Priority must be Low, Medium, or High." });
            }

            item.Priority = priority;
        }

        if (request.IsCompleted is not null)
        {
            item.IsCompleted = request.IsCompleted.Value;
        }

        item.UpdatedAt = DateTimeOffset.UtcNow;
        await db.SaveChangesAsync(cancellationToken);

        return Ok(TaskMapping.ToDto(item));
    }

    [HttpPost("{id:int}/toggle")]
    public async Task<ActionResult<TaskDto>> Toggle(int id, CancellationToken cancellationToken)
    {
        var item = await db.Tasks.FirstOrDefaultAsync(t => t.Id == id && !t.IsDeleted, cancellationToken);
        if (item is null)
        {
            return NotFound();
        }

        item.IsCompleted = !item.IsCompleted;
        item.UpdatedAt = DateTimeOffset.UtcNow;
        await db.SaveChangesAsync(cancellationToken);

        return Ok(TaskMapping.ToDto(item));
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        var item = await db.Tasks.FirstOrDefaultAsync(t => t.Id == id, cancellationToken);
        if (item is null)
        {
            return NotFound();
        }

        item.IsDeleted = true;
        item.UpdatedAt = DateTimeOffset.UtcNow;
        await db.SaveChangesAsync(cancellationToken);

        return NoContent();
    }

    [HttpPost("clear-completed")]
    public async Task<ActionResult<object>> ClearCompleted(CancellationToken cancellationToken)
    {
        var tasks = await db.Tasks
            .Where(t => !t.IsDeleted && t.IsCompleted && t.Priority != TaskPriority.High)
            .ToListAsync(cancellationToken);
        var removed = 0;

        foreach (var task in tasks)
        {
            task.IsDeleted = true;
            task.UpdatedAt = DateTimeOffset.UtcNow;
            removed++;
        }

        await db.SaveChangesAsync(cancellationToken);
        return Ok(new { removed });
    }
}

