/**
 * Created by wangjian on 16/1/30.
 */
/**
 * @author songy
 * date: 2014/04/14
 * descript: 底图图层类
 */
BaseLayer = {
    //这个值为默认选中节点的id值，默认选中为矢量
    current_node : "vec",
    layers : ["cn"],
    bou_layer : null,
    layer_geographic : [
        {
            "id" : "vec",
            "layers" : [
                {"id" : "cn","layerName" : "cva"},
                {"id" : "en","layerName" : "eva"}
            ]
        },
        {
            "id" : "img",
            "layers" : [
                {"id" : "cn","layerName" : "cia"},
                {"id" : "en","layerName" : "eia"},
                {"id" : "wat","layerName" : "wat"},
                {"id" : "raw","layerName" : "raw"}
            ]
        },
        {
            "id" : "ter",
            "layers" : [
                {"id" : "cn","layerName" : "cta"},
                {"id" : "en","layerName" : "eia"},
                {"id" : "wat","layerName" : "wat"},
                {"id" : "raw","layerName" : "raw"}
            ]
        }],
    init : function(){
        var json = [
            {
                id : "tdt_base_layer",
                text : "天地图底图",
                children : [
                    {
                        id : "geographic_elements",
                        text :  "地理要素",
                        children : [
                            { id : "cn", text : "中文地名", icon : "images/index/check2.png", state : { selected : true } },
                            { id : "en", text : "英文地名", icon : "images/index/check1.png" },
                            { id : "wat", text : "水系", icon : "images/index/check3.png"},
                            { id : "raw", text : "铁路", icon : "images/index/check3.png"}
                        ],
                        icon : false,
                        state : { opened : true }
                    },
                    {
                        id : "_tdt_base_layer",//区别上一层
                        text : "底图",
                        children : [
                            { id : "vec", text : "地图", icon : "images/index/sex2.png", state : { selected : true } },
                            { id : "img", text : "影像", icon : "images/index/sex1.png" },
                            { id : "ter", text : "地形", icon : "images/index/sex1.png" }
                        ],
                        icon : false,
                        state : { opened : true }
                    }
                ],
                icon : false,
                state : {
                    opened : true
                }
            }];
        BaseLayer.createTree(json);
        BaseLayer.changeBaseLayer();
        BaseLayer.addBouLayer();
    },
    createTree : function(nodesData) {
        //左侧的树
        var propertyBoxTree = jQuery("#base_layer_tree").jstree({
            core : {
                check_callback : true,
                themes : {stripes : false, icons : true, dots : false },
                data : nodesData,
                multiple : true
            },
            //插件
            plugins : ["checkbox", "wholerow"],//
            checkbox : {
                visible : false,
                three_state : false,
                keep_selected_style : false
            }
        });

        //单击节点
        propertyBoxTree.on('activate_node.jstree', function (e, data) {
            var node = data.node;
            var instance = data.instance;
            //如果不是叶子节点，直接返回
            if (node.children.length > 0) {
                instance.deselect_node(data.node);
                instance.select_node(BaseLayer.current_node);
                return false;
            }
            var parent_id = node.parent;
            switch (parent_id) {
                case "geographic_elements"://多选框
                    var icon = node.icon;
                    if (icon == "images/index/check1.png") {
                        instance.set_icon(node, "images/index/check2.png");
                        //未选中功能实现
                        BaseLayer.changeBaseLayer();
                    } else {
                        instance.set_icon(node, "images/index/check1.png");
                        //选中功能实现
                        BaseLayer.changeBaseLayer();
                    }
                    break;
                case "_tdt_base_layer"://单选框
                    //如果还为本身直接返回
                    if (node.id == BaseLayer.current_node) {
                        instance.deselect_node(node);
                        instance.select_node(BaseLayer.current_node);
                        return false;
                    }
                    instance.set_icon(instance.get_node(BaseLayer.current_node), "images/index/sex1.png");
                    instance.set_icon(node, "images/index/sex2.png");
                    BaseLayer.current_node = node.id;

                    //功能实现
                    BaseLayer.changeBaseLayer();

//					BaseLayer.addBouLayer();
                    break;
                case "user_custom_layer"://待定，这一版不做，有可能是复选，以后有人接手进行扩展即可
                    var icon = node.icon;
                    if (icon == "images/index/check1.png") {
                        instance.set_icon(node, "images/index/check2.png");
                        //未选中功能实现
                    } else {
                        instance.set_icon(node, "images/index/check1.png");
                        //选中功能实现
                    }
                    break;
            }

//			//如果为父节点或者为当前节点，直接返回
//			if (data.node.children.length > 0 || !data.node.state.selected) {
//				data.instance.deselect_node(data.node);
//				data.instance.select_node(BaseLayer.current_node);
//				return false;
//			}
//			//效果切换
//			var instance = data.instance;
//			instance.set_icon(instance.get_node(BaseLayer.current_node), "images/index/sex1.png");
//			instance.set_icon(data.node, "images/index/sex2.png");
//			BaseLayer.current_node = data.node;
//			//功能实现
//			var layers = BaseLayer["layers"];
//			//找出最上层那个layer
//			var arr = [];
//			var oo = {};
//			for (var key in layers) {
//				var o = layers[key];
//				arr.push(o.zIndex);
//				oo[o.zIndex] = {"layer" : o.layer, "name" : key};
//			}
//			//排序
//			arr.sort();
//			//返回最后一个元素
//			var max = arr.pop();
//			//最上面的图层
//			var top_layer = oo[max];
//			//当前图层
//			var obj = layers[data.node.original.text];
//			//图层顺序对换
//			obj.layer.setZindex(max);
//			top_layer.layer.setZindex(obj.zIndex);
//			//重新请求
//			top_layer.layer.refresh();
//			//数组进行更新
//			layers[top_layer.name]["zIndex"] = obj.zIndex;
//			obj.zIndex = max;

        });
        //树加载完成
        propertyBoxTree.on('ready.jstree', function (e, data) {

        });
        //节点展开
        propertyBoxTree.on("after_open.jstree", function (e, data) {
            index.scrollbarLong();
        });
        //节点关闭
        propertyBoxTree.on("after_close.jstree", function (e, data) {
            index.scrollbarShort();
        });
    },
    changeBaseLayer : function(){
        BaseLayer.addBouLayer();
        var layers = [];
        var tree = jQuery("#base_layer_tree").jstree(true);
        var node = tree.get_node(BaseLayer.current_node);
        var proj = (index.map.getCode()=='EPSG:4326')?"_c":"_w";

        for(var i = 0 ; i < BaseLayer.layer_geographic.length; i++){
            var o = BaseLayer.layer_geographic[i];
            if(o.id == node.id){
                var config = {
                    "opacity" : 1.0,
                    "errorImg" : "images/vec404.png",
                    "getTileUrl" : function(x, y, z){
                        x = index.map.toSpanXLegalTile(x,index.map.getZoom());
                        //随机去服务器上取瓦片，达到负载均衡
                        var h = parseInt(Math.random()*8);
                        var url = "http://t" + h + ".tianditu.cn/"+ o.id +proj+"/wmts?"+"SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER="+ o.id +"&STYLE=default&TILEMATRIXSET="+proj.substr(1)+"&FORMAT=tiles&" + "TILECOL=" + x + "&TILEROW=" + y + "&TILEMATRIX=" + z;
                        return url;
                    }
                };
                //创建自定义图层对象
                var lay = new TTileLayer(config);
                lay.setGetTileUrl(config.getTileUrl);
                layers.push(lay);

                BaseLayer.layers = [];
                var pjson = tree.get_json("geographic_elements");
                var children = pjson.children;

                for(var j = 0; j < o.layers.length ; j++){
                    var obj = o.layers[j];
                    var hasnode = tree.get_node(obj.id);
                    hasnode.state.disabled = false;
                    var icon = hasnode.icon;
                    if (icon == "images/index/check2.png") {
                        (function(){
                            var l = obj;
                            var conf = {"extName":l.layerName};
                            conf.getTileUrl = function(x,y,z){
                                x = index.map.toSpanXLegalTile(x,index.map.getZoom());
                                //随机去服务器上取瓦片，达到负载均衡
                                var h = parseInt(Math.random()*8);
                                var url = "http://t" + h + ".tianditu.cn/"+ l.layerName +proj+"/wmts?"+"SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER="+ l.layerName +"&STYLE=default&TILEMATRIXSET="+proj.substr(1)+"&FORMAT=tiles&" + "TILECOL=" + x + "&TILEROW=" + y + "&TILEMATRIX=" + z;
                                return url;
                            };
                            //创建自定义图层对象
                            var lay1 = new TTileLayer(conf);
                            lay1.setGetTileUrl(conf.getTileUrl);
                            layers.push(lay1);
                        })();

                        $A.indexOf(BaseLayer.layers, hasnode.id) == -1 && BaseLayer.layers.push(hasnode.id);
                    }else{
                        tree.set_icon(hasnode, "images/index/check1.png");
                    }
                    //将包含的地理要素id从数组中移除
                    for(var c = 0 ; c < children.length ; c++){
                        if(children[c].id == obj.id){
                            var child = tree.get_node(children[c].id);
                            child.state.disabled = false;
                            children.splice(c,1);
                        }
                    }
                }

                for(var c = 0 ; c < children.length ; c++){
                    var child = tree.get_node(children[c].id);
                    child.state.disabled = true;
                    tree.set_icon(child, "images/index/check3.png");
                }

                break;

            }
        }
        //将图层增加到地图上
        var maptypeNew = new TMapType(layers,"底图");
        index.map.setMapType(maptypeNew);
    },

    /**
     * 在影像与地形视图下显示境界图层
     */
    addBouLayer : function() {

        var proj = (index.map.getCode()=='EPSG:4326')?"_c":"_w";
        if(BaseLayer.bou_layer != null) {
//			index.map.removeOverLay(BaseLayer.bou_layer);
            index.map.removeLayer(BaseLayer.bou_layer);
            BaseLayer.bou_layer = null;
        }
        if(BaseLayer.current_node == "img") {
            //添加自定义图层
            var bou_config = {
                "opacity" : 1.0,
                "errorImg" : "images/404.png",
                "zIndex" : 102,
                "getTileUrl" : function(x, y, z) {
                    //随机去服务器上取瓦片，达到负载均衡
                    var h = parseInt(Math.random()*8);
                    var imageBaseURL = "http://t"+h+".tianditu.cn/ibo"+proj+"/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=ibo&tileMatrixSet="+proj.substr(1)+"&TileMatrix="+z+"&TileRow="+y+"&TileCol="+x+"&style=default&format=tiles";
                    return imageBaseURL;
                }
            };
            BaseLayer.bou_layer = new TTileLayer(bou_config);
            BaseLayer.bou_layer.setGetTileUrl(bou_config.getTileUrl);
            index.map.addLayer(BaseLayer.bou_layer);
        }
        if(BaseLayer.current_node == "ter") {
            //添加自定义图层
            var bou_config = {
                "opacity" : 1.0,
                "errorImg" : "images/404.png",
                "zIndex" : 102,
                "getTileUrl" : function(x, y, z) {
                    //随机去服务器上取瓦片，达到负载均衡
                    var h = parseInt(Math.random()*8);
                    var imageBaseURL = "http://t"+h+".tianditu.cn/tbo"+proj+"/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=tbo&tileMatrixSet="+proj.substr(1)+"&TileMatrix="+z+"&TileRow="+y+"&TileCol="+x+"&style=default&format=tiles";
                    return imageBaseURL;
                }
            };
            BaseLayer.bou_layer = new TTileLayer(bou_config);
            BaseLayer.bou_layer.setGetTileUrl(bou_config.getTileUrl);
            index.map.addLayer(BaseLayer.bou_layer);
        }
    },

    /**
     * 加载地表覆盖图层
     * @param ls 选中的图层数组
     * @date 2015-07-27
     */
    loadCovers : function(ls){

        if(index.covers && index.covers.length>0) {
            for(var cv=0;cv<index.covers.length;cv++){
                index.map.removeLayer(index.covers[cv]);
            }
        }

        var proj = (index.map.getCode()=='EPSG:4326')?"_c":"_w";
        index.covers = [];
        var config = null;
        for (var i=0; i<ls.length; i++){
            var layerName = ls[i];
            (function(layerName){
                config = {
                    "opacity" : 1.0,
                    "errorImg" : "images/no404.gif",
                    "getTileUrl" : function(x, y, z){
                        var url = "http://glcdata.tianditu.com/"+ layerName + proj +"/wmts?"+"SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER="+ layerName +"&STYLE=default&TILEMATRIXSET="+proj.substr(1)+"&FORMAT=tiles&" + "TILECOL=" + x + "&TILEROW=" + y + "&TILEMATRIX=" + z;
                        return url;
                    }
                };
            })(layerName);
            //创建自定义图层对象
            var layer = new TTileLayer(config);
            layer.setGetTileUrl(config.getTileUrl);
            index.map.addLayer(layer);
            index.covers.push(layer);
        }
    },

    /**
     * 地表覆盖图层映射函数
     * @param layers 选中的图层数组
     * @date 2015-07-27
     */
    mapCovers : function(nodeIds){

        var coverLayers = {
            '080101':'glc',//所有类型
            '080102':'lcr',//水体
            '080103':'lcw',//湿地
            '080104':'lci',//人造地表
            '080105':'lcc',//耕地
            '080106':'lcp',//冰川和永久积雪
            '080107':'lcf',//森林
            '080108':'lcg',//草地
            '080109':'lcs',//灌木地
            '080110':'lcb',//裸地
            '080111':'lct'//苔原
        };

        var covers = [];

        for(var i=0; i<nodeIds.length; i++){
            var layer = coverLayers[nodeIds[i]];
            if(map){
                covers.push(layer);
            }
        }

        return covers;
    }
};