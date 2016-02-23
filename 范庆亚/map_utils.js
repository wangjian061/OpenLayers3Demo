/**
 * 定义一些全局变量
 */
var map, vectorLayer;
var highlightStyleCache = {}, highlight;
//弹出框需要的部件
var container = document.getElementById('popup');
var content = document.getElementById('popup-content');
var closer = document.getElementById('popup-closer');


/**
 * 定义矢量图层
 * 其中style是矢量图层的显示样式
 */
var style = new ol.style.Style({
    fill: new ol.style.Fill({ //矢量图层填充颜色，以及透明度
        color: 'rgba(255, 255, 255, 0.6)'
    }),
    stroke: new ol.style.Stroke({ //边界样式
        color: '#319FD3',
        width: 1
    }),
    text: new ol.style.Text({ //文本样式
        font: '12px Calibri,sans-serif',
        fill: new ol.style.Fill({
            color: '#000'
        }),
        stroke: new ol.style.Stroke({
            color: '#fff',
            width: 3
        })
    })
});

vectorLayer = new ol.layer.Vector({ //初始化矢量图层
    source: new ol.source.GeoJSON({
        projection: 'EPSG:3857',
        url: 'data/geojson/countries.geojson'   //从文件加载边界等地理信息
    }),
    style: function (feature, resolution) {
        style.getText().setText(resolution < 5000 ? feature.get('name') : '');  //当放大到1:5000分辨率时，显示国家名字
        return [style];
    }
});

map = new ol.Map({  //初始化map
    target: 'map',
    layers: [
        new ol.layer.Tile({
            source: new ol.source.MapQuest({layer: 'sat'})
        }),
        vectorLayer
    ],
    view: new ol.View({
        center: ol.proj.transform([37.41, 8.82], 'EPSG:4326', 'EPSG:3857'),
        zoom: 4
    })
});

/**
 * 创建一个Overlay，用以放置弹出框
 */
var overlay = new ol.Overlay(({
    element: container,
    autoPan: true,
    autoPanAnimation: {
        duration: 250   //当Popup超出地图边界时，地图移动的速度
    }
}));

/**
 * 当鼠标移动时，高亮相应的区域的函数
 */
var featureOverlay = new ol.FeatureOverlay({
    map: map,
    style: function (feature, resolution) {
        var text = resolution < 5000 ? feature.get('name') : '';
        if (!highlightStyleCache[text]) {
            highlightStyleCache[text] = [new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: '#f00',
                    width: 1
                }),
                fill: new ol.style.Fill({
                    color: 'rgba(255,0,0,0.1)'
                }),
                text: new ol.style.Text({
                    font: '12px Calibri,sans-serif',
                    text: text,
                    fill: new ol.style.Fill({
                        color: '#000'
                    }),
                    stroke: new ol.style.Stroke({
                        color: '#f00',
                        width: 3
                    })
                })
            })];
        }
        return highlightStyleCache[text];
    }
});

var displayFeatureInfo = function (pixel) {
    var feature = map.forEachFeatureAtPixel(pixel, function (feature, layer) {
        return feature;
    });

    if (feature !== highlight) {
        if (highlight) {
            featureOverlay.removeFeature(highlight);
        }
        if (feature) {
            featureOverlay.addFeature(feature);
        }
        highlight = feature;
    }

};

/**
 * 鼠标移动的事件
 */
map.on('pointermove', function (evt) {
    if (evt.dragging) {   //如果是拖动地图造成的鼠标移动，则不作处理
        return;
    }
    var pixel = map.getEventPixel(evt.originalEvent);
    displayFeatureInfo(pixel);
});

/**
 * 鼠标点击的事件
 */
map.on('click', function (evt) {
    var pixel = map.getEventPixel(evt.originalEvent);
    var feature = map.forEachFeatureAtPixel(pixel, function (feature, layer) {
        return feature;
    });
    var coordinate = evt.coordinate;
    var hdms = ol.coordinate.toStringHDMS(ol.proj.transform(
        coordinate, 'EPSG:3857', 'EPSG:4326'));
    if (feature !== undefined) {
        content.innerHTML = '<p>你点击的坐标是：</p><code>' + hdms + '</code><p>这里属于：' + feature.get('name') + '</p>';
    }
    else {
        content.innerHTML = '<p>你点击的坐标是：</p><code>' + hdms + '</code><p>这里是大海！</p>';
    }
    overlay.setPosition(coordinate);
    map.addOverlay(overlay);
});

/**
 * 隐藏弹出框的函数
 */
closer.onclick = function () {
    overlay.setPosition(undefined);
    closer.blur();
    return false;
};


/**
 * 根据传来的参数，平移到相应坐标，然后展示相应内容
 * 参数为 name（搜索结果的名称），content（搜索结果的内容），coordinates（搜索结果的坐标）
 */
function zoomAndDisplay(name, content2, coordinates) {
    try {
        //zoomTo(coordinates);
        var view = new ol.View({
            center: ol.proj.transform(coordinates, 'EPSG:4326', 'EPSG:3857'),
            zoom: 4
        });
        map.setView(view);
        //display [name, content]
        content.innerHTML = '<p>名称：<code>' + name + '</code></p><p>内容：' + content2 + '</p>';
        var crd = ol.proj.transform(coordinates, 'EPSG:4326', 'EPSG:3857');
        overlay.setPosition(crd);
        map.addOverlay(overlay);
    }
    catch (ex) {
        console.log(ex.message);
    }
}

/**
 * 处理用户点击搜索按钮的事件
 * 获取输入，如果为空，什么都不做；如果不为空，首先检查输入，然后发送AJAX请求（使用JQuery）
 */
function sendQuery() {
    var search_input = document.getElementById("search_input").value;
    $.ajax({
        url: "http://127.0.0.1/csdn_blog_about/getQueryData.php?search_input=" + search_input,
        success: function (result) {
            var jsonResult = JSON.parse(result);
            var name = jsonResult.features[0].properties.name;
            var content = jsonResult.features[0].properties.content;
            var crd = [116.51800, 40.26495];
            zoomAndDisplay(name, content, crd);
        }
    });
}

var search_button = document.getElementById("search_button");
search_button.onclick = sendQuery;