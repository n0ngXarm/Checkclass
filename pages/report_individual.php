<?php
require_once '../includes/auth.php';
require_once '../includes/functions.php';
requireLogin();

$page_title       = 'รายงานรายบุคคล';
$db               = new Database();
$conn             = $db->getConnection();
$current_semester = getCurrentSemester();

$student_id = htmlspecialchars(trim($_GET['student_id'] ?? ''));

// ดึงรายชื่อนักเรียนทั้งหมดสำหรับ select
$all_stmt = $conn->query(
    "SELECT s.student_id, s.first_name_th, s.last_name_th, c.class_code, c.room
     FROM students s
     JOIN classes c ON s.class_id = c.class_id
     ORDER BY c.class_code, s.student_number ASC"
);
$all_students = $all_stmt->fetchAll();

$student  = null;
$records  = [];
$stats    = ['มาเรียน'=>0,'ขาดเรียน'=>0,'สาย'=>0,'ลา'=>0,'total'=>0];

if($student_id) {
    // ข้อมูลนักเรียน
    $stmt = $conn->prepare(
        "SELECT s.*, c.class_code, c.room, el.level_name_th, d.dept_name_th
         FROM students s
         JOIN classes c ON s.class_id = c.class_id
         JOIN education_levels el ON c.level_id = el.level_id
         JOIN departments d ON c.dept_id = d.dept_id
         WHERE s.student_id = ?"
    );
    $stmt->execute([$student_id]);
    $student = $stmt->fetch();

    if($student) {
        // ประวัติ
        $stmt = $conn->prepare(
            "SELECT a.check_in_date, a.status, a.check_in_time, a.note
             FROM attendance_records a
             WHERE a.student_id = ? AND a.semester_id = ?
             ORDER BY a.check_in_date DESC"
        );
        $stmt->execute([$student_id, $current_semester['semester_id'] ?? 0]);
        $records = $stmt->fetchAll();

        // สถิติ
        foreach($records as $r) {
            $stats['total']++;
            if(isset($stats[$r['status']])) $stats[$r['status']]++;
        }
    }
}

$present_total = $stats['มาเรียน'] + $stats['สาย'];
$pct           = $stats['total'] > 0 ? round($present_total / $stats['total'] * 100) : 0;

include '../includes/header.php';
?>

<div class="row mb-3">
    <div class="col-12">
        <h2><i class="bi bi-person-lines-fill text-primary"></i> รายงานรายบุคคล</h2>
    </div>
</div>

<!-- เลือกนักเรียน -->
<div class="card mb-4">
    <div class="card-body">
        <form method="GET" class="row g-3 align-items-end">
            <div class="col-md-8">
                <label class="form-label fw-semibold">เลือกนักเรียน</label>
                <select name="student_id" class="form-select" required>
                    <option value="">-- เลือกนักเรียน --</option>
                    <?php foreach($all_students as $s): ?>
                    <option value="<?= htmlspecialchars($s['student_id']) ?>"
                            <?= $student_id === $s['student_id'] ? 'selected' : '' ?>>
                        <?= htmlspecialchars($s['student_id'] . ' – ' . $s['first_name_th'] . ' ' . $s['last_name_th'] . ' (' . $s['class_code'] . ' ' . $s['room'] . ')') ?>
                    </option>
                    <?php endforeach; ?>
                </select>
            </div>
            <div class="col-md-2">
                <button type="submit" class="btn btn-primary w-100"><i class="bi bi-search"></i> ดูรายงาน</button>
            </div>
        </form>
    </div>
</div>

<?php if($student): ?>

<!-- ข้อมูลนักเรียน -->
<div class="card mb-4" style="border-left:4px solid #0d6efd;">
    <div class="card-body">
        <div class="d-flex align-items-center gap-3">
            <div class="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center"
                 style="width:56px;height:56px;font-size:1.5rem;flex-shrink:0;">
                <i class="bi bi-person"></i>
            </div>
            <div>
                <h5 class="mb-1"><?= htmlspecialchars($student['first_name_th'] . ' ' . $student['last_name_th']) ?></h5>
                <div class="text-muted small">
                    รหัส <?= htmlspecialchars($student['student_id']) ?> &bull;
                    ห้อง <?= htmlspecialchars($student['class_code'] . ' ' . $student['room']) ?> &bull;
                    <?= htmlspecialchars($student['dept_name_th']) ?>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- สถิติ -->
