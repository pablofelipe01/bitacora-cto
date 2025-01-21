"use client"; // Indica que este componente es del lado del cliente
import NavBar from './components/NavBar';

export default function Home() {

  return (
    <div className="min-h-screen bg-cover bg-center bg-no-repeat relative">
      {/* NavBar */}
      <NavBar />

      {/* Contenido principal */}
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-4xl font-bold mb-8 text-center museo-slab" style={{ color: 'FFFFFF' }}>
          Bitacoras CTO
        </h1>
      </div>
    </div>
  );
}
