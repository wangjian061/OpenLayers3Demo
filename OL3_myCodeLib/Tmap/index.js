/**
 * Created by wangjian on 16/1/30.
 */
/**
 * @author cicada
 * @date 2010/03/28
 * @descript 页面初始化
 */
var index = {

    //项目URL前缀
    project_prefix_url: location.protocol + "//" + location.host + (location.pathname.substring(1).split("/")[0] == "zhfw" ? "/zhfw" : ""),
    map: null,
    propertyBox: null,
    moreInfo: false,
    tTLayer: null,	//综合服务专题图层对象(gyl)
    CLICK_EVT: "",
    HL_MARKERS: [],

    //初始化
    init: function () {
        var slf = this;
        slf.initOption();

        $LAB
            .script("js/user/Favorite.js")
            .wait(function () {
                User.init();
                //加载收藏夹列表
                Favorite.init();
            })
            .script("js/map/Zoom.js")
            .script("js/map/TGeometry.js")
            .script("js/map/TTLayer.js")
            /*.script("js/lib/popbox/popbox.js")*/
            .script("js/lib/popbox/popbox.min.js")
            .script("js/common/propertyBox.js")
            //.script("js/lib/open_flash_chart/swfobject.js")
            .wait(function () {
                slf.initMap();
                //页面事件添加
                slf.initEvent();
            })
            /*.script("js/lib/jstree/jstree.js")*/
            .script("js/lib/jstree/jstree.min.js")
            /*.script("js/lib/tinyscrollbar/jquery.tinyscrollbar.js")
             .script("js/lib/tinyscrollbar/jq.tinyscrollbar.js")*/
            .script("js/lib/tinyscrollbar/jquery.tinyscrollbar.min.js")
            .script("js/lib/tinyscrollbar/jq.tinyscrollbar.min.js")
            .script("js/lib/ZeroClipboard/ZeroClipboard.min.js")
            .wait(function () {
                slf.loadLayerTree();
            })
            .script("js/attrGrid/ArrtGrid.js")
            .script("js/attrGrid/Records.js")
            .script("js/attrGrid/GridTabs.js")
            .wait(function () {
                slf.initPage();
                //属性表格初始化+滚动翻页
                jQuery("#" + AttrGrid.init()).tinyscrollbar_attrGrid();
            })
            .script("js/map/baseLayer.js")
            .wait(function () {
                //加载底图树数据
                BaseLayer.init();
            })
            .script("js/common/changeArea/init.js")
            .script("js/common/changeArea/query.js")
            .wait(function () {
                //行政区划
                areaInit.mapInit();
            })
            .script("js/map/maptools.js")
            .wait(function () {
                slf.initMapTools();
            })
            .wait(function () {
                index.loadShare();//加载分享
            })
            .script("js/lib/jcarousel/jquery.jcarousel.min.js");
    },

    //初始化选项,如版本号等
    initOption: function () {
        //最上角,综合服务的url
        var zhfw_url = document.getElementById("zhfw_url");
        if (zhfw_url) {
            zhfw_url.href = ZHFW.config.ZHFW_URL;
        }
        //打印版本号
        if (window.console) {
            console.log(ZHFW.VERSION);
        }
    },

    //初始化页面的一些高度
    initPage: function () {
        var height = jQuery(window).height();
        //就一固定值，直接给出
        var top_height = 105;//jQuery(".all_top").outerHeight();
        var tool_height = 29;//jQuery(".allrttop").outerHeight();
        var map_height = 0;
        var ms_top = 0;
        //全屏
        var fullScreen = jQuery('#fullScreen');
        //左侧栏
        var mapSpread = jQuery('#mapSpread');
        //统计表格
        var stat_table = jQuery("#popu_list_box");
        if (jQuery("#topbar").is(":hidden")) {
            map_height = height - tool_height - 1;
            ms_top = tool_height + (map_height - 85) / 2;
            jQuery('#fullScreen a').html('<span class="screen"></span>退出');
            jQuery('#fullScreen a span').css('background-position', '-69px 0px');
        } else {
            map_height = height - top_height - tool_height - 1;
            ms_top = top_height + tool_height + (map_height - 85) / 2;
            jQuery('#fullScreen a').html('<span class="screen"></span>全屏');
            jQuery('#fullScreen a span').css('background-position', '-5px 0px');
        }
        //图片替换
        if (jQuery("#leftbar").is(":hidden")) {
            mapSpread.css({'background-position': '-26px -37px', 'left': '0px', 'top': ms_top + 'px'});
            mapSpread.attr('title', '显示左栏');
            stat_table.css("left", "0px");
        } else {
            mapSpread.css({'background-position': '-8px -37px', 'left': '330px', 'top': ms_top + 'px'});
            mapSpread.attr('title', '收起左栏');
            stat_table.css("left", "330px");
        }
        //地图高度
        jQuery("#map").height(map_height);
        index.map.resizeContainer();
        //树、滚动条高度
        jQuery("#scrollbar_layer,#scrollbar,#viewport").height(map_height);
        //滚动条样式更新
        jQuery("#pub_tc_tree").trigger("after_open.jstree");
        //重新计算属性表宽度 ==>by rt May6
        if (AttrGrid) {
            AttrGrid.resize();
        }
    },

    //页面注册事件
    initEvent: function () {
        //页面注册resize事件
        jQuery(window).on("resize", function () {
            index.initPage();
            index.map && index.map.checkResize();
        });
        //页面关闭前记录状态到cookie
        jQuery(window).on("beforeunload", function () {
            Cookie.set("status", index.getStatusStr(index.map));
        });
        //左侧栏事件
        jQuery('#mapSpread').on('click', function () {
            if (jQuery("#leftbar").is(":hidden")) {
                jQuery('#leftbar').show();
                jQuery("#statistics_box").css({"left": "330px"});
                jQuery("#AreaCityName").css({"left": "370px"});
            } else {
                jQuery('#leftbar').hide();
                jQuery("#statistics_box").css({"left": "0px"});
                jQuery("#AreaCityName").css({"left": "40px"});
            }
            //通知地图进行大小更新
            index.map && index.map.checkResize();
            //初始化一下页面结构
            index.initPage();
        });
        //图层及收藏夹事件
        jQuery("#index,#collect").on("click", function () {
            var id = this.id;
            var o = this.parentNode.parentNode;
            o.className = "libg";
            //样式恢复
            var ids = {
                "index": "collect",
                "collect": "index"
            };
            var obj = ids[id];
            $(obj).parentNode.parentNode.className = "";

            jQuery("#index").parent().removeClass("libg");
            jQuery("#collect").parent().removeClass("libg");
            jQuery("#" + id).parent().addClass("libg");

            //div进行切换
            $(id + "_div").style.display = "";
            $(obj + "_div").style.display = "none";
            var scrollbar = jQuery("#scrollbar_layer").data("plugin_tinyscrollbar");
            scrollbar.update();

            //收藏夹需要弹窗
            if (id == "collect") {
                //登录状态
                Favorite.init(true);
                if (User.isLogin()) {
                    //获取图层树状态（顺序、选中节点）
                    var favJson = index.getTreeStatusInfo();
                    //如果与选中的条目内容相等，直接返回
                    if (favJson == jQuery("#collect_div>.bg>input").data("json")) {
                        return false;
                    }
                    var tree = jQuery("#pub_tc_tree").jstree(true);
                    var nodes = tree.get_selected();
                    if (nodes.length > 0) {

                        if (document.getElementById("prompt")) {
                            index.propertyBox.close();//如果已有弹出窗,则强制关闭
                        }

                        //弹窗进行提示
                        var popbox = new Popbox({
                            shade: true,
                            opacity: 20,
                            title: "提示",
                            height: 100,
                            width: 300,
                            confirmTxt: "是",
                            cancelTxt: "否",
                            confirmFun: function () {
                                popbox.remove();
                                var favorite = {};
                                favorite.favName = Favorite.DEFAULT_NAME;
                                favorite.favJson = favJson;
                                Favorite.insertFavorite(favorite);
                            },
                            cancelFun: function () {
                                popbox.remove();
                            },
                            keydownFun: function () {
                                popbox.remove();
                            },
                            html: "<div style='margin:10px 0 0 10px;'>是否保存当前图层？</div>"
                        });
                    }
                } else {
                    //未登录状态
                    $("collect_div").innerHTML = Favorite.nologHtml;
                }
            }
        });
        //专题底图及地图底图
        jQuery("#subject_layer,#map_baselayer").on("click", function () {
            var id = this.id;
            var o = jQuery(this);
            var img = o.css("background-image");
            var ids = {
                "subject_layer": "#pub_tc_tree",
                "map_baselayer": "#base_layer_tree"
            };
            var obj = ids[id];
            if (img.indexOf("jd2.png") > 0) {
                o.css("background-image", "url(images/index/jd.png)");
                jQuery(obj).show();
            } else {
                o.css("background-image", "url(images/index/jd2.png)");
                jQuery(obj).hide();
            }
            //更新滚动条
            index.scrollbarLong();
        });

        //给changeArea绑定事件
        TEvent.addListener($("changeArea"), "click", function () {
            jQuery("#statistics_box").is(":hidden") ? jQuery("#statistics_box").show() : jQuery("#statistics_box").hide();
        });
        //关闭按钮
        jQuery("#changeAreaClose").on("click", function () {
            jQuery("#AreaCityName").hide();
            jQuery("#changelog_box").hide();
            jQuery("#statistics_box").hide();
            clearAll();
        });

        $LAB
            .script("js/common/changeArea/util.js")
            .wait(function () {
                TEvent.addListener(index.map, "moveend", function () {
                    T.Util.changeCity();
                });
                TEvent.addListener(index.map, "zoomend", function () {
                    T.Util.changeCity();
                });
            });


        /**
         * 注册更多的相关事件
         */
//		setTimeout(function(){
//			var morePage = document.getElementById("t_header_morePage");
//			morePage.onmouseover = function(){
//				index.moreInfo = false;
//				index.T_register_morePage();
//			};
//			morePage.onmouseout = function(){
//				index.moreInfo = true;
//				index.T_register_morePageOut();
//			};
//		},100);
    },
    /**
     * 给更多页面注册事件,mouseover事件
     */
    T_register_morePage: function () {
        //将更多后面的箭头替换成向上
        document.getElementById('t_header_morePage_img').src = ZHFW.config.T_URL + "/images/index/moremouseup.png";
        var div = document.getElementById("T_header_morePage_info");
        if (div) {
            return;
        }
        div = document.createElement("div");
        div.className = "andmore";
        div.id = "T_header_morePage_info";

        var html = "<div class='pub_more'><a href='" + ZHFW.config.T_URL + "/message.shtml?type=1&stime=2013' target='message'>更新日志</a></div>" +
            "<div class='pub_more'><a href='" + ZHFW.config.T_URL + "/feedback.shtml?time=" + new Date().getTime() + "' target='feedback'>意见反馈</a></div>" +
            "<div class='pub_more'><a href='" + ZHFW.config.T_URL + "/help/web/help.html' target='help'>帮助</a></div>";
        div.innerHTML = html;
        document.getElementById("t_user_position").appendChild(div);
        div.onmouseover = function () {
            index.moreInfo = false;
            //将更多后面的箭头替换成向上
            document.getElementById('t_header_morePage_img').src = ZHFW.config.T_URL + "/images/index/moremouseup.png";
        };
        div.onmouseout = function () {
            index.moreInfo = true;
            index.T_register_morePageOut();
        };
    },
    /**
     * 给更多页面注册事件,mouseout事件
     */
    T_register_morePageOut: function () {
        index.moreInfo = true;
        setTimeout(function () {
            var div = document.getElementById("T_header_morePage_info");
            if (div) {
                if (index.moreInfo == true) {
                    //将更多后面的箭头替换成向下
                    document.getElementById('t_header_morePage_img').src = ZHFW.config.T_URL + "/images/index/more.png";
                    document.getElementById("t_user_position").removeChild(div);
                }
            }
        }, 100);
    },
    //加载左侧图层树
    loadLayerTree: function () {

        //请求专题数据
        Ajax.request("getSubjectLayer.shtml", {
            method: "POST",
            success: function (req) {
                var data = req.responseText;
                //存一份最原始的字符串数据，以免数据造成污染
                index.originTreeNodes = data;
                //处理过的索引树节点
                index.indexTreeNodes = Favorite.getTreeNodes();
                //初始化图层树
                var json = JSON.parse(data);
                index.initSubjectLayer(json);
            }
        });
    },

    //加载地图
    initMap: function () {
        var map = new TMap("map", {"projection": "EPSG:900913"});
        map.centerAndZoom(new TLngLat(116.40969, 39.89945), 4);
        map.enableHandleMouseScroll();
        map.enableDoubleClickZoom();
        map.enableHandleKeyboard();
        map.enableInertia();
        map.setZoomLevels([2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18]);
        //比例尺
        var scale = new TScaleControl();
        map.addControl(scale);
        //平移
        var config = {
            type: "TMAP_NAVIGATION_CONTROL_LARGE",
            anchor: "TMAP_ANCHOR_TOP_RIGHT",
            offset: [0, 0],
            showZoomInfo: true,
            style: 1,
            showZoomInfo: false
        };
        var control = new TNavigationControl(config);
        map.addControl(control);

//		this.CLICK_EVT = TEvent.addListener(map, "click", function(point) {
//			var selNodeIds = jQuery("#pub_tc_tree").jstree(true).get_selected();
//			if(selNodeIds.length > 0) {
//
//			}
//		});
        //地图对象
        this.map = map;

        //初始化显示级别监听 ==> by rt May12
        Zoom.init();
    },

    //加载地图工具
    initMapTools: function () {
        //注册事件
        jQuery("#maptoolbar").on("click", function (evt) {
            if (index.tTLayer != null) {
                TEvent.removeListener(index.tTLayer.clickEvt);
                index.tTLayer.clickEvt = null;
            }

            var e = evt || window.event;
            var o = e.target || e.srcElement;
            //元素id及地图对象都存在才能调用
            var id = jQuery(o).closest('li').attr("id");
            id && index.map && MapTools[id](index.map);
        });
    },

    //创建专题图层树
    initSubjectLayer: function (jsonData) {
        //图层树
        var tree = jQuery("#pub_tc_tree").jstree({
            core: {
                check_callback: true,
                themes: {stripes: false, icons: false, dots: false},
                data: jsonData,//data.layerTreeJson(),//
                multiple: true,
                icon_style: "normal"
            },
            //插件
            plugins: ["dnd", "checkbox", "wholerow"],//, "state"
            dnd: {
                copy: false
            },
            checkbox: {
                visible: true,
                three_state: false,
                whole_node: true,
                keep_selected_style: false
            }
        });
        //左键单击
        tree.on('activate_node.jstree', function (e, data) {
            //如果为父节点，直接返回
            var node = data.node;
            var tree = jQuery("#pub_tc_tree").jstree(true);
            if (!node || node.children.length > 0) {
                tree.toggle_node(node);
                tree.deselect_node(node);//非子节点需要取消选择
                index.reloadLegend(node.children);//强制展开全部图例
                //上边操作包含滚动条收缩
                return false;
            }

            //给此节点的父几点都增加样式
            index.renderByChildrenNode();

            //添加专题图层--根据图层树(排序)
            index.sortLayers(tree.get_selected(), "ZHFW:");

            //树上节点点击后, 对应属性表操作 ==>by rt Apr25
            if (AttrGrid) {
                AttrGrid.get(data.node);
            }
        });
        //move_node事件
        tree.on('move_node.jstree', function (e, data) {
            var id = data.node.parent;
            //移动之后重选node ==>May27
            var tree = jQuery("#pub_tc_tree").jstree(true);
            var nodes = tree.get_selected().slice(0);

            //声明数组
            if (!window.sort_nodes) window.sort_nodes = [];
            //如果该元素不存在，则放到数组
            $A.indexOf(sort_nodes, id) == -1 && sort_nodes.push(id);
            index.sortLayers(tree.get_selected(), "ZHFW:");

            //树上节点点击后, 对应属性表操作 ==>by rt May27
            tree.deselect_node(nodes);
            tree.select_node(nodes);
            if (AttrGrid) {
                AttrGrid.initByTree(function () {
                    GridTabs.showTab(AttrGrid.SUBJECT_CODE);
                }, true);//回调显示标签
            }
        });
        //状态改变事件
        tree.on('changed.jstree', function (e, data) {
            //如果为父节点，直接返回
            var node = data.node;
            if (!node || node.children.length > 0) {
                return false;
            }
            //依次判断父节点全部为打开状态，才能添加图例
            index.isOpen(data.instance, node) && index.addLegend(node);
            //添加专题图层--根据图层树(排序)
            //index.sortLayers(jQuery("#pub_tc_tree").jstree(true).get_selected(), "ZHFW:");
            index.renderByChildrenNode();
            //滚动条增高
            index.scrollbarLong();
        });
        //树加载完成后
        tree.on('ready.jstree', function (e, data) {
            //添加提示框
            var left = jQuery(this).offset().left + jQuery(this).outerWidth();
            var tips = document.createElement('DIV');
            tips.style.cssText = 'max-width:500px;background:#fff;border:1px solid #acacac;padding:5px;position:absolute;left:' + left + 'px;top:10px;z-index:65536;display:none;';
            tips.id = 'jstree-tips';
            document.body && document.body.appendChild(tips);
            window.t = null;
            //鼠标进入事件
            jQuery('#jstree-tips').on('mouseenter', function () {
                //存在就清除
                window.t && clearTimeout(window.t);
            });
            //鼠标离开事件
            jQuery('#jstree-tips').on('mouseleave', function () {
                window.t && (window.t = setTimeout(function () {
                    jQuery('#jstree-tips').hide();
                }, 500));
            });
            jQuery('#pub_tc_tree').on('mouseleave', function () {
                window.t = setTimeout(function () {
                    jQuery('#jstree-tips').hide();
                }, 500);
            });
            //滚动条添加
            jQuery("#scrollbar_layer").tinyscrollbar();
            //图层加载
            var tree = data.instance;
            var nodes = tree.get_selected();
            $A.forEach(nodes, function (o) {
                var node = tree.get_node(o);
                index.isOpen(tree, node) && index.addLegend(node);
            });

            //如果不是分享链接，则恢复到上次cookie保存的状态
            var params = getParameter(location.href);
            var key = params.share;
            var status = Cookie.get("status");
            !key && index.restoreStatus(status);

            //属性表初始化 ==>by rt May7
            if (AttrGrid) {
                AttrGrid.initByTree();
            }

            //添加专题图层--根据图层树(排序)
            index.sortLayers(jQuery("#pub_tc_tree").jstree(true).get_selected(), "ZHFW:");
            //index.renderByChildrenNode();
        });
        //打开节点后更新滚动条
        tree.on("after_open.jstree", function (e, data) {
            var tree = jQuery("#pub_tc_tree").jstree(true);
            var nodes = tree.get_selected();
            $A.forEach(nodes, function (node) {
                //只有父节点全部打开，才能重新加载图例
                if (index.isOpen(tree, node)) {
                    tree.deselect_node(node);
                    tree.select_node(node);
                }
            });
            //滚动条增高
            index.scrollbarLong();

            if (AttrGrid) {
                AttrGrid.initByTree(function () {
                    GridTabs.showTab(AttrGrid.SUBJECT_CODE);
                }, true);//回调显示标签
            }
        });
        //关闭节点后更新滚动条
        tree.on("after_close.jstree", function (e, data) {
            index.scrollbarShort();
        });

    },

    /**
     *    子节点点击后, 父节点变色
     */
    renderByChildrenNode: function (isInit) {
        var tree = jQuery("#pub_tc_tree").jstree(true);
        var childrensDoms = jQuery("#pub_tc_tree").find("*");
        //擦除样式
        childrensDoms.removeClass("jstree-selected-inthat-parent-div").removeClass("jstree-selected-inthat-parent-span");

        var nodeArray = tree.get_selected();
        for (var i = 0, len = nodeArray.length; i < len; i++) {
            var node = tree.get_node(nodeArray[i]);//本节点
            index._renderRowWByChildren(node.id);

            var pId = tree.get_parent(node);//父级节点,二级节点
            index._renderRowWByChildren(pId);

            var ppNode = tree.get_node(node.parent);//顶级节点
            var ppId = ppNode.parent;
            index._renderRowWByChildren(ppId);
        }
    },
    _renderRowWByChildren: function (parentId, mode) {
        if ("#" !== parentId)//"#"是root节点
        {
            var parentsRow = jQuery("#pub_tc_tree").find('#' + parentId + " .jstree-wholerow:first");
            var parentFont = jQuery("#pub_tc_tree").find('#' + parentId).find("a:first span");

            parentsRow.addClass("jstree-selected-inthat-parent-div");
            parentFont.addClass("jstree-selected-inthat-parent-span");
        }
    },

    //滚动条增高
    scrollbarLong: function () {
        var scrollbar = jQuery("#scrollbar_layer").data("plugin_tinyscrollbar");
        if (!scrollbar) return false;
        var tree_height = jQuery("#viewport").height();
        var scroll_height = jQuery("#overview").height();
        var offset = scroll_height >= tree_height ? scrollbar.contentPosition : 0;
        scrollbar.update(offset);
    },

    //滚动条缩短
    scrollbarShort: function () {
        var scrollbar = jQuery("#scrollbar_layer").data("plugin_tinyscrollbar");
        if (!scrollbar) return false;
        var tree_height = jQuery("#viewport").height();
        var scroll_height = jQuery("#overview").height();
        var real_height = scrollbar.contentPosition + scrollbar.thumbSize;
        var offset = tree_height >= real_height ? scrollbar.contentPosition : "bottom";
        offset = scroll_height >= tree_height ? offset : 0;
        scrollbar.update(offset);
    },

    //添加图例
    addLegend: function (node) {
        //天气预报月行政地名没有图例
        if (node.id != '020100' && node.id != '030100') {
            var LegendUrl = ZHFW.config.WMSURL + "?REQUEST=GetLegendGraphic&VERSION=1.0.0&FORMAT=image/png&WIDTH=27&HEIGHT=27&STRICT=false&legend_options=fontName:%E5%AE%8B%E4%BD%93;fontSize:13;&";

            var id = '#' + node.id + '>.jstree-legend>img';
            if (jQuery(id).length > 0) {
                jQuery(id).remove();
            }

            var legendId = node.id;
            var subjectData = node.original;
            var level = Zoom.level;
            var div = document.createElement('DIV');
            var img = document.createElement('IMG');

            //人口数据
            if (node.id.indexOf("01") == 0) {
                if (subjectData.adminLevel > 1000) {
                    if (level == Zoom.SHENG) {
                        legendId += "_01000";
                    } else if (level == Zoom.SHI) {
                        legendId += "_00100";
                    } else if (level == Zoom.XIAN) {
                        legendId += "_00010";
                    }
                }
                if (subjectData.type == "1") {
                    legendId += "_pstyle";
                } else if (subjectData.type == "2") {
                    legendId = node.id.substring(1, 6);
                } else if (subjectData.type == "3") {
                    legendId += "_seg";
                }
                img.src = LegendUrl + "style=" + legendId;
            } else if (node.id.indexOf("04") == 0) {
                img.src = LegendUrl + "style=" + legendId;
            } else {
                img.src = LegendUrl + "layer=ZHFW:" + legendId;
            }

            /**全球地表覆盖图例为静态图片，不再请求geoserver服务 START 20150727**/
            if (node.id.substr(0, 2) == "08") {
                var legends = {
                    '080101': 'glc3all.png',//所有类型
                    '080102': 'warterbodies.png',//水体
                    '080103': 'wetland.png',//湿地
                    '080104': 'artifical.png',//人造地表
                    '080105': 'cultivatedland.png',//耕地
                    '080106': 'snowice.png',//冰川和永久积雪
                    '080107': 'forest.png',//森林
                    '080108': 'grassland.png',//草地
                    '080109': 'shrublands.png',//灌木地
                    '080110': 'bareland.png',//裸地
                    '080111': 'tundra.png'//苔原
                };

                img.src = 'images/covers/' + legends[node.id];
            }
            /**全球地表覆盖图例为静态图片，不再请求geoserver服务 END 20150727**/

            img.alt = '图例';
            img.border = 0;
            div.appendChild(img);
            div.className = 'jstree-legend';
            document.getElementById(node.id).appendChild(div);
            //图片加载完成后更新滚动条
            jQuery(id).on('load', function () {
                this.complete && index.scrollbarLong();
            });
            //图片加载完成后更新滚动条
            jQuery(id).on('error', function () {
                this.src = 'images/index/mask.gif';
                this.parentNode.style.height = '1px';
                index.scrollbarLong();
            });
            //选中状态则显示，否则隐藏
            if (!node.state.selected) {
//				jQuery(id).eq(0).hide();
                jQuery(id).remove();
            }
        }
    },
    reloadLegend: function (nodeIdArray) {
        var tree = jQuery("#pub_tc_tree").jstree(true);
        var nodes;

        if (!nodeIdArray) {
            nodes = tree.get_selected();
        }
        else {
            nodes = nodeIdArray;
        }

        $A.forEach(nodes, function (node) {
            index.addLegend(tree.get_node(node));
        });
    },
    //依次判断父节点是否打开，一直到根节点'#'
    isOpen: function (t, n) {
        var pid = t.get_parent(n);
        if (pid == '#') return true;
        var pnode = t.get_node(pid);
        if (!pnode.state.opened) {
            return false;
        }
        return this.isOpen(t, pid);
    },

    //获取图层树选中节点及顺序
    getTreeStatusInfo: function () {
        var tree = jQuery("#pub_tc_tree").jstree(true);
        var nodes = jQuery("#pub_tc_tree").jstree(true).get_selected();
        //获取需要排序的父节点数据
        var sorts = [];
        //遍历父节点数据，获取所有节点
        if (window.sort_nodes) {
            $A.forEach(sort_nodes, function (o) {
                //父节点放在第一位
                var ns = [o].concat(tree.get_node(o).children);
                sorts.push(ns.join("-"));
            });
        }
        return (nodes.join(",") + "|" + sorts.join(","));
    },

    /**
     * 按顺序获取图层树的叶子节点
     */
    sortLayers: function (selectedNodeIds, prefix) {
        if (prefix) {
            prefix = "";
        }
        var layers = new Array();
        var tree = jQuery("#pub_tc_tree").jstree(true);
        //var selectedNodeIds = tree.get_selected();
        var firstCateArr = tree.get_node('#').children;

        /**选中的地表覆盖图层节点数组 START 20150727**/
        var covers = new Array();
        /**选中的地表覆盖图层节点数组 END 20150727**/

        for (var i = 0; i < firstCateArr.length; i++) {
            var firstCate = firstCateArr[i];

            var secendCateArr = tree.get_node(firstCate).children;
            for (var j = 0; j < secendCateArr.length; j++) {
                var secendCate = secendCateArr[j];
                var thirdCateArr = tree.get_node(secendCate).children;
                if (thirdCateArr.length > 0) {
                    for (var k = 0; k < thirdCateArr.length; k++) {
                        var thirdCate = thirdCateArr[k];
                        if ($A.indexOf(selectedNodeIds, thirdCate) > -1) {

                            /**过滤掉地表覆盖图层节点 START 20150727**/
                            if (thirdCate.substr(0, 2) == "08") {
                                covers.push(thirdCate);
                                continue;
                            }
                            /**过滤掉地表覆盖图层节点 END 20150727**/

                            if ($A.indexOf(layers, thirdCate) < 0) {
                                layers.push(prefix + thirdCate);
                            }
                        }
                    }
                } else {
                    if ($A.indexOf(selectedNodeIds, secendCate) > -1) {

                        /**过滤掉地表覆盖图层节点 START 20150727**/
                        if (secendCate.substr(0, 2) == "08") {
                            covers.push(secendCate);
                            continue;
                        }
                        /**过滤掉地表覆盖图层节点 END 20150727**/

                        if ($A.indexOf(layers, secendCate) < 0) {
                            layers.push(prefix + secendCate);
                        }
                    }
                }
            }
        }
        layers = layers.reverse();
        if (index.tTLayer != null) {
            index.map.removeLayer(index.tTLayer.wmsLayer);
            index.tTLayer.wmsLayer = null;

            TEvent.removeListener(index.tTLayer.clickEvt);
            index.tTLayer.clickEvt = null;
        }

        if (layers.length > 0) {
            index.tTLayer = new TTLayer(layers.toString());
        }

        /**加载地表覆盖图层节点 START 20150727**/
        var ls = BaseLayer.mapCovers(covers);
        BaseLayer.loadCovers(ls);
        /**加载地表覆盖图层节点 END 20150727**/
    },

    //加载分享
    loadShare: function () {
        var params = getParameter(location.href);
        var key = params.share;
        if (!!key) {
            var dataStr = "key=" + key;
            Ajax.request("getShare.shtml", {
                method: "POST",
                data: dataStr,
                success: function (req) {
                    var result = req.responseText;
                    index.restoreStatus(result);
                }
            });
        }
    },

    //根据str内容加载相应的底图
    loadBaselayer: function (str) {
        //设置选中样式
        var arr = str.split(",");
        var baselayer = arr.shift();
        var bl = jQuery("#base_layer_tree").jstree(true);
        //底图
        var _tdt_base_layer = bl.get_node("_tdt_base_layer");
        var bl_node = _tdt_base_layer.children;
        $A.forEach(bl_node, function (node) {
            if (node == baselayer) {
                BaseLayer.current_node = baselayer;
                bl.set_icon(bl.get_node(node), "images/index/sex2.png");
            } else {
                bl.set_icon(bl.get_node(node), "images/index/sex1.png");
            }
        });
        //地理要素
        var pjson = bl.get_node("geographic_elements");
        var children = pjson.children;
        $A.forEach(children, function (node) {
            BaseLayer.layers.push(node);
            bl.set_icon(bl.get_node(node), "images/index/check1.png");
        });
        $A.forEach(arr, function (o) {
            bl.set_icon(bl.get_node(o), "images/index/check2.png");
        });
        //重新调用
        BaseLayer.changeBaseLayer();
    },

    //获取当前页面状态，并以串返回
    getStatusStr: function (map) {
        var zoom = map.getZoom();
        var lonlat = map.getCenter();
        var baselayers = BaseLayer.current_node + "," + BaseLayer.layers.join(",");
        var subjectlayers = index.getTreeStatusInfo();
        subjectlayers = subjectlayers != "|" ? "@" + subjectlayers : "";
        //依次为中心点、级别、底图、专题图层树状态（顺序及选中节点）
        return (lonlat.getLng() + "," + lonlat.getLat() + "@" + zoom + "@" + baselayers + subjectlayers);
    },

    //根据串内容进行状态恢复
    restoreStatus: function (statusStr) {
        if (statusStr != "") {
            var arr = statusStr.split("@");
            var lonlat = arr[0].split(",");
            var zoom = arr[1];
            //地图重新定位
            if ('116.40969,39.89945' != arr[0] || '4' != zoom) {
                index.map.setCenter(new TLngLat(parseFloat(lonlat[0], 10), parseFloat(lonlat[1], 10)), parseInt(zoom, 10));
            }
            //底图重新加载
            var baselayers = arr[2];
            if ('vec,cn' != baselayers) {
                index.loadBaselayer(baselayers);
            }
            //重新加载专题图层
            if (!!arr[3]) {
                var data = arr[3].split("|");
                var tree = jQuery("#pub_tc_tree").jstree(true);
                //先把上次选中的清除
                tree.deselect_node(tree.get_selected());
                tree.close_all();
                //树的节点恢复原始状态
                tree.settings.core.data = JSON.parse(index.originTreeNodes);
                window.sort_nodes = [];
                //节点数据存在则去排序
                !!data[1] && Favorite.nodeSort(data[1].split(","));
                //数据修改后，刷新节点
                tree.refresh();
                //需要选中的节点
                !!data[0] && tree.select_node(data[0].split(","));

                index.sortLayers(jQuery("#pub_tc_tree").jstree(true).get_selected(), "ZHFW:");
            }
        }
    },
    mapMoveTo: function (lat, lng) {
        this.map.panTo(new TLngLat(lng, lat));

        if (index.countyMarker) {
            this.map.removeOverLay(index.countyMarker);
        }
        //创建图片对象
        //var icon = new TIcon("http://api.tianditu.com/img/map/markerA.png",new TSize(19,27),{anchor:new TPixel(9,27)});

        //向地图上添加自定义标注
        index.countyMarker = new TMarker(new TLngLat(lng, lat));
        this.map.addOverLay(index.countyMarker);
    }
};