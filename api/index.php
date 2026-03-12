<?php
require_once 'auth_check.php';

// ดึงปีการศึกษาและเทอมปัจจุบัน
$current_year = date('Y');
$current_semester = (date('m') >= 5 && date('m') <= 10) ? '1' : '2';

// รับค่าปี/เทอมจาก GET
$selected_year = $_GET['year'] ?? $current_year;
$selected_semester = $_GET['semester'] ?? $current_semester;

// หา semester_id
$stmt = $conn->prepare("SELECT semester_id FROM semesters WHERE academic_year = ? AND semester = ?");
$stmt->execute([$selected_year, $selected_semester]);
$semester_id = $stmt->fetchColumn();

if (!$semester_id) {
    die("<p class='error' style='padding:20px;'>❌ ไม่พบข้อมูลภาคเรียนที่เลือก</p>");
}
?>
<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ระบบเช็คชื่อนักเรียน</title>
    <link rel="stylesheet" href="../style.css">
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            background: linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%);
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            padding: 20px;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        .header {
            background: white;
            padding: 20px;
            border-radius: 10px;
            margin-bottom: 20px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
        }
        .teacher-info {
            font-size: 18px;
            font-weight: bold;
            color: #667eea;
        }
        .logout-btn {
            background: #dc3545;
            color: white;
            padding: 8px 15px;
            text-decoration: none;
            border-radius: 5px;
        }
        .filter-bar {
            background: white;
            padding: 15px;
            border-radius: 10px;
            margin-bottom: 20px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.05);
            display: flex;
            gap: 15px;
            flex-wrap: wrap;
        }
        .filter-group {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .filter-group select {
            padding: 8px 12px;
            border: 1px solid #ddd;
            border-radius: 5px;
            font-size: 14px;
        }
        .class-card {
            background: white;
            border-radius: 10px;
            padding: 20px;
            margin-bottom: 25px;
            box-shadow: 0 3px 15px rgba(0,0,0,0.1);
            border-left: 5px solid #667eea;
        }
        .class-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 1px solid #eee;
            flex-wrap: wrap;
        }
        .class-title {
            font-size: 20px;
            font-weight: bold;
            color: #333;
        }
        .dept-badge {
            background: #667eea;
            color: white;
            padding: 3px 12px;
            border-radius: 20px;
            font-size: 13px;
        }
        .homeroom-badge {
            background: #28a745;
            color: white;
            padding: 2px 10px;
            border-radius: 20px;
            font-size: 12px;
            margin-left: 10px;
        }
        .student-row {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 8px;
            background: #f8fafc;
            margin-bottom: 5px;
            border-radius: 5px;
        }
        .student-row:hover {
            background: #edf2f7;
        }
        .student-no {
            width: 40px;
            text-align: center;
            font-weight: bold;
            color: #666;
        }
        .student-code {
            width: 120px;
            font-family: monospace;
            color: #555;
        }
        .student-name {
            flex: 2;
        }
        .status-select {
            width: 130px;
            padding: 5px;
            border: 1px solid #ddd;
            border-radius: 4px;
        }
        .note-input {
            width: 150px;
            padding: 5px;
            border: 1px solid #ddd;
            border-radius: 4px;
        }
        .btn-save {
            background: #667eea;
            color: white;
            border: none;
            padding: 10px 25px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
            margin-top: 15px;
        }
        .btn-save:hover {
            background: #764ba2;
        }
        .nav-links {
            margin-top: 30px;
            text-align: center;
        }
        .nav-links a {
            display: inline-block;
            margin: 0 10px;
            color: #667eea;
            text-decoration: none;
        }
        .no-data {
            background: #f8d7da;
            color: #721c24;
            padding: 20px;
            border-radius: 5px;
            text-align: center;
        }
        .legend {
            display: flex;
            gap: 15px;
            margin-bottom: 15px;
            flex-wrap: wrap;
            background: white;
            padding: 10px 15px;
            border-radius: 5px;
        }
        .legend-item {
            display: flex;
            align-items: center;
            gap: 5px;
        }
        .status-badge {
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 12px;
        }
        .status-มา { background: #d4edda; color: #155724; }
        .status-สาย { background: #fff3cd; color: #856404; }
        .status-ขาด { background: #f8d7da; color: #721c24; }
        .status-ลา { background: #d1ecf1; color: #0c5460; }
        .text-muted { color: #6c757d; }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <div class="teacher-info">
                👩‍🏫 <?= htmlspecialchars($current_teacher_name) ?> (<?= $current_teacher_code ?>)
            </div>
            <div>
                <a href="edit_attendance.php" style="margin-right: 15px; color: #667eea;">📝 แก้ไขประวัติ</a>
                <a href="report.php" style="margin-right: 15px; color: #667eea;">📊 รายงาน</a>
                <a href="logout.php" class="logout-btn">🚪 ออกจากระบบ</a>
            </div>
        </div>

        <h1 style="margin-bottom: 20px;">📋 เช็คชื่อนักเรียน</h1>

        <!-- ตัวกรองปี/เทอม -->
        <div class="filter-bar">
            <form method="GET" style="display: flex; gap: 15px; width: 100%;">
                <div class="filter-group">
                    <label>📅 ปี:</label>
                    <select name="year" onchange="this.form.submit()">
                        <?php for ($y = 2026; $y >= 2025; $y--): ?>
                            <option value="<?= $y ?>" <?= $selected_year == $y ? 'selected' : '' ?>><?= $y ?></option>
                        <?php endfor; ?>
                    </select>
                </div>
                <div class="filter-group">
                    <label>📌 เทอม:</label>
                    <select name="semester" onchange="this.form.submit()">
                        <option value="1" <?= $selected_semester == '1' ? 'selected' : '' ?>>เทอม 1</option>
                        <option value="2" <?= $selected_semester == '2' ? 'selected' : '' ?>>เทอม 2</option>
                        <option value="summer" <?= $selected_semester == 'summer' ? 'selected' : '' ?>>ฤดูร้อน</option>
                    </select>
                </div>
            </form>
        </div>

        <!-- คำอธิบายสถานะ -->
        <div class="legend">
            <div class="legend-item"><span class="status-badge status-มา">✅ มา</span></div>
            <div class="legend-item"><span class="status-badge status-สาย">⏰ สาย</span></div>
            <div class="legend-item"><span class="status-badge status-ขาด">❌ ขาด</span></div>
            <div class="legend-item"><span class="status-badge status-ลา">📝 ลา</span></div>
        </div>

        <?php
        // ดึงห้องที่อาจารย์คนนี้สอน
        $sql = "SELECT 
                    c.class_id,
                    c.class_name,
                    d.dept_name,
                    tc.is_homeroom
                FROM teacher_class tc
                JOIN classes c ON tc.class_id = c.class_id
                JOIN departments d ON c.dept_id = d.dept_id
                WHERE tc.teacher_id = :teacher_id 
                AND tc.academic_year = :year 
                AND tc.semester = :semester
                ORDER BY d.dept_name, c.class_name";
        
        $stmt = $conn->prepare($sql);
        $stmt->execute([
            ':teacher_id' => $current_teacher_id,
            ':year' => $selected_year,
            ':semester' => $selected_semester
        ]);
        $classes = $stmt->fetchAll(PDO::FETCH_ASSOC);

        if (count($classes) == 0): ?>
            <div class="no-data">
                ⚠️ คุณไม่มีห้องที่ต้องสอนในภาคเรียนนี้
            </div>
        <?php else:
            foreach ($classes as $class):
                $class_id = $class['class_id'];
        ?>

        <div class="class-card">
            <div class="class-header">
                <div>
                    <span class="class-title">🏫 <?= $class['class_name'] ?></span>
                    <span class="dept-badge"><?= $class['dept_name'] ?></span>
                    <?php if ($class['is_homeroom']): ?>
                        <span class="homeroom-badge">ครูประจำชั้น</span>
                    <?php endif; ?>
                </div>
                <div class="text-muted">🗓️ <?= date('d/m/Y') ?></div>
            </div>

            <form method="POST" action="save_attendance.php">
                <input type="hidden" name="class_id" value="<?= $class_id ?>">
                <input type="hidden" name="semester_id" value="<?= $semester_id ?>">
                <input type="hidden" name="year" value="<?= $selected_year ?>">
                <input type="hidden" name="semester" value="<?= $selected_semester ?>">
                <input type="hidden" name="check_date" value="<?= date('Y-m-d') ?>">

                <?php
                // ดึงนักเรียนในห้อง
                $sql2 = "SELECT 
                            s.student_id,
                            s.student_code,
                            s.title,
                            s.first_name,
                            s.last_name,
                            a.status as current_status,
                            a.note as current_note
                        FROM enrollments e
                        JOIN student s ON e.student_id = s.student_id
                        LEFT JOIN attendance a ON a.student_id = s.student_id 
                            AND a.check_in_date = CURDATE()
                            AND a.semester_id = :semester_id
                        WHERE e.class_id = :class_id 
                        AND e.semester_id = :semester_id2
                        AND e.status = 'กำลังศึกษา'
                        ORDER BY s.student_code";
                
                $stmt2 = $conn->prepare($sql2);
                $stmt2->execute([
                    ':class_id' => $class_id,
                    ':semester_id' => $semester_id,
                    ':semester_id2' => $semester_id
                ]);
                $students = $stmt2->fetchAll(PDO::FETCH_ASSOC);

                if (count($students) == 0): ?>
                    <p class="text-muted">⚠️ ไม่มีนักเรียนในห้องนี้</p>
                <?php else:
                    $no = 1;
                    foreach ($students as $student):
                ?>
                
                <div class="student-row">
                    <div class="student-no"><?= $no++ ?></div>
                    <div class="student-code"><?= $student['student_code'] ?></div>
                    <div class="student-name">
                        <?= $student['title'] ?><?= $student['first_name'] ?> <?= $student['last_name'] ?>
                    </div>
                    <select name="status[<?= $student['student_id'] ?>]" class="status-select">
                        <option value="มา" <?= ($student['current_status'] == 'มา') ? 'selected' : '' ?>>✅ มา</option>
                        <option value="สาย" <?= ($student['current_status'] == 'สาย') ? 'selected' : '' ?>>⏰ สาย</option>
                        <option value="ขาด" <?= ($student['current_status'] == 'ขาด') ? 'selected' : '' ?>>❌ ขาด</option>
                        <option value="ลา" <?= ($student['current_status'] == 'ลา') ? 'selected' : '' ?>>📝 ลา</option>
                    </select>
                    <input type="text" 
                           name="note[<?= $student['student_id'] ?>]" 
                           class="note-input" 
                           placeholder="หมายเหตุ"
                           value="<?= htmlspecialchars($student['current_note'] ?? '') ?>">
                </div>

                <?php 
                    endforeach; 
                ?>
                
                <div style="text-align: right;">
                    <button type="submit" name="save_class" class="btn-save">
                        💾 บันทึกเช็คชื่อ
                    </button>
                </div>

                <?php 
                endif;
                ?>
            </form>
        </div>

        <?php 
            endforeach;
        endif;
        ?>

        <!-- ลิงก์จัดการ -->
        <div class="nav-links">
            <a href="add_student.php">➕ เพิ่มนักเรียน</a>
            <a href="add_teacher.php">👩‍🏫 เพิ่มครู</a>
            <a href="edit_student.php">✏️ จัดการนักเรียน</a>
            <a href="edit_teacher.php">✏️ จัดการครู</a>
            <a href="edit_attendance.php">📝 แก้ไขประวัติ</a>
            <a href="report.php">📊 รายงาน</a>
        </div>
    </div>
</body>
</html>