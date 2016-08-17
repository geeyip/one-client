typeof $style==='function'&& $style((top.path||'')+'/dist/plugin/dict/dict.css');
/**
 * 字典配置
 */
window._dictConfig = {
    select: {name: 'select', baseUrl: top.path+'/api/dict/single/'},
    tree: {name: 'tree', baseUrl: top.path+'/api/dict/multi/'},
    checkbox: {name: 'checkbox', baseUrl: top.path+'/api/dict/single/'},
    dictRoot: 'dict-root',
    dictType: 'dict-type',
    returnValue: 'return-value',
    dictMultiple: 'dict-multiple',
    dictId: 'dict-id',
    dictName: 'dict-name'
};

var zTreeObj ;
var setting = {
    data: {
        key: {
            id: 'key',
            name: 'value'
        },
        simpleData: {
            enable: true,
            idKey: "key",
            pIdKey: "parentKey",
            rootPId: 0
        }
    },
    callback: {
        onDblClick: function (event, treeId, treeNode) { //鼠标双击选中
            var key = treeNode.key;
            var value = treeNode.value;
            selectQueryDict(key, value);

        },
        onClick:function(event, treeId, treeNode){ //鼠标单击展开
            zTreeObj.expandNode(treeNode, true, false, true);
            window.currentDictNode = treeNode;
        }
    },
    view: {
        showIcon: false,
        dblClickExpand: false
    }
};

/**
 * 系统字典控件
 * @param customData 自定义数据
 */
$.fn.dict = function(customData,cb){
    //customData = eval('(' + customData + ')');
    if(typeof arguments[0]=='function'){
        cb=arguments[0];
        customData=null;
    }
    customData= customData==null ? customData:str2obj(customData);
    var _target = $(this);
    $.each(_target, function(i, o) {
        var target = $(o); //字典控件对象
        var root = target.attr(_dictConfig.dictRoot); //字典代码类型
        var type = target.attr(_dictConfig.dictType); //字典展示方式
        var name = target.attr(_dictConfig.dictName);
        if(!name){
            _target.html('请给定dict-name');
            return _target;
        }
        if(type){
            if(!_dictConfig[type]){
                //alert('dict-type指定有误');
                return _target;
            }
            if(!customData && !root){
                //alert('请指定dict-root或自定义数据');
                return _target;
            }
            var remoteUrl = _dictConfig[type].baseUrl + root; //服务端字典数据Url
            var dictData = customData;
            if(!dictData){
                dictData = localData.get(remoteUrl); //自定义数据或本地存储数据
            }
            if(dictData != null){
                initDict(type, target, dictData); //初始化字典控件
            }else{
                getDictDataFromRemote(remoteUrl, function(remoteData){//服务端查询数据后初始化
                    initDict(type, target, remoteData);
                    typeof cb=='function'&&cb();
                });
            }
        }
    });
    return _target;
};

$.fn.resetDict=function(){
    var the = (this.parent().length>0 && this.parent()[0].hasAttribute('dict-type'))?this.parent():this;
    // var bf_id = the.attr('bf-id');
    // var bf_name = the.attr('bf-name');
    // the.empty();
    // if(bf_id) the.attr('id',bf_id);
    // if(bf_name) the.attr('name',bf_name);
    return the;
};
/**
 * 初始化字典
 * @param type 字典展示类型
 * @param target 字典对象
 * @param dictData 字典数据
 */
function initDict(type, target, dictData){
    if(type === _dictConfig.select.name) {
        initSelectDict(target, dictData);//初始化下拉字典
    }else if(type == _dictConfig.tree.name) {
        initTreeDict(target, dictData);  //初始化树形字典
    }else if(type == _dictConfig.checkbox.name) {
        initCheckboxDict(target, dictData); //初始化单选框字典
    }
}

/**
 * 字典初始化值
 * @param initValue 初始化值
 */
