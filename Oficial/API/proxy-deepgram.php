<?php
// ============================================
// PROXY PARA API DEEPGRAM
// ============================================
// Resolve problemas de CORS fazendo a requisição server-side
// Endpoint: /API/proxy-deepgram.php?user_id={user_id}
// ============================================

// Headers CORS para permitir todas as origens
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Accept, Origin');
header('Content-Type: application/json; charset=utf-8');

// Responder OPTIONS (preflight request)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Validar parâmetro user_id
if (!isset($_GET['user_id']) || empty($_GET['user_id'])) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => 'Parâmetro user_id é obrigatório'
    ]);
    exit();
}

$userId = $_GET['user_id'];

// URL da API Deepgram
$apiUrl = "https://www.deepgram.online/api/get-following?user_id=" . urlencode($userId);

// Fazer requisição via cURL
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $apiUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Accept: application/json',
    'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

// Verificar erros
if ($error) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Erro ao fazer requisição: ' . $error
    ]);
    exit();
}

// Retornar resposta da API
http_response_code($httpCode);
echo $response;
