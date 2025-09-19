/*
  Migra la columna fotoEquipo de VARBINARY(MAX) a NVARCHAR(500) para URL.
  Si la columna ya es NVARCHAR, no hace nada.
  Nota: No hay conversión automática del binario a URL; se preserva NULL.
*/
USE [CRT-informatica];
GO

IF EXISTS (
  SELECT 1
  FROM sys.columns c
  JOIN sys.objects o ON o.object_id = c.object_id AND o.type = 'U' AND o.name = 'Equipo'
  WHERE c.name = 'fotoEquipo' AND c.system_type_id = 165 -- varbinary
)
BEGIN
  -- Eliminar valores binarios (no convertibles a URL) o moverlos a tabla auxiliar si se requiriera.
  -- Para simplicidad, se establecen en NULL antes del cambio de tipo.
  UPDATE dbo.Equipo SET fotoEquipo = NULL;

  ALTER TABLE dbo.Equipo ALTER COLUMN fotoEquipo NVARCHAR(500) NULL;
END
GO