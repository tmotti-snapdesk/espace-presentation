"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BlobAsset } from "@/app/api/assets/route";

interface AssetPickerProps {
  open: boolean;
  kind: "image" | "video";
  onSelect: (asset: BlobAsset) => void;
  onClose: () => void;
}

export default function AssetPicker({ open, kind, onSelect, onClose }: AssetPickerProps) {
  const [assets, setAssets] = useState<BlobAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setError(null);
    fetch(`/api/assets?kind=${kind}`)
      .then((r) => r.json())
      .then((data) => setAssets(data.assets || []))
      .catch(() => setError("Impossible de charger les fichiers."))
      .finally(() => setLoading(false));
  }, [open, kind]);

  const filtered = assets.filter((a) =>
    query ? a.pathname.toLowerCase().includes(query.toLowerCase()) : true
  );

  const formatSize = (n: number) => {
    if (n < 1024) return `${n} B`;
    if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
    return `${(n / 1024 / 1024).toFixed(1)} MB`;
  };

  const label = kind === "image" ? "image" : "vidéo";

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white w-full max-w-4xl max-h-[85vh] flex flex-col relative"
              initial={{ opacity: 0, y: 30, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              transition={{ duration: 0.25 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="border-b border-primary-100 px-8 py-6 flex items-center justify-between">
                <div>
                  <p className="luxury-label mb-1">Bibliothèque</p>
                  <h3 className="font-serif text-xl text-luxury-charcoal">
                    Choisir une {label}
                  </h3>
                </div>
                <button
                  onClick={onClose}
                  className="text-luxury-slate hover:text-luxury-charcoal transition-colors text-2xl leading-none"
                  aria-label="Fermer"
                >
                  ×
                </button>
              </div>

              {/* Search */}
              <div className="px-8 py-4 border-b border-primary-100">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Rechercher par nom de fichier..."
                  className="w-full px-4 py-2 border border-primary-200 focus:outline-none focus:border-luxury-gold transition-colors text-sm"
                />
              </div>

              {/* Grid */}
              <div className="flex-1 overflow-y-auto px-8 py-6">
                {loading ? (
                  <p className="text-center py-16 text-luxury-slate">Chargement...</p>
                ) : error ? (
                  <p className="text-center py-16 text-red-500 text-sm">{error}</p>
                ) : filtered.length === 0 ? (
                  <p className="text-center py-16 text-luxury-slate text-sm">
                    {query
                      ? "Aucun fichier ne correspond à la recherche."
                      : `Aucune ${label} disponible. Uploadez un fichier pour commencer.`}
                  </p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {filtered.map((asset) => (
                      <button
                        key={asset.url}
                        type="button"
                        onClick={() => onSelect(asset)}
                        className="group text-left border border-primary-100 bg-white hover:border-luxury-gold transition-colors overflow-hidden"
                      >
                        <div className="aspect-square bg-primary-50 relative overflow-hidden">
                          {kind === "image" ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={asset.url}
                              alt={asset.pathname}
                              className="absolute inset-0 w-full h-full object-contain p-3"
                            />
                          ) : (
                            <video
                              src={asset.url}
                              className="absolute inset-0 w-full h-full object-cover"
                              muted
                              playsInline
                              preload="metadata"
                            />
                          )}
                        </div>
                        <div className="px-3 py-2 border-t border-primary-100">
                          <p className="text-xs text-luxury-charcoal truncate">
                            {asset.pathname.split("/").pop()}
                          </p>
                          <p className="text-[10px] text-luxury-slate/70 mt-0.5">
                            {formatSize(asset.size)} · {new Date(asset.uploadedAt).toLocaleDateString("fr-FR")}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
