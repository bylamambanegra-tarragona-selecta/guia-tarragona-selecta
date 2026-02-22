import { redirect } from 'next/navigation'

export default function Home() {
  // Redirigir la raíz a la gestión de comercios (que a su vez verificará sesión y enviará a /login si no hay)
  redirect('/comercios')
}
