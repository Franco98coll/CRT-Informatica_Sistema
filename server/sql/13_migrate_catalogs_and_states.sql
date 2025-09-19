/*
  Migración: catálogos de Marca/Accesorio y renombre de estados.
  - Crea tablas: OrdenEstado, PresupuestoEstado, EquipoMarca, EquipoAccesorio
  - Agrega columnas: Equipo.idMarcaEquipo, Equipo.idEquipoAccesorio
  - Agrega columnas: Orden.idCliente, Orden.idOrdenEstado
  - Migra datos desde tablas/columnas existentes
  - Mantiene tablas/columnas viejas sin borrar (compatibilidad)
*/
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

USE [CRT-informatica];
GO

/* Tablas de estados nuevas (si no existen) */
IF NOT EXISTS (SELECT 1 FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[OrdenEstado]') AND type = N'U')
BEGIN
  CREATE TABLE [dbo].[OrdenEstado](
    [idOrdenEstado] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    [nombreEstadoOrden] NVARCHAR(100) NOT NULL
  );
  /* Copiar datos si existen en EstadoOrden */
  IF EXISTS (SELECT 1 FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[EstadoOrden]') AND type = N'U')
  BEGIN
    INSERT INTO [dbo].[OrdenEstado] ([nombreEstadoOrden])
    SELECT eo.nombreEstadoOrden FROM dbo.EstadoOrden eo ORDER BY eo.idEstadoOrden;
  END
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[PresupuestoEstado]') AND type = N'U')
BEGIN
  CREATE TABLE [dbo].[PresupuestoEstado](
    [idPresupuestoEstado] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    [nombreEstadoPresupuesto] NVARCHAR(100) NOT NULL
  );
  IF EXISTS (SELECT 1 FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[EstadoPresupuesto]') AND type = N'U')
  BEGIN
    INSERT INTO [dbo].[PresupuestoEstado] ([nombreEstadoPresupuesto])
    SELECT ep.nombreEstadoPresupuesto FROM dbo.EstadoPresupuesto ep ORDER BY ep.idEstadoPresupuesto;
  END
END
GO

/* Catálogos EquipoMarca y EquipoAccesorio */
IF NOT EXISTS (SELECT 1 FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[EquipoMarca]') AND type = N'U')
BEGIN
  CREATE TABLE [dbo].[EquipoMarca](
    [idEquipoMarca] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    [marcaEquipo] NVARCHAR(100) NOT NULL
  );
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[EquipoAccesorio]') AND type = N'U')
BEGIN
  CREATE TABLE [dbo].[EquipoAccesorio](
    [idEquipoAccesorio] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    [accesorio] NVARCHAR(100) NOT NULL
  );
END
GO

/* Agregar columnas a Equipo */
IF COL_LENGTH('dbo.Equipo', 'idMarcaEquipo') IS NULL
BEGIN
  ALTER TABLE dbo.Equipo ADD idMarcaEquipo INT NULL;
END
GO

IF COL_LENGTH('dbo.Equipo', 'idEquipoAccesorio') IS NULL
BEGIN
  ALTER TABLE dbo.Equipo ADD idEquipoAccesorio INT NULL;
END
GO

/* FK para Equipo */
IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'FK_Equipo_EquipoMarca')
BEGIN
  ALTER TABLE dbo.Equipo ADD CONSTRAINT FK_Equipo_EquipoMarca FOREIGN KEY (idMarcaEquipo) REFERENCES dbo.EquipoMarca(idEquipoMarca);
  CREATE INDEX IX_Equipo_idMarcaEquipo ON dbo.Equipo(idMarcaEquipo);
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'FK_Equipo_EquipoAccesorio')
BEGIN
  ALTER TABLE dbo.Equipo ADD CONSTRAINT FK_Equipo_EquipoAccesorio FOREIGN KEY (idEquipoAccesorio) REFERENCES dbo.EquipoAccesorio(idEquipoAccesorio);
  CREATE INDEX IX_Equipo_idEquipoAccesorio ON dbo.Equipo(idEquipoAccesorio);
END
GO

/* Poblar EquipoMarca desde valores existentes en Equipo.marcaEquipo */
IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('dbo.Equipo') AND name = 'marcaEquipo')
BEGIN
  ;WITH DistinctMarcas AS (
    SELECT DISTINCT LTRIM(RTRIM(marcaEquipo)) AS marca FROM dbo.Equipo WHERE marcaEquipo IS NOT NULL AND LTRIM(RTRIM(marcaEquipo)) <> ''
  )
  INSERT INTO dbo.EquipoMarca (marcaEquipo)
  SELECT dm.marca
  FROM DistinctMarcas dm
  LEFT JOIN dbo.EquipoMarca em ON em.marcaEquipo = dm.marca
  WHERE em.idEquipoMarca IS NULL;

  /* Setear idMarcaEquipo en Equipo */
  UPDATE e SET e.idMarcaEquipo = em.idEquipoMarca
  FROM dbo.Equipo e
  JOIN dbo.EquipoMarca em ON em.marcaEquipo = LTRIM(RTRIM(e.marcaEquipo))
  WHERE e.idMarcaEquipo IS NULL AND e.marcaEquipo IS NOT NULL;
END
GO

/* Poblar EquipoAccesorio desde Equipo.accesoriosEquipo (texto) */
IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('dbo.Equipo') AND name = 'accesoriosEquipo')
BEGIN
  ;WITH DistinctAcc AS (
    SELECT DISTINCT LEFT(LTRIM(RTRIM(accesoriosEquipo)), 100) AS acc
    FROM dbo.Equipo
    WHERE accesoriosEquipo IS NOT NULL AND LTRIM(RTRIM(accesoriosEquipo)) <> ''
  )
  INSERT INTO dbo.EquipoAccesorio (accesorio)
  SELECT da.acc
  FROM DistinctAcc da
  LEFT JOIN dbo.EquipoAccesorio ea ON ea.accesorio = da.acc
  WHERE ea.idEquipoAccesorio IS NULL;

  UPDATE e SET e.idEquipoAccesorio = ea.idEquipoAccesorio
  FROM dbo.Equipo e
  JOIN dbo.EquipoAccesorio ea ON ea.accesorio = LEFT(LTRIM(RTRIM(e.accesoriosEquipo)), 100)
  WHERE e.idEquipoAccesorio IS NULL AND e.accesoriosEquipo IS NOT NULL;
