function trimAll(selector) {
    $(selector+' input,'+selector+' textarea').each(function (i,el) {
        var value = $(el).val();
        $(el).val(value.trim());
    });
}

//登录用户管理
function sysUserMngFn(){
    importing('dict',function() {

        var searchAction = top.path+'/api/0/system/user/list';
        var searchLogAction = top.path+'/api/1/system/user/list';
        var viewAction = top.path+'/api/0/system/user/view';
        var editAction = top.path+'/api/0/system/user/_edit';
        var roleAction = top.path+'/api/0/system/role/list';
        var deleteAction = top.path+'/api/1/system/user/delete';
        var saveAction = top.path+'/api/1/system/user/add';
        var updateAction = top.path+'/api/1/system/user/edit';
        var roleDict = top.path + '/api/0/system/role/roleDict';
        var editingUser;

        $(".dict").dict();

        //设置密码填写规则
        $.extend($.fn.validatebox.defaults.rules, {
            password: {
                validator: function (val) {
                    return /^[a-zA-Z]\w{2,20}$/.test(val);
                },
                message: '请以字母开头，长度在3~20之间，只能包含字母、数字和下划线'
            },
            username: {
                validator: function(val){
                    return /^[a-zA-Z]\w{0,50}$/.test(val);
                },
                message: '请以字母开头，只能包含字母、数字和下划线，长度小于50'
            }
        });

        //角色字典查询
        function initRoleDict(){
            $get(roleDict,{},function(res){
                $('#dict-query-role').dict(res.data);
            });
        }
        //查询用户
        function queryForUser(iflog,currentPage){
            $('#user-query-result').pagingList({
                action:iflog?searchLogAction:searchAction,
                currentPage:currentPage,
                jsonObj:{
                    //sortName:sortName||'',
                    //order:order||'asc',
                    userName:$('#userName').val().trim(),
                    trueName:$('#trueName').val().trim(),
                    roleName:$('#query-role').val()
                },
                callback:function(data){
                    $template('#user-table tbody',data,function(item,i){
                        var t_openFlag = item.openFlag;
                        item.openFlagTxt = item.openFlag=='1'?'启用':'禁用';
                    });
                }
            });
        }
        //重置
        function resetForQuery(){
            $('#trueName').val('');
            $('#userName').val('');
            $('#query-role').val('');
        }
        //进入新增页面
        function intoUserAdd(){
            $("#user-add-form")[0].reset();
            $open('#user-add-div',{width:800,height:360,title:'用户新增'});
            $('#add-openFlag').dictSelect('1');
            // $('#add-userUnit').dictSelect('000000000000');
        }
        //进入查看页面
        function intoUserView(id) {
            $get(viewAction,{id:id},function(msg){
                window.newwin = $open('#user-view-div', {width: 800, height: 310, title: '用户查看'});
                $template('#user-view-value', msg.data,function(item,i){
                    var t_openFlag = item.openFlag;
                    item.openFlag = t_openFlag=='1'?'启用':'禁用';
                });
            });
        }
        //进入修改页面
        function intoUserEdit(id){
            $get(editAction,{id:id},function(msg) {
                editingUser=msg.data;
                // queryForRole();
                window.newwin=$open('#user-edit-div',{width:800, title:'用户修改'});
                $template('#user-edit-form',editingUser.sysUser[0]);
                $('#edit-openflag').dictSelect(editingUser.sysUser[0].openFlag);
                top.registry.sys.checkRoles=[];
                top.registry.sys.checkRoleIds=[];
                $template('#role-table tbody',editingUser.roleList,function(item,i){
                    if(editingUser.sysUserRoleIds.indexOf(item.id)>-1){
                        //如果用户已有该项权限则勾上，但前提是没有手动操作过
                        if(typeof top.registry.sys.checkRoles[item.rownum]=='undefined'){
                            item._checked=top.registry.sys.checkRoles[item.rownum]='checked';
                            top.registry.sys.checkRoleIds[item.rownum]=item.id;
                        }
                    }
                    item._checked=top.registry.sys.checkRoles[item.rownum];
                });
            });
        }
        //查询所有角色
        function queryForRole(){
            top.registry.sys.checkRoles=[];
            top.registry.sys.checkRoleIds=[];
            $('#role-result').pagingList({
                pageOnce:5,
                //  useCache:false,
                begin:1,
                end:5,
                action:roleAction,
                callback:function(data){
                    $template('#role-table tbody',data,function(item,i){
                        if(editingUser.sysUserRoleIds.indexOf(item.id)>-1){
                            //如果用户已有该项权限则勾上，但前提是没有手动操作过
                            if(typeof top.registry.sys.checkRoles[item.rownum]=='undefined'){
                                item._checked=top.registry.sys.checkRoles[item.rownum]='checked';
                                top.registry.sys.checkRoleIds[item.rownum]=item.id;
                            }
                        }
                        item._checked=top.registry.sys.checkRoles[item.rownum];
                        /*var t_openFlag = item.openFlag;
                         item.openFlag = t_openFlag=='1'?'启用':'禁用';*/
                    });
                    $('.check-role').on('click',function(i,ele){
                        var rownum=+(this.getAttribute('rownum'));
                        var roleId=this.getAttribute('id');
                        if(this.checked){
                            top.registry.sys.checkRoles[rownum]='checked';
                            top.registry.sys.checkRoleIds[rownum]=roleId;
                            //this.setAttribute('checked','true');
                        }else{
                            top.registry.sys.checkRoles[rownum]=null;
                            top.registry.sys.checkRoleIds[rownum]=null;
                            //this.removeAttribute('checked');
                        }
                    });
                },
                jsonObj:{}
            });
        }
        //删除用户
        function deleteForUser(id,userName){
            $confirm('确定删除【'+userName+'】用户吗？',function(bol){
                if(bol){
                    $post(deleteAction,{id:id},function(res){
                        toast('删除成功！').ok();
                        queryForUser(false, $('.paging').data('currentPage'));
                    },true);
                }
            });
        }
        //新增保存用户
        function saveUser(){
            trimAll();
            $('.user-add-valid').validatebox();
            if($('.validatebox-invalid').length > 0){
                return false;
            }
            $post(saveAction,$("#user-add-form").serializeObject(), function(res){
                userCloseWin('user-add-div');
                toast('保存成功！',600,function(){
                    intoUserEdit(res.id);
                }).ok();
                queryForUser(false);
            },true);
        }
        //修改保存用户
        function updateUser(){
            trimAll();
            $('.user-edit-valid').validatebox();
            if($('.validatebox-invalid').length > 0){
                return false;
            }
            $('#sysUserRoleIds').val(top.registry.sys.checkRoleIds.where('item=>item!=null').join());

            $post(updateAction,$("#user-edit-form").serializeObject(),function(res){
                userCloseWin('user-edit-div');
                toast('保存成功！').ok();
                queryForUser(false,$('.paging').data('currentPage'));
            },true);
        }
        //关闭窗口
        function userCloseWin(id){
            $('#'+id).$close();
            $('.user-add-valid').removeClass("validatebox-invalid");
            $('.user-edit-valid').removeClass("validatebox-invalid");
        }
        //点击事件绑定页面列表排序函数
        function regOrder(){
            var flag=0;//desc
            var sortName;
            var order;

//            $('#user-table').find("[sort-name]").click(function(){
//                flag=!flag;
//                if(flag==0){
//                    sortName = this.getAttribute('sort-name');
//                    order = 'desc';
//                    if($('#icon-asc')){$('#icon-asc').remove();}
//                    $(this).append('<i id="icon-desc" class="icon-caret-down"></i>');
//                }else{
//                    sortName = this.getAttribute('sort-name');
//                    order = 'asc';
//                    if($('#icon-desc')){$('#icon-desc').remove();}
//                    $(this).append('<i id="icon-asc" class="icon-caret-up"></i>');
//                }
//                queryForUser(sortName,order);
//            });

        }

        regOrder();

        //初始化角色字典
        initRoleDict();

        queryForUser(false);

        $('#user-add').click(function(){
            intoUserAdd();
        });
        $('#user-query-btn').on('click',function(){
            if($('.sort-arrow')) $('.sort-arrow').remove();
            queryForUser(true);
        });
        $('#user-reset-btn').on('click',function(){
            resetForQuery();
        });
        $('#save-user').on('click',function(){
            saveUser();
        });
        $('#user-add-cancel').on('click',function(){
            userCloseWin('user-add-div');
        });
        $('#update-user').on('click',function(){
            updateUser();
        });
        $('#user-edit-cancel').on('click',function(){
            userCloseWin('user-edit-div');
        });
        $('#user-view-cancel').on('click',function(){
            userCloseWin('user-view-div');
        });
        $('#user-table').on('click','.into-user-view',function(){
            intoUserView(this.getAttribute('param'));
        }).on('click','.into-user-edit',function(){
            intoUserEdit(this.getAttribute('param'));
        }).on('click','.delete-for-user',function(){
            deleteForUser(this.getAttribute('param'),this.getAttribute('paramName'));
        });
        $('#role-table').on('click','.check-role',function(i,ele){
            var rownum=+(this.getAttribute('rownum'));
            var roleId=this.getAttribute('id');
            if(this.checked){
                top.registry.sys.checkRoles[rownum]='checked';
                top.registry.sys.checkRoleIds[rownum]=roleId;
                //this.setAttribute('checked','true');
            }else{
                top.registry.sys.checkRoles[rownum]=null;
                top.registry.sys.checkRoleIds[rownum]=null;
                //this.removeAttribute('checked');
            }
        });
    });
}
//系统角色管理
function sysRoleMngFn() {
    importing('dict','ztree',function() {
        var searchAction = top.path+'/api/0/system/role/list';
        var searchLogAction = top.path+'/api/0/system/role/list';
        var intoEditAction = top.path+'/api/0/system/role/_edit';
        var intoChooseUserAction = top.path+'/api/0/system/role/_user';
        var intoChoosePermisAction = top.path+'/api/0/system/role/_permission';
        var saveAction = top.path+'/api/0/system/role/add';
        var updateAction = top.path+'/api/0/system/role/edit';
        var deleteAction = top.path+'/api/0/system/role/delete';
        var removeUserAction = top.path+'/api/0/system/role/remove_user';
        var addUserAction = top.path+'/api/0/system/role/add_user';
        var authAction = top.path+'/api/0/system/role/permission';
        var permisTree = $("#permis-tree");
        var v_roleId;//角色id
        var v_role;//选择权限页面需要保存角色信息
        var zTreeObj;

        var nodes = [];
        var setting = {
            check: {
                enable:true
            },
            data: {
                simpleData: {
                    enable:'pid',		//扁平数据，pid表示父节点的ID
                    idKey:'id',
                    pIdKey:'pid'		//默认的pId改为pid，注意默认I为大写
                }
            },
            view: {
                showIcon:false,
                showTitle:false
            }
        };

        $('.dict').dict();

        //查询角色列表
        function queryForRole(iflog, currentPage){
            $('#role-query-result').pagingList({
                action:iflog?searchLogAction:searchAction,
                currentPage:currentPage,
                jsonObj:{
                    roleName:$('#roleName').val().trim(),
                    description:$('#roleDesc').val().trim()
                },
                callback:function(data){
                    $template('#role-table tbody',data,function(item,i){
                        item.openFlagTxt = item.openFlag=='1'?'启用':'禁用';
                        item.fixedRole = item.roleNameEn == null ? '1' : null;//roleNameEn为空，可以删除；不为空，表示固定角色，不可以删除
                    });
                }
            });
        }
        //重置
        function resetForRole(){
            $('#roleName').val('');
            $('#roleDesc').val('');
        }
        //进入新增角色页面
        function intoRoleAdd() {
            $("#add-role-form")[0].reset();
            $('#add-role-openFlag').dictSelect('1');
            $open('#add-role-div', {width: 800, height: 300, title: '角色新增'});
        }
        //进入修改角色页面
        function intoRoleEdit(id){
            $get(intoEditAction,{id:id},function(res){
                var t_role = res.data[0];
                $open('#edit-role-div', {width: 800, height: 300, title: '角色修改'});
                $template('#edit-role-form', t_role);
                $('#edit-role-openFlag').dictSelect(t_role.openFlag);
                $('input[name="roleId"]').val(t_role.id);
            });
        }
        //进入选择权限页面
        function intoChoosePermis(id,moduleId){
            $get(intoChoosePermisAction,{id:id,moduleId:moduleId},function(res){
                v_role = res.data;
                $open('#choose-permis-div',{width:600,height:450,title:'权限选择（'+v_role.sysRole.roleName+'）'});
                v_roleId = v_role.sysRole.id;
                $template('#all-module',v_role.sysModuleList);
                $template('#m-p-checkbox',v_role.permission);
                $('#all-module li a').removeClass('current-module');
                $('#all-module li:first-child a').addClass('current-module');
                intoPermisZtree(v_role.sysRole.id,v_role.sysModuleList[0].id);
            });
        }
        //进入选择用户页面
        function intoChooseUser(id){
            $get(intoChooseUserAction,{id:id},function(res){
                var t_role = res.data;
                $open('#choose-user-div',{width:640, height:450, title:'角色选择（'+t_role.sysRole.roleName+'）'});
                v_roleId = t_role.sysRole.id;
                $template('#select-user',t_role.associatedUserList);
                $template('#all-user',t_role.allUserList);
            });
        }
        //进入模块权限ztree
        function intoPermisZtree(roleId,moduleId){
            $get(intoChoosePermisAction,{id:roleId,moduleId:moduleId},function(res){
                console.log(res);
                var t_sysRole = res.data;
                nodes = [];
                var l_module = t_sysRole.moduleList;
                var l_permis = t_sysRole.sysRolePermisList;//当前角色下所有权限的数组
                var l_m_permis;
                var m_if_check = false;//判断树节点(模块节点)是否需要checkbox为true
                var if_check = false;
                $('#m-p-checkbox').template(t_sysRole.permission);
                for(var i=0;i<l_module.length;i++){
                    m_if_check = false;
                    l_m_permis = l_module[i].sysModulepermissionList;
                    for(var j=0;j<l_m_permis.length;j++){
                        for(var k=0;k<l_permis.length;k++){
                            if((l_m_permis[j].id)==(l_permis[k].permissionId)){
                                m_if_check = true;
                                if_check = true;
                                break;
                            }
                            // if($('#m-p-value').val()==l_permis[k].permissionId){
                            //     $('#m-p-value').prop("checked",true);
                            // }
                        }
                        //nodes.push({id:l_m_permis[j].id,pid:l_m_permis[j].moduleId,name:l_m_permis[j].description,checked:if_check,sort:i});
                        nodes.push({id:l_m_permis[j].id,pid:l_module[i].id,name:l_m_permis[j].description,checked:if_check,sort:i});
                        if_check = false;
                    }
                    nodes.push({id:l_module[i].id,pid:0,name:l_module[i].title,checked:m_if_check,sort:i});
                    m_if_check = false;
                }
                //对进入模块的权限单独做判断
                for(var n=0;n<l_permis.length;n++){
                    if($('#m-p-value').val()==l_permis[n].permissionId){
                        $('#m-p-value').prop("checked",true);
                        break;
                    }
                }
                zTreeObj = $('#permis-tree').ztree(setting, nodes);
            });
        }
        //新增保存角色
        function saveRole(){
            trimAll();
            $('.role-add-valid').validatebox();
            if($('.validatebox-invalid').length > 0){
                return false;
            }
            $post(saveAction,$("#add-role-form").serializeObject(),function(res){
                roleCloseWin('add-role-div');
                toast('保存成功！').ok();
                queryForRole(false);
            },true);
        }
        //修改保存角色
        function updateRole(){
            trimAll();
            $('.role-edit-valid').validatebox();
            if($('.validatebox-invalid').length > 0){
                return false;
            }
            $post(updateAction,$('#edit-role-form').serializeObject(),function(res){
                roleCloseWin('edit-role-div');
                toast('保存成功！').ok();
                queryForRole(false, $('.paging').data('currentPage'));
            },true);
        }
        //删除角色
        function deleteRole(id,trueName){
            $confirm('确定删除【'+trueName+'】角色吗？',function(bol){
                if(bol){
                    $post(deleteAction,{id:id},function(res){
                        toast('删除成功！').ok();
                        queryForRole(false, $('.paging').data('currentPage'));
                    });
                }
            });
        }
        //角色授权
        function authRole(){
            var t_treeObj = $.fn.zTree.getZTreeObj('permis-tree');
            var t_all_nodes = t_treeObj.transformToArray(t_treeObj.getNodes());//获取原来的所有树节点
            var t_nodes = t_treeObj.getCheckedNodes(true);//选中的节点
            var allNodes = [];//所有节点的id
            var selectNodes = [];//选中节点的id

            allNodes.push($('#m-p-value').val());
            if($('#m-p-value').prop('checked')){
                selectNodes.push($('#m-p-value').val());
            }
            for(var i=0;i<t_all_nodes.length;i++){
                if(!t_all_nodes[i].isParent){
                    allNodes.push(t_all_nodes[i].id);
                }
            }
            for(var i=0;i<t_nodes.length;i++){
                if(!t_nodes[i].isParent){
                    selectNodes.push(t_nodes[i].id);
                }
            }
            $get(authAction,{roleId:v_roleId,currentRolePermisIds:allNodes.join(),sysRolePermisIds:selectNodes.join()},function(res){
                toast('授权成功！').ok();
                //roleCloseWin('choose-permis-div');
            });
        }
        //关闭窗口
        function roleCloseWin(id){
            $('#'+id).$close();
            $('.role-add-valid').removeClass('validatebox-invalid');
            $('.role-edit-valid').removeClass('validatebox-invalid');
        }

        queryForRole(false);

        $('#role-query').on('click',function(){
            queryForRole(true);
        });
        $('#role-reset').on('click',function(){
            resetForRole();
        });
        $('#into-role-add').on('click',function(){
            intoRoleAdd();
        });
        $('#save-role').on('click',function(){
            saveRole();
        });
        $('#add-role-cancel').on('click',function(){
            roleCloseWin('add-role-div');
        });

        $('#role-table').on('click','.into-role-edit',function(){
            intoRoleEdit(this.getAttribute('param'));
        }).on('click','.into-choose-user',function(){
            intoChooseUser(this.getAttribute('param'));
        }).on('click','.into-choose-permis',function(){
            intoChoosePermis(this.getAttribute('param'),'');
        }).on('click','.delete-role',function(){
            deleteRole(this.getAttribute('param'),this.getAttribute('paramName'));
        });
        $('#update-role').on('click',function(){
            updateRole();
        });
        $('#edit-role-cancel').on('click',function(){
            roleCloseWin('edit-role-div');
        });
        $('#all-module').on('click','.into-module-permis',function(){
            $('#all-module li a').removeClass('current-module');
            $(this).addClass('current-module');
            var t_role_id = v_roleId;
            var module_id = this.getAttribute('moduleId');
            intoPermisZtree(t_role_id,module_id);
        });
        $('#user-to-right').on('click',function(){
            var t_id = $('#select-user').val();//若没有选择需要移除的用户，t_id为null
            if(!t_id){toast('请先选择需要移除的用户').css('left','43%').err();return false;}
            $get(removeUserAction,{id:v_roleId,associatedUserId:t_id.join()},function(res){
                $("#select-user option:selected").remove();
                toast('移除用户成功！').ok();
                //重新加载未选用户列表
                $get(intoChooseUserAction,{id:v_roleId},function(res){
                    $('#all-user').template(res.data.allUserList);
                });
            });
        });
        $('#user-to-left').on('click',function(){
            var t_id = $('#all-user').val();//若没有选择需要添加的用户，t_id为null
            if(!t_id){toast('请先选择需要添加的用户').css('left','43%').err();return false;}
            $get(addUserAction,{id:v_roleId,selectUserId:t_id.join()},function(res){
                $("#all-user option:selected").remove();
                toast('添加用户成功！').ok();
                //重新加载已选用户列表
                $get(intoChooseUserAction,{id:v_roleId},function(res){
                    $('#select-user').template(res.data.associatedUserList);
                });
            });
        });
        $('#choose-user-cancel').on('click',function(){
            roleCloseWin('choose-user-div');
        });
        $('#auth-role-cancel').on('click',function(){
            roleCloseWin('choose-permis-div');
        });
        $('#auth-role').on('click',function(){
            authRole();
        });
    });
}
//系统登录日志
function sysLoginLogFn() {
    importing('datepicker',function(){
         // var intoAction = top.path+'/api/0/system/login/log',
         //     searchAction = top.path+'/api/1/system/login/log';
        var intoAction = top.socketPath+'/api/online/logs',
            searchAction = top.socketPath+'/api/online/logs';
        $('.query-date').datepicker();
        $('#loginDateEnd').val(Date.format('YYYY-MM-DD'));
        $('#loginDateBegin').val(Date.format('YYYY-MM-DD'));
        intoLoginlog();

        //进入系统登录日志
        function intoLoginlog(){
            $('#loginlog-query-result').pagingList({
                action:intoAction,
                jsonObj:{
                    oprUser:$('#loginName').val(),
                    logDateBegin:$('#loginDateBegin').val(),
                    logDateEnd:$('#loginDateEnd').val()
                },
                callback:function(data){
                    $('#loginlog-table tbody').template(data);
                }
            });
        }

        //查询登录日志列表
        function queryForLoginlog(){
            $('#loginlog-query-result').pagingList({
                action:searchAction,
                jsonObj:{
                    oprUser:$('#loginName').val().trim(),
                    logDateBegin:$('#loginDateBegin').val(),
                    logDateEnd:$('#loginDateEnd').val()
                },
                callback:function(data){
                    $('#loginlog-table tbody').template(data);
                }
            });
        }

        $('#loginlog-query-btn').on('click',function(){
            var t_beginDate = $('#loginDateBegin').val();
            var t_endDate = $('#loginDateEnd').val();
            if(!t_beginDate.isEmpty() && !t_endDate.isEmpty() && t_beginDate > t_endDate){
                toast('登录开始时间不能大于结束时间！').css('width','300px').err();
                return false;
            }
            queryForLoginlog();
        });
        $('#loginlog-reset-btn').on('click',function(){
            $('#loginName').val('');
            $('#loginDateBegin').val('');
            $('#loginDateEnd').val('');
        });
    });
}
//消息管理
function sysMessageFn(){
    
}

//设定默认ajax开始和结束时的loading遮罩效果(#post自带,paginglist没有自带)
$.ajaxSetup({
    beforeSend:showLoading,
    complete:hideLoading
});