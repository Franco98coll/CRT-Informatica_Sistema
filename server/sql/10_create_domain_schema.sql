/*
  Crea el esquema del dominio segun el modelo:
  Cliente, Equipo, Orden, EstadoOrden, Presupuesto, EstadoPresupuesto, Usuario
  Ejecutar contra la base: [CRT-informatica]
*/
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

IF DB_ID(N'CRT-informatica') IS NULL
BEGIN
  RAISERROR('La base de datos CRT-informatica no existe. Cree la BD antes de ejecutar este script.', 16, 1);
  RETURN;
END
GO

USE [CRT-informatica];
GO

/* Tabla: Cliente */
IF NOT EXISTS (SELECT 1 FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Cliente]') AND type = N'U')
BEGIN
  CREATE TABLE [dbo].[Cliente](
    [idCliente] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    [NombreCliente] NVARCHAR(150) NOT NULL,
    [TelefonoCliente] NVARCHAR(30) NULL,
    [DocumentoCliente] NVARCHAR(30) NULL
  );
END
GO

/* Tabla: Equipo */
IF NOT EXISTS (SELECT 1 FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Equipo]') AND type = N'U')
BEGIN
  CREATE TABLE [dbo].[Equipo](
    [idEquipo] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    [marcaEquipo] NVARCHAR(100) NULL,
    [modeloEquipo] NVARCHAR(100) NULL,
    [numeroDeSerieEquipo] NVARCHAR(100) NULL,
    [fotoEquipo] NVARCHAR(500) NULL,
    [accesoriosEquipo] NVARCHAR(MAX) NULL,
    [idCliente] INT NOT NULL
  );
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'FK_Equipo_Cliente')
BEGIN
  ALTER TABLE [dbo].[Equipo]
  ADD CONSTRAINT [FK_Equipo_Cliente]
  FOREIGN KEY ([idCliente]) REFERENCES [dbo].[Cliente]([idCliente]);
  CREATE INDEX IX_Equipo_idCliente ON [dbo].[Equipo]([idCliente]);
END
GO

/* Tabla: EstadoOrden */
IF NOT EXISTS (SELECT 1 FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[EstadoOrden]') AND type = N'U')
BEGIN
  CREATE TABLE [dbo].[EstadoOrden](
    [idEstadoOrden] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    [nombreEstadoOrden] NVARCHAR(100) NOT NULL
  );
END
GO

/* Tabla: Orden */
IF NOT EXISTS (SELECT 1 FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Orden]') AND type = N'U')
BEGIN
  CREATE TABLE [dbo].[Orden](
    [idOrden] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    [fechaHoraCreadoOrden] DATETIME2(0) NOT NULL CONSTRAINT DF_Orden_creado DEFAULT (SYSUTCDATETIME()),
    [fechaHoraFinalizadoOrden] DATETIME2(0) NULL,
    [fechaHoraEntregadoEquipoOrden] DATETIME2(0) NULL,
    [fallaEquipoOrden] NVARCHAR(MAX) NULL,
    [diagnosticoTecnicoOrden] NVARCHAR(MAX) NULL,
    [diagnosticoAClienteOrden] NVARCHAR(MAX) NULL,
    [idEquipo] INT NOT NULL,
    [idEstadoOrden] INT NOT NULL
  );
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'FK_Orden_Equipo')
BEGIN
  ALTER TABLE [dbo].[Orden]
  ADD CONSTRAINT [FK_Orden_Equipo]
  FOREIGN KEY ([idEquipo]) REFERENCES [dbo].[Equipo]([idEquipo]);
  CREATE INDEX IX_Orden_idEquipo ON [dbo].[Orden]([idEquipo]);
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'FK_Orden_EstadoOrden')
BEGIN
  ALTER TABLE [dbo].[Orden]
  ADD CONSTRAINT [FK_Orden_EstadoOrden]
  FOREIGN KEY ([idEstadoOrden]) REFERENCES [dbo].[EstadoOrden]([idEstadoOrden]);
  CREATE INDEX IX_Orden_idEstadoOrden ON [dbo].[Orden]([idEstadoOrden]);
