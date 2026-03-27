"use client";

import { useState, useEffect } from "react";
import { upload } from "@vercel/blob/client";
import FileDropzone from "@/components/admin/FileDropzone";
import { MetroStation, EspaceFormData, EspaceData } from "@/types/espace";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

interface EspaceFormProps {
  mode: "create" | "edit";
  initialData?: EspaceData;
}

export default function EspaceForm({ mode, initialData }: EspaceFormProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Files state
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [videoFile, setVideoFile] = useState<File[]>([]);
  const [floorPlanFile, setFloorPlanFile] = useState<File[]>([]);
  const [floorPlanPreview, setFloorPlanPreview] = useState<string[]>([]);

  // Existing media URLs (edit mode)
  const [existingPhotos, setExistingPhotos] = useState<string[]>(initialData?.photos || []);
  const [existingVideo, setExistingVideo] = useState<string>(initialData?.videoUrl || "");
  const [existingFloorPlan, setExistingFloorPlan] = useState<string>(initialData?.floorPlanImage || "");

  // Form state
  const [form, setForm] = useState<EspaceFormData>(() => {
    if (initialData) {
      return {
        name: initialData.name,
        tagline: initialData.tagline,
        address: initialData.address,
        city: initialData.city,
        postalCode: initialData.postalCode,
        workstations: String(initialData.workstations),
        openSpaces: String(initialData.openSpaces),
        meetingRooms: String(initialData.meetingRooms),
        hasLunchArea: initialData.hasLunchArea,
        hasEquippedKitchen: initialData.hasEquippedKitchen,
        hasBalconFilant: initialData.hasBalconFilant || false,
        hasTerrace: initialData.hasTerrace || false,
        hasAirConditioning: initialData.hasAirConditioning || false,
        hasBikeRack: initialData.hasBikeRack || false,
        amenities: initialData.amenities.join(", "),
        metroStations: initialData.metroStations.length > 0
          ? initialData.metroStations
          : [{ name: "", lines: "", distance: "" }],
        availability: initialData.availability,
        pricePerMonth: initialData.pricePerMonth,
        leaseDuration: initialData.leaseDuration,
        noticePeriod: initialData.noticePeriod,
      };
    }
    return {
      name: "",
      tagline: "",
      address: "",
      city: "",
      postalCode: "",
      workstations: "",
      openSpaces: "",
      meetingRooms: "",
      hasLunchArea: false,
      hasEquippedKitchen: false,
      hasBalconFilant: false,
      hasTerrace: false,
      hasAirConditioning: false,
      hasBikeRack: false,
      amenities: "",
      metroStations: [{ name: "", lines: "", distance: "" }],
      availability: "",
      pricePerMonth: "",
      leaseDuration: "",
      noticePeriod: "",
    };
  });

  // Generate previews for photos
  useEffect(() => {
    const urls = photoFiles.map((f) => URL.createObjectURL(f));
    setPhotoPreviews(urls);
    return () => urls.forEach(URL.revokeObjectURL);
  }, [photoFiles]);

  useEffect(() => {
    const urls = floorPlanFile
      .filter((f) => f.type.startsWith("image/"))
      .map((f) => URL.createObjectURL(f));
    setFloorPlanPreview(urls);
    return () => urls.forEach(URL.revokeObjectURL);
  }, [floorPlanFile]);

  const updateForm = (field: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const addMetroStation = () => {
    setForm((prev) => ({
      ...prev,
      metroStations: [...prev.metroStations, { name: "", lines: "", distance: "" }],
    }));
  };

  const updateMetroStation = (index: number, field: keyof MetroStation, value: string) => {
    setForm((prev) => {
      const stations = [...prev.metroStations];
      stations[index] = { ...stations[index], [field]: value };
      return { ...prev, metroStations: stations };
    });
  };

  const removeMetroStation = (index: number) => {
    setForm((prev) => ({
      ...prev,
      metroStations: prev.metroStations.filter((_, i) => i !== index),
    }));
  };

  const uploadFiles = async (files: File[], slug: string, type: string): Promise<string[]> => {
    if (files.length === 0) return [];

    const allPaths: string[] = [];

    for (const file of files) {
      const sanitizedName = file.name
        .replace(/[^a-zA-Z0-9._-]/g, "_")
        .toLowerCase();
      const pathname = `espaces/${slug}/${type}-${Date.now()}-${sanitizedName}`;

      const blob = await upload(pathname, file, {
        access: "public",
        handleUploadUrl: "/api/upload",
      });

      allPaths.push(blob.url);
    }

    return allPaths;
  };

  const removeExistingPhoto = (index: number) => {
    setExistingPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setError(null);
    setGeneratedUrl(null);

    try {
      const slug = mode === "edit" && initialData
        ? initialData.slug
        : slugify(form.name);

      // Upload new files
      const [newPhotoPaths, newVideoPaths, newFloorPlanPaths] = await Promise.all([
        uploadFiles(photoFiles, slug, "photos"),
        uploadFiles(videoFile, slug, "video"),
        uploadFiles(floorPlanFile, slug, "floorplan"),
      ]);

      // Merge existing + new photos
      const allPhotos = [...existingPhotos, ...newPhotoPaths];
      const finalVideo = newVideoPaths[0] || existingVideo;
      const finalFloorPlan = newFloorPlanPaths[0] || existingFloorPlan;

      // Generate or update the site
      const endpoint = mode === "edit" ? `/api/espaces/${slug}` : "/api/generate";
      const method = mode === "edit" ? "PUT" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          photos: allPhotos,
          videoUrl: finalVideo,
          floorPlanImage: finalFloorPlan,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Une erreur est survenue");
      setGeneratedUrl(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setIsGenerating(false);
    }
  };

  const title = mode === "edit" ? `Modifier : ${initialData?.name}` : "Créer un mini-site";
  const submitLabel = mode === "edit"
    ? (isGenerating ? "Mise à jour en cours..." : "Mettre à jour le mini-site")
    : (isGenerating ? "Génération en cours..." : "Générer le mini-site");

  return (
    <main className="min-h-screen bg-luxury-cream">
      {/* Header */}
      <div className="bg-luxury-charcoal text-white py-8 px-6 md:px-12">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <p className="luxury-label text-luxury-gold mb-1">Snapdesk</p>
            <h1 className="font-serif text-2xl">{title}</h1>
          </div>
          <a href="/admin" className="text-sm text-white/60 hover:text-white transition-colors">
            &larr; Dashboard
          </a>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-5xl mx-auto py-12 px-6 md:px-12">
        {/* Success message */}
        {generatedUrl && (
          <div className="mb-8 p-6 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 font-medium mb-2">
              {mode === "edit" ? "Mini-site mis à jour !" : "Mini-site créé avec succès !"}
            </p>
            <a
              href={generatedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-600 underline hover:text-green-800"
            >
              Voir le mini-site &rarr;
            </a>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="mb-8 p-6 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Section 1: Informations générales */}
        <section className="mb-12">
          <h2 className="font-serif text-2xl text-luxury-charcoal mb-6 pb-3 border-b border-primary-200">
            Informations générales
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-luxury-charcoal mb-2">
                Nom de l&apos;espace *
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => updateForm("name", e.target.value)}
                disabled={mode === "edit"}
                className="w-full px-4 py-3 border border-primary-200 rounded-lg focus:outline-none focus:border-luxury-gold transition-colors disabled:bg-primary-50 disabled:text-luxury-slate"
                placeholder="ex: Le Marais Premium"
              />
              {form.name && mode === "create" && (
                <p className="text-xs text-luxury-slate mt-1">
                  Slug : {slugify(form.name)}
                </p>
              )}
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-luxury-charcoal mb-2">
                Description de l&apos;espace
              </label>
              <textarea
                value={form.tagline}
                onChange={(e) => updateForm("tagline", e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-primary-200 rounded-lg focus:outline-none focus:border-luxury-gold transition-colors resize-vertical"
                placeholder="Décrivez l'espace en quelques lignes. Vous pouvez utiliser plusieurs paragraphes."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-luxury-charcoal mb-2">
                Nombre de postes *
              </label>
              <input
                type="number"
                required
                value={form.workstations}
                onChange={(e) => updateForm("workstations", e.target.value)}
                className="w-full px-4 py-3 border border-primary-200 rounded-lg focus:outline-none focus:border-luxury-gold transition-colors"
                placeholder="ex: 50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-luxury-charcoal mb-2">
                Open Spaces
              </label>
              <input
                type="number"
                value={form.openSpaces}
                onChange={(e) => updateForm("openSpaces", e.target.value)}
                className="w-full px-4 py-3 border border-primary-200 rounded-lg focus:outline-none focus:border-luxury-gold transition-colors"
                placeholder="ex: 2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-luxury-charcoal mb-2">
                Salles de réunion
              </label>
              <input
                type="number"
                value={form.meetingRooms}
                onChange={(e) => updateForm("meetingRooms", e.target.value)}
                className="w-full px-4 py-3 border border-primary-200 rounded-lg focus:outline-none focus:border-luxury-gold transition-colors"
                placeholder="ex: 3"
              />
            </div>
            <div className="md:col-span-2 flex flex-wrap items-center gap-x-8 gap-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.hasLunchArea}
                  onChange={(e) => updateForm("hasLunchArea", e.target.checked)}
                  className="w-5 h-5 accent-luxury-gold"
                />
                <span className="text-sm text-luxury-charcoal">Espace déjeuner</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.hasEquippedKitchen}
                  onChange={(e) => updateForm("hasEquippedKitchen", e.target.checked)}
                  className="w-5 h-5 accent-luxury-gold"
                />
                <span className="text-sm text-luxury-charcoal">Cuisine équipée</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.hasBalconFilant}
                  onChange={(e) => updateForm("hasBalconFilant", e.target.checked)}
                  className="w-5 h-5 accent-luxury-gold"
                />
                <span className="text-sm text-luxury-charcoal">Balcon filant</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.hasTerrace}
                  onChange={(e) => updateForm("hasTerrace", e.target.checked)}
                  className="w-5 h-5 accent-luxury-gold"
                />
                <span className="text-sm text-luxury-charcoal">Terrasse</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.hasAirConditioning}
                  onChange={(e) => updateForm("hasAirConditioning", e.target.checked)}
                  className="w-5 h-5 accent-luxury-gold"
                />
                <span className="text-sm text-luxury-charcoal">Climatisation</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.hasBikeRack}
                  onChange={(e) => updateForm("hasBikeRack", e.target.checked)}
                  className="w-5 h-5 accent-luxury-gold"
                />
                <span className="text-sm text-luxury-charcoal">Rack à vélos</span>
              </label>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-luxury-charcoal mb-2">
                Autres équipements (séparés par des virgules)
              </label>
              <input
                type="text"
                value={form.amenities}
                onChange={(e) => updateForm("amenities", e.target.value)}
                className="w-full px-4 py-3 border border-primary-200 rounded-lg focus:outline-none focus:border-luxury-gold transition-colors"
                placeholder="ex: Fibre optique, Accès 24/7, Douche"
              />
            </div>
          </div>
        </section>

        {/* Section 2: Localisation */}
        <section className="mb-12">
          <h2 className="font-serif text-2xl text-luxury-charcoal mb-6 pb-3 border-b border-primary-200">
            Localisation
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-luxury-charcoal mb-2">
                Adresse *
              </label>
              <input
                type="text"
                required
                value={form.address}
                onChange={(e) => updateForm("address", e.target.value)}
                className="w-full px-4 py-3 border border-primary-200 rounded-lg focus:outline-none focus:border-luxury-gold transition-colors"
                placeholder="ex: 42 rue de Rivoli"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-luxury-charcoal mb-2">
                Ville *
              </label>
              <input
                type="text"
                required
                value={form.city}
                onChange={(e) => updateForm("city", e.target.value)}
                className="w-full px-4 py-3 border border-primary-200 rounded-lg focus:outline-none focus:border-luxury-gold transition-colors"
                placeholder="ex: Paris"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-luxury-charcoal mb-2">
                Code postal *
              </label>
              <input
                type="text"
                required
                value={form.postalCode}
                onChange={(e) => updateForm("postalCode", e.target.value)}
                className="w-full px-4 py-3 border border-primary-200 rounded-lg focus:outline-none focus:border-luxury-gold transition-colors"
                placeholder="ex: 75004"
              />
            </div>
          </div>

          {/* Metro stations */}
          <div className="mt-8">
            <label className="block text-sm font-medium text-luxury-charcoal mb-4">
              Stations de métro à proximité
            </label>
            {form.metroStations.map((station, index) => (
              <div key={index} className="flex gap-3 mb-3">
                <input
                  type="text"
                  value={station.name}
                  onChange={(e) => updateMetroStation(index, "name", e.target.value)}
                  className="flex-1 px-4 py-3 border border-primary-200 rounded-lg focus:outline-none focus:border-luxury-gold transition-colors"
                  placeholder="Nom de la station"
                />
                <input
                  type="text"
                  value={station.lines}
                  onChange={(e) => updateMetroStation(index, "lines", e.target.value)}
                  className="w-32 px-4 py-3 border border-primary-200 rounded-lg focus:outline-none focus:border-luxury-gold transition-colors"
                  placeholder="Lignes (1, 7)"
                />
                <input
                  type="text"
                  value={station.distance}
                  onChange={(e) => updateMetroStation(index, "distance", e.target.value)}
                  className="w-32 px-4 py-3 border border-primary-200 rounded-lg focus:outline-none focus:border-luxury-gold transition-colors"
                  placeholder="Distance"
                />
                {form.metroStations.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeMetroStation(index)}
                    className="px-3 text-red-400 hover:text-red-600 transition-colors"
                  >
                    &times;
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addMetroStation}
              className="text-sm text-luxury-gold hover:text-luxury-charcoal transition-colors mt-2"
            >
              + Ajouter une station
            </button>
          </div>
        </section>

        {/* Section 3: Conditions */}
        <section className="mb-12">
          <h2 className="font-serif text-2xl text-luxury-charcoal mb-6 pb-3 border-b border-primary-200">
            Conditions
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-luxury-charcoal mb-2">
                Disponibilité *
              </label>
              <input
                type="text"
                required
                value={form.availability}
                onChange={(e) => updateForm("availability", e.target.value)}
                className="w-full px-4 py-3 border border-primary-200 rounded-lg focus:outline-none focus:border-luxury-gold transition-colors"
                placeholder="ex: Immédiate"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-luxury-charcoal mb-2">
                Prix mensuel *
              </label>
              <input
                type="text"
                required
                value={form.pricePerMonth}
                onChange={(e) => updateForm("pricePerMonth", e.target.value)}
                className="w-full px-4 py-3 border border-primary-200 rounded-lg focus:outline-none focus:border-luxury-gold transition-colors"
                placeholder="ex: 15 000€ HT/mois"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-luxury-charcoal mb-2">
                Durée d&apos;engagement *
              </label>
              <input
                type="text"
                required
                value={form.leaseDuration}
                onChange={(e) => updateForm("leaseDuration", e.target.value)}
                className="w-full px-4 py-3 border border-primary-200 rounded-lg focus:outline-none focus:border-luxury-gold transition-colors"
                placeholder="ex: 12 mois"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-luxury-charcoal mb-2">
                Préavis de départ *
              </label>
              <input
                type="text"
                required
                value={form.noticePeriod}
                onChange={(e) => updateForm("noticePeriod", e.target.value)}
                className="w-full px-4 py-3 border border-primary-200 rounded-lg focus:outline-none focus:border-luxury-gold transition-colors"
                placeholder="ex: 3 mois"
              />
            </div>
          </div>
        </section>

        {/* Section 4: Médias */}
        <section className="mb-12">
          <h2 className="font-serif text-2xl text-luxury-charcoal mb-6 pb-3 border-b border-primary-200">
            Médias
          </h2>
          <div className="grid gap-8">
            {/* Existing video */}
            {existingVideo && (
              <div>
                <label className="block text-sm font-medium text-luxury-charcoal mb-2">
                  Vidéo actuelle
                </label>
                <div className="flex items-center gap-4 p-4 bg-primary-50 rounded-lg">
                  <span className="text-sm text-luxury-slate truncate flex-1">
                    {existingVideo.split("/").pop()}
                  </span>
                  <button
                    type="button"
                    onClick={() => setExistingVideo("")}
                    className="text-sm text-red-400 hover:text-red-600 transition-colors shrink-0"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            )}
            <FileDropzone
              label={existingVideo ? "Remplacer la vidéo" : "Vidéo de l'espace"}
              description="Glissez-déposez une vidéo (MP4) ou cliquez pour sélectionner"
              accept={{ "video/mp4": [".mp4"], "video/quicktime": [".mov"] }}
              onDrop={(files) => setVideoFile(files)}
              files={videoFile}
              multiple={false}
            />

            {/* Existing photos */}
            {existingPhotos.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-luxury-charcoal mb-2">
                  Photos actuelles
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {existingPhotos.map((photo, i) => (
                    <div key={photo} className="relative aspect-square rounded-lg overflow-hidden bg-primary-50 group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photo}
                        alt={`Photo ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeExistingPhoto(i)}
                        className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <FileDropzone
              label={existingPhotos.length > 0 ? "Ajouter des photos" : "Photos de l'espace"}
              description="Glissez-déposez vos photos ou cliquez pour sélectionner (JPG, PNG, WebP)"
              accept={{
                "image/jpeg": [".jpg", ".jpeg"],
                "image/png": [".png"],
                "image/webp": [".webp"],
              }}
              onDrop={(files) => setPhotoFiles((prev) => [...prev, ...files])}
              files={photoFiles}
              previews={photoPreviews}
            />

            {/* Existing floor plan */}
            {existingFloorPlan && (
              <div>
                <label className="block text-sm font-medium text-luxury-charcoal mb-2">
                  Plan actuel
                </label>
                <div className="flex items-center gap-4 p-4 bg-primary-50 rounded-lg">
                  <span className="text-sm text-luxury-slate truncate flex-1">
                    {existingFloorPlan.split("/").pop()}
                  </span>
                  <button
                    type="button"
                    onClick={() => setExistingFloorPlan("")}
                    className="text-sm text-red-400 hover:text-red-600 transition-colors shrink-0"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            )}
            <FileDropzone
              label={existingFloorPlan ? "Remplacer le plan" : "Plan d'aménagement"}
              description="Glissez-déposez le plan (JPG, PNG, PDF)"
              accept={{
                "image/jpeg": [".jpg", ".jpeg"],
                "image/png": [".png"],
                "application/pdf": [".pdf"],
              }}
              onDrop={(files) => setFloorPlanFile(files)}
              files={floorPlanFile}
              previews={floorPlanPreview}
              multiple={false}
            />
          </div>
        </section>

        {/* Submit */}
        <div className="text-center pt-8 border-t border-primary-200">
          <button
            type="submit"
            disabled={isGenerating}
            className={`luxury-btn text-base px-12 py-5 ${
              isGenerating ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {submitLabel}
          </button>
        </div>
      </form>
    </main>
  );
}
