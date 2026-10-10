using QaCandidateDemo.Api.Models;

namespace QaCandidateDemo.Api.Data;

public static class SeedData
{
    public static void Initialize(AppDbContext db)
    {
        if (db.Tasks.Any())
        {
            return;
        }

        var today = DateOnly.FromDateTime(DateTime.Today);

        db.Tasks.AddRange(
            new TaskItem
            {
                Title = "Review pull request",
                Description = "Check the Cypress starter specs",
                Labels = "review, cypress",
                DueDate = today,
                Priority = TaskPriority.High,
                IsCompleted = false
            },
            new TaskItem
            {
                Title = "Update acceptance criteria notes",
                Description = "Capture edge cases from exploratory testing",
                Labels = "docs",
                DueDate = today.AddDays(2),
                Priority = TaskPriority.Medium,
                IsCompleted = false
            },
            new TaskItem
            {
                Title = "Archive old sprint tasks",
                Description = "Completed cleanup from last sprint",
                Labels = "cleanup",
                DueDate = today.AddDays(-1),
                Priority = TaskPriority.Low,
                IsCompleted = true
            },
            new TaskItem
            {
                Title = "Prepare demo data",
                Description = "Seed scenarios for candidates",
                Labels = "demo",
                DueDate = today.AddDays(1),
                Priority = TaskPriority.High,
                IsCompleted = true
            },
            new TaskItem
            {
                Title = "Archive old checklist",
                Description = "Soft-deleted seed row that should never appear",
                DueDate = today.AddDays(-3),
                Priority = TaskPriority.Low,
                IsCompleted = true,
                IsDeleted = true
            });

        db.SaveChanges();
    }
}
