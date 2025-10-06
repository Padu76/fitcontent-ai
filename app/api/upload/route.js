import { put } from '@vercel/blob';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return Response.json({ error: 'Nessun file caricato' }, { status: 400 });
    }

    // Verifica tipo file
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/quicktime'];
    if (!allowedTypes.includes(file.type)) {
      return Response.json({ error: 'Formato non supportato. Usa JPG, PNG o MP4' }, { status: 400 });
    }

    // Verifica dimensione (max 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return Response.json({ error: 'File troppo grande (max 50MB)' }, { status: 400 });
    }

    // Upload su Vercel Blob
    const blob = await put(file.name, file, {
      access: 'public',
    });

    return Response.json({ 
      success: true,
      url: blob.url,
      type: file.type.startsWith('video') ? 'video' : 'image'
    });

  } catch (error) {
    console.error('Errore upload:', error);
    return Response.json({ error: 'Errore durante upload' }, { status: 500 });
  }
}