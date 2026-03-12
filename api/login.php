<?php
session_start();

// ถ้าล็อกอินแล้วไปหน้า index
if (isset($_SESSION['teacher_loggedin']) && $_SESSION['teacher_loggedin'] === true) {
    header("Location: index.php");
    exit;
}

require_once 'config.php';

$error = '';

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $username = trim($_POST['username'] ?? '');
    $password = trim($_POST['password'] ?? '');
    
    if (empty($username) || empty($password)) {
        $error = "❌ กรุณากรอกชื่อผู้ใช้และรหัสผ่าน";
    } else {
        // ตรวจสอบข้อมูลครู
        $stmt = $conn->prepare("SELECT * FROM teacher WHERE teacher_code = ? AND password = ?");
        $stmt->execute([$username, $password]);
        $teacher = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($teacher) {
            // ล็อกอินสำเร็จ
            $_SESSION['teacher_loggedin'] = true;
            $_SESSION['teacher_id'] = $teacher['teacher_id'];
            $_SESSION['teacher_name'] = $teacher['academic_title'] . $teacher['personal_title'] . ' ' . $teacher['first_name'] . ' ' . $teacher['last_name'];
            $_SESSION['teacher_code'] = $teacher['teacher_code'];
            
            header("Location: index.php");
            exit;
        } else {
            $error = "❌ ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง";
        }
    }
}
?>
<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>เข้าสู่ระบบอาจารย์</title>
    <link rel="stylesheet" href="../style.css">
    <style>
        body {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: 'Segoe UI', sans-serif;
        }
        .login-container {
            background: white;
            padding: 40px;
            border-radius: 10px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            width: 100%;
            max-width: 400px;
        }
        h1 {
            text-align: center;
            color: #333;
            margin-bottom: 30px;
        }
        .form-group {
            margin-bottom: 20px;
        }
        label {
            display: block;
            margin-bottom: 5px;
            color: #555;
            font-weight: 500;
        }
        input {
            width: 100%;
            padding: 12px;
            border: 2px solid #e0e0e0;
            border-radius: 5px;
            font-size: 16px;
            box-sizing: border-box;
        }
        input:focus {
            outline: none;
            border-color: #667eea;
        }
        button {
            width: 100%;
            padding: 12px;
            background: #667eea;
            color: white;
            border: none;
            border-radius: 5px;
            font-size: 18px;
            font-weight: 600;
            cursor: pointer;
        }
        button:hover {
            background: #764ba2;
        }
        .error {
            background: #f8d7da;
            color: #721c24;
            padding: 10px;
            border-radius: 5px;
            margin-bottom: 20px;
            text-align: center;
        }
        .note {
            margin-top: 20px;
            text-align: center;
            color: #6c757d;
            font-size: 14px;
            border-top: 1px solid #e0e0e0;
            padding-top: 20px;
        }
    </style>
</head>
<body>
    <div class="login-container">
        <h1>🔐 ระบบเช็คชื่ออาจารย์</h1>
        
        <?php if ($error): ?>
            <div class="error"><?= htmlspecialchars($error) ?></div>
        <?php endif; ?>

        <form method="POST" action="">
            <div class="form-group">
                <label>👩‍🏫 รหัสอาจารย์</label>
                <input type="text" name="username" required placeholder="เช่น T001" value="<?= htmlspecialchars($_POST['username'] ?? '') ?>">
            </div>
            <div class="form-group">
                <label>🔑 รหัสผ่าน</label>
                <input type="password" name="password" required placeholder="••••••••">
            </div>
            <button type="submit">เข้าสู่ระบบ</button>
        </form>

        <div class="note">
            <p>สำหรับอาจารย์เท่านั้น</p>
            <p>💡 รหัสผ่านเริ่มต้น: 1234</p>
        </div>
    </div>
</body>
</html>