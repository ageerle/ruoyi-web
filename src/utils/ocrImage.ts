export const OCR_IMAGE_ACCEPT = 'image/jpeg,image/png';

const OCR_IMAGE_LIMIT = 10 * 1024 * 1024;

export function isOcrImage(file: File): boolean {
  const type = file.type.toLowerCase();
  const supportedType = ['image/jpeg', 'image/jpg', 'image/png'].includes(type);
  const supportedExtension = /\.(?:jpe?g|png)$/i.test(file.name);
  return file.size > 0 && file.size <= OCR_IMAGE_LIMIT
    && (supportedType || (!type && supportedExtension));
}

export function readTransferredFiles(transfer: DataTransfer | null): File[] {
  if (!transfer)
    return [];
  if (transfer.files.length > 0)
    return Array.from(transfer.files);
  return Array.from(transfer.items)
    .filter(item => item.kind === 'file')
    .map(item => item.getAsFile())
    .filter(file => file !== null);
}
