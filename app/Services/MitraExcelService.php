<?php

namespace App\Services;

use App\Models\District;
use App\Models\Mitra;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

class MitraExcelService
{
    /**
     * Generate template Excel for importing mitras.
     */
    public function generateTemplate(): string
    {
        $spreadsheet = new Spreadsheet();

        // Sheet 1: Template Data Mitra
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Template Data Mitra');

        // Header Title
        $sheet->setCellValue('A1', 'TEMPLATE IMPORT DATA MITRA STATISTIK - BPS KABUPATEN MOJOKERTO');
        $sheet->setCellValue('A2', 'Petunjuk: Kolom dengan tanda (*) wajib diisi. Kode kecamatan wajib sesuai dengan daftar pada Sheet "Daftar Kode Kecamatan".');

        $sheet->getStyle('A1')->getFont()->setBold(true)->setSize(14);
        $sheet->getStyle('A2')->getFont()->setItalic(true)->setSize(10)->getColor()->setRGB('555555');

        // Column Headers
        $headers = [
            'A4' => 'No',
            'B4' => 'SOBAT ID / Kode Mitra',
            'C4' => 'Nama Lengkap (*)',
            'D4' => 'Kode Kecamatan (*)',
            'E4' => 'Nama Kecamatan (Opsional)',
            'F4' => 'Alamat Domisili',
            'G4' => 'Nomor HP / WhatsApp',
            'H4' => 'Email',
            'I4' => 'Pekerjaan Utama',
            'J4' => 'Posisi Petugas',
            'K4' => 'Status (active/inactive)',
            'L4' => 'Catatan / Tahun Database',
        ];

        foreach ($headers as $cell => $text) {
            $sheet->setCellValue($cell, $text);
        }

        // Header Styling (BPS Blue: 005596)
        $headerRange = 'A4:L4';
        $sheet->getStyle($headerRange)->applyFromArray([
            'font' => [
                'bold' => true,
                'color' => ['rgb' => 'FFFFFF'],
                'size' => 11,
            ],
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['rgb' => '005596'],
            ],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
                'vertical' => Alignment::VERTICAL_CENTER,
                'wrapText' => true,
            ],
            'borders' => [
                'allBorders' => [
                    'borderStyle' => Border::BORDER_THIN,
                    'color' => ['rgb' => '003366'],
                ],
            ],
        ]);
        $sheet->getRowDimension(4)->setRowHeight(28);

        // Sample Data Rows (3 samples)
        $sampleData = [
            [1, '351627010001', 'Budi Santoso', '010', 'Jatirejo', 'Dusun Krajan RT 01 RW 02, Ds. Jatirejo', '081234567890', 'budi@gmail.com', 'Mitra Statistik', 'Pencacah (PPL)', 'active', 'Mitra Database 2027'],
            [2, '351627080002', 'Siti Aminah', '080', 'Mojosari', 'Jl. Pahlawan No. 12, Ds. Seduri', '081234567891', 'siti@gmail.com', 'Wiraswasta', 'Pengawas (PML)', 'active', 'Mitra Database 2027'],
            [3, '351627130003', 'Ahmad Fauzi', '130', 'Sooko', 'Perum Jampirogo Asri Blok B No. 5', '081234567892', 'ahmad@gmail.com', 'Guru Honorer', 'Pencacah (PPL)', 'active', 'Mitra Database 2027'],
        ];

        $rowIdx = 5;
        foreach ($sampleData as $row) {
            $colLetter = 'A';
            foreach ($row as $val) {
                // Force string for ID and Kode Kecamatan so leading zeros like '010' are preserved
                if ($colLetter === 'B' || $colLetter === 'D' || $colLetter === 'G') {
                    $sheet->setCellValueExplicit($colLetter . $rowIdx, (string) $val, \PhpOffice\PhpSpreadsheet\Cell\DataType::TYPE_STRING);
                } else {
                    $sheet->setCellValue($colLetter . $rowIdx, $val);
                }
                $colLetter++;
            }
            $rowIdx++;
        }

        // Sample Rows Styling
        $dataRange = 'A5:L' . ($rowIdx - 1);
        $sheet->getStyle($dataRange)->applyFromArray([
            'borders' => [
                'allBorders' => [
                    'borderStyle' => Border::BORDER_THIN,
                    'color' => ['rgb' => 'D1D5DB'],
                ],
            ],
            'alignment' => [
                'vertical' => Alignment::VERTICAL_CENTER,
            ],
        ]);
        $sheet->getStyle('A5:A' . ($rowIdx - 1))->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
        $sheet->getStyle('D5:D' . ($rowIdx - 1))->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
        $sheet->getStyle('K5:K' . ($rowIdx - 1))->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

        // Auto-fit columns
        foreach (range('A', 'L') as $col) {
            $sheet->getColumnDimension($col)->setAutoSize(true);
        }

        // Sheet 2: Daftar Kode Kecamatan (3516)
        $refSheet = $spreadsheet->createSheet();
        $refSheet->setTitle('Daftar Kode Kecamatan');

        $refSheet->setCellValue('A1', 'DAFTAR KODE KECAMATAN RESMI - BPS KABUPATEN MOJOKERTO (3516)');
        $refSheet->setCellValue('A2', 'Gunakan kolom "Kode Kecamatan BPS" saat mengisi kolom Kode Kecamatan pada Sheet Template.');
        $refSheet->getStyle('A1')->getFont()->setBold(true)->setSize(12);
        $refSheet->getStyle('A2')->getFont()->setItalic(true)->setSize(10)->getColor()->setRGB('555555');

        $refHeaders = [
            'A4' => 'No',
            'B4' => 'Kode Wilayah (3516)',
            'C4' => 'Nama Kecamatan',
            'D4' => 'Kabupaten / Kota',
        ];

        foreach ($refHeaders as $cell => $text) {
            $refSheet->setCellValue($cell, $text);
        }

        $refSheet->getStyle('A4:D4')->applyFromArray([
            'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '1E40AF']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
            'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => '003366']]],
        ]);
        $refSheet->getRowDimension(4)->setRowHeight(24);

        $districts = District::orderBy('code', 'asc')->get();
        $distIdx = 5;
        $no = 1;
        foreach ($districts as $d) {
            $refSheet->setCellValue('A' . $distIdx, $no++);
            $refSheet->setCellValueExplicit('B' . $distIdx, (string) $d->code, \PhpOffice\PhpSpreadsheet\Cell\DataType::TYPE_STRING);
            $refSheet->setCellValue('C' . $distIdx, $d->name);
            $refSheet->setCellValue('D' . $distIdx, 'Kabupaten Mojokerto (3516)');
            $distIdx++;
        }

        $refDataRange = 'A5:D' . ($distIdx - 1);
        $refSheet->getStyle($refDataRange)->applyFromArray([
            'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => 'D1D5DB']]],
            'alignment' => ['vertical' => Alignment::VERTICAL_CENTER],
        ]);
        $refSheet->getStyle('A5:A' . ($distIdx - 1))->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
        $refSheet->getStyle('B5:B' . ($distIdx - 1))->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

        foreach (['A', 'B', 'C', 'D'] as $col) {
            $refSheet->getColumnDimension($col)->setAutoSize(true);
        }

        // Return spreadsheet as binary string
        $spreadsheet->setActiveSheetIndex(0);
        $writer = new Xlsx($spreadsheet);

        ob_start();
        $writer->save('php://output');
        return (string) ob_get_clean();
    }

    /**
     * Export all mitras (with optional filters) to Excel.
     */
    public function exportMitras(array $filters = []): string
    {
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Data Mitra Statistik');

        // Header Title
        $sheet->setCellValue('A1', 'DAFTAR MITRA STATISTIK RESMI - BPS KABUPATEN MOJOKERTO');
        $sheet->setCellValue('A2', 'Diekspor pada: ' . date('d F Y, H:i') . ' WIB');
        $sheet->getStyle('A1')->getFont()->setBold(true)->setSize(14);
        $sheet->getStyle('A2')->getFont()->setItalic(true)->setSize(10)->getColor()->setRGB('555555');

        // Headers
        $headers = [
            'A4' => 'No',
            'B4' => 'SOBAT ID / Kode Mitra',
            'C4' => 'Nama Lengkap Mitra',
            'D4' => 'Kode Wilayah',
            'E4' => 'Kecamatan',
            'F4' => 'Alamat Domisili',
            'G4' => 'No. Telepon / WhatsApp',
            'H4' => 'Email',
            'I4' => 'Pekerjaan',
            'J4' => 'Posisi',
            'K4' => 'Status',
            'L4' => 'Catatan / Database',
        ];

        foreach ($headers as $cell => $text) {
            $sheet->setCellValue($cell, $text);
        }

        $sheet->getStyle('A4:L4')->applyFromArray([
            'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF'], 'size' => 11],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '005596']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
            'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => '003366']]],
        ]);
        $sheet->getRowDimension(4)->setRowHeight(26);

        // Fetch query
        $query = Mitra::with('district')->orderBy('name', 'asc');

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('mitra_code', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        if (!empty($filters['district_id'])) {
            $query->where('district_id', $filters['district_id']);
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        $mitras = $query->get();

        $rowIdx = 5;
        $no = 1;
        foreach ($mitras as $m) {
            $sheet->setCellValue('A' . $rowIdx, $no++);
            $sheet->setCellValueExplicit('B' . $rowIdx, (string) ($m->mitra_code ?? '-'), \PhpOffice\PhpSpreadsheet\Cell\DataType::TYPE_STRING);
            $sheet->setCellValue('C' . $rowIdx, $m->name);
            $sheet->setCellValueExplicit('D' . $rowIdx, (string) ($m->district?->code ?? '-'), \PhpOffice\PhpSpreadsheet\Cell\DataType::TYPE_STRING);
            $sheet->setCellValue('E' . $rowIdx, $m->district?->name ?? '-');
            $sheet->setCellValue('F' . $rowIdx, $m->address ?? '-');
            $sheet->setCellValueExplicit('G' . $rowIdx, (string) ($m->phone ?? '-'), \PhpOffice\PhpSpreadsheet\Cell\DataType::TYPE_STRING);
            $sheet->setCellValue('H' . $rowIdx, $m->email ?? '-');
            $sheet->setCellValue('I' . $rowIdx, $m->occupation ?? '-');
            $sheet->setCellValue('J' . $rowIdx, $m->position ?? '-');
            $sheet->setCellValue('K' . $rowIdx, $m->status === 'active' ? 'Aktif' : 'Nonaktif');
            $sheet->setCellValue('L' . $rowIdx, $m->notes ?? '-');

            $rowIdx++;
        }

        if ($rowIdx > 5) {
            $dataRange = 'A5:L' . ($rowIdx - 1);
            $sheet->getStyle($dataRange)->applyFromArray([
                'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => 'D1D5DB']]],
                'alignment' => ['vertical' => Alignment::VERTICAL_CENTER],
            ]);
            $sheet->getStyle('A5:A' . ($rowIdx - 1))->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet->getStyle('B5:B' . ($rowIdx - 1))->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet->getStyle('D5:D' . ($rowIdx - 1))->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet->getStyle('K5:K' . ($rowIdx - 1))->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
        }

        foreach (range('A', 'L') as $col) {
            $sheet->getColumnDimension($col)->setAutoSize(true);
        }

        $writer = new Xlsx($spreadsheet);
        ob_start();
        $writer->save('php://output');
        return (string) ob_get_clean();
    }

    /**
     * Import mitras from uploaded Excel/CSV file.
     */
    public function importMitras(UploadedFile $file, bool $updateExisting = true, ?string $defaultNotes = null): array
    {
        $spreadsheet = IOFactory::load($file->getRealPath());
        $sheet = $spreadsheet->getActiveSheet();

        $highestRow = $sheet->getHighestRow();
        $highestColumn = $sheet->getHighestColumn();
        $highestColumnIndex = Coordinate::columnIndexFromString($highestColumn);

        // Preload districts by code and by lowercase name
        $districts = District::all();
        $districtsByCode = [];
        $districtsByName = [];
        foreach ($districts as $d) {
            $cleanCode = str_pad(ltrim((string) $d->code, '0'), 3, '0', STR_PAD_LEFT);
            $districtsByCode[$cleanCode] = $d;
            $districtsByCode[(string) $d->code] = $d;
            $districtsByName[strtolower(trim($d->name))] = $d;
        }

        // Find header row (search for cell containing 'nama' or 'name')
        $headerRow = 0;
        $colMap = [];

        for ($r = 1; $r <= min(10, $highestRow); $r++) {
            for ($c = 1; $c <= $highestColumnIndex; $c++) {
                $val = strtolower(trim((string) $sheet->getCell([$c, $r])->getValue()));
                if (str_contains($val, 'nama') || str_contains($val, 'name')) {
                    $headerRow = $r;
                    break 2;
                }
            }
        }

        if ($headerRow === 0) {
            $headerRow = 4; // Fallback to standard template header row
        }

        // Map column names
        for ($c = 1; $c <= $highestColumnIndex; $c++) {
            $headerVal = strtolower(trim((string) $sheet->getCell([$c, $headerRow])->getValue()));

            if (str_contains($headerVal, 'nama lengkap') || (str_contains($headerVal, 'nama') && !str_contains($headerVal, 'kecamatan'))) {
                $colMap['name'] = $c;
            } elseif (str_contains($headerVal, 'sobat') || str_contains($headerVal, 'kode mitra') || $headerVal === 'id') {
                $colMap['mitra_code'] = $c;
            } elseif (str_contains($headerVal, 'kode kecamatan') || str_contains($headerVal, 'kec_code') || $headerVal === 'kode kec') {
                $colMap['district_code'] = $c;
            } elseif (str_contains($headerVal, 'nama kecamatan') || $headerVal === 'kecamatan') {
                $colMap['district_name'] = $c;
            } elseif (str_contains($headerVal, 'alamat')) {
                $colMap['address'] = $c;
            } elseif (str_contains($headerVal, 'hp') || str_contains($headerVal, 'telepon') || str_contains($headerVal, 'whatsapp') || str_contains($headerVal, 'phone')) {
                $colMap['phone'] = $c;
            } elseif (str_contains($headerVal, 'email')) {
                $colMap['email'] = $c;
            } elseif (str_contains($headerVal, 'pekerjaan')) {
                $colMap['occupation'] = $c;
            } elseif (str_contains($headerVal, 'posisi') || str_contains($headerVal, 'jabatan')) {
                $colMap['position'] = $c;
            } elseif (str_contains($headerVal, 'status')) {
                $colMap['status'] = $c;
            } elseif (str_contains($headerVal, 'catatan') || str_contains($headerVal, 'tahun') || str_contains($headerVal, 'notes')) {
                $colMap['notes'] = $c;
            }
        }

        // Default name column fallback if not found
        if (!isset($colMap['name'])) {
            $colMap['name'] = 3;
        }

        $imported = 0;
        $updated = 0;
        $skipped = 0;
        $errors = [];
        $totalProcessed = 0;

        DB::beginTransaction();

        try {
            for ($row = $headerRow + 1; $row <= $highestRow; $row++) {
                $name = trim((string) $sheet->getCell([$colMap['name'], $row])->getValue());

                // Skip completely empty row
                if ($name === '') {
                    continue;
                }

                $totalProcessed++;

                // Read fields
                $mitraCode = isset($colMap['mitra_code']) ? trim((string) $sheet->getCell([$colMap['mitra_code'], $row])->getValue()) : '';
                $districtCode = isset($colMap['district_code']) ? trim((string) $sheet->getCell([$colMap['district_code'], $row])->getValue()) : '';
                $districtName = isset($colMap['district_name']) ? trim((string) $sheet->getCell([$colMap['district_name'], $row])->getValue()) : '';
                $address = isset($colMap['address']) ? trim((string) $sheet->getCell([$colMap['address'], $row])->getValue()) : null;
                $phone = isset($colMap['phone']) ? trim((string) $sheet->getCell([$colMap['phone'], $row])->getValue()) : null;
                $email = isset($colMap['email']) ? trim((string) $sheet->getCell([$colMap['email'], $row])->getValue()) : null;
                $occupation = isset($colMap['occupation']) ? trim((string) $sheet->getCell([$colMap['occupation'], $row])->getValue()) : 'Mitra Statistik';
                $position = isset($colMap['position']) ? trim((string) $sheet->getCell([$colMap['position'], $row])->getValue()) : 'Pencacah (PPL)';
                $statusRaw = isset($colMap['status']) ? strtolower(trim((string) $sheet->getCell([$colMap['status'], $row])->getValue())) : 'active';
                $notes = isset($colMap['notes']) ? trim((string) $sheet->getCell([$colMap['notes'], $row])->getValue()) : null;

                if (!empty($defaultNotes) && empty($notes)) {
                    $notes = $defaultNotes;
                }

                $status = ($statusRaw === 'inactive' || $statusRaw === 'nonaktif' || $statusRaw === '0') ? 'inactive' : 'active';

                // Resolve District ID
                $districtId = null;
                if ($districtCode !== '') {
                    $cleanCode = str_pad(ltrim($districtCode, '0'), 3, '0', STR_PAD_LEFT);
                    if (isset($districtsByCode[$cleanCode])) {
                        $districtId = $districtsByCode[$cleanCode]->id;
                    } elseif (isset($districtsByCode[$districtCode])) {
                        $districtId = $districtsByCode[$districtCode]->id;
                    }
                }

                if (!$districtId && $districtName !== '') {
                    $cleanName = strtolower(trim($districtName));
                    if (isset($districtsByName[$cleanName])) {
                        $districtId = $districtsByName[$cleanName]->id;
                    }
                }

                // If district still not resolved, use first district as fallback
                if (!$districtId) {
                    $districtId = $districts->first()?->id ?? 1;
                }

                // Generate code if missing
                if ($mitraCode === '') {
                    $year = date('Y');
                    $count = Mitra::count() + $totalProcessed;
                    $mitraCode = sprintf('3516%02d%05d', substr($year, -2), $count);
                }

                // Check existing mitra by code
                $existingMitra = Mitra::where('mitra_code', $mitraCode)->first();

                if ($existingMitra) {
                    if ($updateExisting) {
                        $existingMitra->update([
                            'name' => $name,
                            'address' => $address ?: $existingMitra->address,
                            'district_id' => $districtId,
                            'phone' => $phone ?: $existingMitra->phone,
                            'email' => $email ?: $existingMitra->email,
                            'occupation' => $occupation ?: $existingMitra->occupation,
                            'position' => $position ?: $existingMitra->position,
                            'status' => $status,
                            'notes' => $notes ?: $existingMitra->notes,
                        ]);
                        $updated++;
                    } else {
                        $skipped++;
                    }
                } else {
                    Mitra::create([
                        'mitra_code' => $mitraCode,
                        'name' => $name,
                        'address' => $address,
                        'district_id' => $districtId,
                        'phone' => $phone,
                        'email' => $email,
                        'occupation' => $occupation ?: 'Mitra Statistik',
                        'position' => $position ?: 'Pencacah (PPL)',
                        'status' => $status,
                        'notes' => $notes,
                    ]);
                    $imported++;
                }
            }

            DB::commit();
        } catch (\Throwable $e) {
            DB::rollBack();
            throw $e;
        }

        return [
            'total_rows' => $totalProcessed,
            'imported' => $imported,
            'updated' => $updated,
            'skipped' => $skipped,
            'errors' => $errors,
        ];
    }
}
