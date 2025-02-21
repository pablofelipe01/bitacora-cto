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
            src="https://airtable.com/embed/app7641N3zooVoI5f/shryKEUrAfboTXyoW" 
            frameBorder="0" 
            onWheel={() => {}} // Usa onWheel en lugar de onMouseWheel
            width="100%" 
            height="533" 
            style={{ background: 'transparent', border: '1px solid #ccc' }}
          />
        </div>
      </div>
    </div>
  );
}