END
GO

/* Agregar idCliente e idOrdenEstado a Orden */
IF COL_LENGTH('dbo.Orden', 'idCliente') IS NULL
BEGIN
  ALTER TABLE dbo.Orden ADD idCliente INT NULL;
END
GO

IF COL_LENGTH('dbo.Orden', 'idOrdenEstado') IS NULL
BEGIN
  ALTER TABLE dbo.Orden ADD idOrdenEstado INT NULL;
END
GO

/* Poblar idCliente desde Equipo */
UPDATE o SET o.idCliente = e.idCliente
FROM dbo.Orden o
JOIN dbo.Equipo e ON e.idEquipo = o.idEquipo
WHERE o.idCliente IS NULL;
GO

/* Poblar idOrdenEstado desde idEstadoOrden si existe */
IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('dbo.Orden') AND name = 'idEstadoOrden')
BEGIN
  UPDATE o SET o.idOrdenEstado = o.idEstadoOrden
  FROM dbo.Orden o
  WHERE o.idOrdenEstado IS NULL;
END
GO

/* FKs para Orden */
IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'FK_Orden_Cliente')
BEGIN
  ALTER TABLE dbo.Orden ADD CONSTRAINT FK_Orden_Cliente FOREIGN KEY (idCliente) REFERENCES dbo.Cliente(idCliente);
  CREATE INDEX IX_Orden_idCliente ON dbo.Orden(idCliente);
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'FK_Orden_OrdenEstado')
BEGIN
  ALTER TABLE dbo.Orden ADD CONSTRAINT FK_Orden_OrdenEstado FOREIGN KEY (idOrdenEstado) REFERENCES dbo.OrdenEstado(idOrdenEstado);
  CREATE INDEX IX_Orden_idOrdenEstado ON dbo.Orden(idOrdenEstado);
END
GO

/* Presupuesto: nueva columna idPresupuestoEstado (si no existe) */
IF COL_LENGTH('dbo.Presupuesto', 'idPresupuestoEstado') IS NULL
BEGIN
  ALTER TABLE dbo.Presupuesto ADD idPresupuestoEstado INT NULL;
END
GO

/* Poblar idPresupuestoEstado desde idEstadoPresupuesto */
IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('dbo.Presupuesto') AND name = 'idEstadoPresupuesto')
BEGIN
  UPDATE p SET p.idPresupuestoEstado = p.idEstadoPresupuesto FROM dbo.Presupuesto p WHERE p.idPresupuestoEstado IS NULL;
END
GO

/* FK Presupuesto -> PresupuestoEstado */
IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'FK_Presupuesto_PresupuestoEstado')
BEGIN
  ALTER TABLE dbo.Presupuesto ADD CONSTRAINT FK_Presupuesto_PresupuestoEstado FOREIGN KEY (idPresupuestoEstado) REFERENCES dbo.PresupuestoEstado(idPresupuestoEstado);
  CREATE INDEX IX_Presupuesto_idPresupuestoEstado ON dbo.Presupuesto(idPresupuestoEstado);
END
GO

/* Opcional: reforzar NOT NULL si todos los datos están poblados */
/*
ALTER TABLE dbo.Orden ALTER COLUMN idCliente INT NOT NULL;
ALTER TABLE dbo.Orden ALTER COLUMN idOrdenEstado INT NOT NULL;
ALTER TABLE dbo.Presupuesto ALTER COLUMN idPresupuestoEstado INT NOT NULL;
*/
