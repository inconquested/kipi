import QRCode from "qrcode";

/**
 * Generate a data URL for a QR code based on item name and department ID
 */
export async function generateQRCode(data: {
  itemName: string;
  departmentId: string;
}): Promise<string> {
  try {
    // We create a unique string for the QR code
    // In a real app, this might be a URL to the item details or a signed token
    const qrString = `item:${data.itemName}:${data.departmentId}:${Date.now()}`;
    
    // Generate QR code as a base64 Data URL
    const qrCodeDataUrl = await QRCode.toDataURL(qrString, {
        errorCorrectionLevel: 'H',
        margin: 1,
        width: 300,
        color: {
            dark: '#000000',
            light: '#ffffff',
        },
    });
    
    return qrCodeDataUrl;
  } catch (err) {
    console.error("Failed to generate QR code:", err);
    throw new Error("Failed to generate QR code");
  }
}
