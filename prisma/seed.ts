import { PrismaClient, TipoComercio, EstadoAnuncio } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Seeding database...')

    // Limpiar datos existentes
    await prisma.comercio.deleteMany()

    const comercios = await prisma.comercio.createMany({
        data: [
            {
                nombre: 'Restaurant Arcs',
                tipo_comercio: TipoComercio.RESTAURANTE,
                barrio: 'Part Alta',
                codigo_postal: '43003',
                direccion: 'Carrer dels Cavallers, 6',
                telefono: '977 21 80 40',
                email: 'info@restaurantarcs.com',
                web: 'https://restaurantarcs.com',
                instagram: '@restaurantarcs',
                maps_url: 'https://maps.google.com/?q=Restaurant+Arcs+Tarragona',
                maps_lat: 41.1182,
                maps_lng: 1.2492,
                estado_anuncio: EstadoAnuncio.INTERESA,
                visitado: true,
                notas: [
                    {
                        texto: 'Primera visita. Muy interesados en anunciarse en la guía premium.',
                        fecha: new Date('2026-02-10').toISOString(),
                        autor: 'Maria'
                    },
                    {
                        texto: 'Seguimiento: Esperan presupuesto antes del 1 de marzo.',
                        fecha: new Date('2026-02-18').toISOString(),
                        autor: 'Jordi'
                    }
                ],
            },
            {
                nombre: 'Hotel Lauria',
                tipo_comercio: TipoComercio.HOTEL,
                barrio: 'Eixample',
                codigo_postal: '43005',
                direccion: 'Rambla Nova, 20',
                telefono: '977 23 67 12',
                email: 'reservas@hotellauriatarragona.com',
                web: 'https://hotellauriatarragona.com',
                facebook: 'HotelLauriaTarragona',
                maps_url: 'https://maps.google.com/?q=Hotel+Lauria+Tarragona',
                maps_lat: 41.1172,
                maps_lng: 1.2459,
                estado_anuncio: EstadoAnuncio.SE_ANUNCIA,
                tipo_anuncio: 'Portada + Interior Premium',
                visitado: true,
                notas: [
                    {
                        texto: 'Anunciante recurrente de ediciones anteriores. Confirman renovación.',
                        fecha: new Date('2026-02-05').toISOString(),
                        autor: 'Jordi'
                    }
                ],
            },
            {
                nombre: 'Farmàcia Rambla Nova',
                tipo_comercio: TipoComercio.SALUD_CUIDADO,
                barrio: 'Eixample',
                codigo_postal: '43005',
                direccion: 'Rambla Nova, 47',
                telefono: '977 21 00 55',
                visitado: false,
                estado_anuncio: null,
                notas: [],
            },
        ],
    })

    console.log(`✅ Seed completado: ${comercios.count} comercios creados.`)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
