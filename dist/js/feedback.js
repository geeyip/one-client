//内容在4行内的不显示“更多”
function isShowMore2(){
    var letterNum = 140;
    var showMore = function (el,letterNum) {
        var elHtml = el.innerHTML.replace(/\n/gm,'<br>'),
            letterNum = letterNum,
            elBriefHtml = '',
            elHtmlLen = elHtml.length,
            $el = $(el),
            $aObj = $el.next(),
            moreId = $aObj.attr('moreId'),
            mt = elHtml.match(/<br>/gm);
        if(elHtmlLen>letterNum ){//|| (mt && mt.length > 3)
            if((elHtmlLen-letterNum)<30){
                letterNum = letterNum -30;
            }
            elBriefHtml = elHtml.substring(0,letterNum);
            $el.html(elBriefHtml);
            $aObj.show();
            $aObj.on('click',function () {
                toggleMore(this,moreId,letterNum,elHtml,elBriefHtml);
            });
        }
    };
    $('p.brief-content').each(function(index,el){
        showMore(el,letterNum);
    });
    letterNum = null;
}
//显示更多、收起
var toggleMore = (function () {
    var isShow = [];//isShow = [{id:'1u',show:true},{id:'2c',show:false}];
    return function (obj,id,isTextArea) {
        var isShowLen = isShow.length,
            moreId = id,
            isMatch = false,//默认false,没有点击过,isShow数组里没有它的id
            i=0,
            textArea = $(obj).prev()[0];
        for(;i<isShowLen;i++){
            if(isShow[i].id === moreId){
                if(isShow[i].show){
                    $(obj).text('收起').prev().addClass('show').height(textArea.scrollHeight);
                    isShow[i].show = false;
                }else{
                    $(obj).text('更多').prev().removeClass('show').height(100);
                    isShow[i].show = true;
                }
                isMatch = true;
            }
        }
        if(!isMatch){
            $(obj).text('收起').prev().addClass('show').height(textArea.scrollHeight);
            isShow.push({id:moreId,show:false});
        }
    };
})();