namespace DogSalon.API.Middleware;

public static class MiddlewareExtensions
{
    public static IApplicationBuilder UseApiExceptionHandling(this IApplicationBuilder app)
    {
        return app.UseMiddleware<ExceptionHandlingMiddleware>();
    }
}