/**
 * featureinfo.html 页面脚本
 * @author qingyafan@163.com
 * @date 9:24 2016/2/13
 */

var featureinfo_content = document.getElementById("featureinfo_content");
var wmsServiceUrl = 'http://localhost:8080/geoserver/wangjian/wms?';

var wmsLayer = new ol.layer.Image({
    source: new ol.source.ImageWMS({
        url: wmsServiceUrl,
        params: {'LAYERS': 'wangjian:shengsheng'},
        serverType: 'geoserver',
        //  crossOrigin: 'anonymous'
    })
});
var overlay = new ol.Overlay({
    element: document.getElementById('featureinfo'),
    autoPan: true,
    autoPanAnimation: {
        duration: 260
    }
});
var map = new ol.Map({
    target: 'map',
    layers: [wmsLayer],
    overlays: [overlay],
    view: new ol.View({
        center: [12977452.2662, 4847790.3422],
        zoom: 9
    })
});
map.on('singleclick', function (evt) {
    featureinfo_content.innerHTML = "";
    var resolution = map.getView().getResolution();
    var url = wmsLayer.getSource().getGetFeatureInfoUrl(
        evt.coordinate,
        resolution,
        'EPSG:3857',
        {'INFO_FORMAT': 'text/html'}
    );
    if (url) {
        $.ajax({
            url: url,
            success: function (results) {
                var patten = new RegExp('table class="featureInfo"');
                if (patten.test(results)) {
                    $('#featureinfo').removeAttr('hidden');
                    featureinfo_content.innerHTML = results;
                    overlay.setPosition(evt.coordinate);
                } else {
                    overlay.setPosition(undefined);
                }
            }
        })
    }
});