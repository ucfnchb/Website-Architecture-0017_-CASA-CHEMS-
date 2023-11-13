CREATE TABLE `public_open_space` (
  `ward_code` varchar(9) NOT NULL,
  `old_ward_code` varchar(6) DEFAULT NULL,
  `ward` varchar(45) DEFAULT NULL,
  `borough_code` varchar(9) DEFAULT NULL,
  `borough` varchar(30) DEFAULT NULL,
  `perc_homes_good_access_to_nature` int DEFAULT NULL,
  `perc_homes_deficiency_of_access_to_nature` int DEFAULT NULL,
  PRIMARY KEY (`ward_code`),
  UNIQUE KEY `ward_code_UNIQUE` (`ward_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='from: https://data.london.gov.uk/dataset/access-public-open-space-and-nature-ward';
