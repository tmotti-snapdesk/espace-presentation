"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { RapportPdf } from "@/types/rapport";

/**
 * pdf.js est chargé à la demande depuis cdnjs (build UMD) plutôt que
 * bundlé : il n'est utile que sur les rapports qui ont un PDF.
 */
const PDFJS_VERSION = "3.11.174";
const PDFJS_SRC = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}/pdf.min.js`;
const PDFJS_WORKER = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}/pdf.worker.min.js`;

interface PdfJsPage {
  getViewport(opts: { scale: number }): { width: number; height: number };
  render(opts: {
    canvasContext: CanvasRenderingContext2D;
    viewport: { width: number; height: number };
  }): { promise: Promise<void> };
}
interface PdfJsDocument {
  numPages: number;
  getPage(n: number): Promise<PdfJsPage>;
}
interface PdfJsLib {
  GlobalWorkerOptions: { workerSrc: string };
  getDocument(src: string): { promise: Promise<PdfJsDocument> };
}

let pdfjsPromise: Promise<PdfJsLib> | null = null;

function loadPdfJs(): Promise<PdfJsLib> {
  const w = window as unknown as { pdfjsLib?: PdfJsLib };
  if (w.pdfjsLib) return Promise.resolve(w.pdfjsLib);
  if (pdfjsPromise) return pdfjsPromise;
  pdfjsPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = PDFJS_SRC;
    script.async = true;
    script.onload = () => {
      if (!w.pdfjsLib) return reject(new Error("pdf.js indisponible"));
      w.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER;
      resolve(w.pdfjsLib);
    };
    script.onerror = () => {
      pdfjsPromise = null;
      reject(new Error("pdf.js indisponible"));
    };
    document.head.appendChild(script);
  });
  return pdfjsPromise;
}

/** Rend chaque page du PDF en image (data URL), à une résolution nette. */
async function renderPdfPages(url: string): Promise<string[]> {
  const pdfjs = await loadPdfJs();
  const doc = await pdfjs.getDocument(url).promise;
  const images: string[] = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const base = page.getViewport({ scale: 1 });
    const scale = Math.min(3, 2000 / base.width);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(viewport.width);
    canvas.height = Math.round(viewport.height);
    const ctx = canvas.getContext("2d");
    if (!ctx) continue;
    await page.render({ canvasContext: ctx, viewport }).promise;
    images.push(canvas.toDataURL("image/jpeg", 0.9));
  }
  return images;
}

interface RapportMarketStateProps {
  espaceName: string;
  pdf: RapportPdf | null;
}

export default function RapportMarketState({ espaceName, pdf }: RapportMarketStateProps) {
  return (
    <section id="etude-marche" className="section-padding bg-white scroll-mt-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <p className="luxury-label mb-4">Analyse</p>
          <h2 className="luxury-subheading text-luxury-charcoal mb-4">État du marché</h2>
          <div className="luxury-divider" />
        </motion.div>

        {pdf ? <PdfSlides pdf={pdf} /> : <Placeholder espaceName={espaceName} />}
      </div>
    </section>
  );
}

function Placeholder({ espaceName }: { espaceName: string }) {
  return (
    <div className="aspect-[16/9] w-full border border-dashed border-luxury-gold rounded-lg bg-luxury-cream flex flex-col items-center justify-center text-center gap-4 px-6">
      <p className="luxury-label">Étude de marché</p>
      <p className="font-serif text-2xl md:text-4xl text-luxury-charcoal">
        Étude de marché — <span className="italic text-luxury-gold">{espaceName}</span>
      </p>
      <p className="text-sm text-luxury-slate">
        En cours de préparation par votre chargé d&apos;affaires.
      </p>
    </div>
  );
}

