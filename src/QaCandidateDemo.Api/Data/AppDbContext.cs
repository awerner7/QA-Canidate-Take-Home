using Microsoft.EntityFrameworkCore;
using QaCandidateDemo.Api.Models;

namespace QaCandidateDemo.Api.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<TaskItem> Tasks => Set<TaskItem>();
}