END
GO

/* Tabla: EstadoPresupuesto */
IF NOT EXISTS (SELECT 1 FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[EstadoPresupuesto]') AND type = N'U')
BEGIN
  CREATE TABLE [dbo].[EstadoPresupuesto](
    [idEstadoPresupuesto] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    [nombreEstadoPresupuesto] NVARCHAR(100) NOT NULL
  );
END
GO

/* Tabla: Presupuesto (1:1 con Orden, PK = idOrden) */
IF NOT EXISTS (SELECT 1 FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Presupuesto]') AND type = N'U')
BEGIN
  CREATE TABLE [dbo].[Presupuesto](
    [idOrden] INT NOT NULL PRIMARY KEY,
    [fechaHoraCreadoPresupuesto] DATETIME2(0) NOT NULL CONSTRAINT DF_Presupuesto_creado DEFAULT (SYSUTCDATETIME()),
    [montoPresupuesto] DECIMAL(18,2) NOT NULL,
    [idEstadoPresupuesto] INT NOT NULL
  );
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'FK_Presupuesto_Orden')
BEGIN
  ALTER TABLE [dbo].[Presupuesto]
  ADD CONSTRAINT [FK_Presupuesto_Orden]
  FOREIGN KEY ([idOrden]) REFERENCES [dbo].[Orden]([idOrden]);
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'FK_Presupuesto_EstadoPresupuesto')
BEGIN
  ALTER TABLE [dbo].[Presupuesto]
  ADD CONSTRAINT [FK_Presupuesto_EstadoPresupuesto]
  FOREIGN KEY ([idEstadoPresupuesto]) REFERENCES [dbo].[EstadoPresupuesto]([idEstadoPresupuesto]);
  CREATE INDEX IX_Presupuesto_idEstadoPresupuesto ON [dbo].[Presupuesto]([idEstadoPresupuesto]);
END
GO

/* Tabla: Usuario */
IF NOT EXISTS (SELECT 1 FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Usuario]') AND type = N'U')
BEGIN
  CREATE TABLE [dbo].[Usuario](
    [idUsuario] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    [nombreUsuario] NVARCHAR(100) NOT NULL,
    [mailUsuario] NVARCHAR(255) NOT NULL,
    [contraseñaUsuario] NVARCHAR(255) NOT NULL,
    [rolUsuario] NVARCHAR(50) NOT NULL CONSTRAINT DF_Usuario_Rol DEFAULT(N'user')
  );
  CREATE UNIQUE INDEX UX_Usuario_mailUsuario ON [dbo].[Usuario]([mailUsuario]);
END
GO

/* Seeds basicos para estados (si no existen) */
IF NOT EXISTS (SELECT 1 FROM [dbo].[EstadoOrden])
BEGIN
  INSERT INTO [dbo].[EstadoOrden] ([nombreEstadoOrden])
  VALUES (N'Creada'),(N'En proceso'),(N'Finalizada'),(N'Entregada');
END
GO

IF NOT EXISTS (SELECT 1 FROM [dbo].[EstadoPresupuesto])
BEGIN
  INSERT INTO [dbo].[EstadoPresupuesto] ([nombreEstadoPresupuesto])
  VALUES (N'Pendiente'),(N'Aprobado'),(N'Rechazado');
END
GO

/* Usuario de ejemplo (si no existe) */
IF NOT EXISTS (SELECT 1 FROM [dbo].[Usuario] WHERE [mailUsuario] = N'admin@example.com')
BEGIN
  INSERT INTO [dbo].[Usuario] ([nombreUsuario],[mailUsuario],[contraseñaUsuario],[rolUsuario])
  VALUES (N'Admin', N'admin@example.com', N'admin', N'admin');
END
GO
