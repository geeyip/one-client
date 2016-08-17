
//自动完成补全的数据
var json=[{value:'111'},{value:'222'},{value:'333'},{value:'100'},{value:'253'},{value:'366'}]

//ztree设定
var setting = {
    check: {
        enable: true			//启用复选框
    },
    data: {
        simpleData: {
            enable: 0,		//扁平数据，pid表示父节点的ID
            idKey:"id",
            pIdKey:"pid"		//默认的pId改为pid，注意默认I为大写
        }
    },
    view:{
        showTitle: false, 	    //不显示提示信息
        nameIsHTML: true,		//名字支持html代码
        selectedMulti:false     //只能选中一个节点
    },
    callback:{
        //beforeClick:null,
        onClick:function(node){log(node)}
    }
};

//ztree节点
var nodes =[
    {id:1, pId:0, name:"[core] 基本功能 演示", open:true},
    {id:101, pId:1, name:"最简单的树 --  标准 JSON 数据", file:"core/standardData"},
    {id:102, pId:1, name:"最简单的树 --  简单 JSON 数据", file:"core/simpleData"},

    {id:2, pId:0, name:"[excheck] 复/单选框功能 演示", open:false},
    {id:201, pId:2, name:"Checkbox 勾选操作", file:"excheck/checkbox"},
    {id:206, pId:2, name:"Checkbox nocheck 演示", file:"excheck/checkbox_nocheck"},

    {id:3, pId:0, name:"[exedit] 编辑功能 演示", open:false},
    {id:301, pId:3, name:"拖拽 节点 基本控制", file:"exedit/drag"},
    {id:302, pId:3, name:"拖拽 节点 高级控制", file:"exedit/drag_super"},

    {id:4, pId:0, name:"大数据量 演示", open:false},
    {id:401, pId:4, name:"一次性加载大数据量", file:"bigdata/common"},
    {id:402, pId:4, name:"分批异步加载大数据量", file:"bigdata/diy_async"},
    {id:403, pId:4, name:"分批异步加载大数据量", file:"bigdata/page"}
];

var nodes2 = [
    {id: "父节点1", name:'hello',children: [
        {id: "子节点1",name:'hehe'},
        {id: "子节点2",name:'haha'}
    ]},
    {id: "父节点12", name:'hello2',children: [
        {id: "子节点12",name:'hehe2'},
        {id: "子节点22",name:'haha2'}
    ]}
];


//导入需要的控件
importing('autocomplete','ztree','datepicker',function() {

    $.ztree.init($('#base-tree'), setting, nodes2);

    $('#addr').autocomplete(json, {
        max: 20,    //列表里的条目数
        minChars: 1,    //自动完成激活之前填入的最小字符
        width: 120,     //提示的宽度，溢出隐藏
        scrollHeight: 220,   //提示的高度，溢出显示滚动条
        matchContains: true,    //包含匹配，就是data参数里的数据，是否只要包含文本框里的数据就显示
        autoFill: false,    //自动填充
        matchCase:false,	  //开启大小写敏感
        delay:200,            //延时
        mouseDownOnSelect:1,
        formatItem: function(row, i, max) {
            return  row.value;
        },
        formatMatch: function(row, i, max) {
            return row.value;
        },
        formatResult: function(row) {
            return row.value;
        }
    }).result(function(event, row, formatted) {});

    $('.dates').datepicker();

    //$('#dt-input').datepicker({
    //maxDate:'%y-%M-%d',
    //event:'mouseenter'
    //});

});