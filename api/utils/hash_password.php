<?php
// ใช้สำหรับสร้าง hash password
if (isset($_GET['password'])) {
    echo password_hash($_GET['password'], PASSWORD_DEFAULT);
} else {
    echo "Usage: ?password=yourpassword";
}
?>