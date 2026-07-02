<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'config.php';

// Pegar dados do POST (tanto URL-encoded quanto JSON)
$inputJSON = file_get_contents('php://input');
$input = json_decode($inputJSON, TRUE);

$nome = $_POST['nome'] ?? $input['nome'] ?? null;
$email = $_POST['email'] ?? $input['email'] ?? null;
$telefone = $_POST['telefone'] ?? $input['telefone'] ?? null;
$servico = $_POST['servico'] ?? $input['servico'] ?? null;
$necessidade = $_POST['necessidade'] ?? $input['necessidade'] ?? null;

// Validação simples
if (empty($nome) || empty($email)) {
    echo json_encode([
        'success' => false,
        'message' => 'Nome e E-mail são obrigatórios.'
    ]);
    exit;
}

// Preparar payload para o Supabase
$data = [
    'nome_completo' => $nome,
    'email' => $email,
    'telefone' => $telefone,
    'servico_interesse' => $servico,
    'necessidade' => $necessidade
];

$jsonData = json_encode($data);

// Endpoint da tabela 'orcamentos' no REST API do Supabase
$url = SUPABASE_URL . '/rest/v1/orcamentos';

// Inicializar cURL
$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "POST");
curl_setopt($ch, CURLOPT_POSTFIELDS, $jsonData);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'apikey: ' . SUPABASE_KEY,
    'Authorization: Bearer ' . SUPABASE_KEY,
    'Prefer: return=representation'
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, http_code: CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode >= 200 && $httpCode < 300) {
    echo json_encode([
        'success' => true,
        'message' => 'Solicitação de orçamento cadastrada com sucesso!'
    ]);
} else {
    echo json_encode([
        'success' => false,
        'message' => 'Erro ao salvar no banco de dados. Código HTTP: ' . $httpCode,
        'details' => json_decode($response)
    ]);
}
?>
