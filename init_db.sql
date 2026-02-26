USE [master];
GO

IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'DogSalonDB')
BEGIN
    CREATE DATABASE [DogSalonDB];
END
GO

USE [DogSalonDB];
GO

-- Users Table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Users]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[Users] (
        [Id] INT IDENTITY(1,1) PRIMARY KEY,
        [Username] NVARCHAR(100) NOT NULL UNIQUE,
        [PasswordHash] NVARCHAR(MAX) NOT NULL,
        [FirstName] NVARCHAR(100) NOT NULL,
        [IsAdmin] BIT NOT NULL DEFAULT 0
    );
END
GO

-- Appointments Table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Appointments]') AND type in (N'U'))
BEGIN
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
END
GO

-- Performance Indexes
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Appointments_Date')
    CREATE INDEX IX_Appointments_Date ON [dbo].[Appointments] ([AppointmentDate]);
GO

-- View: Full Appointment Details
IF EXISTS (SELECT * FROM sys.views WHERE object_id = OBJECT_ID(N'[dbo].[vw_FullAppointmentDetails]'))
    DROP VIEW [dbo].[vw_FullAppointmentDetails];
GO

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

-- Procedure: Get Appointment Count
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[GetUserAppointmentCount]') AND type in (N'P'))
    DROP PROCEDURE [dbo].[GetUserAppointmentCount];
GO

CREATE PROCEDURE [dbo].[GetUserAppointmentCount]
    @UserId INT,
    @Count INT OUTPUT
AS
BEGIN
    SELECT @Count = COUNT(*) FROM Appointments WHERE UserId = @UserId;
END
GO

-- Procedure: Add Appointment with Discount
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[sp_AddAppointmentWithDiscount]') AND type in (N'P'))
    DROP PROCEDURE [dbo].[sp_AddAppointmentWithDiscount];
GO

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
