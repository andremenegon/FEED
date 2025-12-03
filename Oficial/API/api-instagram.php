<?php

// API para buscar múltiplos dados do Instagram
// Usa Instagram Scraper Stable API (POST) - API mais completa e estável

// Tratamento de erros
error_reporting(E_ALL);
ini_set('display_errors', 0); // Não mostrar erros na tela, apenas no JSON
ini_set('max_execution_time', 60); // Reduzido para 1 minuto (suficiente com paralelismo otimizado)

// Headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// Função para retornar erro JSON
function returnError($message, $code = 500) {
    http_response_code($code);
    echo json_encode([
        'error' => true,
        'message' => $message,
        'timestamp' => date('c')
    ], JSON_PRETTY_PRINT);
    exit;
}

// Capturar erros fatais
register_shutdown_function(function() {
    $error = error_get_last();
    if ($error !== NULL && in_array($error['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR])) {
        http_response_code(500);
        echo json_encode([
            'error' => true,
            'message' => 'Erro fatal no servidor',
            'error_type' => $error['type'],
            'error_message' => $error['message'],
            'error_file' => $error['file'],
            'error_line' => $error['line']
        ], JSON_PRETTY_PRINT);
    }
});

$username = $_GET['username'] ?? 'mrbeast';
$rapidApiKey = '59edc28b5fmsh2717d54fd8ca02cp137bf3jsn3ddd0bb7e847';

// Permitir escolher API via parâmetro (padrão: scraper)
$apiType = $_GET['api'] ?? 'scraper'; // 'scraper' (padrão), 'social' ou 'plagio'

// Verificar se é requisição batch de posts
$isBatchPosts = isset($_GET['batch_posts']) && $_GET['batch_posts'] === 'true';
$batchUsernames = isset($_GET['usernames']) ? explode(',', $_GET['usernames']) : [];

// Configuração das APIs
$apiConfig = [
    'social' => [
        'host' => 'instagram-social-api.p.rapidapi.com',
        'method' => 'GET'
    ],
    'scraper' => [
        'host' => 'instagram-scraper-stable-api.p.rapidapi.com',
        'method' => 'POST'
    ],
    'plagio' => [
        'host' => 'api.hikerapi.com',
        'api_key' => 'w46il1jfubi68wdnkci4m1i0udru9zdc',
        'method' => 'GET'
    ]
];

$currentApi = $apiConfig[$apiType] ?? $apiConfig['scraper'];
$rapidApiHost = $currentApi['host'] ?? null;
$plagioApiKey = $apiConfig['plagio']['api_key'] ?? null;

$apiNames = [
    'social' => 'Instagram Social API',
    'scraper' => 'Instagram Scraper Stable API',
    'plagio' => 'API Plágio'
];

$results = [
    'username' => $username,
    'api_type' => $apiType,
    'api_name' => $apiNames[$apiType] ?? 'Instagram Scraper Stable API',
    'timestamp' => date('c'),
    'requests' => []
];

// Função para fazer requisição GET
function makeRequestGET($endpoint, $params = []) {
    global $rapidApiKey, $rapidApiHost, $apiType, $plagioApiKey;
    
    $url = "https://{$rapidApiHost}{$endpoint}";
    if (!empty($params)) {
        $url .= '?' . http_build_query($params);
    }
    
    // Headers diferentes para API Plágio
    $headers = [];
    if ($apiType === 'plagio') {
        $headers = [
            "x-access-key: {$plagioApiKey}",
            "Accept: application/json",
            "Accept-Encoding: gzip, deflate"
        ];
    } else {
        $headers = [
            "x-rapidapi-host: {$rapidApiHost}",
            "x-rapidapi-key: {$rapidApiKey}",
            "Accept-Encoding: gzip, deflate"
        ];
    }
    
    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL => $url,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_ENCODING => "gzip,deflate", // Compressão HTTP
        CURLOPT_MAXREDIRS => 5,
        CURLOPT_TIMEOUT => 10, // Reduzido para 10 segundos (máxima velocidade)
        CURLOPT_CONNECTTIMEOUT => 3, // Timeout de conexão: 3 segundos (máxima velocidade)
        CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
        CURLOPT_CUSTOMREQUEST => "GET",
        CURLOPT_HTTPHEADER => $headers,
        CURLOPT_FRESH_CONNECT => true,
        CURLOPT_FORBID_REUSE => true,
    ]);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $err = curl_error($ch);
    curl_close($ch);
    
    // Verificar se a resposta é JSON válido
    $jsonData = null;
    $jsonError = null;
    
    if ($response) {
        $jsonData = json_decode($response, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            $jsonError = json_last_error_msg();
            // Se não for JSON, pode ser HTML de erro
            if (strpos($response, '<html') !== false || strpos($response, '<!DOCTYPE') !== false) {
                $jsonError = "Resposta HTML recebida (possível erro da API). Primeiros 200 caracteres: " . substr($response, 0, 200);
            } else {
                $jsonError = "JSON inválido: " . $jsonError . ". Resposta: " . substr($response, 0, 200);
            }
        }
    }
    
    return [
        'success' => !$err && $httpCode === 200 && $jsonData !== null,
        'data' => $jsonData,
        'error' => $err ?: ($httpCode !== 200 ? "HTTP {$httpCode}" : $jsonError),
        'http_code' => $httpCode,
        'raw_response' => $response ? substr($response, 0, 500) : null // Para debug
    ];
}

