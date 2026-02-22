-- ────────────────────────────────────────────
-- Migración: Crear tabla comercios
-- Compatible con Supabase (PostgreSQL)
-- ────────────────────────────────────────────

-- Enums
CREATE TYPE "TipoComercio" AS ENUM (
  'RESTAURANTE',
  'BAR',
  'HOTEL',
  'TIENDA_REGALOS',
  'SALUD_CUIDADO',
  'REPARACIONES',
  'SERVICIOS',
  'OCIO_DIURNO',
  'OCIO_NOCTURNO',
  'ANUNCIO_ESPECIAL',
  'OTROS'
);

CREATE TYPE "EstadoAnuncio" AS ENUM (
  'SE_ANUNCIA',
  'NO_SE_ANUNCIA',
  'INTERESA',
  'TAL_VEZ'
);

-- Tabla principal
CREATE TABLE "comercios" (
  "id"             TEXT          NOT NULL DEFAULT gen_random_uuid()::text,
  "nombre"         TEXT          NOT NULL,
  "tipo_comercio"  "TipoComercio" NOT NULL,
  "barrio"         TEXT          NOT NULL,
  "codigo_postal"  TEXT          NOT NULL,

  -- Contacto
  "direccion"      TEXT,
  "telefono"       TEXT,
  "email"          TEXT,
  "web"            TEXT,

  -- Redes sociales
  "instagram"      TEXT,
  "facebook"       TEXT,
  "tiktok"         TEXT,

  -- Google Maps / Places
  "maps_url"       TEXT,
  "maps_place_id"  TEXT,
  "maps_lat"       DOUBLE PRECISION,
  "maps_lng"       DOUBLE PRECISION,

  -- Prospección
  "estado_anuncio" "EstadoAnuncio",
  "tipo_anuncio"   TEXT,
  "visitado"       BOOLEAN       NOT NULL DEFAULT false,

  -- Notas (array JSON)
  "notas"          JSONB         NOT NULL DEFAULT '[]',

  -- Metadatos
  "created_at"     TIMESTAMP(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at"     TIMESTAMP(3)  NOT NULL,

  CONSTRAINT "comercios_pkey" PRIMARY KEY ("id")
);

-- Unique constraint para Google Place ID
CREATE UNIQUE INDEX "comercios_maps_place_id_key"
  ON "comercios"("maps_place_id")
  WHERE "maps_place_id" IS NOT NULL;

-- ─────────────────────────────────────────────
-- ÍNDICES para búsquedas y filtros frecuentes
-- ─────────────────────────────────────────────

-- Filtros individuales
CREATE INDEX "comercios_barrio_idx"         ON "comercios"("barrio");
CREATE INDEX "comercios_tipo_comercio_idx"  ON "comercios"("tipo_comercio");
CREATE INDEX "comercios_codigo_postal_idx"  ON "comercios"("codigo_postal");
CREATE INDEX "comercios_visitado_idx"       ON "comercios"("visitado");
CREATE INDEX "comercios_estado_anuncio_idx" ON "comercios"("estado_anuncio");

-- Filtros combinados más frecuentes
CREATE INDEX "comercios_barrio_tipo_idx"    ON "comercios"("barrio", "tipo_comercio");
CREATE INDEX "comercios_barrio_cp_idx"      ON "comercios"("barrio", "codigo_postal");

-- Búsqueda de texto libre en notas via JSONB GIN
CREATE INDEX "comercios_notas_gin_idx"      ON "comercios" USING GIN ("notas");

-- ─────────────────────────────────────────────
-- TRIGGER para actualizar updated_at automáticamente
-- ─────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_comercios_updated_at
  BEFORE UPDATE ON "comercios"
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();
