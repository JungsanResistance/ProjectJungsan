-- MySQL Script generated by MySQL Workbench
-- 2017년 02월 02일 (목) 오전 11시 39분 23초
-- Model: New Model    Version: 1.0
-- MySQL Workbench Forward Engineering
SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='TRADITIONAL,ALLOW_INVALID_DATES';
-- -----------------------------------------------------
-- Schema Jungsan_DB
-- -----------------------------------------------------
DROP SCHEMA IF EXISTS `Jungsan_DB` ;
-- -----------------------------------------------------
-- Schema Jungsan_DB
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `Jungsan_DB` DEFAULT CHARACTER SET utf8 ;
USE `Jungsan_DB` ;
-- -----------------------------------------------------
-- Table `Jungsan_DB`.`user`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `Jungsan_DB`.`user` ;
CREATE TABLE IF NOT EXISTS `Jungsan_DB`.`user` (
  `idx` INT(11) NOT NULL AUTO_INCREMENT,
  `userid` VARCHAR(16) NOT NULL,
  `username` VARCHAR(16) NOT NULL,
  `password` VARCHAR(16) NOT NULL,
  PRIMARY KEY (`idx`),
  UNIQUE INDEX `userid_UNIQUE` (`userid` ASC));
-- -----------------------------------------------------
-- Table `Jungsan_DB`.`groups`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `Jungsan_DB`.`groups` ;
CREATE TABLE IF NOT EXISTS `Jungsan_DB`.`groups` (
  `idx` INT(11) NOT NULL AUTO_INCREMENT,
  `groupname` VARCHAR(32) NOT NULL,
  PRIMARY KEY (`idx`),
  UNIQUE INDEX `groupname_UNIQUE` (`groupname` ASC));
