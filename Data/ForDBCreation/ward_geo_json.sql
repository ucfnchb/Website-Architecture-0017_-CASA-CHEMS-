CREATE TABLE `ward_geo_json` (
  `OBJECTID` int NOT NULL,
  `GEO_JSON` longtext,
  PRIMARY KEY (`OBJECTID`),
  UNIQUE KEY `OBJECTID_UNIQUE` (`OBJECTID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
