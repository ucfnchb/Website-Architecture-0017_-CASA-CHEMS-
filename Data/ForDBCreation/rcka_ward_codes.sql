CREATE TABLE `rcka_ward_codes` (
  `wardcode` varchar(10) NOT NULL,
  `wardname` varchar(50) DEFAULT NULL,
  `borough` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`wardcode`),
  UNIQUE KEY `wardcode_UNIQUE` (`wardcode`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
