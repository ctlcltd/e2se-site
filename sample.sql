SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

CREATE DATABASE IF NOT EXISTS `e2se_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `e2se_db`;

CREATE TABLE IF NOT EXISTS `e2se_disambigua` (
  `ts_id` bigint(21) UNSIGNED NOT NULL,
  `disambigua` bigint(21) UNSIGNED NOT NULL,
  KEY `ts_id` (`ts_id`,`disambigua`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `e2se_history` (
  `saved_id` bigint(21) UNSIGNED NOT NULL,
  `history` bigint(21) UNSIGNED NOT NULL,
  KEY `saved_id` (`saved_id`,`history`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `e2se_langs` (
  `lang_id` bigint(21) UNSIGNED NOT NULL,
  `lang_guid` varchar(32) NOT NULL,
  `lang_code` varchar(8) NOT NULL,
  `lang_locale` varchar(8) NOT NULL,
  `lang_sourced` tinyint(1) UNSIGNED NOT NULL,
  `lang_dir` varchar(3) NOT NULL,
  `lang_type` tinyint(1) NOT NULL,
  `lang_numerus` tinyint(1) UNSIGNED NOT NULL,
  `lang_name` varchar(100) NOT NULL,
  `lang_tr_name` varchar(100) NOT NULL,
  `lang_completed` tinyint(3) UNSIGNED NOT NULL,
  `lang_revised` tinyint(3) UNSIGNED NOT NULL,
  PRIMARY KEY (`lang_id`),
  UNIQUE KEY `lang_guid` (`lang_guid`),
  KEY `lang_code` (`lang_code`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `e2se_saved` (
  `saved_id` bigint(21) UNSIGNED NOT NULL AUTO_INCREMENT,
  `saved_token` varchar(100) NOT NULL,
  `lang_id` bigint(21) UNSIGNED NOT NULL,
  `saved_user` varchar(100) NOT NULL,
  `saved_time` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
  `saved_content` longtext NOT NULL,
  PRIMARY KEY (`saved_id`),
  UNIQUE KEY `saved_token` (`saved_token`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `e2se_tr` (
  `tr_id` bigint(21) UNSIGNED NOT NULL AUTO_INCREMENT,
  `lang_id` bigint(21) UNSIGNED NOT NULL,
  `ts_id` bigint(21) UNSIGNED NOT NULL,
  `tr_msg_tr` text NOT NULL,
  `tr_line` int(11) UNSIGNED NOT NULL,
  `tr_status` tinyint(1) UNSIGNED NOT NULL,
  `tr_revised` tinyint(3) UNSIGNED NOT NULL,
  `tr_notes` text NOT NULL,
  PRIMARY KEY (`tr_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `e2se_ts` (
  `ts_id` bigint(21) UNSIGNED NOT NULL AUTO_INCREMENT,
  `ts_guid` varchar(32) NOT NULL,
  `ts_ctx_name` varchar(255) NOT NULL,
  `ts_msg_src` text NOT NULL,
  `ts_msg_comment` varchar(255) NOT NULL,
  `ts_msg_extra` varchar(255) NOT NULL,
  `ts_msg_numerus` tinyint(1) UNSIGNED NOT NULL,
  `ts_line` int(11) UNSIGNED NOT NULL,
  `ts_status` tinyint(1) NOT NULL,
  `ts_notes` text NOT NULL,
  PRIMARY KEY (`ts_id`),
  UNIQUE KEY `ts_guid` (`ts_guid`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
