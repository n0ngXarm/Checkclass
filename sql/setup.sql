-- =====================================================
-- ไฟล์: setup.sql
-- สำหรับ: ระบบเช็คชื่อ (รอบที่ 2)
-- รันครั้งเดียวจบ! (One-click setup)
-- =====================================================

-- ปิด Foreign Key Check ชั่วคราว
SET FOREIGN_KEY_CHECKS = 0;

-- =====================================================
-- 1. ลบตารางทั้งหมด (ถ้ามี)
-- =====================================================
DROP TABLE IF EXISTS attendance;
DROP TABLE IF EXISTS teacher_class;
DROP TABLE IF EXISTS enrollments;
DROP TABLE IF EXISTS profiles;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS roles;
DROP TABLE IF EXISTS student;
DROP TABLE IF EXISTS teacher;
DROP TABLE IF EXISTS classes;
DROP TABLE IF EXISTS semesters;
DROP TABLE IF EXISTS departments;

-- =====================================================
-- 2. สร้างตารางใหม่ทั้งหมด
-- =====================================================

-- 2.1 ตาราง roles
CREATE TABLE roles (
    role_id INT PRIMARY KEY AUTO_INCREMENT,
    role_name VARCHAR(50) NOT NULL UNIQUE,
    permissions JSON
);

-- 2.2 ตาราง users
CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role_id INT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    is_approved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(role_id)
);

