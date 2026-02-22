# La Mamba Negra - Guía Tarragona (Prospección)

Sistema interno de gestión comercial y prospección para La Mamba Negra en Tarragona.
Construido con Next.js 14, TailwindCSS, Prisma, Supabase y Google Places API.

## Funcionalidades Principales
- **Gestión de Comercios**: CRUD completo, notas cronológicas, insignias de estado.
- **Búsqueda Avanzada**: Combinación de hasta 6 filtros en tiempo real y búsqeda libre de texto.
- **Importación/Exportación Masiva**: Sube archivos CSV/Excel con previsualización, mapeo inteligente y exporta reportes filtrados a Excel.
- **Descubrimiento Inteligente**: Módulo Discover integrado con Google Maps y Google Places API para prospección en tiempo real interactiva (incluye badge de comercio "Ya Registrado").

## Requisitos
- Node.js 18.17+
- Base de datos PostgreSQL (local o externa como Supabase)
- Google Places API Key (v1 habilitada)

## Instalación Local

1. Instala las dependencias:
   ```bash
   npm install
   ```

2. Configura las variables de entorno copiando la plantilla:
   ```bash
   cp .env.example .env.local
   ```
   Rellena el archivo `.env.local` con tus credenciales de Supabase, URL de la BD y la clave de Google Places. El campo `GOOGLE_PLACES_API_KEY` es obligatorio para que funcione el módulo de descubrir. Para la base de datos local y Prisma, asegúrate de crear el archivo `.env` tradicional.

3. Sincroniza la base de datos:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. Ejecuta el servidor de desarrollo:
   ```bash
   npm run dev
   ```

## Estilos y Temática
La plataforma utiliza la temática corporativa **"La Mamba Negra"**, la cual está priorizada por un modo oscuro elegante y estilizado (fondo `#1A1A2E`, acentos `primary` `#E94560`, `accent` `#F5A623`).
