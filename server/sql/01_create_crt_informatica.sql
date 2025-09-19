/* Crear base de datos CRT_informatica (nombre sin espacios para evitar problemas) */
IF DB_ID(N'CRT_informatica') IS NULL
BEGIN
  CREATE DATABASE [CRT_informatica];
END
GO

USE [CRT_informatica];
GO

/* Crear esquema opcional */
IF NOT EXISTS (SELECT 1 FROM sys.schemas WHERE name = 'dbo')
BEGIN
    EXEC('CREATE SCHEMA dbo');
END
GO

/* Crear tabla de ejemplo Users */
IF OBJECT_ID(N'dbo.Users', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.Users (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(100) NOT NULL,
    Email NVARCHAR(255) NOT NULL UNIQUE
  );
END
GO

/* Datos seed */
IF NOT EXISTS (SELECT 1 FROM dbo.Users)
BEGIN
  INSERT INTO dbo.Users (Name, Email)
  VALUES ('Alice', 'alice@example.com'), ('Bob', 'bob@example.com');
END
GO
