//为静态页获取数据
top.path=localData.get('path');
top.token = localData.get('token');
top.uploadPath = localData.get('uploadServer');
top.limits = localData.get('limits');
top.roles = localData.get('roles');
top.currentUser=localData.get('currentUser');
top.trueName = top.currentUser ? top.currentUser.trueName:'';
top.userName = top.currentUser ? top.currentUser.userName:'';
top.userUnit = top.currentUser ? top.currentUser.userUnit:'';
top.socketPath = localData.get('socketServer');
top.serverIp = location.hostname;
top.serverPort = location.port;

function gotoLogin(){
    location.href=location.protocol=='file:' ? location.href.replace('index','login') : location.origin+(top.path||'');//top.path + '/logout';
}

//本地调用
if(typeof require=='function' && typeof require('os')=='object') {
    top.extending({
        regedit:require('os').platform().indexOf('win')==0?require('regedit'):{list:function(){return false;}},
        exec:require('child_process').exec,
        openIE: function (url) {top.exec('start,"" "iexplore" "' + url + '"');},
        openRemoteDesktop: function (ip,username,pwd) {
            //打开远程桌面
            var cmd = 'cmdkey /generic:'+ip+' /user:'+username+' /pass:'+pwd+' & mstsc /v:'+ip+':3389';
            top.exec(cmd, function(error, stdout, stderr) {
                console.log('stdout: ' + stdout);
                console.log('stderr: ' + stderr);
                if (error !== null) {
                    console.log('exec error: ' + error);
                } else {
                    top.exec('cmdkey /delete:'+ip, function(er, out, err) {
                    });
                }
            });
        }
    });
}
if(!top.token || !top.limits ||!top.trueName){
    gotoLogin();
}else{
    byid('user-name').innerHTML=top.trueName;
}

