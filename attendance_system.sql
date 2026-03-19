-- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
--
-- Host: mysql-39ead0ed-pisitpong04-f1bb.f.aivencloud.com    Database: attendance_system
-- ------------------------------------------------------
-- Server version	8.0.45

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ '5148af68-1fa6-11f1-8306-7a0c062bd281:1-15,
afcf2b90-1e20-11f1-b25e-526fda60f779:1-85,
efc7fdf6-1fa6-11f1-84a6-6ed21bd63578:1-297';

--
-- Table structure for table `attendance_records`
--

DROP TABLE IF EXISTS `attendance_records`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `attendance_records` (
  `attendance_id` int NOT NULL AUTO_INCREMENT,
  `student_id` int NOT NULL,
  `teacher_id` int NOT NULL,
  `semester_id` int NOT NULL,
  `class_id` int NOT NULL,
  `check_in_date` date NOT NULL,
  `check_in_time` time DEFAULT NULL,
  `status` enum('มาเรียน','ขาดเรียน','สาย','ลา','มาสาย') DEFAULT 'มาเรียน',
  `remark` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`attendance_id`),
  UNIQUE KEY `unique_attendance` (`student_id`,`check_in_date`,`semester_id`),
  KEY `teacher_id` (`teacher_id`),
  KEY `semester_id` (`semester_id`),
  KEY `class_id` (`class_id`),
  KEY `idx_student_semester` (`student_id`,`semester_id`),
  KEY `idx_date` (`check_in_date`),
  KEY `idx_status` (`status`),
  CONSTRAINT `attendance_records_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`) ON DELETE CASCADE,
  CONSTRAINT `attendance_records_ibfk_2` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`teacher_id`),
  CONSTRAINT `attendance_records_ibfk_3` FOREIGN KEY (`semester_id`) REFERENCES `semesters` (`semester_id`),
  CONSTRAINT `attendance_records_ibfk_4` FOREIGN KEY (`class_id`) REFERENCES `classes` (`class_id`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `attendance_records`
--

LOCK TABLES `attendance_records` WRITE;
/*!40000 ALTER TABLE `attendance_records` DISABLE KEYS */;
INSERT INTO `attendance_records` VALUES (1,23,1,1,1,'2026-03-18',NULL,'มาเรียน',NULL,'2026-03-18 19:02:21'),(2,24,1,1,1,'2026-03-18',NULL,'มาเรียน',NULL,'2026-03-18 19:02:21'),(3,25,1,1,1,'2026-03-18',NULL,'มาเรียน',NULL,'2026-03-18 19:02:21'),(4,26,1,1,1,'2026-03-18',NULL,'มาเรียน',NULL,'2026-03-18 19:02:22'),(5,27,1,1,1,'2026-03-18',NULL,'มาเรียน',NULL,'2026-03-18 19:02:22'),(6,28,1,1,1,'2026-03-18',NULL,'ขาดเรียน',NULL,'2026-03-18 19:02:22'),(7,29,1,1,1,'2026-03-18',NULL,'มาเรียน',NULL,'2026-03-18 19:02:22'),(8,30,1,1,1,'2026-03-18',NULL,'มาเรียน',NULL,'2026-03-18 19:02:23'),(9,31,1,1,1,'2026-03-18',NULL,'มาเรียน',NULL,'2026-03-18 19:02:23'),(10,32,1,1,1,'2026-03-18',NULL,'มาเรียน',NULL,'2026-03-18 19:02:23'),(11,33,1,1,1,'2026-03-18',NULL,'มาเรียน',NULL,'2026-03-18 19:02:23'),(12,34,1,1,1,'2026-03-18',NULL,'มาเรียน',NULL,'2026-03-18 19:02:23'),(13,35,1,1,1,'2026-03-18',NULL,'มาเรียน',NULL,'2026-03-18 19:02:24'),(14,36,1,1,1,'2026-03-18',NULL,'มาเรียน',NULL,'2026-03-18 19:02:24'),(15,37,1,1,1,'2026-03-18',NULL,'มาเรียน',NULL,'2026-03-18 19:02:24'),(16,38,1,1,1,'2026-03-18',NULL,'มาเรียน',NULL,'2026-03-18 19:02:24'),(17,39,1,1,1,'2026-03-18',NULL,'มาเรียน',NULL,'2026-03-18 19:02:25'),(18,40,1,1,1,'2026-03-18',NULL,'มาเรียน',NULL,'2026-03-18 19:02:25'),(19,41,1,1,1,'2026-03-18',NULL,'มาเรียน',NULL,'2026-03-18 19:02:25'),(20,42,1,1,1,'2026-03-18',NULL,'มาเรียน',NULL,'2026-03-18 19:02:26'),(21,43,1,1,1,'2026-03-18',NULL,'มาเรียน',NULL,'2026-03-18 19:02:26'),(22,44,1,1,1,'2026-03-18',NULL,'ขาดเรียน',NULL,'2026-03-18 19:02:26');
/*!40000 ALTER TABLE `attendance_records` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `classes`
--

DROP TABLE IF EXISTS `classes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `classes` (
  `class_id` int NOT NULL AUTO_INCREMENT,
  `class_code` varchar(20) NOT NULL,
  `class_name` varchar(50) DEFAULT NULL,
  `level_id` int NOT NULL,
  `dept_id` int NOT NULL,
  `room` varchar(10) DEFAULT NULL,
  `academic_year` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`class_id`),
  UNIQUE KEY `class_code` (`class_code`),
  KEY `dept_id` (`dept_id`),
  KEY `idx_level_dept` (`level_id`,`dept_id`),
  CONSTRAINT `classes_ibfk_1` FOREIGN KEY (`level_id`) REFERENCES `education_levels` (`level_id`),
  CONSTRAINT `classes_ibfk_2` FOREIGN KEY (`dept_id`) REFERENCES `departments` (`dept_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `classes`
--

LOCK TABLES `classes` WRITE;
/*!40000 ALTER TABLE `classes` DISABLE KEYS */;
INSERT INTO `classes` VALUES (1,'DV1-IT-B','ปวส.1 IT ห้อง B',4,1,'B',2567,'2026-03-18 17:37:08');
/*!40000 ALTER TABLE `classes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `departments`
--

DROP TABLE IF EXISTS `departments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `departments` (
  `dept_id` int NOT NULL AUTO_INCREMENT,
  `dept_code` varchar(10) NOT NULL,
  `dept_name_th` varchar(100) NOT NULL,
  `dept_name_en` varchar(100) DEFAULT NULL,
  `dept_short` varchar(20) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`dept_id`),
  UNIQUE KEY `dept_code` (`dept_code`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `departments`
--

LOCK TABLES `departments` WRITE;
/*!40000 ALTER TABLE `departments` DISABLE KEYS */;
INSERT INTO `departments` VALUES (1,'IT','เทคโนโลยีสารสนเทศ','Information Technology','IT','2026-03-18 17:34:21');
/*!40000 ALTER TABLE `departments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `education_levels`
--

DROP TABLE IF EXISTS `education_levels`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `education_levels` (
  `level_id` int NOT NULL AUTO_INCREMENT,
  `level_code` varchar(10) NOT NULL,
  `level_name_th` varchar(50) NOT NULL,
  `level_name_en` varchar(50) DEFAULT NULL,
  `level_order` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`level_id`),
  UNIQUE KEY `level_code` (`level_code`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `education_levels`
--

LOCK TABLES `education_levels` WRITE;
/*!40000 ALTER TABLE `education_levels` DISABLE KEYS */;
INSERT INTO `education_levels` VALUES (1,'V1','ปวช.1','Vocational Certificate Year 1',1,'2026-03-18 17:33:16'),(2,'V2','ปวช.2','Vocational Certificate Year 2',2,'2026-03-18 17:33:16'),(3,'V3','ปวช.3','Vocational Certificate Year 3',3,'2026-03-18 17:33:16'),(4,'DV1','ปวส.1','Diploma Year 1',4,'2026-03-18 17:33:16'),(5,'DV2','ปวส.2','Diploma Year 2',5,'2026-03-18 17:33:16');
/*!40000 ALTER TABLE `education_levels` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `semesters`
--

DROP TABLE IF EXISTS `semesters`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `semesters` (
  `semester_id` int NOT NULL AUTO_INCREMENT,
  `semester_name_th` varchar(50) NOT NULL,
  `semester_name_en` varchar(50) DEFAULT NULL,
  `semester_code` varchar(10) NOT NULL,
  `academic_year` int NOT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `is_current` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`semester_id`),
  UNIQUE KEY `semester_code` (`semester_code`),
  KEY `idx_year` (`academic_year`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `semesters`
--

LOCK TABLES `semesters` WRITE;
/*!40000 ALTER TABLE `semesters` DISABLE KEYS */;
INSERT INTO `semesters` VALUES (1,'ภาคเรียนที่ 1/2569','Semester 1/2024','1/2567',2567,'2024-05-16','2024-09-30',1,'2026-03-18 17:38:34'),(2,'ภาคเรียนที่ 2/2569','Semester 2/2024','2/2567',2567,'2024-11-01','2025-02-28',0,'2026-03-18 17:38:34'),(3,'ภาคเรียนฤดูร้อน/2569','Summer/2024','S/2567',2567,'2025-03-01','2025-04-30',0,'2026-03-18 17:38:34'),(4,'ภาคเรียนที่ 1/2570','Semester 1/2025','1/2568',2568,'2025-05-16','2025-09-30',0,'2026-03-18 17:38:34');
/*!40000 ALTER TABLE `semesters` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `students`
--

DROP TABLE IF EXISTS `students`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `students` (
  `student_id` int NOT NULL AUTO_INCREMENT,
  `student_code` varchar(20) NOT NULL,
  `title_th` varchar(20) DEFAULT NULL,
  `first_name_th` varchar(100) NOT NULL,
  `last_name_th` varchar(100) NOT NULL,
  `title_en` varchar(20) DEFAULT NULL,
  `first_name_en` varchar(100) DEFAULT NULL,
  `last_name_en` varchar(100) DEFAULT NULL,
  `class_id` int NOT NULL,
  `student_number` int DEFAULT NULL,
  `gender` enum('male','female','other') DEFAULT 'other',
  `birth_date` date DEFAULT NULL,
  `phone` varchar(10) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `status` enum('studying','graduated','withdrawn') DEFAULT 'studying',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`student_id`),
  UNIQUE KEY `student_code` (`student_code`),
  KEY `idx_class` (`class_id`),
  KEY `idx_code` (`student_code`),
  CONSTRAINT `students_ibfk_1` FOREIGN KEY (`class_id`) REFERENCES `classes` (`class_id`)
) ENGINE=InnoDB AUTO_INCREMENT=45 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `students`
--

LOCK TABLES `students` WRITE;
/*!40000 ALTER TABLE `students` DISABLE KEYS */;
INSERT INTO `students` VALUES (23,'68319010039','นาย','กฤษณะ','พรมโยธา',NULL,NULL,NULL,1,1,'male',NULL,NULL,NULL,'studying','2026-03-18 17:37:27'),(24,'68319010040','นาย','จตุพล','หัวนา',NULL,NULL,NULL,1,2,'male',NULL,NULL,NULL,'studying','2026-03-18 17:37:27'),(25,'68319010042','นาย','ณัฐฐ์ณนน','โพธิ์อัมพล',NULL,NULL,NULL,1,3,'male',NULL,NULL,NULL,'studying','2026-03-18 17:37:27'),(26,'68319010043','นาย','ทยากร','อินตานอน',NULL,NULL,NULL,1,4,'male',NULL,NULL,NULL,'studying','2026-03-18 17:37:27'),(27,'68319010044','นาย','นภดล','ชัยยา',NULL,NULL,NULL,1,5,'male',NULL,NULL,NULL,'studying','2026-03-18 17:37:27'),(28,'68319010045','นาย','ปัฐพล','วงค์เลย',NULL,NULL,NULL,1,6,'male',NULL,NULL,NULL,'studying','2026-03-18 17:37:27'),(29,'68319010046','นาย','พงศ์เทพ','ลุงหย่า',NULL,NULL,NULL,1,7,'male',NULL,NULL,NULL,'studying','2026-03-18 17:37:27'),(30,'68319010047','นาย','พสิษฐ์','ประวรรณ',NULL,NULL,NULL,1,8,'male',NULL,NULL,NULL,'studying','2026-03-18 17:37:27'),(31,'68319010048','นาย','พิสิษฐ์พงษ์','บุญเรือง',NULL,NULL,NULL,1,9,'male',NULL,NULL,NULL,'studying','2026-03-18 17:37:27'),(32,'68319010049','นาย','เพชรระพีพัฒน์','นันตรัตน์',NULL,NULL,NULL,1,10,'male',NULL,NULL,NULL,'studying','2026-03-18 17:37:27'),(33,'68319010050','นาย','ภัทรดนัย','แก้วจัน',NULL,NULL,NULL,1,11,'male',NULL,NULL,NULL,'studying','2026-03-18 17:37:27'),(34,'68319010051','นาย','วีรภัทร','สมนะ',NULL,NULL,NULL,1,12,'male',NULL,NULL,NULL,'studying','2026-03-18 17:37:27'),(35,'68319010052','นาย','วีราพงศ์','ธรรมใจ',NULL,NULL,NULL,1,13,'male',NULL,NULL,NULL,'studying','2026-03-18 17:37:27'),(36,'68319010053','นาย','ศุภกร','เปรมมะโน',NULL,NULL,NULL,1,14,'male',NULL,NULL,NULL,'studying','2026-03-18 17:37:27'),(37,'68319010055','นางสาว','สุดาแก้ว','พญา',NULL,NULL,NULL,1,15,'female',NULL,NULL,NULL,'studying','2026-03-18 17:37:27'),(38,'68319010056','นาย','เสกสรรณ์','ชายกวินภพ',NULL,NULL,NULL,1,16,'male',NULL,NULL,NULL,'studying','2026-03-18 17:37:27'),(39,'68319010057','นางสาว','อรชุมา','จอต๊ะ',NULL,NULL,NULL,1,17,'female',NULL,NULL,NULL,'studying','2026-03-18 17:37:27'),(40,'68319010058','นาย','อัมรินทร์','ทองคำ',NULL,NULL,NULL,1,18,'male',NULL,NULL,NULL,'studying','2026-03-18 17:37:27'),(41,'68319010059','นาย','ฤามเม','แย้มสำรวจ',NULL,NULL,NULL,1,19,'male',NULL,NULL,NULL,'studying','2026-03-18 17:37:27'),(42,'68319010060','นางสาว','อมรา','อิศระภักดี',NULL,NULL,NULL,1,20,'female',NULL,NULL,NULL,'studying','2026-03-18 17:37:27'),(43,'68319010061','นาย','ศุภกิจ','กิติทรัพย์',NULL,NULL,NULL,1,21,'male',NULL,NULL,NULL,'studying','2026-03-18 17:37:27'),(44,'68319010064','นาย','วีรภัทร','ปิมป้อ',NULL,NULL,NULL,1,22,'male',NULL,NULL,NULL,'studying','2026-03-18 17:37:27');
/*!40000 ALTER TABLE `students` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `teacher_positions`
--

DROP TABLE IF EXISTS `teacher_positions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `teacher_positions` (
  `position_id` int NOT NULL AUTO_INCREMENT,
  `position_name_th` varchar(100) NOT NULL,
  `position_name_en` varchar(100) DEFAULT NULL,
  `description` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`position_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `teacher_positions`
--

LOCK TABLES `teacher_positions` WRITE;
/*!40000 ALTER TABLE `teacher_positions` DISABLE KEYS */;
INSERT INTO `teacher_positions` VALUES (1,'หัวหน้าแผนก','Department Head',NULL,'2026-03-18 17:33:29'),(2,'อาจารย์ประจำชั้น','Class Teacher',NULL,'2026-03-18 17:33:29'),(3,'อาจารย์ผู้สอน','Instructor',NULL,'2026-03-18 17:33:29'),(4,'อาจารย์พิเศษ','Part-time Teacher',NULL,'2026-03-18 17:33:29');
/*!40000 ALTER TABLE `teacher_positions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `teachers`
--

DROP TABLE IF EXISTS `teachers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `teachers` (
  `teacher_id` int NOT NULL AUTO_INCREMENT,
  `teacher_code` varchar(10) NOT NULL,
  `title_th` varchar(20) DEFAULT NULL,
  `first_name_th` varchar(100) NOT NULL,
  `last_name_th` varchar(100) NOT NULL,
  `title_en` varchar(20) DEFAULT NULL,
  `first_name_en` varchar(100) DEFAULT NULL,
  `last_name_en` varchar(100) DEFAULT NULL,
  `dept_id` int NOT NULL,
  `position_id` int DEFAULT NULL,
  `tel` varchar(10) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`teacher_id`),
  UNIQUE KEY `teacher_code` (`teacher_code`),
  KEY `position_id` (`position_id`),
  KEY `idx_dept` (`dept_id`),
  CONSTRAINT `teachers_ibfk_1` FOREIGN KEY (`dept_id`) REFERENCES `departments` (`dept_id`),
  CONSTRAINT `teachers_ibfk_2` FOREIGN KEY (`position_id`) REFERENCES `teacher_positions` (`position_id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `teachers`
--

LOCK TABLES `teachers` WRITE;
/*!40000 ALTER TABLE `teachers` DISABLE KEYS */;
INSERT INTO `teachers` VALUES (1,'T001','อาจารย์','ฐาปนันท์','ปัญญามี',NULL,NULL,NULL,1,1,'0812345678','thapanan@school.ac.th','active','2026-03-18 17:34:51'),(2,'T002','อาจารย์','วราภรณ์','แผ่นฟ้า',NULL,NULL,NULL,1,2,'0823456789','waraporn@school.ac.th','active','2026-03-18 17:34:51'),(3,'T003','อาจารย์','อนุชาติ','รังสิยานนท์',NULL,NULL,NULL,1,3,'0834567890','anuchat@school.ac.th','active','2026-03-18 17:34:51'),(4,'T004','อาจารย์','ธฤต','ไชยมงคล',NULL,NULL,NULL,1,3,'0845678901','tharit@school.ac.th','active','2026-03-18 17:34:51'),(5,'T005','อาจารย์','อมรินทร์','เลขะวณิชย์',NULL,NULL,NULL,1,3,'0856789012','amarin@school.ac.th','active','2026-03-18 17:34:51'),(6,'T006','อาจารย์','นฐมนพรรณ','สุวรรณชาตรี',NULL,NULL,NULL,1,3,'0867890123','nathamol@school.ac.th','active','2026-03-18 17:34:51'),(7,'T007','อาจารย์','วิเชียร','คำปาต๋า',NULL,NULL,NULL,1,3,'0878901234','wichean@school.ac.th','active','2026-03-18 17:34:51');
/*!40000 ALTER TABLE `teachers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary view structure for view `vw_daily_attendance_summary`
--

DROP TABLE IF EXISTS `vw_daily_attendance_summary`;
/*!50001 DROP VIEW IF EXISTS `vw_daily_attendance_summary`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `vw_daily_attendance_summary` AS SELECT 
 1 AS `วันที่`,
 1 AS `ห้องเรียน`,
 1 AS `จำนวนนักเรียนทั้งหมด`,
 1 AS `มาเรียน`,
 1 AS `ขาดเรียน`,
 1 AS `สาย`,
 1 AS `ลา`,
 1 AS `อัตราการมาเรียน`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `vw_frequent_late_students`
--

DROP TABLE IF EXISTS `vw_frequent_late_students`;
/*!50001 DROP VIEW IF EXISTS `vw_frequent_late_students`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `vw_frequent_late_students` AS SELECT 
 1 AS `student_code`,
 1 AS `student_name`,
 1 AS `class_code`,
 1 AS `จำนวนครั้งที่สาย`,
 1 AS `วันที่มาสาย`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `vw_student_attendance_summary`
--

DROP TABLE IF EXISTS `vw_student_attendance_summary`;
/*!50001 DROP VIEW IF EXISTS `vw_student_attendance_summary`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `vw_student_attendance_summary` AS SELECT 
 1 AS `รหัสนักศึกษา`,
 1 AS `ชื่อ_สกุล`,
 1 AS `เลขที่`,
 1 AS `ห้อง`,
 1 AS `ภาคเรียน`,
 1 AS `จำนวนวันทั้งหมด`,
 1 AS `มาเรียน`,
 1 AS `ขาดเรียน`,
 1 AS `สาย`,
 1 AS `ลา`,
 1 AS `อัตราการมาเรียน`*/;
SET character_set_client = @saved_cs_client;

--
-- Final view structure for view `vw_daily_attendance_summary`
--

/*!50001 DROP VIEW IF EXISTS `vw_daily_attendance_summary`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`avnadmin`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `vw_daily_attendance_summary` AS select `a`.`check_in_date` AS `วันที่`,`c`.`class_code` AS `ห้องเรียน`,count(distinct `a`.`student_id`) AS `จำนวนนักเรียนทั้งหมด`,sum((case when (`a`.`status` in ('มาเรียน','สาย','มาสาย')) then 1 else 0 end)) AS `มาเรียน`,sum((case when (`a`.`status` = 'ขาดเรียน') then 1 else 0 end)) AS `ขาดเรียน`,sum((case when (`a`.`status` in ('สาย','มาสาย')) then 1 else 0 end)) AS `สาย`,sum((case when (`a`.`status` = 'ลา') then 1 else 0 end)) AS `ลา`,concat(round(((sum((case when (`a`.`status` in ('มาเรียน','สาย','มาสาย')) then 1 else 0 end)) * 100.0) / count(0)),1),'%') AS `อัตราการมาเรียน` from (`attendance_records` `a` join `classes` `c` on((`a`.`class_id` = `c`.`class_id`))) group by `a`.`check_in_date`,`c`.`class_code` order by `a`.`check_in_date` desc */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `vw_frequent_late_students`
--

/*!50001 DROP VIEW IF EXISTS `vw_frequent_late_students`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`avnadmin`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `vw_frequent_late_students` AS select `s`.`student_code` AS `student_code`,concat(`s`.`title_th`,`s`.`first_name_th`,' ',`s`.`last_name_th`) AS `student_name`,`c`.`class_code` AS `class_code`,count(0) AS `จำนวนครั้งที่สาย`,group_concat(distinct date_format(`a`.`check_in_date`,'%d/%m/%Y') order by `a`.`check_in_date` DESC separator ', ') AS `วันที่มาสาย` from ((`attendance_records` `a` join `students` `s` on((`a`.`student_id` = `s`.`student_id`))) join `classes` `c` on((`s`.`class_id` = `c`.`class_id`))) where (`a`.`status` in ('สาย','มาสาย')) group by `s`.`student_id` having (count(0) >= 3) order by count(0) desc */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `vw_student_attendance_summary`
--

/*!50001 DROP VIEW IF EXISTS `vw_student_attendance_summary`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`avnadmin`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `vw_student_attendance_summary` AS select `s`.`student_code` AS `รหัสนักศึกษา`,concat(`s`.`title_th`,`s`.`first_name_th`,' ',`s`.`last_name_th`) AS `ชื่อ_สกุล`,`s`.`student_number` AS `เลขที่`,`c`.`class_code` AS `ห้อง`,`sem`.`semester_name_th` AS `ภาคเรียน`,count(`a`.`attendance_id`) AS `จำนวนวันทั้งหมด`,sum((case when (`a`.`status` in ('มาเรียน','สาย','มาสาย')) then 1 else 0 end)) AS `มาเรียน`,sum((case when (`a`.`status` = 'ขาดเรียน') then 1 else 0 end)) AS `ขาดเรียน`,sum((case when (`a`.`status` in ('สาย','มาสาย')) then 1 else 0 end)) AS `สาย`,sum((case when (`a`.`status` = 'ลา') then 1 else 0 end)) AS `ลา`,concat(round(((sum((case when (`a`.`status` in ('มาเรียน','สาย','มาสาย')) then 1 else 0 end)) * 100.0) / count(`a`.`attendance_id`)),1),'%') AS `อัตราการมาเรียน` from (((`students` `s` join `classes` `c` on((`s`.`class_id` = `c`.`class_id`))) join `semesters` `sem`) left join `attendance_records` `a` on(((`s`.`student_id` = `a`.`student_id`) and (`a`.`semester_id` = `sem`.`semester_id`)))) where (`sem`.`is_current` = true) group by `s`.`student_id`,`sem`.`semester_id` order by `s`.`student_number` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-03-19 17:19:56
