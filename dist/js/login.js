$(function () {
    var loginAction = window.path+'/login',
        pwd = localData.get('login-password');
    function login() {
        localData.set('login-username',$('#username').val());
        if(byid('remember-me').checked){
            localData.set('login-password',$('#password').val());
        }
        $post(loginAction,$('#login-form').serializeObject(),function (res) {
            var errorMsg = res.msg;
            if(errorMsg){
                $('#error span').text(errorMsg);
                $('#error').fadeIn();
                setTimeout(function () {
                    $('#error').fadeOut();
                },5000);
            }else{
                localData.set('path',window.path);
                localData.set('token',res.data.token);
                localData.set('limits',res.data.limits);
                localData.set('currentUser',res.data.currentUser);
                localData.set('uploadServer',res.data.uploadServer);
                localData.set('socketServer',res.data.socketServer);
                localData.set('roles',res.data.roles);
                if(location.protocol=='file:'){
                    window.resizeTo(window.screen.width, window.screen.height);
                    location.replace('./index.html');
                }else{
                    location.replace(window.path+ '/dist/index.html?version='+config.version);
                }

            }
        },true);
    }
    if(!window.chrome && !window.webkitURL){
        $('#login-div').css('top','50%').hide();
        $('#browser-tip').show().html('<p> 检测到您的浏览器非chrome!<br> 请下载chrome谷歌浏览器后, 再打开本系统!</p><p id="download-wrap"><img src="/dist/img/chrome.jpg"><a href="#">点此下载谷歌chrome浏览器</a></p><br>');
        $('#download-cr').show();
        byid('download-a').href = window.path+'/ftp/chrome.zip';
    }
    
    $('#username').val(localData.get('login-username'));
    if(pwd){
        $('#password').val(pwd);
        login();
    }
    $('.login-btn').on('click',function () {
        login();
    });
    $('#error').on('click',function () {
        $('#error').fadeOut();
    });
    $(document).on('keyup',function (event) {
        var e =  event || window.event;
        if(e.keyCode === 13){
            login();
        }
    });
    $(document.body).css('visibility','visible');
});