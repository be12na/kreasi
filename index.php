<?php
// Serve the built dist/index.html for production (cPanel/LiteSpeed)
// This file takes priority since index.html is removed from git
$distIndex = __DIR__ . '/dist/index.html';
if (file_exists($distIndex)) {
    // Read & fix asset paths: /kreasi/assets/ -> /kreasi/dist/assets/
    $html = file_get_contents($distIndex);
    $html = str_replace('/kreasi/assets/', '/kreasi/dist/assets/', $html);
    echo $html;
} else {
    http_response_code(503);
    echo '<!DOCTYPE html><html><head><title>Build Required</title></head><body>';
    echo '<h1>Build belum tersedia</h1>';
    echo '<p>Jalankan <code>npm run build</code> terlebih dahulu.</p>';
    echo '</body></html>';
}