-- -----------------------------------------------------
-- Table `Jungsan_DB`.`groupmember`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `Jungsan_DB`.`groupmember` ;
CREATE TABLE IF NOT EXISTS `Jungsan_DB`.`groupmember` (
  `user_idx` INT(11) NOT NULL,
  `group_idx` INT(11) NOT NULL,
  PRIMARY KEY (`user_idx`, `group_idx`),
  INDEX `fk_user_has_group_group1_idx` (`group_idx` ASC),
  INDEX `fk_user_has_group_user_idx` (`user_idx` ASC),
  CONSTRAINT `fk_user_has_group_user`
    FOREIGN KEY (`user_idx`)
    REFERENCES `Jungsan_DB`.`user` (`idx`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_user_has_group_group1`
    FOREIGN KEY (`group_idx`)
    REFERENCES `Jungsan_DB`.`groups` (`idx`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION);
-- -----------------------------------------------------
-- Table `Jungsan_DB`.`event`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `Jungsan_DB`.`event` ;
CREATE TABLE IF NOT EXISTS `Jungsan_DB`.`event` (
  `idx` INT(11) NOT NULL AUTO_INCREMENT,
  `group_idx` INT(11) NOT NULL,
  `date` DATE NOT NULL,
  `recipient_idx` INT(11) NOT NULL,
  `eventname` VARCHAR(16) NOT NULL,
  `totalcost` INT(11) NOT NULL,
  PRIMARY KEY (`idx`, `group_idx`, `recipient_idx`),
  INDEX `fk_event_group1_idx` (`group_idx` ASC),
  INDEX `fk_event_user1_idx` (`recipient_idx` ASC),
  CONSTRAINT `fk_event_group1`
    FOREIGN KEY (`group_idx`)
    REFERENCES `Jungsan_DB`.`groups` (`idx`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_event_user1`
    FOREIGN KEY (`recipient_idx`)
    REFERENCES `Jungsan_DB`.`user` (`idx`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION);
-- -----------------------------------------------------
-- Table `Jungsan_DB`.`eventmember`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `Jungsan_DB`.`eventmember` ;
CREATE TABLE IF NOT EXISTS `Jungsan_DB`.`eventmember` (
  `user_idx` INT(11) NOT NULL,
  `event_idx` INT(11) NOT NULL,
  `event_group_idx` INT(11) NOT NULL,
  `event_recipient_idx` INT(11) NOT NULL,
  `cost` INT(11) NOT NULL,
  `ispaid` TINYINT(1) NOT NULL,
  PRIMARY KEY (`user_idx`, `event_idx`, `event_group_idx`, `event_recipient_idx`),
  INDEX `fk_user_has_event_event1_idx` (`event_idx` ASC, `event_group_idx` ASC, `event_recipient_idx` ASC),
  INDEX `fk_user_has_event_user1_idx` (`user_idx` ASC),
  CONSTRAINT `fk_user_has_event_user1`
    FOREIGN KEY (`user_idx`)
    REFERENCES `Jungsan_DB`.`user` (`idx`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_user_has_event_event1`
    FOREIGN KEY (`event_idx` , `event_group_idx` , `event_recipient_idx`)
    REFERENCES `Jungsan_DB`.`event` (`idx` , `group_idx` , `recipient_idx`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION);
-- -----------------------------------------------------
-- Table `Jungsan_DB`.`account`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `Jungsan_DB`.`account` ;
CREATE TABLE IF NOT EXISTS `Jungsan_DB`.`account` (
  `user_idx` INT(11) NOT NULL,
  `accountnumber` VARCHAR(64) NOT NULL,
  `bank` VARCHAR(12) NOT NULL,
  PRIMARY KEY (`user_idx`, `accountnumber`),
  INDEX `fk_account_user1_idx` (`user_idx` ASC),
  CONSTRAINT `fk_account_user1`
    FOREIGN KEY (`user_idx`)
    REFERENCES `Jungsan_DB`.`user` (`idx`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;
SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;


INSERT INTO user (userid, username, password) VALUES ('cs1', '이성준', 'cs');
INSERT INTO user (userid, username, password) VALUES ('cs2', '이현진', 'cs');
INSERT INTO user (userid, username, password) VALUES ('cs3', '구일모', 'cs');
INSERT INTO user (userid, username, password) VALUES ('cs4', '이웅희', 'cs');
INSERT INTO user (userid, username, password) VALUES ('cs5', '송현규', 'cs');
INSERT INTO user (userid, username, password) VALUES ('cs6', '공윤구', 'cs');
INSERT INTO user (userid, username, password) VALUES ('cs7', '고민호', 'cs');
INSERT INTO user (userid, username, password) VALUES ('cs8', '이상훈', 'cs');

INSERT INTO groups (groupname) VALUES ('Codestates');

INSERT INTO groupmember (user_idx, group_idx) VALUES (1, 1);
INSERT INTO groupmember (user_idx, group_idx) VALUES (2, 1);
INSERT INTO groupmember (user_idx, group_idx) VALUES (3, 1);
INSERT INTO groupmember (user_idx, group_idx) VALUES (4, 1);
INSERT INTO groupmember (user_idx, group_idx) VALUES (5, 1);
INSERT INTO groupmember (user_idx, group_idx) VALUES (6, 1);
INSERT INTO groupmember (user_idx, group_idx) VALUES (7, 1);
INSERT INTO groupmember (user_idx, group_idx) VALUES (8, 1);

INSERT INTO event (group_idx, date, recipient_idx, eventname, totalcost) VALUES (1, now(), 1, 'BurgurKing', 50000);
INSERT INTO event (group_idx, date, recipient_idx, eventname, totalcost) VALUES (1, now(), 1, 'Mcdonald', 30000);
--
-- INSERT INTO eventmember (user_idx, event_idx, event_group_idx, event_recipient_idx, cost, ispaid) VALUES (2, 1, 1, 1, 10000, TRUE);
-- INSERT INTO eventmember (user_idx, event_idx, event_group_idx, event_recipient_idx, cost, ispaid) VALUES (3, 1, 1, 1, 10000, FALSE);
-- INSERT INTO eventmember (user_idx, event_idx, event_group_idx, event_recipient_idx, cost, ispaid) VALUES (4, 1, 1, 1, 10000, FALSE);
-- INSERT INTO eventmember (user_idx, event_idx, event_group_idx, event_recipient_idx, cost, ispaid) VALUES (5, 1, 1, 1, 10000, FALSE);

INSERT INTO eventmember (user_idx, event_idx, event_group_idx, event_recipient_idx, cost, ispaid) VALUES (2, 2, 1, 1, 10000, TRUE);
INSERT INTO eventmember (user_idx, event_idx, event_group_idx, event_recipient_idx, cost, ispaid) VALUES (3, 2, 1, 1, 10000, FALSE);
INSERT INTO eventmember (user_idx, event_idx, event_group_idx, event_recipient_idx, cost, ispaid) VALUES (4, 2, 1, 1, 10000, FALSE);
