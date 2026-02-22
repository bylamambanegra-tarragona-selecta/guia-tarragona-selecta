# Guía de Despliegue en Vercel (Producción)

Esta guía detalla los pasos para desplegar "La Mamba Negra - Guía Tarragona" en Vercel, configurar las variables de entorno, y crear los usuarios del equipo.

## 1. Preparación de Repositorio
Asegúrate de que todo el código esté subido a tu repositorio de GitHub. Los archivos `.env` y `.env.local` ya están excluidos vía `.gitignore`.

## 2. Creación del Proyecto en Vercel
1. Entra a [Vercel](https://vercel.com/) e inicia sesión con GitHub.
2. Haz clic en **Add New...** > **Project**.
3. Selecciona tu repositorio de GitHub y pulsa **Import**.
4. En **Framework Preset**, Vercel debería detectar automáticamente **Next.js**.
5. Deja los **Build and Output Settings** por defecto (Build Command: `npm run build`).

## 3. Configuración de Variables de Entorno (Environment Variables)
Antes de darle a Deploy, debes configurar estas variables en Vercel basándote en tu Supabase de Producción:
* `DATABASE_URL`: (Ej. `postgres://postgres.[tusupabase]:[password]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true`) - Conexión Pgbouncer (Transaction Pooler).
* `DIRECT_URL`: Conexión directa a PostgreSQL puerto 5432 (Sin pgbouncer).
* `NEXT_PUBLIC_SUPABASE_URL`: URL API del Dashboard de Supabase.
* `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Anon Key de Supabase.
* `SUPABASE_SERVICE_ROLE_KEY`: Service Role Key (Por si se requieren acciones administrativas bypass RLS).
* `GOOGLE_PLACES_API_KEY`: API Key de GCP, asegurándote que tiene el servicio "Places API (New)" habilitado.

Haz clic en **Deploy**. El proyecto se empezará a construir.

## 4. Migración de Base de Datos
Dado que Vercel reconstruirá el cliente de Prisma global, pero tu BD en producción de Supabase puede estar vacía, debemos enviar la estructura:
* Al utilizar Supabase y Prisma, lo ideal es que ejecutes manualmente un push a producción localmente indicando las URLs de producción la primera vez.
* Modifica localmente tu `.env` con las variables de producción `.env` y ejecuta: `npx prisma db push`. 
*(Esto aplicará el modelo "Comercio" en la instancia de Supabase remota).*
* Nota: Si vas a usar migraciones de Prisma en cadena (`migrate deploy`), puedes añadir el comando en Vercel: `npx prisma migrate deploy && next build`.

## 5. Accesos: Dar de alta al equipo
Como no se ha implementado página de registro (SignUp) por seguridad:
1. Entra a tu proyecto en el Dashboard de [Supabase](https://supabase.com).
2. Ve al menú **Authentication** > **Users**.
3. Haz clic en **Add User** -> **Create New User**.
4. Introduce el email y una contraseña temporal para cada uno de los 3 comerciales de La Mamba Negra (por ej. `comercial1@lamambanegra.com`, `comercial2@lamambanegra.com`, `admin@lamambanegra.com`).
5. Diles que inicien sesión y prueba a acceder al Panel de Guías Tarragona desplegado.

## 6. Verificación 
Accede a la URL asignada por Vercel (`lamambanegra-guia.vercel.app`), haz login y comprueba desde la App:
1. La búsqueda en Módulo Discover funciona (*revisa que la clave de Google no bloquea peticiones de server de Vercel por IPs o restricciones*).
2. Sube un CSV de prueba.
3. Importa un lugar de Google Maps y comprueba si se renderiza en la Vista Global de Vercel y el listado de "Comercios".
