<?php
require_once 'auth_check.php';

// ดึงข้อมูลครูทั้งหมด
$teachers = $conn->query("SELECT t.*, d.dept_name 
                         FROM teacher t
                         LEFT JOIN departments d ON t.dept_id = d.dept_id
                         ORDER BY t.teacher_code")->fetchAll(PDO::FETCH_ASSOC);

// ดึงข้อมูลแผนก
$depts = $conn->query("SELECT dept_id, dept_name FROM departments ORDER BY dept_name")->fetchAll(PDO::FETCH_ASSOC);

// จัดการการลบ
if (isset($_GET['delete'])) {
    $id = $_GET['delete'];
    
    // เช็คว่ามีประวัติการเช็คชื่อหรือยัง
    $check = $conn->prepare("SELECT COUNT(*) FROM attendance WHERE teacher_id = ?");
    $check->execute([$id]);
    $count = $check->fetchColumn();
    
    if ($count > 0) {
        $_SESSION['message'] = "❌ ไม่สามารถลบได้ เนื่องจากมีประวัติการบันทึกเช็คชื่อแล้ว";
    } else {
        if ($conn->prepare("DELETE FROM teacher WHERE teacher_id = ?")->execute([$id])) {
            $_SESSION['message'] = "✅ ลบข้อมูลเรียบร้อย";
        } else {
            $_SESSION['message'] = "❌ ลบข้อมูลล้มเหลว";
        }
    }
    header("Location: edit_teacher.php");
    exit;
}

// จัดการการแก้ไข
if (isset($_POST['update'])) {
    $teacher_id = $_POST['teacher_id'];
    $teacher_code = trim($_POST['teacher_code']);
    $academic_title = $_POST['academic_title'];
    $personal_title = $_POST['personal_title'];
    $first_name = trim($_POST['first_name']);
    $last_name = trim($_POST['last_name']);
    $dept_id = $_POST['dept_id'] ?: null;
    $password = $_POST['password'];
    
    $stmt = $conn->prepare("UPDATE teacher SET teacher_code = ?, academic_title = ?, personal_title = ?, first_name = ?, last_name = ?, dept_id = ?, password = ? WHERE teacher_id = ?");
    if ($stmt->execute([$teacher_code, $academic_title, $personal_title, $first_name, $last_name, $dept_id, $password, $teacher_id])) {
        $_SESSION['message'] = "✅ แก้ไขข้อมูลเรียบร้อย";
    } else {
        $_SESSION['message'] = "❌ แก้ไขข้อมูลล้มเหลว";
    }
    header("Location: edit_teacher.php");
    exit;
}
?>
<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>จัดการครู</title>
    <link rel="stylesheet" href="../style.css">
    <style>
        * { box-sizing: border-box; }
        body {
            background: #f5f7fa;
            font-family: 'Segoe UI', sans-serif;
            padding: 20px;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 5px 20px rgba(0,0,0,0.1);
        }
        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
        }
        .message {
            padding: 10px 15px;
            border-radius: 5px;
            margin-bottom: 20px;
        }
        .success { background: #d4edda; color: #155724; }
        .error { background: #f8d7da; color: #721c24; }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        th {
            background: #667eea;
            color: white;
            padding: 12px;
        }
        td {
            padding: 10px;
            border-bottom: 1px solid #e0e0e0;
        }
        tr:hover { background: #f5f5f5; }
        .btn-edit {
            background: #ffc107;
            color: black;
            padding: 5px 10px;
            text-decoration: none;
            border-radius: 3px;
            margin-right: 5px;
        }
        .btn-delete {
            background: #dc3545;
            color: white;
            padding: 5px 10px;
            text-decoration: none;
            border-radius: 3px;
        }
        .edit-form {
            background: #f8fafc;
            padding: 20px;
            border-radius: 8px;
            margin-top: 30px;
            border: 1px solid #ddd;
        }
        .form-row {
            display: flex;
            gap: 15px;
            margin-bottom: 15px;
            flex-wrap: wrap;
        }
        .form-group {
            flex: 1;
            min-width: 200px;
        }
        .form-group label {
            display: block;
            margin-bottom: 5px;
            font-weight: 500;
        }
        .form-group input, .form-group select {
            width: 100%;
            padding: 8px;
            border: 1px solid #ddd;
            border-radius: 4px;
        }
        .btn-save {
            background: #28a745;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 4px;
            cursor: pointer;
        }
        .btn-cancel {
            background: #6c757d;
            color: white;
            padding: 10px 20px;
            border-radius: 4px;
            text-decoration: none;
        }
        .nav-links {
            margin-top: 30px;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>✏️ จัดการข้อมูลครู</h1>
            <div>
                <a href="index.php">🏠 หน้าหลัก</a> |
                <a href="add_teacher.php">➕ เพิ่มใหม่</a>
            </div>
        </div>

        <?php if (isset($_SESSION['message'])): ?>
            <div class="message <?= strpos($_SESSION['message'], '✅') !== false ? 'success' : 'error' ?>">
                <?= $_SESSION['message'] ?>
            </div>
            <?php unset($_SESSION['message']); ?>
        <?php endif; ?>

        <!-- ตารางแสดงรายชื่อครู -->
        <table>
            <thead>
                <tr>
                    <th>รหัสครู</th>
                    <th>ชื่อ-นามสกุล</th>
                    <th>แผนก</th>
                    <th>รหัสผ่าน</th>
                    <th>จัดการ</th>
                </tr>
            </thead>
            <tbody>
                <?php foreach ($teachers as $tch): ?>
                <tr>
                    <td><?= $tch['teacher_code'] ?></td>
                    <td><?= $tch['academic_title'] ?><?= $tch['personal_title'] ?><?= $tch['first_name'] ?> <?= $tch['last_name'] ?></td>
                    <td><?= $tch['dept_name'] ?? '-' ?></td>
                    <td><?= $tch['password'] ?></td>
                    <td>
                        <a href="edit_teacher.php?edit=<?= $tch['teacher_id'] ?>" class="btn-edit">✏️ แก้ไข</a>
                        <a href="edit_teacher.php?delete=<?= $tch['teacher_id'] ?>" class="btn-delete" onclick="return confirm('แน่ใจว่าต้องการลบ?')">🗑️ ลบ</a>
                    </td>
                </tr>
                <?php endforeach; ?>
            </tbody>
        </table>

        <!-- ฟอร์มแก้ไข -->
        <?php if (isset($_GET['edit'])):
            $edit_id = $_GET['edit'];
            $stmt = $conn->prepare("SELECT * FROM teacher WHERE teacher_id = ?");
            $stmt->execute([$edit_id]);
            $edit = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($edit):
        ?>
        <div class="edit-form">
            <h3>✏️ แก้ไขข้อมูล <?= $edit['academic_title'] ?><?= $edit['personal_title'] ?><?= $edit['first_name'] ?> <?= $edit['last_name'] ?></h3>
            <form method="POST">
                <input type="hidden" name="teacher_id" value="<?= $edit['teacher_id'] ?>">
                
                <div class="form-row">
                    <div class="form-group">
                        <label>📌 รหัสครู</label>
                        <input type="text" name="teacher_code" value="<?= $edit['teacher_code'] ?>" required>
                    </div>
                    <div class="form-group">
                        <label>🔑 รหัสผ่าน</label>
                        <input type="text" name="password" value="<?= $edit['password'] ?>" required>
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label>🎓 คำนำหน้าวิชาการ</label>
                        <select name="academic_title">
                            <option value="">ไม่มี</option>
                            <option value="ดร." <?= $edit['academic_title'] == 'ดร.' ? 'selected' : '' ?>>ดร.</option>
                            <option value="ผศ." <?= $edit['academic_title'] == 'ผศ.' ? 'selected' : '' ?>>ผศ.</option>
                            <option value="รศ." <?= $edit['academic_title'] == 'รศ.' ? 'selected' : '' ?>>รศ.</option>
                            <option value="ศ." <?= $edit['academic_title'] == 'ศ.' ? 'selected' : '' ?>>ศ.</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>👤 คำนำหน้าบุคคล</label>
                        <select name="personal_title" required>
                            <option value="นาย" <?= $edit['personal_title'] == 'นาย' ? 'selected' : '' ?>>นาย</option>
                            <option value="นาง" <?= $edit['personal_title'] == 'นาง' ? 'selected' : '' ?>>นาง</option>
                            <option value="นางสาว" <?= $edit['personal_title'] == 'นางสาว' ? 'selected' : '' ?>>นางสาว</option>
                        </select>
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label>ชื่อ</label>
                        <input type="text" name="first_name" value="<?= $edit['first_name'] ?>" required>
                    </div>
                    <div class="form-group">
                        <label>นามสกุล</label>
                        <input type="text" name="last_name" value="<?= $edit['last_name'] ?>" required>
                    </div>
                </div>

                <div class="form-group">
                    <label>🏢 แผนก</label>
                    <select name="dept_id">
                        <option value="">-- ไม่ระบุ --</option>
                        <?php foreach ($depts as $dept): ?>
                            <option value="<?= $dept['dept_id'] ?>" <?= ($edit['dept_id'] ?? '') == $dept['dept_id'] ? 'selected' : '' ?>>
                                <?= $dept['dept_name'] ?>
                            </option>
                        <?php endforeach; ?>
                    </select>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <button type="submit" name="update" class="btn-save">💾 บันทึก</button>
                    </div>
                    <div class="form-group">
                        <a href="edit_teacher.php" class="btn-cancel">↩️ ยกเลิก</a>
                    </div>
                </div>
            </form>
        </div>
        <?php 
            endif;
        endif;
        ?>

        <div class="nav-links">
            <a href="index.php">🏠 หน้าหลัก</a>
            <a href="add_teacher.php">➕ เพิ่มครู</a>
            <a href="edit_student.php">✏️ จัดการนักเรียน</a>
        </div>
    </div>
</body>
</html>