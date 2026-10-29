<?php

declare(strict_types=1);

final class MailerService
{
    private array $config;

    public function __construct()
    {
        $configPath = __DIR__ . '/../config/mail.php';
        $examplePath = __DIR__ . '/../config/mail.example.php';
        $this->config = require file_exists($configPath) ? $configPath : $examplePath;
    }

    public function isEnabled(): bool
    {
        return (bool) ($this->config['enabled'] ?? false);
    }

    public function sendLeadNotification(array $lead): bool
    {
        if (!$this->isEnabled()) {
            return false;
        }

        $subject = $this->subject('Novo lead recebido');
        $body = $this->buildBody([
            'Tipo' => 'Lead',
            'Nome' => (string) ($lead['name'] ?? ''),
            'E-mail' => (string) ($lead['email'] ?? ''),
            'Telefone' => (string) ($lead['phone'] ?? ''),
            'Servico' => (string) ($lead['service'] ?? ''),
            'Origem' => (string) ($lead['source'] ?? ''),
            'Aceita marketing' => !empty($lead['marketing_opt_in']) ? 'Sim' : 'Nao',
            'Mensagem' => (string) ($lead['message'] ?? ''),
        ]);

        return $this->sendToAdmin($subject, $body);
    }

    public function sendNewsletterNotification(array $subscriber): bool
    {
        if (!$this->isEnabled()) {
            return false;
        }

        $subject = $this->subject('Nova inscricao na newsletter');
        $body = $this->buildBody([
            'Tipo' => 'Newsletter',
            'Nome' => (string) ($subscriber['name'] ?? ''),
            'E-mail' => (string) ($subscriber['email'] ?? ''),
            'Origem' => (string) ($subscriber['source'] ?? ''),
        ]);

        return $this->sendToAdmin($subject, $body);
    }

    private function subject(string $subject): string
    {
        $prefix = trim((string) ($this->config['subject_prefix'] ?? ''));

        return $prefix !== '' ? "{$prefix} {$subject}" : $subject;
    }

    private function buildBody(array $fields): string
    {
        $lines = [];

        foreach ($fields as $label => $value) {
            $lines[] = "{$label}: " . ($value !== '' ? $value : '-');
        }

        $lines[] = 'Recebido em: ' . date('d/m/Y H:i:s');

        return implode("\r\n", $lines);
    }

    private function sendToAdmin(string $subject, string $body): bool
    {
        $toEmail = trim((string) ($this->config['admin_email'] ?? ''));

        if ($toEmail === '') {
            return false;
        }

        return $this->sendSmtp($toEmail, $subject, $body);
    }

    private function sendSmtp(string $toEmail, string $subject, string $body): bool
    {
        $host = (string) ($this->config['host'] ?? '');
        $port = (int) ($this->config['port'] ?? 587);
        $encryption = strtolower((string) ($this->config['encryption'] ?? 'tls'));
        $username = (string) ($this->config['username'] ?? '');
        $password = (string) ($this->config['password'] ?? '');
        $fromEmail = (string) ($this->config['from_email'] ?? $username);
        $fromName = (string) ($this->config['from_name'] ?? 'Growth Navigator Pro');

        if ($host === '' || $username === '' || $password === '' || $fromEmail === '') {
            return false;
        }

        $remote = $encryption === 'ssl' ? "ssl://{$host}:{$port}" : "{$host}:{$port}";
        $socket = @stream_socket_client($remote, $errno, $errstr, 20);

        if (!$socket) {
            throw new RuntimeException("Nao foi possivel conectar ao SMTP: {$errstr}");
        }

        try {
            $this->expect($socket, [220]);
            $this->command($socket, 'EHLO localhost', [250]);

            if ($encryption === 'tls') {
                $this->command($socket, 'STARTTLS', [220]);

                if (!stream_socket_enable_crypto($socket, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) {
                    throw new RuntimeException('Nao foi possivel iniciar TLS no SMTP.');
                }

                $this->command($socket, 'EHLO localhost', [250]);
            }

            $this->command($socket, 'AUTH LOGIN', [334]);
            $this->command($socket, base64_encode($username), [334]);
            $this->command($socket, base64_encode($password), [235]);
            $this->command($socket, "MAIL FROM:<{$fromEmail}>", [250]);
            $this->command($socket, "RCPT TO:<{$toEmail}>", [250, 251]);
            $this->command($socket, 'DATA', [354]);

            $headers = [
                'MIME-Version: 1.0',
                'Content-Type: text/plain; charset=UTF-8',
                'Content-Transfer-Encoding: 8bit',
                'From: ' . $this->formatAddress($fromEmail, $fromName),
                'To: <' . $toEmail . '>',
                'Subject: ' . $this->encodeHeader($subject),
            ];

            fwrite($socket, implode("\r\n", $headers) . "\r\n\r\n" . $body . "\r\n.\r\n");
            $this->expect($socket, [250]);
            $this->command($socket, 'QUIT', [221]);

            return true;
        } finally {
            fclose($socket);
        }
    }

    private function formatAddress(string $email, string $name): string
    {
        $name = trim($name);

        return $name !== '' ? $this->encodeHeader($name) . " <{$email}>" : "<{$email}>";
    }

    private function encodeHeader(string $value): string
    {
        return '=?UTF-8?B?' . base64_encode($value) . '?=';
    }

    private function command($socket, string $command, array $expectedCodes): string
    {
        fwrite($socket, $command . "\r\n");

        return $this->expect($socket, $expectedCodes);
    }

    private function expect($socket, array $expectedCodes): string
    {
        $response = '';

        while (($line = fgets($socket, 515)) !== false) {
            $response .= $line;

            if (strlen($line) >= 4 && $line[3] === ' ') {
                break;
            }
        }

        $code = (int) substr($response, 0, 3);

        if (!in_array($code, $expectedCodes, true)) {
            throw new RuntimeException('Resposta inesperada do SMTP: ' . trim($response));
        }

        return $response;
    }
}
