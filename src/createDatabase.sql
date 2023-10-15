DROP DATABASE `sql_elevators`;

CREATE DATABASE IF NOT EXISTS `sql_elevators`; 
USE `sql_elevators`;


CREATE TABLE IF NOT EXISTS `my_elevators` (
		`elevator_id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        `current_floor` INT DEFAULT 1,
        `destination_floor` INT DEFAULT NULL,
        `status` varchar(50) DEFAULT 'idle',
        `queue` JSON
);


INSERT INTO `my_elevators` VALUES();
INSERT INTO `my_elevators` VALUES();
INSERT INTO `my_elevators` VALUES();


 