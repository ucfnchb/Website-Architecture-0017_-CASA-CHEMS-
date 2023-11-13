CREATE TABLE `ward_geo_json_attributes` (
  `OBJECTID` int NOT NULL,
  `country` varchar(45) DEFAULT NULL,
  `wardcode` varchar(10) DEFAULT NULL,
  `wardname` varchar(100) DEFAULT NULL,
  `designated` varchar(45) DEFAULT NULL,
  `status` varchar(45) DEFAULT NULL,
  `survyear` int DEFAULT NULL,
  `percancov` float DEFAULT NULL,
  `standerr` float DEFAULT NULL,
  `numpts` int DEFAULT NULL,
  `warea` float DEFAULT NULL,
  PRIMARY KEY (`OBJECTID`),
  UNIQUE KEY `OBJECTID_UNIQUE` (`OBJECTID`),
  KEY `idx_wardcode` (`wardcode`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
