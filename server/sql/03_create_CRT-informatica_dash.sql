/* Crear base de datos con guion en el nombre: [CRT-informatica] */
IF DB_ID(N'CRT-informatica') IS NULL
BEGIN
  CREATE DATABASE [CRT-informatica];
END
GO

USE [CRT-informatica];
GO

/* Crear tabla de ejemplo Users si no existe */
IF OBJECT_ID(N'dbo.Users', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.Users (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(100) NOT NULL,
    Email NVARCHAR(255) NOT NULL UNIQUE
  );
END
GO

/* Seeds */
IF NOT EXISTS (SELECT 1 FROM dbo.Users)
BEGIN
  INSERT INTO dbo.Users (Name, Email)
  VALUES ('Eva', 'eva@example.com'), ('Felipe', 'felipe@example.com');
END
GO
