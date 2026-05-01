const XLSX_MIME_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

export function getAcceptedSpreadsheetFile(files: File[] | FileList | null | undefined): File | null {
  if (!files || files.length === 0) {
    return null;
  }

  const [file] = Array.from(files);
  const lowerCaseName = file.name.toLowerCase();
  const isSpreadsheet = lowerCaseName.endsWith('.xlsx') || file.type === XLSX_MIME_TYPE;

  return isSpreadsheet ? file : null;
}
