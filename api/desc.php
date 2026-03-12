<?php
include 'config.php';
try {
    $stmt = $conn->query("DESCRIBE student");
    $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
    print_r($result);
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
