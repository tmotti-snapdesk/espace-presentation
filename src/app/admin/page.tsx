"use client";

import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import FileDropzone from "@/components/admin/FileDropzone";
import { Contact, MetroStation, EspaceFormData } from "@/types/espace";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function AdminPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Files state
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [videoFile, setVideoFile] = useState<File[]>([]);
  const [floorPlanFile, setFloorPlanFile] = useState<File[]>([]);
  const [floorPlanPreview, setFloorPlanPreview] = useState<string[]>([]);
  const [contactPhotoFiles, setContactPhotoFiles] = useState<Record<string, File>>({});

  // Form state
  const [form, setForm] = useState<EspaceFormData>({
    name: "",
    tagline: "",
    address: "",
    city: "",
    postalCode: "",
    latitude: "",
    longitude: "",
    workstations: "",
    openSpaces: "",
    meetingRooms: "",
    hasLunchArea: false,
    hasEquippedKitchen: false,
    amenities: "",
    metroStations: [{ name: "", line: "", distance: "" }],
    availability: "",
    pricePerMonth: "",
    leaseDuration: "",
    noticePeriod: "",
    contacts: [
      {
        id: uuidv4(),
        name: "",
        role: "",
        email: "",
        phone: "",
        photo: "",
      },
    ],
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
      metroStations: [...prev.metroStations, { name: "", line: "", distance: "" }],
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

  const addContact = () => {
    setForm((prev) => ({
      ...prev,
      contacts: [
        ...prev.contacts,
        { id: uuidv4(), name: "", role: "", email: "", phone: "", photo: "" },
      ],
    }));
  };

  const updateContact = (index: number, field: keyof Contact, value: string) => {
    setForm((prev) => {
      const contacts = [...prev.contacts];
      contacts[index] = { ...contacts[index], [field]: value };
      return { ...prev, contacts };
    });
  };

  const removeContact = (index: number) => {
    setForm((prev) => ({
      ...prev,
      contacts: prev.contacts.filter((_, i) => i !== index),
    }));
  };

  const uploadFiles = async (files: File[], slug: string, type: string): Promise<string[]> => {
    if (files.length === 0) return [];

    const allPaths: string[] = [];

    // Upload files one by one to avoid body size limits
    for (const file of files) {
      const formData = new FormData();
      formData.append("slug", slug);
      formData.append("type", type);
      formData.append("files", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Upload ${type} failed`);
      allPaths.push(...data.paths);
    }

    return allPaths;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setError(null);
    setGeneratedUrl(null);

    try {
      const slug = slugify(form.name);

      // Upload all files in parallel
      const [photoPaths, videoPaths, floorPlanPaths] = await Promise.all([
        uploadFiles(photoFiles, slug, "photos"),
        uploadFiles(videoFile, slug, "video"),
        uploadFiles(floorPlanFile, slug, "floorplan"),
      ]);

      // Upload contact photos
      const contactsWithPhotos = await Promise.all(
        form.contacts.map(async (contact) => {
          const photoFile = contactPhotoFiles[contact.id];
          if (photoFile) {
            const paths = await uploadFiles([photoFile], slug, "contact");
            return { ...contact, photo: paths[0] || "" };
          }
          return contact;
        })
      );

      // Generate the site
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          photos: photoPaths,
          videoUrl: videoPaths[0] || "",
          floorPlanImage: floorPlanPaths[0] || "",
          contacts: contactsWithPhotos,
        }),
      });

      if (!res.ok) throw new Error("Generation failed");

      const data = await res.json();
      setGeneratedUrl(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <main className="min-h-screen bg-luxury-cream">
      {/* Header */}
      <div className="bg-luxury-charcoal text-white py-8 px-6 md:px-12">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <p className="luxury-label text-luxury-gold mb-1">Snapdesk</p>
            <h1 className="font-serif text-2xl">Créer un mini-site</h1>
          </div>
          <a href="/" className="text-sm text-white/60 hover:text-white transition-colors">
            Retour
          </a>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-5xl mx-auto py-12 px-6 md:px-12">
        {/* Success message */}
        {generatedUrl && (
          <div className="mb-8 p-6 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 font-medium mb-2">Mini-site créé avec succès !</p>
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
                className="w-full px-4 py-3 border border-primary-200 rounded-lg focus:outline-none focus:border-luxury-gold transition-colors"
                placeholder="ex: Le Marais Premium"
              />
              {form.name && (
                <p className="text-xs text-luxury-slate mt-1">
                  Slug : {slugify(form.name)}
                </p>
              )}
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-luxury-charcoal mb-2">
                Accroche
              </label>
              <input
                type="text"
                value={form.tagline}
                onChange={(e) => updateForm("tagline", e.target.value)}
                className="w-full px-4 py-3 border border-primary-200 rounded-lg focus:outline-none focus:border-luxury-gold transition-colors"
                placeholder="ex: Un espace de travail d'exception au cœur du Marais"
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
            <div className="flex items-center gap-8">
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
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-luxury-charcoal mb-2">
                Équipements (séparés par des virgules)
              </label>
              <input
                type="text"
                value={form.amenities}
                onChange={(e) => updateForm("amenities", e.target.value)}
                className="w-full px-4 py-3 border border-primary-200 rounded-lg focus:outline-none focus:border-luxury-gold transition-colors"
                placeholder="ex: Climatisation, Rack à vélos, Terrasse, Fibre optique"
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
            <div>
              <label className="block text-sm font-medium text-luxury-charcoal mb-2">
                Latitude
              </label>
              <input
                type="text"
                value={form.latitude}
                onChange={(e) => updateForm("latitude", e.target.value)}
                className="w-full px-4 py-3 border border-primary-200 rounded-lg focus:outline-none focus:border-luxury-gold transition-colors"
                placeholder="ex: 48.8566"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-luxury-charcoal mb-2">
                Longitude
              </label>
              <input
                type="text"
                value={form.longitude}
                onChange={(e) => updateForm("longitude", e.target.value)}
                className="w-full px-4 py-3 border border-primary-200 rounded-lg focus:outline-none focus:border-luxury-gold transition-colors"
                placeholder="ex: 2.3522"
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
                  value={station.line}
                  onChange={(e) => updateMetroStation(index, "line", e.target.value)}
                  className="w-24 px-4 py-3 border border-primary-200 rounded-lg focus:outline-none focus:border-luxury-gold transition-colors"
                  placeholder="Ligne"
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
            <FileDropzone
              label="Vidéo de l'espace"
              description="Glissez-déposez une vidéo (MP4) ou cliquez pour sélectionner"
              accept={{ "video/mp4": [".mp4"], "video/quicktime": [".mov"] }}
              onDrop={(files) => setVideoFile(files)}
              files={videoFile}
              multiple={false}
            />
            <FileDropzone
              label="Photos de l'espace"
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
            <FileDropzone
              label="Plan d'aménagement"
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

        {/* Section 5: Contacts */}
        <section className="mb-12">
          <h2 className="font-serif text-2xl text-luxury-charcoal mb-6 pb-3 border-b border-primary-200">
            Interlocuteurs Snapdesk
          </h2>
          {form.contacts.map((contact, index) => (
            <div
              key={contact.id}
              className="border border-primary-200 rounded-lg p-6 mb-4"
            >
              <div className="flex justify-between items-center mb-4">
                <p className="font-medium text-luxury-charcoal">
                  Contact {index + 1}
                </p>
                {form.contacts.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeContact(index)}
                    className="text-sm text-red-400 hover:text-red-600 transition-colors"
                  >
                    Supprimer
                  </button>
                )}
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <input
                  type="text"
                  value={contact.name}
                  onChange={(e) => updateContact(index, "name", e.target.value)}
                  className="px-4 py-3 border border-primary-200 rounded-lg focus:outline-none focus:border-luxury-gold transition-colors"
                  placeholder="Nom complet"
                />
                <input
                  type="text"
                  value={contact.role}
                  onChange={(e) => updateContact(index, "role", e.target.value)}
                  className="px-4 py-3 border border-primary-200 rounded-lg focus:outline-none focus:border-luxury-gold transition-colors"
                  placeholder="Rôle"
                />
                <input
                  type="email"
                  value={contact.email}
                  onChange={(e) => updateContact(index, "email", e.target.value)}
                  className="px-4 py-3 border border-primary-200 rounded-lg focus:outline-none focus:border-luxury-gold transition-colors"
                  placeholder="Email"
                />
                <input
                  type="tel"
                  value={contact.phone}
                  onChange={(e) => updateContact(index, "phone", e.target.value)}
                  className="px-4 py-3 border border-primary-200 rounded-lg focus:outline-none focus:border-luxury-gold transition-colors"
                  placeholder="Téléphone"
                />
                <div className="md:col-span-2">
                  <label className="block text-sm text-luxury-slate mb-2">
                    Photo du contact
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setContactPhotoFiles((prev) => ({
                          ...prev,
                          [contact.id]: file,
                        }));
                      }
                    }}
                    className="text-sm text-luxury-slate"
                  />
                </div>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={addContact}
            className="text-sm text-luxury-gold hover:text-luxury-charcoal transition-colors"
          >
            + Ajouter un contact
          </button>
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
            {isGenerating ? "Génération en cours..." : "Générer le mini-site"}
          </button>
        </div>
      </form>
    </main>
  );
}
