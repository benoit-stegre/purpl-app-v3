'use client';

import { useState } from 'react';
import { Upload } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface RemerciementEditorProps {
  initialMessage?: string;
  initialImageUrl?: string;
  initialCollecteEmail?: boolean;
  initialDesignConfig?: any;
  onChange?: (data: {
    message: string;
    imageUrl?: string;
    collecteEmailActive: boolean;
    designConfig: any;
  }) => void;
  concertationId: string;
}

export function RemerciementEditor({
  initialMessage = '',
  initialImageUrl = '',
  initialCollecteEmail = false,
  initialDesignConfig = {},
  onChange,
  concertationId,
}: RemerciementEditorProps) {
  const supabase = createClient();
  const [message, setMessage] = useState(initialMessage);
  const [imageUrl, setImageUrl] = useState(initialImageUrl);
  const [collecteEmail, setCollecteEmail] = useState(initialCollecteEmail);
  const [couleurFond, setCouleurFond] = useState(initialDesignConfig.couleurFond || '#F3F4F6');
  const [couleurTexte, setCouleurTexte] = useState(initialDesignConfig.couleurTexte || '#111827');
  const [uploading, setUploading] = useState(false);

  const handleChange = () => {
    if (onChange) {
      onChange({
        message,
        imageUrl,
        collecteEmailActive: collecteEmail,
        designConfig: {
          couleurFond,
          couleurTexte,
        },
      });
    }
  };

  const handleMessageChange = (value: string) => {
    setMessage(value);
    setTimeout(handleChange, 0);
  };

  const handleCollecteEmailChange = (checked: boolean) => {
    setCollecteEmail(checked);
    setTimeout(handleChange, 0);
  };

  const handleCouleurFondChange = (value: string) => {
    setCouleurFond(value);
    setTimeout(handleChange, 0);
  };

  const handleCouleurTexteChange = (value: string) => {
    setCouleurTexte(value);
    setTimeout(handleChange, 0);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${concertationId}/remerciement-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('images').getPublicUrl(fileName);

      setImageUrl(data.publicUrl);
      setTimeout(handleChange, 0);
    } catch (error) {
      console.error('Erreur upload:', error);
      alert('Erreur lors de l\'upload de l\'image');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Message de remerciement</label>
          <textarea
            value={message}
            onChange={(e) => handleMessageChange(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={6}
            placeholder="Merci d'avoir participé à cette concertation..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Image (optionnelle)</label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="image-upload"
              disabled={uploading}
            />
            <label htmlFor="image-upload" className="cursor-pointer">
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">
                {uploading ? 'Upload en cours...' : 'Cliquez pour uploader une image'}
              </p>
            </label>
          </div>
          {imageUrl && (
            <div className="mt-4">
              <img src={imageUrl} alt="Preview" className="max-h-40 rounded-lg mx-auto" />
            </div>
          )}
        </div>

        <div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={collecteEmail}
              onChange={(e) => handleCollecteEmailChange(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-sm font-medium">Collecter les emails</span>
          </label>
          <p className="text-xs text-gray-500 mt-1 ml-6">
            Ajouter un champ email dans le formulaire de remerciement
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Couleur de fond</label>
            <input
              type="color"
              value={couleurFond}
              onChange={(e) => handleCouleurFondChange(e.target.value)}
              className="w-full h-12 rounded cursor-pointer"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Couleur du texte</label>
            <input
              type="color"
              value={couleurTexte}
              onChange={(e) => handleCouleurTexteChange(e.target.value)}
              className="w-full h-12 rounded cursor-pointer"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Aperçu</label>
        <div
          className="rounded-lg p-8 min-h-[400px] flex flex-col items-center justify-center text-center"
          style={{ backgroundColor: couleurFond, color: couleurTexte }}
        >
          {imageUrl && (
            <img src={imageUrl} alt="Preview" className="max-h-32 mb-6 rounded-lg" />
          )}
          <p className="text-lg whitespace-pre-wrap">{message || 'Votre message apparaîtra ici...'}</p>
          {collecteEmail && (
            <div className="mt-6 w-full max-w-sm">
              <input
                type="email"
                placeholder="Votre email"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                disabled
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}