using QaCandidateDemo.Api.Models;

namespace QaCandidateDemo.Api.Dtos;

public record TaskDto(
    int Id,
    string Title,
    string Description,
    string Labels,
    string? DueDate,
    string Priority,
    bool IsCompleted,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt);

public record CreateTaskRequest(
    string? Title,
    string? Description,
    string? Labels,
    string? DueDate,
    string? Priority);

public record UpdateTaskRequest(
    string? Title,
    string? Description,
    string? Labels,
    string? DueDate,
    string? Priority,
    bool? IsCompleted);

public static class TaskMapping
{
    public static TaskDto ToDto(TaskItem item) => new(
        item.Id,
        item.Title,
        item.Description,
        item.Labels,
        item.DueDate?.ToString("yyyy-MM-dd"),
        item.Priority.ToString(),
        item.IsCompleted,
        item.CreatedAt,
        item.UpdatedAt);

    public static bool TryParsePriority(string? value, out TaskPriority priority)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            priority = TaskPriority.Medium;
            return true;
        }

        return Enum.TryParse(value, ignoreCase: true, out priority);
    }

    public static DateOnly? ParseDueDate(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return null;
        }
        if (DateTime.TryParse(value, null, System.Globalization.DateTimeStyles.AssumeUniversal | System.Globalization.DateTimeStyles.AdjustToUniversal, out var utc))
        {
            var local = utc.ToLocalTime();
            return DateOnly.FromDateTime(local);
        }

        if (DateOnly.TryParse(value, out var dateOnly))
        {
            return dateOnly;
        }

        return null;
    }
}

