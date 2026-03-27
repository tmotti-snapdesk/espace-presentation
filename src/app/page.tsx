import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-luxury-cream flex items-center justify-center">
      <div className="text-center max-w-2xl mx-auto px-6">
        <p className="luxury-label mb-6">Snapdesk</p>
        <h1 className="luxury-heading text-luxury-charcoal mb-6">
          Générateur de<br />
          <span className="text-luxury-gold italic">Mini-Sites</span>
        </h1>
        <p className="text-luxury-slate text-lg mb-12 font-light leading-relaxed">
          Créez en quelques clics une présentation élégante pour vos espaces de bureaux.
        </p>
        <Link href="/admin" className="luxury-btn">
          Créer un espace
        </Link>
      </div>
    </main>
  );
}
