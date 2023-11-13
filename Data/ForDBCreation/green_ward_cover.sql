CREATE TABLE `green_ward_cover` (
  `lb_name` varchar(35) DEFAULT NULL,
  `lb_code` varchar(9) DEFAULT NULL,
  `ward_code` varchar(9) NOT NULL,
  `ward_name` varchar(50) DEFAULT NULL,
  `ward_area_hectare` float DEFAULT NULL,
  `green_area_hectare` float DEFAULT NULL,
  `blue_area_hectare` float DEFAULT NULL,
  `green_blue_area_hectare` float DEFAULT NULL,
  `percent_green` float DEFAULT NULL,
  `percent_blue` float DEFAULT NULL,
  `percent_green_blue` float DEFAULT NULL,
  PRIMARY KEY (`ward_code`),
  UNIQUE KEY `ward_code_UNIQUE` (`ward_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
