import { put } from '@vercel/blob';

export async function POST(request) {
  try {
    console.log('=== UPLOAD REQUEST START ===');
    
    const formData = await request.formData();
    const file = formData.get('file');

    console.log('File ricevuto:', {
      name: file?.name,
      type: file?.type,
      size: file?.size ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : 'unknown'
    });

    if (!file) {
      console.error('Nessun file nel form data');
      return Response.json({ error: 'Nessun file caricato' }, { status: 400 });
    }

    // Verifica tipo file
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      console.error('Tipo file non supportato:', file.type);
      return Response.json({ 
        error: `Formato non supportato: ${file.type}. Usa JPG, PNG o WEBP` 
      }, { status: 400 });
    }

    // Verifica dimensione (max 10MB per sicurezza Vercel)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      console.error('File troppo grande:', file.size);
      return Response.json({ 
        error: `File troppo grande (${(file.size / 1024 / 1024).toFixed(2)} MB). Max 10MB` 
      }, { status: 400 });
    }

    console.log('Validazione OK, inizio upload su Vercel Blob...');

    // Upload su Vercel Blob con nome random per evitare conflitti
    const blob = await put(file.name, file, {
      access: 'public',
      addRandomSuffix: true,
    });

    console.log('Upload completato:', blob.url);

    return Response.json({ 
      success: true,
      url: blob.url,
      type: 'image'
    });

  } catch (error) {
    console.error('=== ERRORE UPLOAD ===');
    console.error('Tipo errore:', error.name);
    console.error('Messaggio:', error.message);
    console.error('Stack:', error.stack);
    
    return Response.json({ 
      error: 'Errore durante upload',
      details: error.message 
    }, { status: 500 });
  }
}