"use client";

import { useState, useEffect } from "react";
import { upload } from "@vercel/blob/client";
import FileDropzone from "@/components/admin/FileDropzone";
import { MetroStation, EspaceFormData, EspaceData, LeadGenMode, Template } from "@/types/espace";

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

  // Prestige media files
  const [storyPhotoFiles, setStoryPhotoFiles] = useState<File[]>([]);
  const [storyPhotoPreviews, setStoryPhotoPreviews] = useState<string[]>([]);
  const [highlightPhotoFiles, setHighlightPhotoFiles] = useState<File[]>([]);
  const [highlightPhotoPreviews, setHighlightPhotoPreviews] = useState<string[]>([]);
  const [neighborhoodPhotoFiles, setNeighborhoodPhotoFiles] = useState<File[]>([]);
  const [neighborhoodPhotoPreviews, setNeighborhoodPhotoPreviews] = useState<string[]>([]);

  // Existing media URLs (edit mode)
  const [existingPhotos, setExistingPhotos] = useState<string[]>(initialData?.photos || []);
  const [existingVideo, setExistingVideo] = useState<string>(initialData?.videoUrl || "");
  const [existingFloorPlan, setExistingFloorPlan] = useState<string>(initialData?.floorPlanImage || "");
  const [existingStoryPhotos, setExistingStoryPhotos] = useState<string[]>(initialData?.storyPhotos || []);
  const [existingHighlightPhotos, setExistingHighlightPhotos] = useState<string[]>(initialData?.highlightPhotos || []);
  const [existingNeighborhoodPhotos, setExistingNeighborhoodPhotos] = useState<string[]>(initialData?.neighborhoodPhotos || []);

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
        isLeadGen: initialData.isLeadGen || false,
        leadGenMode: initialData.leadGenMode || "unlock",
        leadGenDismissible: initialData.leadGenDismissible || false,
        presentationLink: initialData.presentationLink || "",
        template: initialData.template || "standard",
        storyTitle: initialData.storyTitle || "",
        storyText: initialData.storyText || "",
        highlightTitle: initialData.highlightTitle || "",
        highlightText: initialData.highlightText || "",
        buildingSurface: initialData.buildingSurface || "",
        buildingFloors: initialData.buildingFloors || "",
        buildingYear: initialData.buildingYear || "",
        buildingCertification: initialData.buildingCertification || "",
        neighborhoodTitle: initialData.neighborhoodTitle || "",
        neighborhoodText: initialData.neighborhoodText || "",
        testimonialQuote: initialData.testimonial?.quote || "",
        testimonialAuthor: initialData.testimonial?.author || "",
        testimonialRole: initialData.testimonial?.role || "",
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
      isLeadGen: false,
      leadGenMode: "unlock" as LeadGenMode,
      leadGenDismissible: false,
      presentationLink: "",
      template: "standard" as Template,
      storyTitle: "",
      storyText: "",
      highlightTitle: "",
      highlightText: "",
      buildingSurface: "",
      buildingFloors: "",
      buildingYear: "",
      buildingCertification: "",
      neighborhoodTitle: "",
      neighborhoodText: "",
      testimonialQuote: "",
      testimonialAuthor: "",
      testimonialRole: "",
    };
  });

  // Generate previews for photos
  useEffect(() => {
    const urls = photoFiles.map((f) => URL.createObjectURL(f));
    setPhotoPreviews(urls);
    return () => urls.forEach(URL.revokeObjectURL);
  }, [photoFiles]);

  useEffect(() => {
    const urls = storyPhotoFiles.map((f) => URL.createObjectURL(f));
    setStoryPhotoPreviews(urls);
    return () => urls.forEach(URL.revokeObjectURL);
  }, [storyPhotoFiles]);

  useEffect(() => {
    const urls = highlightPhotoFiles.map((f) => URL.createObjectURL(f));
    setHighlightPhotoPreviews(urls);
    return () => urls.forEach(URL.revokeObjectURL);
  }, [highlightPhotoFiles]);

  useEffect(() => {
    const urls = neighborhoodPhotoFiles.map((f) => URL.createObjectURL(f));
    setNeighborhoodPhotoPreviews(urls);
    return () => urls.forEach(URL.revokeObjectURL);
  }, [neighborhoodPhotoFiles]);

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
      const [newPhotoPaths, newVideoPaths, newFloorPlanPaths, newStoryPhotoPaths, newHighlightPhotoPaths, newNeighborhoodPhotoPaths] = await Promise.all([
        uploadFiles(photoFiles, slug, "photos"),
        uploadFiles(videoFile, slug, "video"),
        uploadFiles(floorPlanFile, slug, "floorplan"),
        uploadFiles(storyPhotoFiles, slug, "story"),
        uploadFiles(highlightPhotoFiles, slug, "highlight"),
        uploadFiles(neighborhoodPhotoFiles, slug, "neighborhood"),
      ]);

      // Merge existing + new photos
      const allPhotos = [...existingPhotos, ...newPhotoPaths];
      const finalVideo = newVideoPaths[0] || existingVideo;
      const finalFloorPlan = newFloorPlanPaths[0] || existingFloorPlan;
      const allStoryPhotos = [...existingStoryPhotos, ...newStoryPhotoPaths];
      const allHighlightPhotos = [...existingHighlightPhotos, ...newHighlightPhotoPaths];
      const allNeighborhoodPhotos = [...existingNeighborhoodPhotos, ...newNeighborhoodPhotoPaths];

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
          storyPhotos: allStoryPhotos,
          highlightPhotos: allHighlightPhotos,
          neighborhoodPhotos: allNeighborhoodPhotos,
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

        {/* Section 0: Template */}
        <section className="mb-12">
          <h2 className="font-serif text-2xl text-luxury-charcoal mb-6 pb-3 border-b border-primary-200">
            Format
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <label
              className={`flex flex-col items-center gap-3 cursor-pointer p-6 border-2 rounded-lg transition-colors ${
                form.template === "standard"
                  ? "border-luxury-gold bg-luxury-champagne/10"
                  : "border-primary-200 hover:border-luxury-gold/50"
              }`}
            >
              <input
                type="radio"
                name="template"
                value="standard"
                checked={form.template === "standard"}
                onChange={(e) => updateForm("template", e.target.value)}
                className="sr-only"
              />
              <span className="text-2xl">&#9634;</span>
              <span className="text-sm font-medium text-luxury-charcoal">Standard</span>
              <p className="text-xs text-luxury-slate text-center">
                Landing page classique pour un espace de bureaux.
              </p>
            </label>
            <label
              className={`flex flex-col items-center gap-3 cursor-pointer p-6 border-2 rounded-lg transition-colors ${
                form.template === "prestige"
                  ? "border-luxury-gold bg-luxury-champagne/10"
                  : "border-primary-200 hover:border-luxury-gold/50"
              }`}
            >
              <input
                type="radio"
                name="template"
                value="prestige"
                checked={form.template === "prestige"}
                onChange={(e) => updateForm("template", e.target.value)}
                className="sr-only"
              />
              <span className="text-2xl">&#9733;</span>
              <span className="text-sm font-medium text-luxury-charcoal">Prestige</span>
              <p className="text-xs text-luxury-slate text-center">
                Version enrichie avec histoire, point fort, quartier et témoignage.
              </p>
            </label>
          </div>
        </section>

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
                className="w-full px-4 py-3 border border-primary-200 rounded-lg focus:outline-none focus:border-luxury-gold transition-colors"
                placeholder="ex: Le Marais Premium"
              />
              {form.name && mode === "create" && (
                <p className="text-xs text-luxury-slate mt-1">
                  Slug : {slugify(form.name)}
                </p>
              )}
              {mode === "edit" && initialData && (
                <p className="text-xs text-luxury-slate mt-1">
                  URL : /espaces/{initialData.slug}
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

        {/* Section 4: Lead Generation */}
        <section className="mb-12">
          <h2 className="font-serif text-2xl text-luxury-charcoal mb-6 pb-3 border-b border-primary-200">
            Lead Generation
          </h2>
          <label className="flex items-center gap-4 cursor-pointer p-6 border border-primary-200 rounded-lg hover:border-luxury-gold/50 transition-colors mb-6">
            <input
              type="checkbox"
              checked={form.isLeadGen}
              onChange={(e) => updateForm("isLeadGen", e.target.checked)}
              className="w-5 h-5 accent-luxury-gold"
            />
            <div>
              <span className="text-sm font-medium text-luxury-charcoal">
                Passer au format lead generation
              </span>
              <p className="text-xs text-luxury-slate mt-1">
                Un formulaire apparaîtra aux visiteurs pour collecter leur email et entreprise.
              </p>
            </div>
          </label>

          {form.isLeadGen && (
            <div className="space-y-6 p-6 bg-primary-50 rounded-lg border border-primary-200">
              <div>
                <label className="block text-sm font-medium text-luxury-charcoal mb-3">
                  Mode du call-to-action
                </label>
                <div className="space-y-3">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="leadGenMode"
                      value="unlock"
                      checked={form.leadGenMode === "unlock"}
                      onChange={(e) => updateForm("leadGenMode", e.target.value)}
                      className="mt-1 accent-luxury-gold"
                    />
                    <div>
                      <span className="text-sm font-medium text-luxury-charcoal">
                        &ldquo;Recevoir la présentation complète&rdquo; + accès à la suite de la page
                      </span>
                      <p className="text-xs text-luxury-slate mt-0.5">
                        Après soumission, le visiteur peut continuer à naviguer sur la page.
                      </p>
                    </div>
                  </label>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="leadGenMode"
                      value="redirect"
                      checked={form.leadGenMode === "redirect"}
                      onChange={(e) => updateForm("leadGenMode", e.target.value)}
                      className="mt-1 accent-luxury-gold"
                    />
                    <div>
                      <span className="text-sm font-medium text-luxury-charcoal">
                        &ldquo;Recevoir la présentation complète&rdquo; + redirection vers un lien
                      </span>
                      <p className="text-xs text-luxury-slate mt-0.5">
                        Après soumission, le visiteur est redirigé vers le lien de la présentation.
                      </p>
                    </div>
                  </label>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="leadGenMode"
                      value="voir_suite"
                      checked={form.leadGenMode === "voir_suite"}
                      onChange={(e) => updateForm("leadGenMode", e.target.value)}
                      className="mt-1 accent-luxury-gold"
                    />
                    <div>
                      <span className="text-sm font-medium text-luxury-charcoal">
                        &ldquo;Voir la suite&rdquo; + accès à la suite de la page
                      </span>
                      <p className="text-xs text-luxury-slate mt-0.5">
                        CTA simplifié, pas de mention de présentation. Le visiteur continue sur la page.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {form.leadGenMode === "redirect" && (
                <div>
                  <label className="block text-sm font-medium text-luxury-charcoal mb-2">
                    Lien de la présentation *
                  </label>
                  <input
                    type="url"
                    required={form.leadGenMode === "redirect"}
                    value={form.presentationLink}
                    onChange={(e) => updateForm("presentationLink", e.target.value)}
                    className="w-full px-4 py-3 border border-primary-200 rounded-lg focus:outline-none focus:border-luxury-gold transition-colors"
                    placeholder="https://..."
                  />
                  <p className="text-xs text-luxury-slate mt-1">
                    Le visiteur sera redirigé vers ce lien après soumission du formulaire.
                  </p>
                </div>
              )}

              <label className="flex items-start gap-3 cursor-pointer pt-2 border-t border-primary-200">
                <input
                  type="checkbox"
                  checked={form.leadGenDismissible}
                  onChange={(e) => updateForm("leadGenDismissible", e.target.checked)}
                  className="mt-1 w-5 h-5 accent-luxury-gold"
                />
                <div>
                  <span className="text-sm font-medium text-luxury-charcoal">
                    Modale fermable
                  </span>
                  <p className="text-xs text-luxury-slate mt-0.5">
                    Le visiteur peut fermer la modale (croix, clic en dehors, touche Échap) et continuer à parcourir la page sans soumettre le formulaire.
                  </p>
                </div>
              </label>
            </div>
          )}
        </section>

        {/* Prestige sections */}
        {form.template === "prestige" && (
          <>
            {/* Histoire de l'immeuble */}
            <section className="mb-12">
              <h2 className="font-serif text-2xl text-luxury-charcoal mb-2 pb-3 border-b border-luxury-gold/30">
                <span className="text-luxury-gold mr-2">&#9733;</span>
                Histoire de l&apos;immeuble
              </h2>
              <p className="text-xs text-luxury-slate mb-6">Section prestige</p>
              <div className="grid gap-6">
                <div>
                  <label className="block text-sm font-medium text-luxury-charcoal mb-2">
                    Titre de la section
                  </label>
                  <input
                    type="text"
                    value={form.storyTitle}
                    onChange={(e) => updateForm("storyTitle", e.target.value)}
                    className="w-full px-4 py-3 border border-primary-200 rounded-lg focus:outline-none focus:border-luxury-gold transition-colors"
                    placeholder="ex: Un immeuble haussmannien d'exception"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-luxury-charcoal mb-2">
                    Texte
                  </label>
                  <textarea
                    value={form.storyText}
                    onChange={(e) => updateForm("storyText", e.target.value)}
                    rows={6}
                    className="w-full px-4 py-3 border border-primary-200 rounded-lg focus:outline-none focus:border-luxury-gold transition-colors resize-vertical"
                    placeholder="Racontez l'histoire de l'immeuble, ses origines, sa rénovation..."
                  />
                </div>
                {existingStoryPhotos.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-luxury-charcoal mb-2">Photos actuelles</label>
                    <div className="grid grid-cols-4 gap-3">
                      {existingStoryPhotos.map((photo, i) => (
                        <div key={photo} className="relative aspect-square rounded-lg overflow-hidden bg-primary-50 group">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={photo} alt={`Story ${i + 1}`} className="w-full h-full object-cover" />
                          <button type="button" onClick={() => setExistingStoryPhotos((prev) => prev.filter((_, j) => j !== i))} className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">&times;</button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <FileDropzone
                  label="Photos de l'histoire"
                  description="Photos historiques ou de l'immeuble (JPG, PNG, WebP)"
                  accept={{ "image/jpeg": [".jpg", ".jpeg"], "image/png": [".png"], "image/webp": [".webp"] }}
                  onDrop={(files) => setStoryPhotoFiles((prev) => [...prev, ...files])}
                  files={storyPhotoFiles}
                  previews={storyPhotoPreviews}
                />
              </div>
            </section>

            {/* Point fort */}
            <section className="mb-12">
              <h2 className="font-serif text-2xl text-luxury-charcoal mb-2 pb-3 border-b border-luxury-gold/30">
                <span className="text-luxury-gold mr-2">&#9733;</span>
                Point fort
              </h2>
              <p className="text-xs text-luxury-slate mb-6">Section prestige</p>
              <div className="grid gap-6">
                <div>
                  <label className="block text-sm font-medium text-luxury-charcoal mb-2">
                    Titre du point fort
                  </label>
                  <input
                    type="text"
                    value={form.highlightTitle}
                    onChange={(e) => updateForm("highlightTitle", e.target.value)}
                    className="w-full px-4 py-3 border border-primary-200 rounded-lg focus:outline-none focus:border-luxury-gold transition-colors"
                    placeholder="ex: Un espace de vie d'exception"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-luxury-charcoal mb-2">
                    Description
                  </label>
                  <textarea
                    value={form.highlightText}
                    onChange={(e) => updateForm("highlightText", e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border border-primary-200 rounded-lg focus:outline-none focus:border-luxury-gold transition-colors resize-vertical"
                    placeholder="Décrivez ce qui rend cet aspect unique..."
                  />
                </div>
                {existingHighlightPhotos.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-luxury-charcoal mb-2">Photos actuelles</label>
                    <div className="grid grid-cols-4 gap-3">
                      {existingHighlightPhotos.map((photo, i) => (
                        <div key={photo} className="relative aspect-square rounded-lg overflow-hidden bg-primary-50 group">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={photo} alt={`Highlight ${i + 1}`} className="w-full h-full object-cover" />
                          <button type="button" onClick={() => setExistingHighlightPhotos((prev) => prev.filter((_, j) => j !== i))} className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">&times;</button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <FileDropzone
                  label="Photos du point fort"
                  description="Photos mettant en valeur ce point fort (JPG, PNG, WebP)"
                  accept={{ "image/jpeg": [".jpg", ".jpeg"], "image/png": [".png"], "image/webp": [".webp"] }}
                  onDrop={(files) => setHighlightPhotoFiles((prev) => [...prev, ...files])}
                  files={highlightPhotoFiles}
                  previews={highlightPhotoPreviews}
                />
              </div>
            </section>

            {/* Chiffres clés immeuble */}
            <section className="mb-12">
              <h2 className="font-serif text-2xl text-luxury-charcoal mb-2 pb-3 border-b border-luxury-gold/30">
                <span className="text-luxury-gold mr-2">&#9733;</span>
                Chiffres clés de l&apos;immeuble
              </h2>
              <p className="text-xs text-luxury-slate mb-6">Section prestige</p>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-luxury-charcoal mb-2">Surface totale</label>
                  <input type="text" value={form.buildingSurface} onChange={(e) => updateForm("buildingSurface", e.target.value)} className="w-full px-4 py-3 border border-primary-200 rounded-lg focus:outline-none focus:border-luxury-gold transition-colors" placeholder="ex: 5 200 m2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-luxury-charcoal mb-2">Nombre d&apos;étages</label>
                  <input type="text" value={form.buildingFloors} onChange={(e) => updateForm("buildingFloors", e.target.value)} className="w-full px-4 py-3 border border-primary-200 rounded-lg focus:outline-none focus:border-luxury-gold transition-colors" placeholder="ex: 7 étages" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-luxury-charcoal mb-2">Année de construction / rénovation</label>
                  <input type="text" value={form.buildingYear} onChange={(e) => updateForm("buildingYear", e.target.value)} className="w-full px-4 py-3 border border-primary-200 rounded-lg focus:outline-none focus:border-luxury-gold transition-colors" placeholder="ex: 1890 / rénové 2023" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-luxury-charcoal mb-2">Certification</label>
                  <input type="text" value={form.buildingCertification} onChange={(e) => updateForm("buildingCertification", e.target.value)} className="w-full px-4 py-3 border border-primary-200 rounded-lg focus:outline-none focus:border-luxury-gold transition-colors" placeholder="ex: HQE, BREEAM" />
                </div>
              </div>
            </section>

            {/* Le quartier */}
            <section className="mb-12">
              <h2 className="font-serif text-2xl text-luxury-charcoal mb-2 pb-3 border-b border-luxury-gold/30">
                <span className="text-luxury-gold mr-2">&#9733;</span>
                Le quartier
              </h2>
              <p className="text-xs text-luxury-slate mb-6">Section prestige</p>
              <div className="grid gap-6">
                <div>
                  <label className="block text-sm font-medium text-luxury-charcoal mb-2">Titre</label>
                  <input type="text" value={form.neighborhoodTitle} onChange={(e) => updateForm("neighborhoodTitle", e.target.value)} className="w-full px-4 py-3 border border-primary-200 rounded-lg focus:outline-none focus:border-luxury-gold transition-colors" placeholder="ex: Au cœur du 9e arrondissement" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-luxury-charcoal mb-2">Description du quartier</label>
                  <textarea value={form.neighborhoodText} onChange={(e) => updateForm("neighborhoodText", e.target.value)} rows={4} className="w-full px-4 py-3 border border-primary-200 rounded-lg focus:outline-none focus:border-luxury-gold transition-colors resize-vertical" placeholder="Restaurants, commerces, vie de quartier..." />
                </div>
                {existingNeighborhoodPhotos.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-luxury-charcoal mb-2">Photos actuelles</label>
                    <div className="grid grid-cols-4 gap-3">
                      {existingNeighborhoodPhotos.map((photo, i) => (
                        <div key={photo} className="relative aspect-square rounded-lg overflow-hidden bg-primary-50 group">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={photo} alt={`Quartier ${i + 1}`} className="w-full h-full object-cover" />
                          <button type="button" onClick={() => setExistingNeighborhoodPhotos((prev) => prev.filter((_, j) => j !== i))} className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">&times;</button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <FileDropzone
                  label="Photos du quartier"
                  description="Photos d'ambiance du quartier (JPG, PNG, WebP)"
                  accept={{ "image/jpeg": [".jpg", ".jpeg"], "image/png": [".png"], "image/webp": [".webp"] }}
                  onDrop={(files) => setNeighborhoodPhotoFiles((prev) => [...prev, ...files])}
                  files={neighborhoodPhotoFiles}
                  previews={neighborhoodPhotoPreviews}
                />
              </div>
            </section>

            {/* Témoignage */}
            <section className="mb-12">
              <h2 className="font-serif text-2xl text-luxury-charcoal mb-2 pb-3 border-b border-luxury-gold/30">
                <span className="text-luxury-gold mr-2">&#9733;</span>
                Témoignage
              </h2>
              <p className="text-xs text-luxury-slate mb-6">Section prestige</p>
              <div className="grid gap-6">
                <div>
                  <label className="block text-sm font-medium text-luxury-charcoal mb-2">Citation</label>
                  <textarea value={form.testimonialQuote} onChange={(e) => updateForm("testimonialQuote", e.target.value)} rows={3} className="w-full px-4 py-3 border border-primary-200 rounded-lg focus:outline-none focus:border-luxury-gold transition-colors resize-vertical" placeholder="ex: Cet espace a transformé notre façon de travailler..." />
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-luxury-charcoal mb-2">Auteur</label>
                    <input type="text" value={form.testimonialAuthor} onChange={(e) => updateForm("testimonialAuthor", e.target.value)} className="w-full px-4 py-3 border border-primary-200 rounded-lg focus:outline-none focus:border-luxury-gold transition-colors" placeholder="ex: Jean Dupont" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-luxury-charcoal mb-2">Fonction</label>
                    <input type="text" value={form.testimonialRole} onChange={(e) => updateForm("testimonialRole", e.target.value)} className="w-full px-4 py-3 border border-primary-200 rounded-lg focus:outline-none focus:border-luxury-gold transition-colors" placeholder="ex: CEO, Entreprise XYZ" />
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        {/* Section 5: Médias */}
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
