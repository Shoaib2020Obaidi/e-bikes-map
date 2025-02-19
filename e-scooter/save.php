<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Content-Type: application/json');

// Get the JSON input from JavaScript
$data = json_decode(file_get_contents("php://input"), true);

// Check if data is received
if (!$data || !isset($data['filePath']) || !isset($data['data'])) {
    echo json_encode(["status" => "error", "message" => "Invalid data received"]);
    exit;
}

$filePath = $data['filePath'];
$newFeature = $data['data'];

// Ensure the directory exists
$dirPath = dirname($filePath);
if (!is_dir($dirPath)) {
    if (!mkdir($dirPath, 0777, true)) {
        echo json_encode(["status" => "error", "message" => "Failed to create directory"]);
        exit;
    }
}

// Read existing GeoJSON data (if the file exists)
$existingData = [];
if (file_exists($filePath)) {
    $existingContent = file_get_contents($filePath);
    $existingData = json_decode($existingContent, true);

    // Ensure the existing data is in valid GeoJSON format
    if (!isset($existingData['type']) || $existingData['type'] !== 'FeatureCollection') {
        $existingData = [
            'type' => 'FeatureCollection',
            'features' => []
        ];
    }
} else {
    // Initialize as a new FeatureCollection if the file doesn't exist
    $existingData = [
        'type' => 'FeatureCollection',
        'features' => []
    ];
}

// Append the new feature to the existing features
$existingData['features'][] = $newFeature;

// Convert the updated data to JSON (pretty print for readability)
$jsonContent = json_encode($existingData, JSON_PRETTY_PRINT);

// Write the updated data back to the file
if (file_put_contents($filePath, $jsonContent)) {
    echo json_encode(["status" => "success", "message" => "Data saved to $filePath"]);
} else {
    echo json_encode(["status" => "error", "message" => "Failed to save data"]);
}
?>