-- MySQL dump 10.13  Distrib 8.0.39, for Win64 (x86_64)
--
-- Host: localhost    Database: mm_new
-- ------------------------------------------------------
-- Server version	8.0.39

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table  deals 
--

DROP TABLE IF EXISTS  deals ;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE  deals  (
   id  int NOT NULL AUTO_INCREMENT,
   lead_id  int NOT NULL,
   deal_amount  decimal(12,2) NOT NULL,
   payment_method  varchar(50) NOT NULL,
   payment_notes  text,
   invoice_id  varchar(50) DEFAULT NULL,
   invoice_generated  tinyint(1) DEFAULT '0',
   closed_by  int DEFAULT NULL,
   closed_at  datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ( id ),
  KEY  lead_id  ( lead_id ),
  CONSTRAINT  deals_ibfk_1  FOREIGN KEY ( lead_id ) REFERENCES  leads  ( id )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table  deals 
--

LOCK TABLES  deals  WRITE;
/*!40000 ALTER TABLE  deals  DISABLE KEYS */;
/*!40000 ALTER TABLE  deals  ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table  leads 
--

DROP TABLE IF EXISTS  leads ;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE  leads  (
   id  int NOT NULL AUTO_INCREMENT,
   company_name  varchar(255) NOT NULL,
   client_name  varchar(255) NOT NULL,
   contact  varchar(20) NOT NULL,
   alternate_contact  varchar(20) DEFAULT NULL,
   telephone  varchar(20) DEFAULT NULL,
   email  varchar(255) DEFAULT NULL,
   gst_no  varchar(50) DEFAULT NULL,
   flat_no  varchar(50) DEFAULT NULL,
   building_name  varchar(255) DEFAULT NULL,
   locality  varchar(255) NOT NULL,
   city  varchar(100) NOT NULL,
   pincode  varchar(10) NOT NULL,
   state  varchar(100) NOT NULL,
   source_lead  varchar(100) NOT NULL,
   industry_type  varchar(100) NOT NULL,
   web_type  json DEFAULT NULL,
   seo_type  json DEFAULT NULL,
   smo_type  json DEFAULT NULL,
   app_type  json DEFAULT NULL,
   erp_type  json DEFAULT NULL,
   services  json DEFAULT (json_array()) COMMENT 'Services array as JSON',
   service_notes  text,
   action_type  enum('appointment','followup','not_interested','deal_closed') DEFAULT 'appointment',
   app_date  date DEFAULT NULL,
   app_time  time DEFAULT NULL,
   assign_emp  varchar(255) DEFAULT NULL,
   location  varchar(255) DEFAULT NULL,
   follow_date  date DEFAULT NULL,
   follow_time  time DEFAULT NULL,
   reason  text,
   additional_notes  text,
   created_at  timestamp NULL DEFAULT CURRENT_TIMESTAMP,
   maps_lnk  text,
   lead_status  varchar(30) DEFAULT 'active',
   closed_date  datetime DEFAULT NULL,
   payment_method  varchar(50) DEFAULT NULL,
   deal_amount  decimal(12,2) DEFAULT NULL,
   payment_notes  text,
   invoice_id  varchar(50) DEFAULT NULL,
   transaction_id  varchar(100) DEFAULT NULL,
   cheque_number  varchar(50) DEFAULT NULL,
   cheque_date  date DEFAULT NULL,
   bank_name  varchar(100) DEFAULT NULL,
   payment_proof  varchar(255) DEFAULT NULL,
   branch_name  varchar(100) DEFAULT NULL,
   received_by  varchar(100) DEFAULT NULL,
   payment_date  date DEFAULT NULL,
   closed_by  int DEFAULT NULL,
   pay_stat  enum('pending','received','failed') DEFAULT 'pending',
  PRIMARY KEY ( id )
); ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table  leads 
--

LOCK TABLES  leads  WRITE;
/*!40000 ALTER TABLE  leads  DISABLE KEYS */;
INSERT INTO  leads  VALUES (1,'metrics','neha','9090909090','9098909890','2345613451','metrics123@gmail.com','112212121212','1001','SunShine Towers','Lokhandwala, Andheri East','Mumbai','400069','Maharashtra','linkedin','ecommerce','[\"ecommerce\"]','[]','[]','[\"android\"]','[\"node\"]','[\"Web Development\", \"SEO\", \"SMO\", \"App Development\", \"ERP\"]',NULL,'appointment','2026-04-14','18:00:00','Aadii','Office','2026-04-11','14:52:00','Client having no money','website will be no 1 ','2026-04-11 07:21:21',NULL,'active',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'pending'),(2,'Khushi Dance Academy','Khushi Pathak','8361347739','1125532553','9362945511','khushi123@gmail.com','926387372001458','3503','Lodha Towers','Nallasopara','Mumbai','401209','Maharashtra','walkin','other','[]','[]','[]','[\"android\"]','[\"node\"]','[\"Web Development\", \"SEO\", \"SMO\", \"App Development\", \"ERP\"]',NULL,'appointment','2026-04-15','15:00:00','Komal Maurya','Office','2026-04-18','12:00:00','Abhi mera classes khulaa nahi hai. ek hafte me khulega tab bataungi','Hum ye ye service provide karte hai, aapko number 1 pe pohocha denge. Dhanyawaad, mandal bohot bohot aabhaari hai aapka (haath jodne wala emoji)','2026-04-11 09:40:10',NULL,'active',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'pending'),(3,'sammam','sammam','8925517342','9667224418',NULL,'sammam123@gmail.com','8392817490','3001','sample apt','andheri east','mumbai','400069','Maharashtra','referral','it','[\"dynamic\"]','[\"web\"]','[\"facebook\", \"instagram\"]','[\"android\"]','[\"php\"]','[\"Web Development\", \"SEO\", \"SMO\", \"App Development\", \"ERP\"]',NULL,NULL,'2026-04-16','16:30:00','Irfan Patel','https://www.google.com/maps?q=e-107%2C%20riddhi%20siddhi%20complex%2C%20unnat%20nagar%2C%20goregaon%20west%2C%20mumbai%2C%20400104%2C%20maharashtra','2026-04-15','13:00:00','Client having no money',NULL,'2026-04-13 03:29:43',NULL,'deal_closed','2026-04-24 14:55:09','Debit/Credit Card',28000.00,'thank you guyss.',NULL,'2392810382104832',NULL,NULL,NULL,'uploads/payments/payment-1777022709829-686699290.png',NULL,NULL,NULL,6,'pending'),(4,'Lawyer\'s Comp','Lawyer Sir','8016482562','8936241745',NULL,'lawyersir123@gmail.com','836201740391847','C-13','Krishna Koyna Apartment','Opp bmc market, jawahar nagar, goregaon west','Mumbai','400104','Maharashtra','referral','other','[\"dynamic\"]','[\"web\"]','[\"facebook\", \"instagram\", \"linkedin\"]','[\"android\"]','[\"next\", \"node\"]','[\"Web Development\", \"SEO\", \"SMO\", \"App Development\", \"ERP\"]',NULL,NULL,'2026-04-16','13:00:00','Irfan Patel','https://www.google.com/maps?q=C-13%2C%20Krishna%20Koyna%20Apartment%2C%20Opp%20bmc%20market%2C%20jawahar%20nagar%2C%20goregaon%20west%2C%20Mumbai%2C%20400104%2C%20Maharashtra','2026-04-21','12:15:00','WIll tell you soon, talking to other companies as well.','hello hiii, thank you for connecting to us sir.','2026-04-13 04:44:21','https://www.google.com/maps?q=C-13%2C%20Krishna%20Koyna%20Apartment%2C%20Opp%20bmc%20market%2C%20jawahar%20nagar%2C%20goregaon%20west%2C%20Mumbai%2C%20400104%2C%20Maharashtra','deal_closed','2026-04-13 13:11:24','Cash',50000.00,'no',NULL,NULL,NULL,NULL,NULL,'uploads/payments/payment-1776066084773-686566885.png',NULL,'Irfan Patel',NULL,6,'pending'),(5,'metrics mart','Atul pandey','9204876154','9307762543',NULL,'atulpandey123@gmail.com','8408947364896123','e-107','riddhi siddhi complex','unnat nagar, goregaon west','mumbai','400104','maharashtra','coldcall','other','[\"dynamic\"]','[\"web\"]','[\"facebook\", \"instagram\", \"twitter\"]','[\"android\"]','[\"next\", \"node\"]','[\"Web Development\", \"SEO\", \"SMO\", \"App Development\", \"ERP\"]',NULL,'appointment','2026-04-16','18:30:00','Irfan Patel','https://www.google.com/maps?q=e-107%2C%20riddhi%20siddhi%20complex%2C%20unnat%20nagar%2C%20goregaon%20west%2C%20mumbai%2C%20400104%2C%20maharashtra',NULL,NULL,NULL,NULL,'2026-04-13 07:57:24','https://www.google.com/maps?q=e-107%2C%20riddhi%20siddhi%20complex%2C%20unnat%20nagar%2C%20goregaon%20west%2C%20mumbai%2C%20400104%2C%20maharashtra','active',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'pending'),(6,'Aanand Rathi Pvt Ltd','Aanand Raathi','8309825723','9931156294','022-0287441945','anandrathiandco123@gmail.com','8209143687','10-A','Express Zone','Near Oberoi mall, wester express highway, goregaon east','mumbai','400063','maharashtra','coldcall','it','[\"dynamic\", \"ecommerce\"]','[\"gmb\", \"web\"]','[\"facebook\", \"instagram\", \"linkedin\", \"twitter\"]','[\"android\", \"ios\"]','[\"next\", \"php\", \"node\"]','[\"Web Development\", \"SEO\", \"SMO\", \"App Development\", \"ERP\"]',NULL,'appointment','2026-04-16','17:04:00','Komal Maurya','https://www.google.com/maps?q=10-A%2C%20Express%20Zone%2C%20Near%20Oberoi%20mall%2C%20wester%20express%20highway%2C%20goregaon%20east%2C%20mumbai%2C%20400063%2C%20maharashtra',NULL,NULL,NULL,NULL,'2026-04-13 09:35:05','https://www.google.com/maps?q=10-A%2C%20Express%20Zone%2C%20Near%20Oberoi%20mall%2C%20wester%20express%20highway%2C%20goregaon%20east%2C%20mumbai%2C%20400063%2C%20maharashtra','active',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'pending'),(7,'Pankaj Dubey And Associates','Pankaj Dubey','8903442889','9200645143',NULL,'pkdubey123@gmail.com','781209803527730','sho no 10','swaroop celesta building','np thakkar road, near veer makarand dhanekar marg junction, navpada, vile parle east','mumbai','400057','Maharashtra','referral','other','[\"dynamic\"]','[\"gmb\", \"web\"]','[\"facebook\", \"instagram\"]','[\"android\"]','[\"next\", \"php\", \"node\"]','[\"Web Development\", \"SEO\", \"SMO\", \"App Development\", \"ERP\"]',NULL,'appointment','2026-04-20','13:00:00','Komal Maurya','https://www.google.com/maps?q=sho%20no%2010%2C%20swaroop%20celesta%20building%2C%20np%20thakkar%20road%2C%20near%20veer%20makarand%20dhanekar%20marg%20junction%2C%20navpada%2C%20vile%20parle%20east%2C%20mumbai%2C%20400057%2C%20Maharashtra',NULL,NULL,NULL,NULL,'2026-04-13 10:05:14','https://www.google.com/maps?q=sho%20no%2010%2C%20swaroop%20celesta%20building%2C%20np%20thakkar%20road%2C%20near%20veer%20makarand%20dhanekar%20marg%20junction%2C%20navpada%2C%20vile%20parle%20east%2C%20mumbai%2C%20400057%2C%20Maharashtra','active',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'pending'),(8,'security services','securityservices','8927377194',NULL,NULL,'securityservices123@gmail.com','380018472018842','305','megha apt','sai baba nagar, navghar road, bhayandar east','mumbai','401105','maharashtra','referral','other','[\"dynamic\"]','[\"web\"]','[\"facebook\", \"instagram\"]','[\"android\", \"ios\"]','[\"next\", \"php\", \"node\"]','[]',NULL,'followup',NULL,NULL,NULL,'https://www.google.com/maps?q=305%2C%20megha%20apt%2C%20sai%20baba%20nagar%2C%20navghar%20road%2C%20bhayandar%20east%2C%20mumbai%2C%20401105%2C%20maharashtra','2026-04-20','14:05:00','batate hai soch kar',NULL,'2026-04-14 03:35:36','https://www.google.com/maps?q=305%2C%20megha%20apt%2C%20sai%20baba%20nagar%2C%20navghar%20road%2C%20bhayandar%20east%2C%20mumbai%2C%20401105%2C%20maharashtra','active',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'pending'),(9,'km dance vibes','komal maurya','908688453',NULL,'02205649973','kmdance123@gmail.com',NULL,'202','bhairav darshan tower','pooja nagar, cabin rd, bhayandar east','Mumbai','401105','Maharashtra','referral','other','[\"dynamic\"]','[\"web\"]','[\"instagram\"]','[]','[]','[]',NULL,NULL,'2026-04-22','14:00:00','Komal Maurya','https://www.google.com/maps?q=202%2C%20bhairav%20darshan%20tower%2C%20pooja%20nagar%2C%20cabin%20rd%2C%20bhayandar%20east%2C%20Mumbai%2C%20401105%2C%20Maharashtra',NULL,NULL,NULL,NULL,'2026-04-14 05:37:31','https://www.google.com/maps?q=202%2C%20bhairav%20darshan%20tower%2C%20pooja%20nagar%2C%20cabin%20rd%2C%20bhayandar%20east%2C%20Mumbai%2C%20401105%2C%20Maharashtra','deal_closed','2026-04-14 11:09:39','Cash',45000.00,NULL,NULL,NULL,NULL,NULL,NULL,'uploads/payments/payment-1776145179771-697154336.png',NULL,'Komal Maurya',NULL,2,'failed'),(10,'USA Company','Bhupendra Jogi','8391184771','9088903482',NULL,'usacomppvtlt123@gmail.com','2789105647382901','305','megha apt','sai baba nagar, navghar road, bhayandar east','mumbai','401105','maharashtra','linkedin','ecommerce','[\"ecommerce\"]','[\"web\"]','[\"facebook\"]','[\"android\"]','[\"node\"]','[\"ads\"]',NULL,NULL,'2026-04-27',NULL,'Komal Maurya','https://www.google.com/maps?q=305%2C%20megha%20apt%2C%20sai%20baba%20nagar%2C%20navghar%20road%2C%20bhayandar%20east%2C%20mumbai%2C%20401105%2C%20maharashtra',NULL,NULL,NULL,NULL,'2026-04-25 05:46:41','https://www.google.com/maps?q=305%2C%20megha%20apt%2C%20sai%20baba%20nagar%2C%20navghar%20road%2C%20bhayandar%20east%2C%20mumbai%2C%20401105%2C%20maharashtra','deal_closed','2026-04-25 11:20:28','Cheque',80000.00,NULL,NULL,NULL,'1234567890','2026-04-28','Saraswat Bank','uploads/payments/payment-1777096228767-729344083.png','Goregaon',NULL,NULL,2,'received');
/*!40000 ALTER TABLE  leads  ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table  project_assignments 
--

DROP TABLE IF EXISTS  project_assignments ;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE  project_assignments  (
   id  int NOT NULL AUTO_INCREMENT,
   project_id  int DEFAULT NULL,
   user_id  int DEFAULT NULL,
   assigned_at  timestamp NULL DEFAULT CURRENT_TIMESTAMP,
   status  varchar(50) DEFAULT 'assigned',
  PRIMARY KEY ( id )
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table  project_assignments 
--

LOCK TABLES  project_assignments  WRITE;
/*!40000 ALTER TABLE  project_assignments  DISABLE KEYS */;
INSERT INTO  project_assignments  VALUES (1,4,3,'2026-04-14 06:51:38','assigned'),(2,9,7,'2026-04-14 06:56:26','assigned');
/*!40000 ALTER TABLE  project_assignments  ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table  users 
--

DROP TABLE IF EXISTS  users ;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE  users  (
   id  int NOT NULL AUTO_INCREMENT,
   name  varchar(100) DEFAULT NULL,
   prof_img  varchar(999) DEFAULT NULL,
   email  varchar(100) DEFAULT NULL,
   contact  varchar(10) DEFAULT NULL,
   spswd  varchar(8) DEFAULT NULL,
   cpswd  varchar(8) DEFAULT NULL,
   role  varchar(100) DEFAULT NULL,
   comp_name  varchar(100) DEFAULT NULL,
   skills  json DEFAULT NULL,
  PRIMARY KEY ( id )
); ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table  users 
--

LOCK TABLES  users  WRITE;
/*!40000 ALTER TABLE  users  DISABLE KEYS */;
INSERT INTO  users  VALUES (1,'Aditya Yadav','uploads/1775725770337-155613463.jpeg','aadii123@gmail.com','7863541835','aadii123','aadii123','tme','Metrics Mart Infoline Pvt Ltd',NULL),(2,'Komal Maurya','uploads/1775726546121-204415453.png','km123@gmail.com','8173678463','km123','km123','me','Metrics Mart Infoline Pvt Ltd',NULL),(3,'Sam Mam','uploads/1775726634437-731281836.png','sammam123@gmail.com','9123456780','sammam12','sammam12','dev','Metrics Mart Infoline Pvt Ltd','[\"web\", \"seo\"]'),(4,'Harsh Shukla','uploads/1775726771602-151383837.png','harsh123@gmail.com','8108728060','harsh123','harsh123','admin','Metrics Mart Infoline Pvt Ltd',NULL),(5,'Khushi Pathak','uploads/1775791130685-643069966.png','khushi123@gmail.com','9204471945','khushi12','khushi12','tme','Metrics Mart Infoline Pvt Ltd',NULL),(6,'Irfan Patel','uploads/1776059440904-92784263.png','irfanpatel123@gmail.com','9845174634','irfan123','irfan123','me','Metrics Mart Infoline Pvt Ltd',NULL),(7,'Harsh Shukla','uploads/1776149574237-861013047.png','shukla.harsh.2111@gmail.com','8108728060','harsh123','harsh123','dev','Metrics Mart Infoline Pvt Ltd','[\"web\", \"seo\", \"smo\"]'),(8,'Banwari','uploads/1777091114286-606946063.png','banwari123@gmail.com','7291448201','banwari','banwari','dm','Metrics Mart Infoline Pvt Ltd','[\"seo\", \"ads\"]'),(10,'Eena meena teena','uploads/1777091334459-56240530.png','emt123@gmail.com','7284957251','emt123','emt123','dev','Metrics Mart Infoline Pvt Ltd','[\"web\", \"app\", \"erp_crm\"]'),(12,'Atharva Shukla','uploads/1777091596582-833704496.png','atharva123@gmail.com','7395661946','ath123','ath123','dev','Metrics Mart Infoline Pvt Ltd','[\"web\", \"erp_crm\"]');
/*!40000 ALTER TABLE  users  ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-25 13:27:06