-- 2.3 ตาราง profiles
CREATE TABLE profiles (
    profile_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT UNIQUE NOT NULL,
    title VARCHAR(20),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    avatar VARCHAR(255),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 2.4 ตาราง departments
CREATE TABLE departments (
    dept_id INT PRIMARY KEY AUTO_INCREMENT,
    dept_name VARCHAR(100) NOT NULL UNIQUE,
    dept_group ENUM('ช่างอุตสาหกรรม', 'บริหารธุรกิจ', 'สามัญ', 'อื่นๆ') DEFAULT 'อื่นๆ'
);

-- 2.5 ตาราง semesters
CREATE TABLE semesters (
    semester_id INT PRIMARY KEY AUTO_INCREMENT,
    academic_year YEAR NOT NULL,
    semester ENUM('1', '2', 'summer') NOT NULL,
    semester_name VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT FALSE,
    start_date DATE,
    end_date DATE,
    UNIQUE KEY unique_semester (academic_year, semester)
);

-- 2.6 ตาราง classes
CREATE TABLE classes (
    class_id INT PRIMARY KEY AUTO_INCREMENT,
    class_name VARCHAR(50) NOT NULL,
    dept_id INT NOT NULL,
    academic_year YEAR NOT NULL,
    semester ENUM('1', '2') NOT NULL,
    FOREIGN KEY (dept_id) REFERENCES departments(dept_id),
    UNIQUE KEY unique_class (class_name, dept_id, academic_year, semester)
);

-- 2.7 ตาราง teacher
CREATE TABLE teacher (
    teacher_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT UNIQUE,
    teacher_code VARCHAR(10) UNIQUE NOT NULL,
    academic_title ENUM('ดร.', 'ผศ.', 'รศ.', 'ศ.', '') DEFAULT '',
    personal_title ENUM('นาย', 'นาง', 'นางสาว') NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    dept_id INT,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (dept_id) REFERENCES departments(dept_id)
);

-- 2.8 ตาราง student
CREATE TABLE student (
    student_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT UNIQUE,
    student_code VARCHAR(20) UNIQUE NOT NULL,
    title ENUM('นาย', 'นางสาว', 'นาง', 'เด็กชาย', 'เด็กหญิง') NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- 2.9 ตาราง enrollments
CREATE TABLE enrollments (
    enrollment_id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    class_id INT NOT NULL,
    semester_id INT NOT NULL,
    enrollment_date DATE DEFAULT (CURRENT_DATE),
    status ENUM('กำลังศึกษา', 'สำเร็จการศึกษา', 'ลาออก', 'พักการเรียน') DEFAULT 'กำลังศึกษา',
    FOREIGN KEY (student_id) REFERENCES student(student_id) ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES classes(class_id),
    FOREIGN KEY (semester_id) REFERENCES semesters(semester_id),
    UNIQUE KEY unique_enrollment (student_id, class_id, semester_id)
);

-- 2.10 ตาราง teacher_class
CREATE TABLE teacher_class (
    tc_id INT PRIMARY KEY AUTO_INCREMENT,
    teacher_id INT NOT NULL,
    class_id INT NOT NULL,
    academic_year YEAR NOT NULL,
    semester ENUM('1', '2') NOT NULL,
    is_homeroom BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (teacher_id) REFERENCES teacher(teacher_id),
    FOREIGN KEY (class_id) REFERENCES classes(class_id),
    UNIQUE KEY unique_assignment (teacher_id, class_id, academic_year, semester)
);

-- 2.11 ตาราง attendance
CREATE TABLE attendance (
    attendance_id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    teacher_id INT NOT NULL,
    class_id INT NOT NULL,
    check_in_date DATE NOT NULL,
    check_in_time TIME NOT NULL,
    status ENUM('มา', 'สาย', 'ขาด', 'ลา') NOT NULL DEFAULT 'มา',
    note TEXT,
    semester_id INT NOT NULL,
    FOREIGN KEY (student_id) REFERENCES student(student_id),
    FOREIGN KEY (teacher_id) REFERENCES teacher(teacher_id),
    FOREIGN KEY (class_id) REFERENCES classes(class_id),
    FOREIGN KEY (semester_id) REFERENCES semesters(semester_id)
);

-- =====================================================
-- 3. เพิ่มข้อมูลพื้นฐาน
-- =====================================================

-- 3.1 roles
INSERT INTO roles (role_name, permissions) VALUES
('SUPER_ADMIN', '{"all": true}'),
('TEACHER', '{"attendance": true, "report": true, "profile": true}'),
('STUDENT', '{"view_attendance": true, "profile": true}');

-- 3.2 departments (13 แผนก)
INSERT INTO departments (dept_name, dept_group) VALUES
('ช่างกลโรงงาน', 'ช่างอุตสาหกรรม'),
('ช่างยนต์', 'ช่างอุตสาหกรรม'),
('ช่างไฟฟ้ากำลัง', 'ช่างอุตสาหกรรม'),
('ช่างอิเล็กทรอนิกส์', 'ช่างอุตสาหกรรม'),
('ช่างเมคคาทรอนิกส์', 'ช่างอุตสาหกรรม'),
('ช่างก่อสร้าง', 'ช่างอุตสาหกรรม'),
('ช่างเทคโนโลยีสารสนเทศ', 'ช่างอุตสาหกรรม'),
('เทคนิคสถาปัตยกรรม', 'ช่างอุตสาหกรรม'),
('เทคนิคพื้นฐาน', 'ช่างอุตสาหกรรม'),
('เทคนิคอุตสาหกรรม', 'ช่างอุตสาหกรรม'),
('เทคนิคกายอุปกรณ์', 'ช่างอุตสาหกรรม'),
('บริหารธุรกิจ', 'บริหารธุรกิจ'),
('สามัญสัมพันธ์', 'สามัญ');

-- 3.3 semesters (6 ภาคเรียน)
INSERT INTO semesters (academic_year, semester, semester_name, is_active) VALUES
(2026, '1', 'ภาคเรียนที่ 1/2569', TRUE),
(2026, '2', 'ภาคเรียนที่ 2/2569', FALSE),
(2026, 'summer', 'ภาคเรียนฤดูร้อน/2569', FALSE),
(2025, '1', 'ภาคเรียนที่ 1/2568', FALSE),
(2025, '2', 'ภาคเรียนที่ 2/2568', FALSE),
(2025, 'summer', 'ภาคเรียนฤดูร้อน/2568', FALSE);

-- 3.4 สร้าง SUPER_ADMIN (รหัสผ่าน: 1234)
-- หมายเหตุ: ต้องเปลี่ยน password hash จริงก่อนใช้งาน
INSERT INTO users (username, email, password, role_id, is_active, is_approved) 
VALUES ('admin', 'admin@school.com', '$2y$10$YourHashedPasswordHere', 1, TRUE, TRUE);

-- 3.5 profile สำหรับ admin
INSERT INTO profiles (user_id, title, first_name, last_name, phone) 
VALUES (1, 'ดร.', 'สมชาย', 'ใจดี', '081-234-5678');

-- =====================================================
-- 4. เพิ่มห้องเรียน 83 ห้อง (ปี 2026 เทอม 1)
-- =====================================================

INSERT INTO classes (class_name, dept_id, academic_year, semester) VALUES
-- ช่างกลโรงงาน (dept_id=1)
('ปวช.1/1', 1, 2026, '1'), ('ปวช.1/2', 1, 2026, '1'), ('ปวช.2/1', 1, 2026, '1'), ('ปวช.2/2', 1, 2026, '1'), ('ปวช.3/1', 1, 2026, '1'), ('ปวส.1/1', 1, 2026, '1'), ('ปวส.2/1', 1, 2026, '1'),
-- ช่างยนต์ (dept_id=2)
('ปวช.1/1', 2, 2026, '1'), ('ปวช.1/2', 2, 2026, '1'), ('ปวช.2/1', 2, 2026, '1'), ('ปวช.2/2', 2, 2026, '1'), ('ปวช.3/1', 2, 2026, '1'), ('ปวส.1/1', 2, 2026, '1'), ('ปวส.2/1', 2, 2026, '1'),
-- ช่างไฟฟ้า (dept_id=3)
('ปวช.1/1', 3, 2026, '1'), ('ปวช.1/2', 3, 2026, '1'), ('ปวช.2/1', 3, 2026, '1'), ('ปวช.2/2', 3, 2026, '1'), ('ปวช.3/1', 3, 2026, '1'), ('ปวส.1/1', 3, 2026, '1'), ('ปวส.2/1', 3, 2026, '1'),
-- ช่างอิเล็ก (dept_id=4)
('ปวช.1/1', 4, 2026, '1'), ('ปวช.1/2', 4, 2026, '1'), ('ปวช.2/1', 4, 2026, '1'), ('ปวช.2/2', 4, 2026, '1'), ('ปวช.3/1', 4, 2026, '1'), ('ปวส.1/1', 4, 2026, '1'), ('ปวส.2/1', 4, 2026, '1'),
-- ช่างเมคคา (dept_id=5)
('ปวช.1/1', 5, 2026, '1'), ('ปวช.1/2', 5, 2026, '1'), ('ปวช.2/1', 5, 2026, '1'), ('ปวช.2/2', 5, 2026, '1'), ('ปวช.3/1', 5, 2026, '1'), ('ปวส.1/1', 5, 2026, '1'), ('ปวส.2/1', 5, 2026, '1'),
-- ช่างก่อสร้าง (dept_id=6)
('ปวช.1/1', 6, 2026, '1'), ('ปวช.1/2', 6, 2026, '1'), ('ปวช.2/1', 6, 2026, '1'), ('ปวช.2/2', 6, 2026, '1'), ('ปวช.3/1', 6, 2026, '1'), ('ปวส.1/1', 6, 2026, '1'), ('ปวส.2/1', 6, 2026, '1'),
-- ช่าง IT (dept_id=7)
('ปวช.1/1', 7, 2026, '1'), ('ปวช.1/2', 7, 2026, '1'), ('ปวช.2/1', 7, 2026, '1'), ('ปวช.2/2', 7, 2026, '1'), ('ปวช.3/1', 7, 2026, '1'), ('ปวส.1/1', 7, 2026, '1'), ('ปวส.2/1', 7, 2026, '1'),
-- เทคนิคสถาปัตย์ (dept_id=8)
('ปวช.1/1', 8, 2026, '1'), ('ปวช.2/1', 8, 2026, '1'), ('ปวช.3/1', 8, 2026, '1'), ('ปวส.1/1', 8, 2026, '1'), ('ปวส.2/1', 8, 2026, '1'),
-- เทคนิคพื้นฐาน (dept_id=9)
('ปวช.1/1', 9, 2026, '1'), ('ปวช.2/1', 9, 2026, '1'), ('ปวช.3/1', 9, 2026, '1'), ('ปวส.1/1', 9, 2026, '1'), ('ปวส.2/1', 9, 2026, '1'),
-- เทคนิคอุตสาหกรรม (dept_id=10)
('ปวช.1/1', 10, 2026, '1'), ('ปวช.2/1', 10, 2026, '1'), ('ปวช.3/1', 10, 2026, '1'), ('ปวส.1/1', 10, 2026, '1'), ('ปวส.2/1', 10, 2026, '1'),
-- เทคนิคกายอุปกรณ์ (dept_id=11)
('ปวช.1/1', 11, 2026, '1'), ('ปวช.2/1', 11, 2026, '1'), ('ปวช.3/1', 11, 2026, '1'), ('ปวส.1/1', 11, 2026, '1'), ('ปวส.2/1', 11, 2026, '1'),
-- บริหารธุรกิจ (dept_id=12)
('ปวช.1/1', 12, 2026, '1'), ('ปวช.1/2', 12, 2026, '1'), ('ปวช.2/1', 12, 2026, '1'), ('ปวช.2/2', 12, 2026, '1'), ('ปวช.3/1', 12, 2026, '1'), ('ปวส.1/1', 12, 2026, '1'), ('ปวส.2/1', 12, 2026, '1'),
-- สามัญสัมพันธ์ (dept_id=13)
('ปวช.1/1', 13, 2026, '1'), ('ปวช.1/2', 13, 2026, '1'), ('ปวช.2/1', 13, 2026, '1'), ('ปวช.2/2', 13, 2026, '1'), ('ปวช.3/1', 13, 2026, '1'), ('ปวส.1/1', 13, 2026, '1'), ('ปวส.2/1', 13, 2026, '1');

-- =====================================================
-- 5. ตรวจสอบจำนวน
-- =====================================================
SELECT 'departments' AS table_name, COUNT(*) FROM departments
UNION ALL SELECT 'semesters', COUNT(*) FROM semesters
UNION ALL SELECT 'classes', COUNT(*) FROM classes
UNION ALL SELECT 'users', COUNT(*) FROM users
UNION ALL SELECT 'profiles', COUNT(*) FROM profiles;

-- =====================================================
-- 6. เปิด Foreign Key Check อีกครั้ง
-- =====================================================
SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================
-- เสร็จสิ้น! ฐานข้อมูลพร้อมใช้งาน
-- =====================================================