$.fn.dictSelect = function(initValue){
    var _target = $(this);
    $.each(_target, function(i, o) {
        //链式调用时o代表字典根(<dict></dict>)对象
        var type = $(o).attr(_dictConfig.dictType) || $(o).parent().attr(_dictConfig.dictType);
        var root = $(o).attr(_dictConfig.dictRoot) || $(o).parent().attr(_dictConfig.dictRoot);
        //字典是否返回中文值
        var returnValue = $(o).attr(_dictConfig.returnValue) || $(o).parent().attr(_dictConfig.returnValue);
        returnValue = returnValue === 'true'? true : false;
        //字典是否多选
        var multiple = $(o).attr(_dictConfig.dictMultiple) || $(o).parent().attr(_dictConfig.dictMultiple);
        multiple = multiple === 'true'? true : false;
        if(type === _dictConfig.select.name){
            if($(o).find('option[value="'+initValue+'"]').length>0){
                //初始化下拉字典的值
                if(o.nodeName == 'SELECT'){
                    o.value = initValue;
                }else{
                    $(o).find('select')[0].value = initValue;
                }
            }
            //$(o).find('option[value="'+initValue+'"]').attr('selected', true);
        }else if(type === _dictConfig.tree.name){
            if(root === 'custom'){
               alert('自定义数据树形字典初始化值暂未开发');
            }else{
                if(returnValue){
                    initTreeDictValue($(o), initValue, initValue);
                }else{
                    if(multiple){
                        getDictListByKeys(root, initValue, function(list){
                            if(list.length > 0){
                                var values = ''
                                $.each(list, function(i, dict){
                                    values += dict.value + '、';
                                });
                                if(values.indexOf('、')>-1){
                                    values = values.substring(0, values.length-1);
                                }
                                initTreeDictValue($(o), initValue, values);
                            }
                        });
                    }else{
                        getDictByKey(root, initValue, function(dict){
                            if(dict){
                                initTreeDictValue($(o), initValue, dict.value);
                            }
                        });
                    }
                }
            }
        }else if(type === _dictConfig.checkbox.name){
            var initValueArray = initValue.split(',');
            $.each(initValueArray, function(i, v){
                $(o).find('input[value="'+v+'"]').attr("checked","checked");
            });

        }
    });
}

/**
 * 初始化树形字典值
 * @param target 字典控件对象
 * @param key 字典key
 * @param value 字典value
 */
function initTreeDictValue(target, key, value){
    if(!target.attr(_dictConfig.dictType)){
        target = target.parent();
    }
    target.find('input[type="hidden"]').val(key);
    target.find('input[type="text"]').val(value);
}



/**
 * 初始化下拉字典
 * @param target
 * @param data
 */
function initSelectDict(target, data){
    var config = getConfigForDict(target, _dictConfig.select.name);
    config.items = data;
    var emptyOption = config.notEmpty?'':'<option value=""></option>';
    var _value = config.returnValue?'{value}':'{key}';
    var template = '<select name="{dictName}" id="{dictId}" class="common-select{validate}" {dataOptions}>{0}{{items:#<option value="{1}">{value}</option>#}}</select>'.format(emptyOption,_value);
    target.html($compile(template,config));
}

/**
 * 取得字典配置信息
 * @param target
 * @param type
 */
function getConfigForDict(target, type){
    var target_id = target.attr('id') || 'id_'+ Math.floor(Math.random()*100000);
    var dict_id = target.attr(_dictConfig.dictId) || 'id_'+ Math.floor(Math.random()*100000);;
    var dict_name = target.attr(_dictConfig.dictName);

    var notEmpty = target.attr('empty')==='false'? true : false;
    var returnValue = target.attr(_dictConfig.returnValue)==='true'? true : false;
    var multiple = target.attr(_dictConfig.dictMultiple)==='true'? true : false;
    var dictRoot = target.attr(_dictConfig.dictRoot);

    var validate = target.hasClass('validate')?' validate':'';
    target.removeClass('validate');
    var dataOptions = target.attr('data-options')==undefined?'':'data-options="'+target.attr('data-options')+'"';
    target.removeAttr('data-options');

    //树型字典弹窗位置
    var treeX = target.attr('tree-x');
    var treeY = target.attr('tree-y');

    return {
        id: target_id,
        dictId: dict_id,
        dictName: dict_name,
        dictRoot: dictRoot,
        returnValue: returnValue,
        multiple: multiple,
        notEmpty: notEmpty,
        validate: validate,
        dataOptions: dataOptions,
        treeX: treeX,
        treeY: treeY
    };
}

