using Microsoft.EntityFrameworkCore;
using MyApi.Data; // Adjust the namespace to match your project structure
using MyApi.Models; // Adjust the namespace to match your project structure

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

// Configure CORS policy
builder.Services.AddCors(options =>
{
    options.AddPolicy(name: "MyAllowSpecificOrigins",
                      policy =>
                      {
                          policy.WithOrigins("http://127.0.0.1:5500")
                          .AllowAnyHeader()
                          .AllowAnyMethod();
                      });
});

// Configure SQLite database
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection") ?? "Data Source=MyDatabase.db"));

// Add services to the container.
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Use CORS policy
app.UseCors("MyAllowSpecificOrigins");

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

//app.UseHttpsRedirection();

// CRUD operations for TodoItems
app.MapGet("/todoitems", async (AppDbContext db) =>
    await db.TodoItems.ToListAsync());
    
//read
app.MapGet("/todoitems/{id}", async (int id, AppDbContext db) =>
    await db.TodoItems.FindAsync(id)
        is TodoItem todoItem
            ? Results.Ok(todoItem)
            : Results.NotFound());

//create
app.MapPost("/todoitems", async (TodoItem todoItem, AppDbContext db) =>
{
    db.TodoItems.Add(todoItem);
    await db.SaveChangesAsync();

    return Results.Created($"/todoitems/{todoItem.Id}", todoItem);
});

//update
app.MapPut("/todoitems/{id}", async (int id, TodoItem inputTodoItem, AppDbContext db) =>
{
    var todoItem = await db.TodoItems.FindAsync(id);

    if (todoItem == null) return Results.NotFound();

    todoItem.Name = inputTodoItem.Name;
    todoItem.IsComplete = inputTodoItem.IsComplete; // Make sure this matches your model property

    await db.SaveChangesAsync();

    return Results.NoContent();
});

//delete
app.MapDelete("/todoitems/{id}", async (int id, AppDbContext db) =>
{
    if (await db.TodoItems.FindAsync(id) is TodoItem todoItem)
    {
        db.TodoItems.Remove(todoItem);
        await db.SaveChangesAsync();
        return Results.Ok(todoItem);
    }

    return Results.NotFound();
});

//querying
app.MapGet("/todoitems", async (AppDbContext db, string? name) =>
{
    IQueryable<TodoItem> query = db.TodoItems;

    if (!string.IsNullOrEmpty(name))
    {
        query = query.Where(t => t.Name.Contains(name));
    }

    return await query.ToListAsync();
});

//sorting
app.MapGet("/todoitems", async (AppDbContext db, string? sortBy, string? order) =>
{
    IQueryable<TodoItem> query = db.TodoItems;

    switch (sortBy)
    {
        case "name":
            query = (order == "desc") ? query.OrderByDescending(t => t.Name) : query.OrderBy(t => t.Name);
            break;
        case "isComplete":
            query = (order == "desc") ? query.OrderByDescending(t => t.IsComplete) : query.OrderBy(t => t.IsComplete);
            break;
    }

    return await query.ToListAsync();
});


// Run the application
app.Run();
