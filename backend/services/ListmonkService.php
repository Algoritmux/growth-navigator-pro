<?php

declare(strict_types=1);

class ListmonkService
{
    private array $config;

    public function __construct()
    {
        $configPath = __DIR__ . '/../config/listmonk.php';

        if (!file_exists($configPath)) {
            throw new RuntimeException('Configuração do Listmonk não encontrada.');
        }

        $config = require $configPath;

        if (!is_array($config) || empty($config['enabled'])) {
            throw new RuntimeException('Integração com Listmonk desativada.');
        }

        $this->config = $config;
    }

    public function createCampaignDraft(array $payload): array
    {
        return $this->request('POST', '/api/campaigns', $payload);
    }

    private function request(string $method, string $path, array $payload = []): array
    {
        $baseUrl = rtrim((string) ($this->config['base_url'] ?? ''), '/');
        $username = (string) ($this->config['username'] ?? '');
        $password = (string) ($this->config['password'] ?? '');

        if ($baseUrl === '' || $username === '' || $password === '') {
            throw new RuntimeException('Configuração do Listmonk incompleta.');
        }

        $url = $baseUrl . $path;

        $headers = [
            'Content-Type: application/json',
            'Accept: application/json',
            'Authorization: Basic ' . base64_encode($username . ':' . $password),
        ];

        $body = json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

        if ($body === false) {
            throw new RuntimeException('Erro ao preparar payload para o Listmonk.');
        }

        if (!function_exists('curl_init')) {
            throw new RuntimeException('cURL não está disponível no servidor.');
        }

        $curl = curl_init($url);

        curl_setopt_array($curl, [
            CURLOPT_CUSTOMREQUEST => $method,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => $headers,
            CURLOPT_POSTFIELDS => $body,
            CURLOPT_TIMEOUT => 15,
        ]);

        $responseBody = curl_exec($curl);
        $statusCode = (int) curl_getinfo($curl, CURLINFO_HTTP_CODE);

        if ($responseBody === false) {
            $error = curl_error($curl);
            curl_close($curl);
            throw new RuntimeException($error !== '' ? $error : 'Erro desconhecido ao chamar Listmonk.');
        }

        curl_close($curl);

        $decoded = json_decode((string) $responseBody, true);

        if ($statusCode < 200 || $statusCode >= 300) {
            $message = is_array($decoded)
                ? json_encode($decoded, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)
                : (string) $responseBody;

            throw new RuntimeException("Erro Listmonk HTTP {$statusCode}: {$message}");
        }

        return is_array($decoded) ? $decoded : [];
    }
}