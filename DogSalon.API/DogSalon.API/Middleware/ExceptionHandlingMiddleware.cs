using System.Text.Json;
using DogSalon.API.Exceptions;
using Microsoft.AspNetCore.Mvc;

namespace DogSalon.API.Middleware;

public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task Invoke(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await Handle(context, ex);
        }
    }

    private async Task Handle(HttpContext context, Exception ex)
    {
        var status = StatusCodes.Status500InternalServerError;
        var title = "Server error";
        var detail = "Unexpected error occurred.";

        switch (ex)
        {
            case BadRequestException bre:
                status = StatusCodes.Status400BadRequest;
                title = "Bad request";
                detail = bre.Message;
                break;

            case UnauthorizedAccessException uae:
                status = StatusCodes.Status401Unauthorized;
                title = "Unauthorized";
                detail = uae.Message;
                break;

            case ForbiddenException fe:
                status = StatusCodes.Status403Forbidden;
                title = "Forbidden";
                detail = fe.Message;
                break;

            case NotFoundException nfe:
                status = StatusCodes.Status404NotFound;
                title = "Not found";
                detail = nfe.Message;
                break;

            case InvalidOperationException ioe:
                status = StatusCodes.Status400BadRequest;
                title = "Bad request";
                detail = ioe.Message;
                break;
        }

        if (status >= 500)
            _logger.LogError(ex, "Unhandled exception: {Message}", ex.Message);
        else
            _logger.LogWarning(ex, "Request failed ({Status}): {Message}", status, ex.Message);

        var problem = new ProblemDetails
        {
            Status = status,
            Title = title,
            Detail = detail,
            Instance = context.Request.Path
        };

        context.Response.ContentType = "application/problem+json";
        context.Response.StatusCode = status;

        var json = JsonSerializer.Serialize(problem, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        });

        await context.Response.WriteAsync(json);
    }
}