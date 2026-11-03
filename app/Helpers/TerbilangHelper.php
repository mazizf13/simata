<?php

namespace App\Helpers;

use Carbon\Carbon;

class TerbilangHelper
{
    private static array $units = [
        '', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'delapan', 'sembilan', 'sepuluh', 'sebelas'
    ];

    private static array $days = [
        1 => 'Senin',
        2 => 'Selasa',
        3 => 'Rabu',
        4 => 'Kamis',
        5 => 'Jumat',
        6 => 'Sabtu',
        7 => 'Minggu',
    ];

    private static array $months = [
        1 => 'Januari',
        2 => 'Februari',
        3 => 'Maret',
        4 => 'April',
        5 => 'Mei',
        6 => 'Juni',
        7 => 'Juli',
        8 => 'Agustus',
        9 => 'September',
        10 => 'Oktober',
        11 => 'November',
        12 => 'Desember',
    ];

    /**
     * Convert integer/float to Indonesian words (e.g. 728000 => Tujuh Ratus Dua Puluh Delapan Ribu Rupiah).
     */
    public static function rupiah(float|int $number): string
    {
        $words = self::spell((int) $number);
        $clean = trim(preg_replace('/\s+/', ' ', $words));

        if (empty($clean)) {
            return 'Nol Rupiah';
        }

        return ucwords($clean) . ' Rupiah';
    }

    /**
     * Recursively convert integer to Indonesian words.
     */
    public static function spell(int $number): string
    {
        $number = abs($number);

        if ($number < 12) {
            return self::$units[$number];
        }

        if ($number < 20) {
            return self::spell($number - 10) . ' belas';
        }

        if ($number < 100) {
            return self::spell((int) ($number / 10)) . ' puluh ' . self::spell($number % 10);
        }

        if ($number < 200) {
            return 'seratus ' . self::spell($number - 100);
        }

        if ($number < 1000) {
            return self::spell((int) ($number / 100)) . ' ratus ' . self::spell($number % 100);
        }

        if ($number < 2000) {
            return 'seribu ' . self::spell($number - 1000);
        }

        if ($number < 1000000) {
            return self::spell((int) ($number / 1000)) . ' ribu ' . self::spell($number % 1000);
        }

        if ($number < 1000000000) {
            return self::spell((int) ($number / 1000000)) . ' juta ' . self::spell($number % 1000000);
        }

        if ($number < 1000000000000) {
            return self::spell((int) ($number / 1000000000)) . ' milyar ' . self::spell($number % 1000000000);
        }

        return self::spell((int) ($number / 1000000000000)) . ' triliun ' . self::spell($number % 1000000000000);
    }

    /**
     * Get day name in Indonesian (e.g. Rabu).
     */
    public static function dayName(string|Carbon $date): string
    {
        $carbon = $date instanceof Carbon ? $date : Carbon::parse($date);
        return self::$days[$carbon->dayOfWeekIso] ?? '';
    }

    /**
     * Get month name in Indonesian (e.g. September).
     */
    public static function monthName(string|Carbon $date): string
    {
        $carbon = $date instanceof Carbon ? $date : Carbon::parse($date);
        return self::$months[$carbon->month] ?? '';
    }

    /**
     * Format full legal contract date in words:
     * e.g. "rabu tanggal tiga puluh, bulan september, tahun dua ribu dua puluh enam"
     */
    public static function legalDateClause(string|Carbon $date): string
    {
        $carbon = $date instanceof Carbon ? $date : Carbon::parse($date);
        
        $dayName = strtolower(self::dayName($carbon));
        $dayNumberWords = strtolower(trim(self::spell($carbon->day)));
        $monthName = strtolower(self::monthName($carbon));
        $yearWords = strtolower(trim(self::spell($carbon->year)));

        return "{$dayName} tanggal {$dayNumberWords}, bulan {$monthName}, tahun {$yearWords}";
    }
}
