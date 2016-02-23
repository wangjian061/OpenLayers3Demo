<?php 
$search_input = $_GET["search_input"];
try{
    if($search_input != ""){
        echo '{
            "type": "FeatureCollection",
            "features": [
                {"type":"Feature","properties":{"id":"An example!","name":"北京市","content":"北京（Beijing），中华人民共和国的首都、直辖市和国家中心城市，是中国的政治、文化中心，中国经济的决策和管理中心，是中华人民共和国中央人民政府和全国人民代表大会的办公所在地。","geometry":{"type":"Point", "coordinates":[116.51800, 40.26495]}}}
                ]
            }';
    }
    else{
        echo false;
    }
}
catch(Exception $e){
    echo 'Exception message: ' . $e->getMessage();
}
?>