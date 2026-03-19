<?php
require_once '../includes/auth.php';
require_once '../includes/functions.php';
requireLogin();

$page_title   = 'แก้ไขข้อมูลนักเรียน';
$db           = new Database();
$conn         = $db->getConnection();
$classes_list = getClassList();
$errors       = [];

$id   = (int)($_GET['id'] ?? 0);
$stmt = $conn->prepare("SELECT * FROM students WHERE id = ?");
$stmt->execute([$id]);
$student = $stmt->fetch();

if(!$student) {
    header('Location: students.php');
    exit;
}

if($_SERVER['REQUEST_METHOD'] === 'POST') {
    $student_id    = htmlspecialchars(trim($_POST['student_id']    ?? ''));
    $first_name_th = htmlspecialchars(trim($_POST['first_name_th'] ?? ''));
    $last_name_th  = htmlspecialchars(trim($_POST['last_name_th']  ?? ''));
    $class_id      = (int)($_POST['class_id'] ?? 0);
    $student_number= htmlspecialchars(trim($_POST['student_number']?? ''));
    $gender        = $_POST['gender'] ?? '';

    if(!$student_id)    $errors[] = 'กรุณากรอกรหัสนักเรียน';
    if(!$first_name_th) $errors[] = 'กรุณากรอกชื่อ';
    if(!$last_name_th)  $errors[] = 'กรุณากรอกนามสกุล';
    if(!$class_id)      $errors[] = 'กรุณาเลือกห้องเรียน';

    if(empty($errors)) {
        $check = $conn->prepare("SELECT COUNT(*) FROM students WHERE student_id = ? AND id != ?");
        $check->execute([$student_id, $id]);
        if($check->fetchColumn() > 0) {
            $errors[] = 'รหัสนักเรียนนี้มีอยู่ในระบบแล้ว';
        } else {
            $conn->prepare(
                "UPDATE students SET student_id=?, first_name_th=?, last_name_th=?, class_id=?, student_number=?, gender=?
                 WHERE id=?"
            )->execute([$student_id, $first_name_th, $last_name_th, $class_id, $student_number, $gender, $id]);
            $_SESSION['flash_success'] = 'แก้ไขข้อมูลนักเรียนเรียบร้อยแล้ว';
            header('Location: students.php');
            exit;
        }
    }
    // keep posted values for re-display
    $student = array_merge($student, compact(
        'student_id','first_name_th','last_name_th','class_id','student_number','gender'
    ));
}

include '../includes/header.php';
?>

<div class="row justify-content-center">
<div class="col-md-8 col-lg-6">
<div class="card">
    <div class="card-header d-flex justify-content-between align-items-center">
        <h5 class="mb-0"><i class="bi bi-person-gear text-warning"></i> แก้ไขข้อมูลนักเรียน</h5>
        <a href="students.php" class="btn btn-sm btn-outline-secondary"><i class="bi bi-arrow-left"></i> กลับ</a>
    </div>
    <div class="card-body">
        <?php foreach($errors as $err): ?>
        <div class="alert alert-danger py-2 small"><i class="bi bi-exclamation-triangle"></i> <?= $err ?></div>
        <?php endforeach; ?>

        <form method="POST">
            <div class="row g-3">
                <div class="col-md-6">
                    <label class="form-label required-field">รหัสนักเรียน</label>
                    <input type="text" name="student_id" class="form-control"
                           value="<?= htmlspecialchars($student['student_id']) ?>" required>
                </div>
                <div class="col-md-6">
                    <label class="form-label">เลขที่</label>
                    <input type="text" name="student_number" class="form-control"
                           value="<?= htmlspecialchars($student['student_number'] ?? '') ?>">
                </div>
                <div class="col-md-6">
                    <label class="form-label required-field">ชื่อ (ภาษาไทย)</label>
                    <input type="text" name="first_name_th" class="form-control"
                           value="<?= htmlspecialchars($student['first_name_th']) ?>" required>
                </div>
                <div class="col-md-6">
                    <label class="form-label required-field">นามสกุล (ภาษาไทย)</label>
                    <input type="text" name="last_name_th" class="form-control"
                           value="<?= htmlspecialchars($student['last_name_th']) ?>" required>
                </div>
                <div class="col-md-8">
                    <label class="form-label required-field">ห้องเรียน</label>
                    <select name="class_id" class="form-select" required>
                        <option value="">-- เลือกห้องเรียน --</option>
                        <?php foreach($classes_list as $cls): ?>
                        <option value="<?= $cls['class_id'] ?>"
                                <?= $student['class_id'] == $cls['class_id'] ? 'selected' : '' ?>>
                            <?= htmlspecialchars($cls['class_code'] . ' – ' . $cls['room'] . ' (' . $cls['dept_name_th'] . ')') ?>
                        </option>
                        <?php endforeach; ?>
                    </select>
                </div>
                <div class="col-md-4">
                    <label class="form-label">เพศ</label>
                    <select name="gender" class="form-select">
                        <option value="">ไม่ระบุ</option>
                        <option value="ชาย"   <?= ($student['gender'] ?? '')==='ชาย'?'selected':'' ?>>♂ ชาย</option>
                        <option value="หญิง"  <?= ($student['gender'] ?? '')==='หญิง'?'selected':'' ?>>♀ หญิง</option>
                    </select>
                </div>
            </div>
            <div class="d-flex justify-content-between mt-4">
                <a href="students.php" class="btn btn-outline-secondary">ยกเลิก</a>
                <button type="submit" class="btn btn-warning">
                    <i class="bi bi-save"></i> บันทึกการแก้ไข
                </button>
            </div>
        </form>
    </div>
</div>
</div>
</div>

<?php include '../includes/footer.php'; ?>
