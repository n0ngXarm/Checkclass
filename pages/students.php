<?php
require_once '../includes/auth.php';
require_once '../includes/functions.php';
requireLogin();

$page_title = 'จัดการนักเรียน';
$db   = new Database();
$conn = $db->getConnection();

// ตรวจหา primary key column ของ students จริงๆ
$pk = 'id'; // default
try {
    $cols_info = $conn->query("SHOW KEYS FROM students WHERE Key_name = 'PRIMARY'")->fetchAll();
    if(!empty($cols_info)) $pk = $cols_info[0]['Column_name'];
} catch(Exception $e) {}

// Handle delete
if(isset($_GET['delete']) && is_numeric($_GET['delete'])) {
    $del_id = (int)$_GET['delete'];
    $conn->prepare("DELETE FROM students WHERE `$pk` = ?")->execute([$del_id]);
    $_SESSION['flash_success'] = 'ลบนักเรียนเรียบร้อยแล้ว';
    header('Location: students.php');
    exit;
}

// Filters
$class_filter = (int)($_GET['class_id'] ?? 0);
$search       = htmlspecialchars(trim($_GET['search'] ?? ''));

$sql = "SELECT s.`$pk` AS row_id, s.student_id, s.student_number,
               s.first_name_th, s.last_name_th,
               s.gender, c.class_id, c.class_code, c.room, d.dept_name_th
        FROM students s
        JOIN classes c ON s.class_id = c.class_id
        JOIN departments d ON c.dept_id = d.dept_id
        WHERE 1=1";
$params = [];

if($class_filter) { $sql .= " AND s.class_id = ?"; $params[] = $class_filter; }
if($search) {
    $sql .= " AND (s.first_name_th LIKE ? OR s.last_name_th LIKE ? OR s.student_id LIKE ?)";
    $like = '%' . $search . '%';
    array_push($params, $like, $like, $like);
}
$sql .= " ORDER BY c.class_code, s.student_number ASC";

$stmt = $conn->prepare($sql);
$stmt->execute($params);
$students = $stmt->fetchAll();

$classes_list = getClassList();

include '../includes/header.php';
?>

<!-- Flash -->
<?php if(isset($_SESSION['flash_success'])): ?>
<div class="alert alert-success alert-dismissible fade show"><i class="bi bi-check-circle"></i> <?= htmlspecialchars($_SESSION['flash_success']) ?>
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
</div>
<?php unset($_SESSION['flash_success']); endif; ?>

<!-- Filter bar -->
<div class="card mb-4">
    <div class="card-body">
        <form method="GET" class="row g-2 align-items-end">
            <div class="col-md-3">
                <label class="form-label">ห้องเรียน</label>
                <select name="class_id" class="form-select form-select-sm" onchange="this.form.submit()">
                    <option value="0">ทุกห้อง</option>
                    <?php foreach($classes_list as $cls): ?>
                    <option value="<?= $cls['class_id'] ?>" <?= $class_filter==$cls['class_id']?'selected':'' ?>>
                        <?= htmlspecialchars($cls['class_code'] . ' ' . $cls['room']) ?>
                    </option>
                    <?php endforeach; ?>
                </select>
            </div>
            <div class="col-md-4">
                <label class="form-label">ค้นหา</label>
                <input type="text" name="search" class="form-control form-control-sm"
                       placeholder="ชื่อ, รหัส..." value="<?= $search ?>">
            </div>
            <div class="col-auto"><button type="submit" class="btn btn-primary btn-sm"><i class="bi bi-search"></i></button></div>
            <?php if($class_filter || $search): ?>
            <div class="col-auto"><a href="students.php" class="btn btn-outline-secondary btn-sm">ล้าง</a></div>
            <?php endif; ?>
            <div class="col-auto ms-auto">
                <a href="student_add.php" class="btn btn-success btn-sm">
                    <i class="bi bi-person-plus"></i> เพิ่มนักเรียน
                </a>
            </div>
        </form>
    </div>
</div>

<div class="card">
    <div class="card-header d-flex justify-content-between align-items-center">
        <h5 class="mb-0"><i class="bi bi-people"></i> นักเรียน <?= count($students) ?> คน</h5>
        <button onclick="exportCSV('studentTable','students.csv')" class="btn btn-sm btn-outline-secondary">
            <i class="bi bi-filetype-csv"></i> Export
        </button>
    </div>
    <div class="card-body p-0">
    <?php if(empty($students)): ?>
        <div class="text-center text-muted py-5"><i class="bi bi-inbox fs-1 d-block mb-2"></i>ไม่พบข้อมูลนักเรียน</div>
    <?php else: ?>
    <div class="table-responsive">
        <table class="table table-hover mb-0" id="studentTable">
            <thead class="table-light">
                <tr><th>#</th><th>รหัส</th><th>ชื่อ</th><th>นามสกุล</th><th>ห้อง</th><th>สาขา</th><th>จัดการ</th></tr>
            </thead>
            <tbody>
            <?php foreach($students as $i => $stu): ?>
            <tr>
                <td><?= $i + 1 ?></td>
                <td><?= htmlspecialchars($stu['student_id']) ?></td>
                <td><?= htmlspecialchars($stu['first_name_th']) ?></td>
                <td><?= htmlspecialchars($stu['last_name_th']) ?></td>
                <td><?= htmlspecialchars($stu['class_code'] . ' ' . $stu['room']) ?></td>
                <td><small><?= htmlspecialchars($stu['dept_name_th']) ?></small></td>
                <td>
                    <a href="student_edit.php?id=<?= $stu['row_id'] ?>" class="btn btn-sm btn-warning" title="แก้ไข">
                        <i class="bi bi-pencil"></i>
                    </a>
                    <a href="?delete=<?= $stu['row_id'] ?>" class="btn btn-sm btn-danger" title="ลบ"
                       onclick="return confirm('ยืนยันการลบ <?= htmlspecialchars($stu['first_name_th']) ?>?')">
                        <i class="bi bi-trash"></i>
                    </a>
                </td>
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
    let csv = [];
    table.querySelectorAll('tr').forEach(r => {
        const cols = [...r.querySelectorAll('th,td')].map(c => '"'+c.innerText.replace(/"/g,'""')+'"');
        csv.push(cols.join(','));
    });
    const blob = new Blob(['\ufeff'+csv.join('\n')], {type:'text/csv;charset=utf-8;'});
    const a = Object.assign(document.createElement('a'), {href:URL.createObjectURL(blob), download:filename});
    a.click();
}
</script>

<?php include '../includes/footer.php'; ?>