<div class="row g-3 mb-4">
    <div class="col-6 col-md-3">
        <div class="card text-center bg-primary text-white">
            <div class="card-body py-3"><h3><?= $stats['total'] ?></h3><small>ครั้งทั้งหมด</small></div>
        </div>
    </div>
    <div class="col-6 col-md-3">
        <div class="card text-center bg-success text-white">
            <div class="card-body py-3"><h3><?= $stats['มาเรียน'] ?></h3><small>มาเรียน</small></div>
        </div>
    </div>
    <div class="col-6 col-md-3">
        <div class="card text-center bg-warning text-dark">
            <div class="card-body py-3"><h3><?= $stats['สาย'] ?></h3><small>มาสาย</small></div>
        </div>
    </div>
    <div class="col-6 col-md-3">
        <div class="card text-center bg-danger text-white">
            <div class="card-body py-3"><h3><?= $stats['ขาดเรียน'] ?></h3><small>ขาดเรียน</small></div>
        </div>
    </div>
</div>

<?php if($stats['total'] > 0): ?>
<div class="card mb-4">
    <div class="card-body">
        <div class="d-flex justify-content-between mb-1">
            <span class="fw-semibold">อัตราการเข้าเรียน (รวมสาย)</span>
            <span class="fw-bold <?= $pct >= 80 ? 'text-success' : 'text-danger' ?>"><?= $pct ?>%</span>
        </div>
        <div class="progress" style="height:12px;">
            <div class="progress-bar <?= $pct >= 80 ? 'bg-success' : ($pct >= 60 ? 'bg-warning' : 'bg-danger') ?>"
                 style="width:<?= $pct ?>%;"></div>
        </div>
        <?php if($pct < 80): ?>
        <div class="alert alert-danger mt-3 mb-0 py-2 small">
            <i class="bi bi-exclamation-triangle-fill"></i>
            อัตราการเข้าเรียนต่ำกว่า 80% – ควรดำเนินการติดตาม
        </div>
        <?php endif; ?>
    </div>
</div>
<?php endif; ?>

<!-- ประวัติ -->
<div class="card">
    <div class="card-header d-flex justify-content-between align-items-center">
        <h5 class="mb-0"><i class="bi bi-calendar3"></i> ประวัติการเข้าเรียน</h5>
        <?php if($records): ?>
        <button onclick="exportCSV('indivTable','individual_<?= htmlspecialchars($student_id) ?>.csv')" class="btn btn-sm btn-outline-secondary">
            <i class="bi bi-filetype-csv"></i> Export
        </button>
        <?php endif; ?>
    </div>
    <div class="card-body p-0">
    <?php if(empty($records)): ?>
        <div class="text-center text-muted py-4"><i class="bi bi-inbox fs-1 d-block mb-2"></i>ไม่พบข้อมูล</div>
    <?php else: ?>
    <div class="table-responsive">
        <table class="table table-hover mb-0" id="indivTable">
            <thead class="table-light">
                <tr><th>#</th><th>วันที่</th><th>เวลา</th><th>สถานะ</th><th>หมายเหตุ</th></tr>
            </thead>
            <tbody>
            <?php foreach($records as $i => $r): ?>
            <tr>
                <td><?= $i + 1 ?></td>
                <td><?= date('d/m/Y', strtotime($r['check_in_date'])) ?></td>
                <td><?= htmlspecialchars($r['check_in_time'] ?? '-') ?></td>
                <td><?= getStatusBadge($r['status']) ?></td>
                <td><small><?= htmlspecialchars($r['note'] ?? '') ?></small></td>
            </tr>
            <?php endforeach; ?>
            </tbody>
        </table>
    </div>
    <?php endif; ?>
    </div>
</div>

<script>
function exportCSV(tableId, filename) {
    const table = document.getElementById(tableId);
    if(!table) return;
    let csv = [];
    table.querySelectorAll('tr').forEach(row => {
        const cols = [...row.querySelectorAll('th,td')].map(c => '"' + c.innerText.replace(/"/g,'""') + '"');
        csv.push(cols.join(','));
    });
    const blob = new Blob(['\ufeff' + csv.join('\n')], {type:'text/csv;charset=utf-8;'});
    const a = Object.assign(document.createElement('a'), {href:URL.createObjectURL(blob), download:filename});
    a.click();
    URL.revokeObjectURL(a.href);
}
</script>
<?php endif; ?>

<?php include '../includes/footer.php'; ?>
