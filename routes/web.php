<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes (Single Page Application Shell)
|--------------------------------------------------------------------------
| All web routes outside /api are forwarded to the React Single Page App.
*/

Route::get('/{any}', function () {
    return view('app');
})->where('any', '^(?!api).*$');
