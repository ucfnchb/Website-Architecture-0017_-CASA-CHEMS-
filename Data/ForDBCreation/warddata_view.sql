create view `warddata`
AS select `a`.`OBJECTID` AS `OBJECTID`,`a`.`percancov` AS `percancov`,`a`.`warea` AS `warea`,`a`.`survyear` AS `survyear`,`a`.`wardcode` AS `Wardcode`,`a`.`wardname` AS `Wardname`,`a`.`designated` AS `Designated`,`a`.`status` AS `Status`,`a`.`survyear` AS `Survey Year`,format(`a`.`percancov`,2) AS `Perc Coverage`,`a`.`standerr` AS `StandErr`,`a`.`numpts` AS `Numpts`,`a`.`warea` AS `Ward Area`,`p`.`borough` AS `Borough`,format(`p`.`perc_homes_good_access_to_nature`,2) AS `Homes w/ Nature Access`,format(`g`.`blue_area_hectare`,2) AS `Blue Hectares`,format(`g`.`green_blue_area_hectare`,2) AS `Blue-Green Hectares`,format(`g`.`green_area_hectare`,2) AS `Green per Hectare`,format(`g`.`percent_blue`,2) AS `Perc Blue`,format(`g`.`percent_green`,2) AS `Perc Green`,format(`g`.`percent_green_blue`,2) AS `Perc Blue-Green`,format(`g`.`ward_area_hectare`,2) AS `Ward Hectares`,`p`.`perc_homes_good_access_to_nature` AS `perc_homes_good_access_to_nature`,`p`.`perc_homes_deficiency_of_access_to_nature` AS `perc_homes_deficiency_of_access_to_nature`,`g`.`blue_area_hectare` AS `blue_area_hectare`,`g`.`green_blue_area_hectare` AS `green_blue_area_hectare`,`g`.`green_area_hectare` AS `green_area_hectare`,`g`.`percent_green` AS `percent_green`,`g`.`percent_green_blue` AS `percent_green_blue`,`g`.`ward_area_hectare` AS `ward_area_hectare`,`g`.`percent_blue` AS `percent_blue` from ((`mdb`.`ward_geo_json_attributes` `a` left join `mdb`.`public_open_space` `p` on((`a`.`wardcode` = `p`.`ward_code`))) left join `mdb`.`green_ward_cover` `g` on((`a`.`wardcode` = `g`.`ward_code`)));