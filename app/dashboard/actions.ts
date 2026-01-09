'use server'

export async function triggerN8n(url: string, verificationId: string) {
  try {
    const response = await fetch('http://localhost:5678/webhook-test/verificar-articulo', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: url,
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