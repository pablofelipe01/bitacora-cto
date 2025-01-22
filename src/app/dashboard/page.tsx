"use client"; // Indica que este componente es del lado del cliente
import NavBar from '../components/NavBar';

export default function Home() {
  return (
    <div className="min-h-screen bg-cover bg-center bg-no-repeat relative">
      {/* NavBar */}
      <NavBar />

      {/* Contenido principal */}
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        {/* Frame Embebido */}
        <div className="w-full max-w-4xl">
          <iframe
            className="airtable-embed"
            src="https://airtable.com/embed/appzsxZtoqN9mK2ZW/shr84iDrVitD0uhVq"
            frameBorder="0"
            style={{
              background: 'transparent',
              border: '1px solid #ccc',
              width: '100%',
              height: '70vh',
            }}
          ></iframe>
        </div>
      </div>
    </div>
  );
}
