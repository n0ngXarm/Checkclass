<?php
// pages/login.php
session_start();

// ถ้า login แล้วให้ไป dashboard
if(isset($_SESSION['teacher_id'])) {
    header('Location: dashboard.php');
    exit;
}

$error = '';

if($_SERVER['REQUEST_METHOD'] == 'POST') {
    require_once '../config/database.php';
    
    $username = $_POST['username'] ?? '';
    $password = $_POST['password'] ?? '';
    
    try {
        $db = new Database();
        $conn = $db->getConnection();
        
        // ค้นหาครูจาก teacher_code
        $query = "SELECT * FROM teachers WHERE teacher_code = :code";
        $stmt = $conn->prepare($query);
        $stmt->execute([':code' => $username]);
        $teacher = $stmt->fetch();
        
        // ตรวจสอบรหัสผ่าน (เบื้องต้น ใช้รหัสผ่านเดียวกันก่อน)
        if($teacher && $password == '1234') {
            $_SESSION['teacher_id'] = $teacher['teacher_id'];
            $_SESSION['teacher_name'] = $teacher['first_name_th'] . ' ' . $teacher['last_name_th'];
            $_SESSION['teacher_code'] = $teacher['teacher_code'];
            header('Location: dashboard.php');
            exit;
        } else {
            $error = '❌ ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง';
        }
    } catch(Exception $e) {
        $error = '❌ เกิดข้อผิดพลาด: ' . $e->getMessage();
    }
}
?>
<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>เข้าสู่ระบบ - ระบบเช็คชื่อ</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        body {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .login-card {
            border-radius: 15px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.1);
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="row justify-content-center">
            <div class="col-md-4">
                <div class="card login-card">
                    <div class="card-header bg-primary text-white text-center py-3">
                        <h4 class="mb-0">📋 ระบบเช็คชื่อนักศึกษา</h4>
                        <small>แผนกเทคโนโลยีสารสนเทศ</small>
                    </div>
                    <div class="card-body p-4">
                        <?php if($error): ?>
                            <div class="alert alert-danger"><?php echo $error; ?></div>
                        <?php endif; ?>
                        
                        <form method="POST">
                            <div class="mb-3">
                                <label class="form-label">👤 รหัสครู</label>
                                <input type="text" name="username" class="form-control" 
                                       placeholder="เช่น T001" required>
                                <small class="text-muted">ลองใช้: T001, T002, T003...</small>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">🔑 รหัสผ่าน</label>
                                <input type="password" name="password" class="form-control" 
                                       placeholder="****" required>
                                <small class="text-muted">รหัสผ่าน: 1234 (สำหรับทดสอบ)</small>
                            </div>
                            <button type="submit" class="btn btn-primary w-100 py-2">
                                เข้าสู่ระบบ
                            </button>
                        </form>
                    </div>
                    <div class="card-footer text-center text-muted py-3">
                        <small>สำหรับทดสอบเท่านั้น</small>
                    </div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>