// API Plágio (HikerAPI) - Requisições em PARALELO para acelerar
if ($apiType === 'plagio') {
    
    // Se for batch de posts, processar separadamente
    if ($isBatchPosts && !empty($batchUsernames)) {
        try {
            // Limitar a 25 usuários
            $usernames = array_slice($batchUsernames, 0, 25);
            error_log("Batch posts request: " . count($usernames) . " usuários");
            
            // Buscar posts de cada usuário em paralelo
            $multiHandle = curl_multi_init();
            if (defined('CURLMOPT_PIPELINING') && defined('CURLPIPE_MULTIPLEX')) {
                curl_multi_setopt($multiHandle, CURLMOPT_PIPELINING, CURLPIPE_MULTIPLEX);
            }
            
            $curlHandles = [];
            $userIds = [];
            
            // Primeiro, buscar todos os user_ids em paralelo
            foreach ($usernames as $uname) {
                $uname = trim($uname);
                if (empty($uname)) continue;
                
                $url = "https://{$rapidApiHost}/v1/user/by/username?username=" . urlencode($uname);
                $ch = curl_init();
                curl_setopt_array($ch, [
                    CURLOPT_URL => $url,
                    CURLOPT_RETURNTRANSFER => true,
                    CURLOPT_ENCODING => "gzip,deflate",
                    CURLOPT_TIMEOUT => 10,
                    CURLOPT_CONNECTTIMEOUT => 3,
                    CURLOPT_HTTPHEADER => [
                        "x-access-key: {$plagioApiKey}",
                        "Accept: application/json",
                        "Accept-Encoding: gzip, deflate"
                    ],
                ]);
                
                curl_multi_add_handle($multiHandle, $ch);
                $curlHandles[$uname] = ['handle' => $ch, 'type' => 'user'];
            }
            
            // Executar requisições de user_id
            $running = null;
            do {
                curl_multi_exec($multiHandle, $running);
                if ($running > 0) {
                    usleep(1000);
                }
            } while ($running > 0);
            
            // Processar user_ids e buscar posts
            foreach ($curlHandles as $uname => $data) {
                $ch = $data['handle'];
                $response = curl_multi_getcontent($ch);
                $jsonData = json_decode($response, true);
                
                if ($jsonData && isset($jsonData['pk'])) {
                    $userIds[$uname] = $jsonData['pk'];
                }
                
                curl_multi_remove_handle($multiHandle, $ch);
                curl_close($ch);
            }
            
            // Agora buscar posts de cada usuário em paralelo
            $curlHandles = [];
            foreach ($userIds as $uname => $userId) {
                $url = "https://{$rapidApiHost}/v1/user/medias/chunk?user_id=" . urlencode($userId);
                $ch = curl_init();
                curl_setopt_array($ch, [
                    CURLOPT_URL => $url,
                    CURLOPT_RETURNTRANSFER => true,
                    CURLOPT_ENCODING => "gzip,deflate",
                    CURLOPT_TIMEOUT => 10,
                    CURLOPT_CONNECTTIMEOUT => 3,
                    CURLOPT_HTTPHEADER => [
                        "x-access-key: {$plagioApiKey}",
                        "Accept: application/json",
                        "Accept-Encoding: gzip, deflate"
                    ],
                ]);
                
                curl_multi_add_handle($multiHandle, $ch);
                $curlHandles[$uname] = ['handle' => $ch, 'type' => 'posts'];
            }
            
            // Executar requisições de posts
            $running = null;
            do {
                curl_multi_exec($multiHandle, $running);
                if ($running > 0) {
                    usleep(1000);
                }
            } while ($running > 0);
            
            // Processar resultados
            $batchResults = [];
            foreach ($curlHandles as $uname => $data) {
                $ch = $data['handle'];
                $response = curl_multi_getcontent($ch);
                $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
                $err = curl_error($ch);
                
                curl_multi_remove_handle($multiHandle, $ch);
                curl_close($ch);
                
                $jsonData = null;
                if ($response) {
                    $jsonData = json_decode($response, true);
                }
                
                $post = null;
                if (!$err && $httpCode === 200 && $jsonData) {
                    if (is_array($jsonData) && count($jsonData) > 0) {
                        $post = $jsonData[0]; // Primeiro post
                    }
                }
                
                $batchResults[] = [
                    'username' => $uname,
                    'success' => $post !== null,
                    'post' => $post,
                    'error' => $post === null ? ($err ?: "HTTP {$httpCode}") : null
                ];
            }
            
            curl_multi_close($multiHandle);
            
            // Retornar resultados do batch
            echo json_encode([
                'batch_results' => $batchResults,
                'timestamp' => date('c')
            ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
            exit;
            
        } catch (Exception $e) {
            returnError('Erro ao processar batch de posts: ' . $e->getMessage());
        }
    }
    try {
        // Primeiro, buscar dados do usuário para obter o user_id (pk)
        $userResponse = makeRequestGET('/v1/user/by/username', ['username' => $username]);
        
        if (!$userResponse['success'] || !isset($userResponse['data']['pk'])) {
            returnError('Erro ao buscar dados do usuário: ' . ($userResponse['error'] ?? 'Usuário não encontrado'));
        }
        
        $userId = $userResponse['data']['pk'];
        $userData = $userResponse['data'];
        
        // Garantir que chaining_results seja preservado no resultado
        if (isset($userData['chaining_results']) && is_array($userData['chaining_results'])) {
            error_log("Chaining results found: " . count($userData['chaining_results']) . " perfis");
            // chaining_results já está em $userData, será incluído no resultado
        }
        
        // Salvar dados do perfil
        $results['requests']['account_data'] = [
            'name' => 'User Profile',
            'endpoint' => '/v1/user/by/username',
            'result' => $userResponse
        ];
        
        // Garantir que chaining_results esteja acessível em result.data
        if (isset($userData['chaining_results'])) {
            $results['requests']['account_data']['result']['data']['chaining_results'] = $userData['chaining_results'];
        }
        
        // Definir endpoints que precisam do user_id
        $endpoints = [
            'followers' => [
                'name' => 'Followers',
                'endpoint' => '/v1/user/followers/chunk',
                'params' => ['user_id' => $userId]
            ],
            'following' => [
                'name' => 'Following',
                'endpoint' => '/v1/user/following/chunk',
                'params' => ['user_id' => $userId]
            ],
            'posts' => [
                'name' => 'User Posts',
                'endpoint' => '/v1/user/medias/chunk',
                'params' => ['user_id' => $userId]
            ],
            'stories' => [
                'name' => 'User Stories',
                'endpoint' => '/v1/user/stories',
                'params' => ['user_id' => $userId]
            ],
            'highlights' => [
                'name' => 'User Highlights',
                'endpoint' => '/v1/user/highlights',
                'params' => ['user_id' => $userId]
            ]
        ];
        
        // Criar múltiplas requisições cURL em paralelo
        $multiHandle = curl_multi_init();
        if (defined('CURLMOPT_PIPELINING') && defined('CURLPIPE_MULTIPLEX')) {
            curl_multi_setopt($multiHandle, CURLMOPT_PIPELINING, CURLPIPE_MULTIPLEX);
        }
        $curlHandles = [];
        
        foreach ($endpoints as $key => $config) {
            $url = "https://{$rapidApiHost}{$config['endpoint']}";
            if (!empty($config['params'])) {
                $url .= '?' . http_build_query($config['params']);
            }
            
            $ch = curl_init();
            curl_setopt_array($ch, [
                CURLOPT_URL => $url,
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_ENCODING => "gzip,deflate",
                CURLOPT_MAXREDIRS => 5,
                CURLOPT_TIMEOUT => 10,
                CURLOPT_CONNECTTIMEOUT => 3,
                CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
                CURLOPT_CUSTOMREQUEST => "GET",
                CURLOPT_HTTPHEADER => [
                    "x-access-key: {$plagioApiKey}",
                    "Accept: application/json",
                    "Accept-Encoding: gzip, deflate"
                ],
                CURLOPT_FRESH_CONNECT => true,
                CURLOPT_FORBID_REUSE => true,
            ]);
            
            curl_multi_add_handle($multiHandle, $ch);
            $curlHandles[$key] = [
                'handle' => $ch,
                'config' => $config
            ];
        }
        
        // Executar todas as requisições em paralelo
        $running = null;
        do {
            $mrc = curl_multi_exec($multiHandle, $running);
            if ($running > 0) {
                usleep(1000);
            }
        } while ($running > 0);
        
        // Processar resultados
        foreach ($curlHandles as $key => $data) {
            $ch = $data['handle'];
            $config = $data['config'];
            
            $response = curl_multi_getcontent($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $err = curl_error($ch);
            
            curl_multi_remove_handle($multiHandle, $ch);
            curl_close($ch);
            
            $jsonData = null;
            $jsonError = null;
            
            if ($response) {
                $jsonData = json_decode($response, true);
                if (json_last_error() !== JSON_ERROR_NONE) {
                    $jsonError = json_last_error_msg();
                }
            }
            
            $results['requests'][$key] = [
                'name' => $config['name'],
                'endpoint' => $config['endpoint'],
                'result' => [
                    'success' => !$err && $httpCode === 200 && $jsonData !== null,
                    'data' => $jsonData,
                    'error' => $err ?: ($httpCode !== 200 ? "HTTP {$httpCode}" : $jsonError),
                    'http_code' => $httpCode,
                    'raw_response' => $response ? substr($response, 0, 500) : null
                ]
            ];
        }
        
        curl_multi_close($multiHandle);
        
        // Retornar resultados
        echo json_encode($results, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
        exit;
        
    } catch (Exception $e) {
        returnError('Erro ao processar requisição Plágio: ' . $e->getMessage());
    }
}
?>
