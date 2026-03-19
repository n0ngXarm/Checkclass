<?php
require_once '../includes/auth.php';
require_once '../includes/functions.php';
requireLogin();

$db               = new Database();
$conn             = $db->getConnection();
$current_semester = getCurrentSemester();
$teacher          = getCurrentTeacher();

$class_id   = (int)($_GET['class_id']   ?? 0);
$check_date = $_GET['check_date'] ?? date('Y-m-d');

if(!$class_id) {
    header('Location: attendance.php');
    exit;
}

// ดึงข้อมูลห้อง
$stmt = $conn->prepare("SELECT c.*, el.level_name_th, d.dept_name_th 
    FROM classes c
    JOIN education_levels el ON c.level_id = el.level_id
    JOIN departments d ON c.dept_id = d.dept_id
    WHERE c.class_id = ?");
$stmt->execute([$class_id]);
$class_info = $stmt->fetch();

if(!$class_info) {
    header('Location: attendance.php');
    exit;
}

// ดึงรายชื่อนักเรียนในห้อง
$stmt = $conn->prepare(
    "SELECT * FROM students WHERE class_id = ? ORDER BY student_number ASC"
);
$stmt->execute([$class_id]);
$students = $stmt->fetchAll();

// ดึงข้อมูลการเช็คชื่อที่มีอยู่แล้ว (กรณีแก้ไข)
$existing = [];
try {
    $stmt = $conn->prepare(
        "SELECT student_id, status,
                COALESCE(check_in_time, '') AS check_in_time,
                COALESCE(note, '')         AS note
         FROM attendance_records 
         WHERE class_id = ? AND check_in_date = ? AND semester_id = ?"
    );
    $stmt->execute([$class_id, $check_date, $current_semester['semester_id'] ?? 0]);
    foreach($stmt->fetchAll() as $row) {
        $existing[$row['student_id']] = $row;
    }
} catch(Exception $e) {
    // ถ้าตาราง/คอลัมน์ไม่มี ให้ข้ามไป
}

// บันทึก
if($_SERVER['REQUEST_METHOD'] === 'POST') {
    $statuses = $_POST['status']       ?? [];
    $times    = $_POST['check_in_time']?? [];
    $notes    = $_POST['note']          ?? [];

    $conn->beginTransaction();
    try {
        // ตรวจสอบว่า table มีคอลัมน์ note และ check_in_time หรือไม่
        $cols = $conn->query("SHOW COLUMNS FROM attendance_records")->fetchAll(PDO::FETCH_COLUMN);
        $hasNote = in_array('note', $cols);
        $hasTime = in_array('check_in_time', $cols);

        foreach($statuses as $student_id => $status) {
            $allowed = ['มาเรียน','ขาดเรียน','สาย','ลา'];
            if(!in_array($status, $allowed)) continue;

            if($hasNote && $hasTime) {
                $time = !empty($times[$student_id]) ? $times[$student_id] : null;
                $note = !empty($notes[$student_id]) ? trim($notes[$student_id]) : null;
                $stmt = $conn->prepare(
                    "INSERT INTO attendance_records
                        (student_id, class_id, teacher_id, semester_id, check_in_date, status, check_in_time, note)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                     ON DUPLICATE KEY UPDATE
                        status = VALUES(status),
                        check_in_time = VALUES(check_in_time),
                        note = VALUES(note)"
                );
                $stmt->execute([
                    $student_id, $class_id, $teacher['id'],
                    $current_semester['semester_id'] ?? 0,
                    $check_date, $status, $time, $note
                ]);
            } else {
                // Fallback: ถ้าไม่มี note/check_in_time ใช้ query พื้นฐาน
                $stmt = $conn->prepare(
                    "INSERT INTO attendance_records
                        (student_id, class_id, teacher_id, semester_id, check_in_date, status)
                     VALUES (?, ?, ?, ?, ?, ?)
                     ON DUPLICATE KEY UPDATE status = VALUES(status)"
                );
                $stmt->execute([
                    $student_id, $class_id, $teacher['id'],
                    $current_semester['semester_id'] ?? 0,
                    $check_date, $status
                ]);
            }
        }
        $conn->commit();
        $_SESSION['flash_success'] = 'บันทึกการเช็คชื่อเรียบร้อยแล้ว';
        header('Location: attendance.php');
        exit;
    } catch(Exception $e) {
        $conn->rollBack();
        $error = 'เกิดข้อผิดพลาด: ' . $e->getMessage();
    }
}

$page_title = 'เช็คชื่อ – ' . htmlspecialchars($class_info['class_code'] . ' ' . $class_info['room']);
include '../includes/header.php';

$statusLabels = [
    'มาเรียน'  => ['color'=>'success','icon'=>'check-circle'],
    'สาย'       => ['color'=>'warning','icon'=>'clock'],
    'ลา'         => ['color'=>'info',   'icon'=>'file-text'],
    'ขาดเรียน' => ['color'=>'danger',  'icon'=>'x-circle'],
];
?>

<!-- Info bar -->
<div class="d-flex flex-wrap align-items-center justify-content-between mb-3 gap-2">
    <div>
        <h2 class="mb-1"><i class="bi bi-pencil-square text-primary"></i>
            เช็คชื่อ
            <span class="badge bg-primary fs-6"><?= htmlspecialchars($class_info['class_code'] . ' ' . $class_info['room']) ?></span>
        </h2>
        <span class="text-muted"><?= htmlspecialchars($class_info['dept_name_th']) ?> &bull; วันที่ <?= date('d/m/Y', strtotime($check_date)) ?> &bull; นักเรียน <?= count($students) ?> คน</span>
    </div>
    <div class="d-flex gap-2 flex-wrap">
        <button type="button" onclick="setAll('มาเรียน')" class="btn btn-success btn-sm">
            <i class="bi bi-check-all"></i> ทุกคนมาเรียน
        </button>
        <a href="attendance.php" class="btn btn-outline-secondary btn-sm">
            <i class="bi bi-arrow-left"></i> กลับ
        </a>
    </div>
</div>

<?php if(isset($error)): ?>
<div class="alert alert-danger"><i class="bi bi-exclamation-triangle"></i> <?= htmlspecialchars($error) ?></div>
<?php endif; ?>
<?php if(isset($_SESSION['flash_success'])): ?>
<div class="alert alert-success"><i class="bi bi-check-circle"></i> <?= htmlspecialchars($_SESSION['flash_success']) ?></div>
<?php unset($_SESSION['flash_success']); endif; ?>

<form method="POST" action="">
<div class="card">
    <div class="card-body p-0">
        <?php if(empty($students)): ?>
            <div class="text-center text-muted py-5"><i class="bi bi-inbox fs-1 d-block mb-2"></i>ไม่พบนักเรียนในห้องนี้</div>
        <?php else: ?>
        <div class="table-responsive">
            <table class="table table-hover mb-0 attendance-table" id="attendanceTable">
                <thead class="table-light sticky-top">
                    <tr>
                        <th style="width:40px;">#</th>
                        <th>รหัส</th>
                        <th>ชื่อ-นามสกุล</th>
                        <th>สถานะ</th>
                        <th>เวลามาสาย</th>
                        <th>หมายเหตุ</th>
                    </tr>
                </thead>
                <tbody>
                <?php foreach($students as $i => $stu):
                    $cur_status = $existing[$stu['student_id']]['status'] ?? 'มาเรียน';
                    $cur_time   = $existing[$stu['student_id']]['check_in_time'] ?? '';
                    $cur_note   = $existing[$stu['student_id']]['note'] ?? '';
                ?>
                <tr class="student-row" id="row_<?= $stu['student_id'] ?>">
                    <td><?= $i + 1 ?></td>
                    <td><small class="text-muted"><?= htmlspecialchars($stu['student_id']) ?></small></td>
                    <td>
                        <strong><?= htmlspecialchars($stu['first_name_th'] . ' ' . $stu['last_name_th']) ?></strong>
                        <?php if(!empty($stu['nickname'])): ?>
                        <small class="text-muted">(<?= htmlspecialchars($stu['nickname']) ?>)</small>
                        <?php endif; ?>
                    </td>
                    <td>
                        <div class="btn-group btn-group-sm" role="group">
                        <?php foreach($statusLabels as $label => $meta): ?>
                            <input type="radio" class="btn-check" name="status[<?= $stu['student_id'] ?>]"
                                   id="s_<?= $stu['student_id'] ?>_<?= $label ?>"
                                   value="<?= $label ?>"
                                   <?= $cur_status === $label ? 'checked' : '' ?>
                                   onchange="updateRow('<?= $stu['student_id'] ?>','<?= $label ?>')">
                            <label class="btn btn-outline-<?= $meta['color'] ?> py-1 px-2"
                                   for="s_<?= $stu['student_id'] ?>_<?= $label ?>"
                                   style="font-size:0.78rem;">
                                <?= $label ?>
                            </label>
                        <?php endforeach; ?>
                        </div>
                    </td>
                    <td>
                        <input type="time" name="check_in_time[<?= $stu['student_id'] ?>]"
                               class="form-control form-control-sm time-input"
                               value="<?= htmlspecialchars($cur_time) ?>">
                    </td>
                    <td>
                        <input type="text" name="note[<?= $stu['student_id'] ?>]"
                               class="form-control form-control-sm"
                               placeholder="หมายเหตุ" style="min-width:120px;"
                               value="<?= htmlspecialchars($cur_note) ?>">
                    </td>
                </tr>
                <?php endforeach; ?>
                </tbody>
            </table>
        </div>
        <div class="p-3 d-flex justify-content-between align-items-center border-top bg-light">
            <span class="text-muted small">
                <i class="bi bi-info-circle"></i> คลิกปุ่มสถานะเพื่อเลือก จากนั้นกด "บันทึก"
            </span>
            <div class="d-flex gap-2">
                <a href="attendance.php" class="btn btn-outline-secondary">ยกเลิก</a>
                <button type="submit" class="btn btn-primary btn-lg">
                    <i class="bi bi-save"></i> บันทึกการเช็คชื่อ
                </button>
            </div>
        </div>
        <?php endif; ?>
    </div>
</div>
</form>

<script>
function setAll(status) {
    document.querySelectorAll('.student-row').forEach(row => {
        const id   = row.id.replace('row_', '');
        const radio = document.getElementById('s_' + id + '_' + status);
        if(radio) { radio.checked = true; updateRow(id, status); }
    });
}
function updateRow(studentId, status) {
    const row = document.getElementById('row_' + studentId);
    if(!row) return;
    row.classList.remove('table-success','table-danger','table-warning','table-info');
    const map = {'มาเรียน':'success','ขาดเรียน':'danger','สาย':'warning','ลา':'info'};
    if(map[status]) row.classList.add('table-' + map[status]);
}
// Set initial row colors
document.querySelectorAll('.student-row').forEach(row => {
    const id    = row.id.replace('row_', '');
    const checked = row.querySelector('input[type=radio]:checked');
    if(checked) updateRow(id, checked.value);
});
// Quick search
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.className = 'form-control form-control-sm mb-2';
    searchInput.placeholder = 'ค้นหานักเรียน...';
    searchInput.style.maxWidth = '250px';
    const table = document.getElementById('attendanceTable');
    table?.parentElement?.insertBefore(searchInput, table);
    searchInput.addEventListener('input', function() {
        const q = this.value.toLowerCase();
        document.querySelectorAll('#attendanceTable tbody tr').forEach(tr => {
            tr.style.display = tr.textContent.toLowerCase().includes(q) ? '' : 'none';
        });
    });
});
</script>

<?php include '../includes/footer.php'; ?>
