USE [DogSalonDB]
GO

/* 1. יצירת טבלת משתמשים */
CREATE TABLE [dbo].[Users] (
    [Id] INT IDENTITY(1,1) PRIMARY KEY,
    [Username] NVARCHAR(50) NOT NULL,
    [PasswordHash] NVARCHAR(MAX) NOT NULL,
    [FirstName] NVARCHAR(50) NOT NULL
);
GO

/* 2. יצירת טבלת תורים */
CREATE TABLE [dbo].[Appointments] (
    [Id] INT IDENTITY(1,1) PRIMARY KEY,
    [UserId] INT NOT NULL,
    [DogName] NVARCHAR(100) NOT NULL,
    [DogSize] NVARCHAR(20) NOT NULL,
    [AppointmentDate] DATETIME NOT NULL,
    [Status] NVARCHAR(20) DEFAULT 'Pending',
    [CreatedAt] DATETIME DEFAULT GETDATE(),
    [DurationMinutes] INT NOT NULL,
    [Price] DECIMAL(10,2) NOT NULL,
    [Discount] INT DEFAULT 0,
    CONSTRAINT [FK_Appointments_Users] FOREIGN KEY ([UserId]) REFERENCES [Users]([Id])
);
GO

/* 3. יצירת VIEW לפרטי תורים מלאים (דרישה טכנית חובה) */
CREATE VIEW [dbo].[vw_FullAppointmentDetails] AS
SELECT 
    A.Id, 
    U.FirstName AS CustomerName, 
    A.DogName, 
    A.DogSize, 
    A.AppointmentDate, 
    DATEADD(MINUTE, A.DurationMinutes, A.AppointmentDate) AS EndTime, 
    A.Price, 
    A.Discount, 
    A.Status, 
    A.CreatedAt, 
    A.UserId
FROM [dbo].[Appointments] A
LEFT JOIN [dbo].[Users] U ON A.UserId = U.Id;
GO

/* 4. פרוצדורה לספירת תורים (בשימוש ב-Controller שלך) */
CREATE PROCEDURE [dbo].[GetUserAppointmentCount]
    @UserId INT,
    @Count INT OUTPUT
AS
BEGIN
    SELECT @Count = COUNT(*) FROM Appointments WHERE UserId = @UserId;
END
GO

/* 5. פרוצדורה להוספת תור עם הנחה אוטומטית (דרישה טכנית חובה) */
CREATE PROCEDURE [dbo].[sp_AddAppointmentWithDiscount]
    @UserId INT,
    @DogName NVARCHAR(100),
    @DogSize NVARCHAR(20),
    @AppointmentDate DATETIME
AS
BEGIN
    DECLARE @BasePrice INT, @Duration INT, @PastAppCount INT, @FinalPrice DECIMAL(10,2), @DiscountPercent INT = 0;

    IF @DogSize = N'קטן' BEGIN SET @BasePrice = 100; SET @Duration = 30; END
    ELSE IF @DogSize = N'בינוני' BEGIN SET @BasePrice = 150; SET @Duration = 60; END
    ELSE IF @DogSize = N'גדול' BEGIN SET @BasePrice = 200; SET @Duration = 90; END

    SELECT @PastAppCount = COUNT(*) FROM [dbo].[Appointments] WHERE [UserId] = @UserId;

    IF @PastAppCount >= 3
    BEGIN
        SET @DiscountPercent = 10;
        SET @FinalPrice = @BasePrice * 0.9;
    END
    ELSE SET @FinalPrice = @BasePrice;

    INSERT INTO [dbo].[Appointments] ([UserId], [DogName], [DogSize], [AppointmentDate], [Status], [CreatedAt], [DurationMinutes], [Price], [Discount])
    VALUES (@UserId, @DogName, @DogSize, @AppointmentDate, 'Pending', GETDATE(), @Duration, @FinalPrice, @DiscountPercent);
END
GO

/* 6. פרוצדורה לבדיקת זכאות להנחה */
CREATE PROCEDURE [dbo].[sp_GetUserDiscount]
    @UserId INT,
    @HasDiscount BIT OUTPUT
AS
BEGIN
    DECLARE @AppCount INT;
    SELECT @AppCount = COUNT(*) FROM Appointments WHERE UserId = @UserId AND Status = 'Completed';
    IF @AppCount >= 3 SET @HasDiscount = 1;
    ELSE SET @HasDiscount = 0;
END
GO