/**
 * 初始化树形字典
 * @param target
 * @param data
 */
function initTreeDict(target, data){
    var config = getConfigForDict(target, _dictConfig.tree.name);
    var template = '<input type="text" readonly="readonly" name="{dictName}_displayValue" id="{dictId}_displayValue" {dataOptions} class="common-input{validate}">\
                    <input type="hidden" name="{dictName}" id="{dictId}">\
                    <a href="#" id="{id}_treeButton"><i class="icon-circle-arrow-down fs16"></i></a>';
    target.html($compile(template,config));

    $('#' + config.id + '_treeButton').on("click", function(e){
        var x = config.treeX || e.pageX-100;
        var y = config.treeY || e.pageY-10;//+15;
        if(typeof x == 'string') x = Number(x);
        if(typeof y == 'string') y = Number(y);
        $('#dictFrame').remove();
        window.currentDictConfig = config;
        window.dictWin = $open(top.path + '/dist/plugin/dict/dict-tree.html',
            {title:'字典',width:380,height:window.height-40-y, top:y,left:x,mask:'no-top',modal:false}, true, function(){
            if($.ztree){
                initDictZtree(target, data);
            }else{
                importing('ztree',function() {
                    initDictZtree(target, data);
                });
            }
            if(config.multiple){
                $('#multipleDiv').show();
            }
            if(!config.dictRoot || config.dictRoot=='custom'){
                $('#dictQueryBtn').hide();
            }
        });
        dictWin.parent().addClass('dict-window-wrap');
    });
}

/**
 * 初始化单选字典
 * @param target
 * @param data
 */
function initCheckboxDict(target, data){
    var config = getConfigForDict(target, _dictConfig.checkbox.name);
    config.items = data;
    var _value = config.returnValue?'value':'key';
    var name = config.dictName;
    var template = '{{items:#<label><input name="'+name+'"  type="checkbox" value="{' + _value + '}">{value}</label>&nbsp;&nbsp;#}}';
    target.html($compile(template,config));
}


/**
 * 字典Ztree初始化
 * @param target
 * @param data
 */
function initDictZtree(target, data){
    zTreeObj = $.ztree.init($('#baseTree'), setting, data);
    var root = target.attr(_dictConfig.dictRoot);
    if(root && root.toUpperCase() === 'GXSDM1'){
        var nodes = zTreeObj.getNodes();
        zTreeObj.expandNode(nodes[0]);
    }
}


/**
 * 字典确认
 */
function treeDictOk(){
    var returnKey = '';
    var returnValue = '';
    if(currentDictConfig.multiple){
        returnKey = $('#selectedKeys').val();
        returnValue = $('#selectedValues').text();
    }else{
        if(window.currentDictNode != undefined){
            returnKey = window.currentDictNode.key;
            returnValue = window.currentDictNode.value
        }
    }
    if(currentDictConfig.returnValue){
        returnKey = returnValue;
    }
    if(returnKey == ''){
        alert('请选择字典');
        return;
    }
    $('#'+currentDictConfig.dictId).val(returnKey);
    $('#'+currentDictConfig.dictId).trigger('ex-change');
    $('#'+currentDictConfig.dictId + '_displayValue').val(returnValue);
    $('#'+currentDictConfig.dictId + '_displayValue').removeClass('validatebox-invalid');

    window.currentDictConfig = null;
    window.dictWin.$close();
    //window.dictWin.find('.panel-tool-close').click();

}

/**
 * 字典选择空值
 */
function treeDictEmpty(){
    $('#'+currentDictConfig.dictId).val('');
    $('#'+currentDictConfig.dictId + '_displayValue').val('');
    window.currentDictConfig = null;
    window.dictWin.$close();
    //window.dictWin.find('.panel-tool-close').click();
}