function PdfSlides({ pdf }: { pdf: RapportPdf }) {
  const [pages, setPages] = useState<string[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [index, setIndex] = useState(0);
  const viewerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    setPages(null);
    setFailed(false);
    setIndex(0);
    renderPdfPages(pdf.url)
      .then((imgs) => {
        if (cancelled) return;
        if (imgs.length === 0) setFailed(true);
        else setPages(imgs);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [pdf.url]);

  const count = pages?.length || 0;
  const go = useCallback(
    (delta: number) => setIndex((i) => (count ? (i + delta + count) % count : 0)),
    [count]
  );

  const toggleFullscreen = () => {
    const el = viewerRef.current;
    if (!el) return;
    if (document.fullscreenElement) document.exitFullscreen?.();
    else el.requestFullscreen?.();
  };

  const downloadBtn = (
    <a
      href={pdf.url}
      target="_blank"
      rel="noopener noreferrer"
      download={pdf.name}
      className="px-4 py-2 text-sm rounded-full bg-luxury-charcoal text-white hover:bg-black transition-colors"
    >
      Télécharger l&apos;étude (PDF)
    </a>
  );

  // Repli : si pdf.js n'a pas pu lire le fichier, on laisse le navigateur l'afficher.
  if (failed) {
    return (
      <div className="border border-primary-200 rounded-lg overflow-hidden bg-white">
        <object data={pdf.url} type="application/pdf" className="w-full aspect-[16/10]">
          <div className="aspect-[16/9] flex items-center justify-center bg-luxury-cream text-sm text-luxury-slate">
            Aperçu indisponible sur cet appareil.
          </div>
        </object>
        <div className="no-print flex justify-end px-5 py-3 border-t border-primary-100">{downloadBtn}</div>
      </div>
    );
  }

  return (
    <div>
      <div
        ref={viewerRef}
        className="border border-primary-200 rounded-lg overflow-hidden bg-white shadow-[0_10px_30px_rgba(44,44,44,0.06)] flex flex-col [&:fullscreen]:bg-black [&:fullscreen]:justify-center"
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") go(1);
          if (e.key === "ArrowLeft") go(-1);
        }}
        tabIndex={0}
      >
        {pages ? (
          <>
            {/* Écran : une slide à la fois */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={pages[index]}
              alt={`Étude de marché — slide ${index + 1} sur ${count}`}
              className="print:hidden w-full h-auto max-h-[85vh] object-contain bg-luxury-cream"
            />
            {/* Impression : toutes les slides à la suite */}
            <div className="hidden print:block">
              {pages.map((src, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={i} src={src} alt={`Slide ${i + 1}`} className="w-full h-auto mb-4" />
              ))}
            </div>
          </>
        ) : (
          <div className="aspect-[16/9] w-full bg-luxury-cream animate-pulse flex items-center justify-center text-sm text-luxury-slate">
            Chargement de l&apos;étude…
          </div>
        )}

        <div className="no-print flex flex-wrap items-center justify-between gap-3 px-4 md:px-5 py-3 border-t border-primary-100 bg-white">
          <div className="flex gap-2">
            <NavButton label="Slide précédente" onClick={() => go(-1)} disabled={count < 2}>
              ‹
            </NavButton>
            <NavButton label="Slide suivante" onClick={() => go(1)} disabled={count < 2}>
              ›
            </NavButton>
          </div>
          {count > 1 && (
            <div className="flex items-center gap-2">
              {pages!.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Aller à la slide ${i + 1}`}
                  onClick={() => setIndex(i)}
                  className={`h-2 rounded-full transition-all ${
                    i === index ? "w-6 bg-luxury-gold" : "w-2 bg-primary-200"
                  }`}
                />
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={toggleFullscreen}
              className="hidden md:inline-block px-4 py-2 text-sm rounded-full border border-luxury-charcoal text-luxury-charcoal hover:bg-luxury-cream transition-colors"
            >
              Plein écran
            </button>
            {downloadBtn}
          </div>
        </div>
      </div>

      {pages && count > 1 && (
        <div className="no-print grid grid-cols-3 md:grid-cols-6 gap-3 mt-4">
          {pages.map((src, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIndex(i)}
              className={`rounded-md overflow-hidden border-2 transition-colors ${
                i === index ? "border-luxury-gold" : "border-transparent hover:border-primary-200"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={`Miniature slide ${i + 1}`} className="w-full h-auto block" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function NavButton({
  children,
  label,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className="w-9 h-9 rounded-full border border-primary-200 text-luxury-charcoal text-lg leading-none flex items-center justify-center hover:border-luxury-gold disabled:opacity-30 transition-colors"
    >
      {children}
    </button>
  );
}
