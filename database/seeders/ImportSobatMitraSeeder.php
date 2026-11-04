<?php

namespace Database\Seeders;

use App\Models\District;
use App\Models\Mitra;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ImportSobatMitraSeeder extends Seeder
{
    /**
     * Run the database seed to import 100 SOBAT Mitras of BPS Kabupaten Mojokerto.
     */
    public function run(): void
    {
        $rawMitras = [
            ['no' => 1, 'name' => 'akhmad agus sulthoni', 'sobat_id' => '351624100168', 'kec_code' => '010'],
            ['no' => 2, 'name' => 'adinda regita putri', 'sobat_id' => '351622020139', 'kec_code' => '091'],
            ['no' => 3, 'name' => 'agus alim', 'sobat_id' => '351622010061', 'kec_code' => '080'],
            ['no' => 4, 'name' => 'ahmad junaidi', 'sobat_id' => '351622090998', 'kec_code' => '040'],
            ['no' => 5, 'name' => 'akhmad virdaus prasetyo', 'sobat_id' => '351622010062', 'kec_code' => '060'],
            ['no' => 6, 'name' => 'ana yupitasari', 'sobat_id' => '351622090462', 'kec_code' => '050'],
            ['no' => 7, 'name' => 'anggraini hidayathi', 'sobat_id' => '351622020136', 'kec_code' => '040'],
            ['no' => 8, 'name' => 'arief aji sasmito', 'sobat_id' => '351622090079', 'kec_code' => '080'],
            ['no' => 9, 'name' => 'arifatul khumaidah', 'sobat_id' => '351623030029', 'kec_code' => '160'],
            ['no' => 10, 'name' => 'awalludin firman andriansyah', 'sobat_id' => '351622090358', 'kec_code' => '140'],
            ['no' => 11, 'name' => 'binti khuzaimah', 'sobat_id' => '351622010004', 'kec_code' => '120'],
            ['no' => 12, 'name' => 'darna ayunda', 'sobat_id' => '351622091076', 'kec_code' => '170'],
            ['no' => 13, 'name' => 'dewi rahmawati', 'sobat_id' => '351622090186', 'kec_code' => '060'],
            ['no' => 14, 'name' => 'dhea fitri ismaya', 'sobat_id' => '351622010102', 'kec_code' => '150'],
            ['no' => 15, 'name' => 'dian novita sari', 'sobat_id' => '351623030065', 'kec_code' => '090'],
            ['no' => 16, 'name' => 'dian rokhmawati', 'sobat_id' => '351622010027', 'kec_code' => '080'],
            ['no' => 17, 'name' => 'dicka virdiansyah', 'sobat_id' => '351622090215', 'kec_code' => '020'],
            ['no' => 18, 'name' => 'diesna ari ubaya', 'sobat_id' => '351622020077', 'kec_code' => '160'],
            ['no' => 19, 'name' => 'dina retno anggraeni', 'sobat_id' => '351622020154', 'kec_code' => '160'],
            ['no' => 20, 'name' => 'dinda ayu kusumawati', 'sobat_id' => '351622090038', 'kec_code' => '160'],
            ['no' => 21, 'name' => 'dini dwi puspitasari', 'sobat_id' => '351622010010', 'kec_code' => '130'],
            ['no' => 22, 'name' => 'dwi ratnawati', 'sobat_id' => '351622020065', 'kec_code' => '090'],
            ['no' => 23, 'name' => 'dzurotun nasikah', 'sobat_id' => '351622020119', 'kec_code' => '060'],
            ['no' => 24, 'name' => 'eli sulis setiyowati', 'sobat_id' => '351623080002', 'kec_code' => '120'],
            ['no' => 25, 'name' => 'endang purwati ningsih', 'sobat_id' => '351622091053', 'kec_code' => '170'],
            ['no' => 26, 'name' => 'erlita febri anjarsari', 'sobat_id' => '351622091017', 'kec_code' => '170'],
            ['no' => 27, 'name' => 'riski fatmala', 'sobat_id' => '351622010074', 'kec_code' => '140'],
            ['no' => 28, 'name' => 'etin puspita sari', 'sobat_id' => '351622020049', 'kec_code' => '130'],
            ['no' => 29, 'name' => 'evi novita ningtiyas', 'sobat_id' => '351622090552', 'kec_code' => '030'],
            ['no' => 30, 'name' => 'ferisa dwi alfia meisty', 'sobat_id' => '351624100135', 'kec_code' => '130'],
            ['no' => 31, 'name' => 'fitrika mei darwanti', 'sobat_id' => '351622090681', 'kec_code' => '080'],
            ['no' => 32, 'name' => 'ihsan fermantono', 'sobat_id' => '351624100119', 'kec_code' => '130'],
            ['no' => 33, 'name' => 'ika khurotul afidah', 'sobat_id' => '351622090193', 'kec_code' => '050'],
            ['no' => 34, 'name' => 'ika lestari', 'sobat_id' => '351622090697', 'kec_code' => '040'],
            ['no' => 35, 'name' => 'indah novita sari', 'sobat_id' => '351622020138', 'kec_code' => '010'],
            ['no' => 36, 'name' => 'inna fatikhatul khasanah', 'sobat_id' => '351622090689', 'kec_code' => '020'],
            ['no' => 37, 'name' => 'innayatu soviyah', 'sobat_id' => '351622090305', 'kec_code' => '120'],
            ['no' => 38, 'name' => 'irawati', 'sobat_id' => '351622090494', 'kec_code' => '030'],
            ['no' => 39, 'name' => 'irawati', 'sobat_id' => '351624100012', 'kec_code' => '160'],
            ['no' => 40, 'name' => 'ita nur indayani', 'sobat_id' => '351622010076', 'kec_code' => '140'],
            ['no' => 41, 'name' => 'kariyo', 'sobat_id' => '351623110151', 'kec_code' => '070'],
            ['no' => 42, 'name' => 'kasmi\'ah', 'sobat_id' => '351622030019', 'kec_code' => '030'],
            ['no' => 43, 'name' => 'khoirul anam', 'sobat_id' => '351623030244', 'kec_code' => '170'],
            ['no' => 44, 'name' => 'khoirul jazil', 'sobat_id' => '351622090177', 'kec_code' => '050'],
            ['no' => 45, 'name' => 'khurin in amalia', 'sobat_id' => '351623110212', 'kec_code' => '090'],
            ['no' => 46, 'name' => 'kiki astutik', 'sobat_id' => '351622020064', 'kec_code' => '100'],
            ['no' => 47, 'name' => 'laily maulidiyah', 'sobat_id' => '351622090231', 'kec_code' => '120'],
            ['no' => 48, 'name' => 'lukman hakim', 'sobat_id' => '351622090100', 'kec_code' => '080'],
            ['no' => 49, 'name' => 'mamik yustini', 'sobat_id' => '351622010070', 'kec_code' => '091'],
            ['no' => 50, 'name' => 'mardiyana mulyaningrum', 'sobat_id' => '351622090049', 'kec_code' => '080'],
            ['no' => 51, 'name' => 'mohamad lutfi fatkur rohmat', 'sobat_id' => '351624100214', 'kec_code' => '090'],
            ['no' => 52, 'name' => 'mohamad mustofa', 'sobat_id' => '351623030250', 'kec_code' => '170'],
            ['no' => 53, 'name' => 'mu\'awalin', 'sobat_id' => '351623020005', 'kec_code' => '170'],
            ['no' => 54, 'name' => 'musrifah', 'sobat_id' => '351622020133', 'kec_code' => '020'],
            ['no' => 55, 'name' => 'naning sriwahyuni', 'sobat_id' => '351622010016', 'kec_code' => '110'],
            ['no' => 56, 'name' => 'nasifah', 'sobat_id' => '351622020062', 'kec_code' => '050'],
            ['no' => 57, 'name' => 'neni dwita kirana', 'sobat_id' => '351622090879', 'kec_code' => '080'],
            ['no' => 58, 'name' => 'niken susiwati', 'sobat_id' => '351622091320', 'kec_code' => '070'],
            ['no' => 59, 'name' => 'nindya ayu ambarwati', 'sobat_id' => '351622090197', 'kec_code' => '100'],
            ['no' => 60, 'name' => 'novi dwi arisandi', 'sobat_id' => '351624100156', 'kec_code' => '060'],
            ['no' => 61, 'name' => 'nur khumairoh rokhmahwati', 'sobat_id' => '351622090884', 'kec_code' => '050'],
            ['no' => 62, 'name' => 'nuriyanti', 'sobat_id' => '351622030010', 'kec_code' => '030'],
            ['no' => 63, 'name' => 'nurul hidayah', 'sobat_id' => '351622020135', 'kec_code' => '150'],
            ['no' => 64, 'name' => 'nurviana wulandari', 'sobat_id' => '351623110031', 'kec_code' => '130'],
            ['no' => 65, 'name' => 'pipit nurlia nita sari', 'sobat_id' => '351624100025', 'kec_code' => '050'],
            ['no' => 66, 'name' => 'pramita ayu ariyanti', 'sobat_id' => '351622091215', 'kec_code' => '060'],
            ['no' => 67, 'name' => 'praptoadi', 'sobat_id' => '351622010032', 'kec_code' => '070'],
            ['no' => 68, 'name' => 'putri ambarwati', 'sobat_id' => '351622020051', 'kec_code' => '170'],
            ['no' => 69, 'name' => 'qurrotul aini', 'sobat_id' => '351623030011', 'kec_code' => '130'],
            ['no' => 70, 'name' => 'rahayu maria ulfa', 'sobat_id' => '351622090727', 'kec_code' => '150'],
            ['no' => 71, 'name' => 'retno wulandari', 'sobat_id' => '351622030018', 'kec_code' => '050'],
            ['no' => 72, 'name' => 'rina ekawati', 'sobat_id' => '351623030120', 'kec_code' => '170'],
            ['no' => 73, 'name' => 'ririn sriastutik', 'sobat_id' => '351622090858', 'kec_code' => '080'],
            ['no' => 74, 'name' => 'ririn sugiarti', 'sobat_id' => '351622090910', 'kec_code' => '110'],
            ['no' => 75, 'name' => 'saddam hussein', 'sobat_id' => '351622090347', 'kec_code' => '030'],
            ['no' => 76, 'name' => 'sari sumardianti', 'sobat_id' => '351622020030', 'kec_code' => '150'],
            ['no' => 77, 'name' => 'setyowati nurjayanti', 'sobat_id' => '351623030170', 'kec_code' => '100'],
            ['no' => 78, 'name' => 'sih widhi ganesa melu', 'sobat_id' => '351622010094', 'kec_code' => '020'],
            ['no' => 79, 'name' => 'sinta mardiana', 'sobat_id' => '351622010048', 'kec_code' => '100'],
            ['no' => 80, 'name' => 'siti asiyah', 'sobat_id' => '351625050001', 'kec_code' => '020'],
            ['no' => 81, 'name' => 'sofiyah ulfa listiyorini', 'sobat_id' => '351623110115', 'kec_code' => '030'],
            ['no' => 82, 'name' => 'sri arningsih', 'sobat_id' => '351622020015', 'kec_code' => '170'],
            ['no' => 83, 'name' => 'sri danarti', 'sobat_id' => '351622070004', 'kec_code' => '020'],
            ['no' => 84, 'name' => 'sri purwati', 'sobat_id' => '351622090582', 'kec_code' => '160'],
            ['no' => 85, 'name' => 'sri purwoningsih', 'sobat_id' => '351622091424', 'kec_code' => '160'],
            ['no' => 86, 'name' => 'sulistiyowati', 'sobat_id' => '351622090982', 'kec_code' => '091'],
            ['no' => 87, 'name' => 'suprapti', 'sobat_id' => '351622090881', 'kec_code' => '090'],
            ['no' => 88, 'name' => 'suryatining widiarti', 'sobat_id' => '351622010042', 'kec_code' => '070'],
            ['no' => 89, 'name' => 'totok budi santoso', 'sobat_id' => '351622090042', 'kec_code' => '160'],
            ['no' => 90, 'name' => 'tuminingsih', 'sobat_id' => '351622020007', 'kec_code' => '170'],
            ['no' => 91, 'name' => 'Salsabila Najmi Nuha', 'sobat_id' => '351624100175', 'kec_code' => '130'],
            ['no' => 92, 'name' => 'umrotin lina fiati', 'sobat_id' => '351622010086', 'kec_code' => '130'],
            ['no' => 93, 'name' => 'wanikmatin', 'sobat_id' => '351622020043', 'kec_code' => '030'],
            ['no' => 94, 'name' => 'windi gading apriliyani', 'sobat_id' => '351622010069', 'kec_code' => '110'],
            ['no' => 95, 'name' => 'Wiwik Ulfatun Nikmah', 'sobat_id' => '351622090546', 'kec_code' => '160'],
            ['no' => 96, 'name' => 'wuni ifada amaliyah', 'sobat_id' => '351622010020', 'kec_code' => '130'],
            ['no' => 97, 'name' => 'yeni andriani fransischa', 'sobat_id' => '351622090965', 'kec_code' => '010'],
            ['no' => 98, 'name' => 'yeni febri safitri', 'sobat_id' => '351622090017', 'kec_code' => '170'],
            ['no' => 99, 'name' => 'yuhana putri setiawan', 'sobat_id' => '351622010025', 'kec_code' => '060'],
            ['no' => 100, 'name' => 'zakia indira syahda taufikalloh', 'sobat_id' => '351625050005', 'kec_code' => '160'],
        ];

        // Fetch all districts mapped by BPS code (e.g. '3516010' or '010')
        $districts = District::all()->keyBy('code');

        DB::transaction(function () use ($rawMitras, $districts) {
            foreach ($rawMitras as $item) {
                $fullKecCode = '3516' . str_pad($item['kec_code'], 3, '0', STR_PAD_LEFT);
                $district = $districts->get($fullKecCode);

                if (!$district) {
                    // Try fallback without 3516 prefix just in case
                    $district = District::where('code', 'like', "%{$item['kec_code']}")->first();
                }

                if (!$district) {
                    throw new \RuntimeException("Kecamatan dengan kode {$item['kec_code']} ({$fullKecCode}) tidak ditemukan.");
                }

                // Format Name nicely with Title Case
                $formattedName = ucwords(strtolower(trim($item['name'])));

                Mitra::updateOrCreate(
                    ['mitra_code' => $item['sobat_id']],
                    [
                        'name' => $formattedName,
                        'district_id' => $district->id,
                        'address' => "Kecamatan {$district->name}, Kabupaten Mojokerto",
                        'occupation' => 'Pencacah Lapangan',
                        'position' => 'Mitra Statistik',
                        'status' => 'active',
                        'notes' => 'Diimpor dari data resmi mitra SOBAT BPS Kabupaten Mojokerto.',
                    ]
                );
            }
        });
    }
}