/**
 * 多选字典选择清空
 */
function clearMultipleDict(){
    $('#selectedValues').text('');
    $('#selectedValues').attr('title','');
    $('#selectedKeys').val('');
}

function selectQueryDict(key, value){
    if(currentDictConfig.multiple){
        var oldValue = $('#selectedValues').text();
        var oldKey = $('#selectedKeys').val();
        if(oldKey.indexOf(key)==-1 ){//&& oldValue.indexOf(value)==-1
            var newValue = "";
            var newKey = "";
            if(oldValue==""){
                newValue = value ;
            }else{
                newValue = oldValue + "、" + value ;
            }
            if(oldKey==""){
                newKey = key ;
            }else{
                newKey = oldKey + "," + key ;
            }
            jQuery("#selectedValues").text(newValue);
            jQuery("#selectedKeys").val(newKey);
        }
    }else{
        if(currentDictConfig.returnValue){
            key = treeNode.value;
        }
        $('#'+currentDictConfig.dictId).val(key);
        $('#'+currentDictConfig.dictId).trigger('ex-change');
        $('#'+currentDictConfig.dictId + '_displayValue').val(value);
        $('#'+currentDictConfig.dictId + '_displayValue').removeClass('validatebox-invalid');
        window.currentDictNode = null;
        window.currentDictConfig = null;
        window.dictWin.$close();
        //window.dictWin.find('.panel-tool-close').click();
    }
}

function showDictQuery(){
    $('#dictTreeDiv').hide();
    $('#dictQueryDiv').show();
    $('#dictQueryBtn').hide();
    $('#dictTreeBtn').show();
}

function showDictTree(){
    $('#dictTreeDiv').show();
    $('#dictQueryDiv').hide();
    $('#dictQueryBtn').show();
    $('#dictTreeBtn').hide();
}

var preQueryValue ="";
var condition = "";
var strType = "";
function queryDict(obj){
    condition = obj.value;
    if($.trim(condition)==preQueryValue){
        return;
    }
    preQueryValue = condition;
    if(condition=="" || condition.length < 2){
        return;
    }else{
        var regcode=/^[0-9]+$/;
        var regcodepy=/^[a-zA-Z]+$/;
        if(regcode.exec(condition)){
            strType = "1";//代码
        }else if(regcodepy.exec(condition)){
            strType = "2";//拼音
        }else {
            strType = "3";//中文
        }
    }
    $get(top.path+'/api/dict/'+currentDictConfig.dictRoot+'/query',{queryType: strType, queryString: encodeURI(condition)}, function(list) {
            list = list.data;
            var data = {dicts:list};
            $template('#dictQueryTb',data);
    },true);

}

//==================字典数据Ajax-Begin===================
/**
 * 服务器查询字典数据
 * @param url 查询URL
 * @param target 字典对象
 * @param cb 回调
 */
function getDictDataFromRemote(url, cb){
    $get(url, null,function (remoteData) {
        remoteData = remoteData.data;
            if(remoteData !=null && remoteData.length > 0){
                localData.set(url, remoteData);
            }
            cb(remoteData);
        });

}

/**
 * 根据key查询字典信息
 * @param root 字典代码类型
 * @param key 字典key
 * @param cb 回调
 */
function getDictByKey(root, key, cb){
    if(root == null || key == null) return null;
    $get(top.path+'/api/dict/'+root+'/'+key, null ,function (dict) {
            dict = dict.data;
            cb(dict);
        });
}

/**
 * 根据多个key查询字典信息
 * @param root 字典代码类型
 * @param keys 字典keys，使用英文逗号分隔
 * @param cb 回调
 */
function getDictListByKeys(root, keys, cb){
    if(root == null || keys == null) return null;
    $get(top.path+'/api/dict/'+root+'/keys/'+keys,null,function (list) {
        list = list.data;
        cb(list);
    });
}

//==================字典数据Ajax-End===================