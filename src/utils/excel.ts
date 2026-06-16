import ExcelJS from "exceljs";

interface ExcelColumn {
  header: string;
  key: string;
  width?: number;
}

/**
 * Membuat file excel dasar dan mengembalikannya dalam bentuk Buffer.
 * @param sheetName Nama sheet di dalam excel
 * @param columns Daftar definisi kolom
 * @param rows Data baris yang akan dimasukkan
 */
export async function createExcelBuffer(
  sheetName: string,
  columns: ExcelColumn[],
  rows: any[]
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(sheetName);

  worksheet.columns = columns.map((col) => ({
    header: col.header,
    key: col.key,
    width: col.width || 15,
  }));

  worksheet.addRows(rows);

  // Styling header sederhana
  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF4F46E5" }, // Indigo primary color
  };

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
