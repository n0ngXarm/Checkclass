<?php
require_once '../includes/auth.php';
require_once '../includes/functions.php';
requireLogin();

$page_title = 'รายงานประจำวัน';
$db               = new Database();
$conn             = $db->getConnection();
$current_semester = getCurrentSemester();

$selected_date  = $_GET['check_date'] ?? date('Y-m-d');
$selected_class = (int)($_GET['class_id'] ?? 0);

// ดึงรายชื่อห้องเรียน
$classes_list = getClassList();

// ตรวจสอบคอลัมน์ที่มีใน attendance_records
$ar_cols = [];
try {
    $ar_cols = $conn->query("SHOW COLUMNS FROM attendance_records")->fetchAll(PDO::FETCH_COLUMN);
} catch(Exception $e) {}
$hasNote = in_array('note', $ar_cols);
$hasTime = in_array('check_in_time', $ar_cols);

// สร้าง Query
$select_extra = '';
if($hasTime) $select_extra .= ', a.check_in_time';
if($hasNote) $select_extra .= ', a.note';

$sql    = "SELECT a.status $select_extra,
                  s.student_id, s.first_name_th, s.last_name_th, s.student_number,
                  c.class_code, c.room
           FROM attendance_records a
           JOIN students s ON a.student_id = s.student_id
           JOIN classes  c ON a.class_id   = c.class_id
           WHERE a.check_in_date = :date AND a.semester_id = :sem";
$params = [':date'=>$selected_date, ':sem'=>$current_semester['semester_id'] ?? 0];

if($selected_class) {
    $sql .= " AND a.class_id = :class_id";
    $params[':class_id'] = $selected_class;
}
$sql .= " ORDER BY c.class_code, s.student_number ASC";

$rows = [];
try {
    $stmt = $conn->prepare($sql);
    $stmt->execute($params);
    $rows = $stmt->fetchAll();
} catch(Exception $e) {
    $rows = [];
}

// รวมสถิติ
$counts = ['มาเรียน'=>0,'ขาดเรียน'=>0,'สาย'=>0,'ลา'=>0];
foreach($rows as $r) {
    $key = $r['status'];
    if(isset($counts[$key])) $counts[$key]++;
}
$total   = count($rows);
$present = $counts['มาเรียน'] + $counts['สาย'];

include '../includes/header.php';
?>

<div class="row mb-3">
    <div class="col-12">
        <h2><i class="bi bi-calendar-day text-primary"></i> รายงานประจำวัน</h2>
    </div>
</div>

<!-- Filter -->
<div class="card mb-4">
    <div class="card-body">
        <form method="GET" class="row g-3 align-items-end">
            <div class="col-md-3">
                <label class="form-label fw-semibold">วันที่</label>
                <input type="date" name="check_date" class="form-control" value="<?= htmlspecialchars($selected_date) ?>">
            </div>
            <div class="col-md-4">
                <label class="form-label fw-semibold">ห้องเรียน</label>
                <select name="class_id" class="form-select">
                    <option value="0">ทุกห้อง</option>
                    <?php foreach($classes_list as $cls): ?>
                    <option value="<?= $cls['class_id'] ?>" <?= $selected_class==$cls['class_id']?'selected':'' ?>>
                        <?= htmlspecialchars($cls['class_code'] . ' ' . $cls['room']) ?>
                    </option>
                    <?php endforeach; ?>
                </select>
            </div>
            <div class="col-md-2">
                <button type="submit" class="btn btn-primary w-100"><i class="bi bi-filter"></i> กรอง</button>
            </div>
            <div class="col-md-2">
                <button type="button" onclick="window.print()" class="btn btn-outline-secondary w-100">
                    <i class="bi bi-printer"></i> พิมพ์
                </button>
            </div>
        </form>
    </div>
</div>

<!-- Stat cards -->
<div class="row g-3 mb-4">
    <div class="col-6 col-md-3">
        <div class="card stats-card bg-primary text-white text-center">
            <div class="card-body py-3">
                <h2 class="mb-0"><?= $total ?></h2>
                <small>ทั้งหมด</small>
            </div>
        </div>
    </div>
    <div class="col-6 col-md-3">
        <div class="card stats-card bg-success text-white text-center">
            <div class="card-body py-3">
                <h2 class="mb-0"><?= $present ?></h2>
                <small>มาเรียน (รวมสาย)</small>
            </div>
        </div>
    </div>
    <div class="col-6 col-md-3">
        <div class="card stats-card bg-warning text-dark text-center">
            <div class="card-body py-3">
                <h2 class="mb-0"><?= $counts['สาย'] ?></h2>
                <small>มาสาย</small>
            </div>
        </div>
    </div>
    <div class="col-6 col-md-3">
        <div class="card stats-card bg-danger text-white text-center">
            <div class="card-body py-3">
                <h2 class="mb-0"><?= $counts['ขาดเรียน'] ?></h2>
                <small>ขาดเรียน</small>
            </div>
        </div>
    </div>
</div>

<?php if($total > 0): $pct = round($present / $total * 100); ?>
<div class="mb-4">
    <div class="d-flex justify-content-between mb-1">
        <small>อัตราการเข้าเรียน</small>
        <small><?= $pct ?>%</small>
    </div>
    <div class="progress" style="height:10px;">
        <div class="progress-bar <?= $pct>=80?'bg-success':($pct>=60?'bg-warning':'bg-danger') ?>"
             style="width:<?= $pct ?>%;"></div>
    </div>
</div>
<?php endif; ?>

<!-- Table -->
<div class="card">
    <div class="card-header d-flex justify-content-between align-items-center">
        <h5 class="mb-0"><i class="bi bi-table"></i> รายละเอียด <?= date('d/m/Y', strtotime($selected_date)) ?></h5>
        <?php if($rows): ?>
        <button onclick="exportCSV('dailyTable','daily_<?= $selected_date ?>.csv')" class="btn btn-sm btn-outline-secondary">
            <i class="bi bi-filetype-csv"></i> Export CSV
        </button>
        <?php endif; ?>
    </div>
    <div class="card-body p-0">
    <?php if(empty($rows)): ?>
        <div class="text-center text-muted py-5"><i class="bi bi-inbox fs-1 d-block mb-2"></i>ไม่พบข้อมูลในวันที่เลือก</div>
    <?php else: ?>
    <div class="table-responsive">
        <table class="table table-hover mb-0" id="dailyTable">
            <thead class="table-light">
                <tr><th>#</th><th>รหัส</th><th>ชื่อ-นามสกุล</th><th>ห้อง</th><th>เวลา</th><th>สถานะ</th><th>หมายเหตุ</th></tr>
            </thead>
            <tbody>
            <?php foreach($rows as $i => $r): ?>
            <tr>
                <td><?= $i + 1 ?></td>
                <td><?= htmlspecialchars($r['student_id']) ?></td>
                <td><?= htmlspecialchars($r['first_name_th'] . ' ' . $r['last_name_th']) ?></td>
                <td><?= htmlspecialchars($r['class_code'] . ' ' . $r['room']) ?></td>
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

<?php include '../includes/footer.php'; ?>
