namespace DogSalon.API.Exceptions;

// 400
public class BadRequestException : Exception
{
    public BadRequestException(string message) : base(message) { }
}

// 404
public class NotFoundException : Exception
{
    public NotFoundException(string message) : base(message) { }
}

// 403
public class ForbiddenException : Exception
{
    public ForbiddenException(string message = "Forbidden") : base(message) { }
}