<?php

declare(strict_types=1);

require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/response.php';
require_once __DIR__ . '/../../config/auth.php';

applyCors();

$admin = requireAdmin();

sendJson([
    'success' => true,
    'admin' => $admin,
]);