importing('socket', 'dict', function(){
    var viewPrePath=location.protocol=='file:'?'./view/':path+'/dist/view/';
    var header=$('header').eq(0);
    var headHeight=header.height();
    var mainFrame=byid('main-frame');
    
    top.getViewPath=function getViewPath(src){
        return viewPrePath+(src||'404.html')+'?version='+window.config.version;
    }
    //页面初始化
    function indexInit(animate) {
        //检测浏览器
        if(!window.chrome&&!window.webkitURL){
            document.body.innerHTML='';
            toast('请使用chrome谷歌浏览器打开本系统!',9999)
        }
        //动画开场
        animate  && setTimeout(function(){
            $('header').animate({height:360},800,function(){
                var $this=$(this);
                setTimeout(function(){
                    $this.animate({height:headHeight-10},800).animate({height:headHeight},200);
                },1600);
                setTimeout(function(){
                    $('#nav-wrap').animate({right:200},320);
                },3000);
                setTimeout(function(){
                    $('#root-info-bar').animate({bottom:0},720);
                },3600);
            });
        },300);//&& $('#nav-wrap').addClass('animate');

        !animate && $('#root-info-bar').addClass('animate-done') && $('#nav-wrap').addClass('animate-done');
        localParams.set('indexAnimation','false');
    }

    //窗口适配
    function fitSize(){
        var fitHeight=window.height-header.height();
        var fitWidth=window.width;
        rootTabs.css({width:fitWidth,height:fitHeight-3});
        rootTabs.find('.tabs-panels,.panel,.panel-body').has('iframe').css({width:fitWidth,height:fitHeight-35});//'auto'});//
        $('#main').css({width:fitWidth,height:fitHeight-35});
    }

    //主模块的molNo与pageNo保持一致
    var delegate='m=>{name:m.title, pageNo:m.pageNo, direct:m.url, items:m.items, defaultInto:m.defaultInto,molNo:m.moduleNo}';
    top.molDatas=limits.pages.select(delegate.replace('m.pageNo','m.moduleNo'));
    top.molDatas.each(function(m,i){
        m.items && (m.items= m.items.select(delegate)) && m.items.each(function(v,i){
            v.items && (v.items=v.items.select(delegate));
        });
    });
    top.molKeys=molDatas.select('m=>m.molNo');
    localParamsInit(top.molKeys);
    indexInit(localParams.get('indexAnimation')!='false');

    //操作权限集合
    window.extending('ops',{});
    window.limits.operates.each(function(v,i){
        window.ops[v.operateNo]= v.openFlag;
    });


    //顶层属性与供内部frame调用的方法
    window.extending({
        //辅助遮罩
        showHelpMask:function (noNeedLeft){
            var contentLeft=getRect(content).left;
            var contentTop=122;//window.height-getRect(content).height-1.5//getRect(content).top;
            noNeedLeft || (top.rootTreeMenu.data('collapsed') ||top.rootTreeMenu[0].style.display=='none'||top.rootTreeMenu.hasClass('hideplus')) || $('#left-mask').css({
                top:contentTop
            }).show();
            $('#top-mask').css({
                height:contentTop+1.5
            }).show();
            top.rootTreeMenu.find('.toggle-tag').hide();
            return true;
        },
        hideHelpMask:function(){
            $('#left-mask').hide();
            $('#top-mask').hide();
            top.rootTreeMenu.find('.toggle-tag').show();
            return true;
        },
        //主要元素
        rootTabs:$('#root-tabs'),
        rootNav:$('#root-nav'),
        rootTreeMenu:$('#tree-menu').hide(),
        //注册中心
        registry:(function(){
            var obj={};
            for(var i=0;i<molDatas.length;i++){
                obj.extending(dash2camel(molDatas[i].molNo),{});
            }
            obj.extending('global',{});
            return obj;
        })()
    });

    //生成导航条
    $template(rootNav,molDatas,function(item){
        if(item.molNo=='sys'){
            item.isSys=true;
        }
    });

    //注册导航选择事件
    $('.nav a').click(function(){
        var $this=$(this);
        var navLink=$this.parents('.nav-first').children('a').eq(0);
        var clicked=false;
        var src=$this.attr('direct');
        var molName=navLink.attr('mol-name');//||navLink.html();
        var pageNo=navLink.attr('page-no');
        var molTab=rootTabs.tabs('getTab',0);
        var molItems;

        rootTreeMenu.hide();
        $('.nav a').removeClass('current');
        $this.addClass('current');
        navLink.addClass('current');
        mainFrame.setAttribute('currentPageNo',pageNo);
        top._currentItem_=$this;
        top.currentPageNo=pageNo;
        molItems=molDatas.where(/data => data.pageNo==top.currentPageNo/)[0].items;

        //消除切换闪动
        $('#main').addClass('hidden');
        mainFrame.onload=function(){
            $('#main').removeClass('hidden');
        };
        //生成左侧功能菜单,并利用左侧菜单默认点击,自动将src载入iframe
        if(molItems){
            rootTreeMenu.treemenu(molItems,function(src){
                //setTimeout(function(){
                src=getViewPath(src);
                //$('#content').css('padding-left',10);
                mainFrame.setAttribute('o-src',src);
                mainFrame.src=src;
                //},5);
            }).show();

            //与导航条联动, 先看是否是导航下级菜单,寻找对应的侧边子菜单
            rootTreeMenu.find('li').each(function(){
                if(!clicked && top._currentItem_ && top._currentItem_.html()==$(this).children('a',0).html()) {
                    this.click();
                    clicked=true;
                }
            });
            //否则就是点击了一级模块自身
            if(!clicked){
                var defaultInto=$this.attr('default-into');
                if(defaultInto){
                    rootTreeMenu.find('li').each(function(){
                        var $this=$(this);
                        if(!clicked){
                            if($this.attr('page-no')==defaultInto){
                                $this.click();
                                clicked=true;
                            }
                        }
                    });
                }
                !clicked && rootTreeMenu.find('li').eq(0).click();
            }
        }
        //无功能就隐藏菜单,载入src
        else{
            //$('#content').css('padding-left',0);
            rootTreeMenu.empty().hide();
            mainFrame.setAttribute('o-src',getViewPath(src));
            mainFrame.src=getViewPath(src);
            //location.href.lastIndexOf('#')==location.href.length-1 ? location=location.href.slice(0,location.length-1):(location=location+'#');
        }
        //更新当前模块名称
        rootTabs.tabs('update',{
            tab:molTab,
            options:{
                title:'当前模块:'+molName
                //content: '<iframe class="mol-content" src="{0}" frameborder="0"></iframe>'.format(src)
            }
        }).tabs('select',0);

        localParams.global.get('show-slide-menu')==0 && rootTreeMenu.addClass('hideplus');
        setTimeout(fitSize,200);
        //history.pushState({}, "index", location.href+'#');
        //history.replaceState({}, "index", location.href);
        //window.onpopstate=function(){alert();window.location='sdf'}
        //window.addEventListener("popstate", function() {
        //    var currentState = history.state;
        //});

    });

    //完毕后头部正常显示
    $(".waiters").show();

    //启动选项卡,注册适配事件
    rootTabs.height(window.height-header.height()-3).tabs({'scrollIncrement':320});
    $(window).on('resize',fitSize);


    //点击用户名 修改密码
    $('#user-name').on('click',function () {
        var editPwdWin = $open('#edit-pwd-block',{width:416,height:320,top:120,title:'&nbsp系统用户修改个人密码',closable:false});
    });
    $('#close-edit-pwd').on('click',function () {
        $('#edit-pwd-block').window('close').find('input').val('');
        $('.pwd-validate').removeClass('validatebox-invalid');
    });
    $('#save-edit-pwd').on('click',function () {
        var oldPwd = $('#old-pwd').val();
        var newPwd = $('#new-pwd').val();
        var changePwdAction = top.path+'/api/0/system/user/password';
        $('.pwd-validate').validatebox();
        if($('.validatebox-invalid').length>0){
            return false;
        }
        if($('#confirm-new-pwd').val() != newPwd){
            $alert('请确认两次输入的新密码是否一致！');
            return false;
        }
        $post(changePwdAction,{oldPassword:oldPwd,newPassword:newPwd},function (res) {
            var msg = res.msg;
            msg = msg?msg:'新密码修改成功！';
            toast(msg,600,function () {
                $('#edit-pwd-block').$close();
                $('.common-input').val('');
            }).ok();
        });
    });
    // $.extendValidateRules({
    //         password: {
    //             validator: function (val) {
    //                 return /^[a-zA-Z]\w{2,20}$/.test(val);
    //             },
    //             message: '长度在3~20之间，不能包含中文'
    //         }
    // });


    //socket监测用户登录注销
    var socket = null;
    var userInfo = {
        userId:  top.userName,
        userName: top.trueName,
        userUnit: top.userUnit,
        serverIp: top.serverIp,
        serverPort: top.serverPort
    };
    //设置用户基础信息
    localData.set('userInfo',userInfo);
    localData.set('login-truename', top.trueName);
    //建立websocket连接
    function initSocket(){
        socket = io.connect(top.socketPath);
        socket.emit('login', userInfo);
        socket.on('logoutAll', function(){
            gotoLogin();
        });
    }
    initSocket();
    //注销
    function logout() {
        localData.set('token','');
        localData.set('login-password','');
        location.href=location.protocol+'//'+location.host;
        socket.emit('logout',userInfo.userId);
    }
    $('#login-out').click(logout);


    //打开收件箱页面
    $('#msg-count-wrap').on('click',function(){
        //如果已经打开过,并且没有被关闭清除, 那就直接选中现在这个
        if(typeof window.msgTab=='object' && window.msgTab.children().length>0){
            window.msgTab.$select();
        }else{
            window.msgTab=$open(getViewPath('message.html'),'收件箱');
        }
    });

    //引入message.js，不在importing中直接引入是因为，message.js中需要使用top.registry,其注册在index.js中注册，故使用$script引入
    $script(top.path + '/dist/js/message.js', function(){
        setTimeout(initPopMsg,5000);//刷新页面弹出消息提示框
        setInterval(function(){initPopMsg();},1800000);//每30分钟，弹出消息提示框
        top.unReadMsgCounts();
        setInterval(function(){top.unReadMsgCounts();},180000);//每3分钟，更新一次右上角消息数量
    });

    //默认载入首页
    mainFrame.src=getViewPath('fst-page.html');

    //客户端测试
    $('#more-tool').click(function(){
        if(!top.regedit){return false;}
        var key = "HKCR\\hisignXmind\\shell\\open\\command\\";
        top.regedit.list(key, function(err, result) {
            var subStr = result[key]['values']['']['value'];
            var path = subStr.substring(0, subStr.indexOf("xmind.exe")).replace(/^"/,'');
            var shellPath = "\"" + path + "xmind.exe\"";
            var obj = {nodeId:"K4401141608002014070032",nodeValue:"(K4401141608002014070032)",user:"sys",userThink:"sys_1",tableName:"xcky_view",userTrueName:"sys",userUnit:"440000000000",module:"common",ypName:"最后哦顾问",systemPlace:"440000000000",systemEnv:"1"};
            var jsonObj = {};
            for (i in obj) {
                jsonObj[i] = "\"" + obj[i] + "\"";
            }
            var jsonStr = JSON.stringify(jsonObj);
            var cmd = shellPath + " " + jsonStr + "";
            top.exec(cmd, function(error, stdout, stderr) {
                console.log('stdout: ' + stdout);
                console.log('stderr: ' + stderr);
                if (error !== null) {
                    console.log('exec error: ' + error);
                }
            });
        });
    });
    $('#head-txt').click(function(){
        if(!top.openIE){return false;}
        top.openIE('http://baidu.cn');

        //打开远程桌面
        if(!top.openRemoteDesktop){return false;}
        top.openRemoteDesktop('192.168.1.169','administrator','Aa123456');
        // var cmd = "cmdkey /generic:192.168.1.169 /user:administrator /pass:Aa123456 & mstsc /v:192.168.1.169:3389";
        // top.exec(cmd, function(error, stdout, stderr) {
        //     console.log('stdout: ' + stdout);
        //     console.log('stderr: ' + stderr);
        //     if (error !== null) {
        //         console.log('exec error: ' + error);
        //     } else {
        //         top.exec("cmdkey /delete:192.168.1.169", function(er, out, err) {
        //
        //         });
        //     }
        // });
    });
    // $('#confirm-new-pwd').on('blur',function () {
    //     if($(this).val() !== $('#new-pwd').val()){
    //         $('#pwd-error').html('您两次输入的密码不一致');
    //     }else{
    //         $('#pwd-error').html('');
    //     }
    // });
});
