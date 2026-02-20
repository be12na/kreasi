<?php
// Serve the built dist/index.html for production
// This file has higher priority than index.html on LiteSpeed/Apache
$distIndex = __DIR__ . '/dist/index.html';
if (file_exists($distIndex)) {
    readfile($distIndex);
} else {
    echo '<!DOCTYPE html><html><head><title>Build Required</title></head><body>';
    echo '<h1>Build belum tersedia</h1>';
    echo '<p>Jalankan <code>npm run build</code> terlebih dahulu.</p>';
    echo '</body></html>';
}
