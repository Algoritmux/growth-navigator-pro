<?php

declare(strict_types=1);

function getConnection(): PDO
{
    $host = getenv('DB_HOST') ?: 'localhost';
    $database = getenv('DB_DATABASE') ?: 'growth_navigator';
    $user = getenv('DB_USER') ?: 'root';
    $password = getenv('DB_PASSWORD') ?: '';
    $charset = 'utf8mb4';

    $dsn = "mysql:host={$host};dbname={$database};charset={$charset}";

    return new PDO($dsn, $user, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
}
