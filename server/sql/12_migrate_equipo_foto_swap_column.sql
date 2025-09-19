/*
  Migración alternativa: reemplaza dbo.Equipo.fotoEquipo VARBINARY/IMAGE por NVARCHAR(500)
  Estrategia: agregar columna nueva, eliminar la antigua y renombrar.
  Seguro si existen datos binarios no convertibles.
*/
USE [CRT-informatica];
GO

IF EXISTS (
  SELECT 1
  FROM sys.columns c
  JOIN sys.objects o ON o.object_id = c.object_id AND o.type = 'U' AND o.name = 'Equipo'
  JOIN sys.types   t ON t.user_type_id = c.user_type_id
  WHERE c.name = 'fotoEquipo' AND t.name IN ('varbinary','image')
)
BEGIN
  PRINT 'Agregando columna temporal fotoEquipo_url (NVARCHAR(500))...';
  IF COL_LENGTH('dbo.Equipo','fotoEquipo_url') IS NULL
  BEGIN
    ALTER TABLE dbo.Equipo ADD fotoEquipo_url NVARCHAR(500) NULL;
  END

  -- Opcional: intentar convertir binario a texto (comentado por defecto)
  -- UPDATE dbo.Equipo SET fotoEquipo_url = TRY_CONVERT(NVARCHAR(500), fotoEquipo);

  PRINT 'Eliminando columna binaria fotoEquipo...';
  ALTER TABLE dbo.Equipo DROP COLUMN fotoEquipo;

  PRINT 'Renombrando fotoEquipo_url -> fotoEquipo...';
  EXEC sp_rename 'dbo.Equipo.fotoEquipo_url', 'fotoEquipo', 'COLUMN';
END
ELSE
BEGIN
  PRINT 'No se detectó columna fotoEquipo como VARBINARY/IMAGE; no se realizaron cambios.';
END
GO
