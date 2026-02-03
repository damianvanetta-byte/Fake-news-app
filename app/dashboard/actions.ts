'use server'

export async function triggerN8n(
  contentType: 'url' | 'text',
  content: string,
  verificationId: string
) {
  try {
    const response = await fetch('https://n8n.srv1259210.hstgr.cloud/webhook/verificar-articulo', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content_type: contentType,
        url: contentType === 'url' ? content : null,
        text_content: contentType === 'text' ? content : null,
        verification_id: verificationId,
      }),
    });

    if (!response.ok) {
      throw new Error(`Error en n8n: ${response.status}`);
    }

    return { success: true };
  } catch (error) {
    console.error("Error triggerN8n:", error);
    return { success: false };
  }
}