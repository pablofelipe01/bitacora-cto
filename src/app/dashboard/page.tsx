"use client"; // Indica que este componente es del lado del cliente
import NavBar from '../components/NavBar';

export default function Home() {
  return (
    <div className="min-h-screen bg-cover bg-center bg-no-repeat relative">
      {/* NavBar */}
      <NavBar />

      {/* Contenido principal */}
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-4xl font-bold mb-8 text-center museo-slab" style={{ color: 'FFFFFF' }}>
          Bitacoras Sirius
        </h1>

        {/* Frame Embebido */}
        <iframe
          className="airtable-embed"
          src="https://airtable.com/embed/appzsxZtoqN9mK2ZW/shr84iDrVitD0uhVq"
          frameBorder="0"
          width="100%"
          height="533"
          style={{ background: 'transparent', border: '1px solid #ccc' }}
        ></iframe>
      </div>
    </div>
  );
}
