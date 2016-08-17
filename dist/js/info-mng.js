// //内容在4行内的不显示“更多”
// function isShowMore(){
//     var letterNum = 140;
//     var showMore = function (el,letterNum,isTextArea) {
//         var reg = isTextArea?/\n/gm:/<br/gm,
//             elHtml = isTextArea? el.innerHTML:el.innerHTML.replace(/\n/gm,'<br>'),
//             letterNum = isTextArea?400:letterNum,
//             elBriefHtml = '',
//             elHtmlLen = elHtml.length,
//             $el = $(el),
//             $aObj = $el.next(),
//             moreId = $aObj.attr('moreId'),
//             mt = elHtml.match(reg);
//
//         if(! isTextArea && elHtmlLen>letterNum ){//|| (mt && mt.length > 3)
//             elBriefHtml = elHtml.substring(0,letterNum);
//             $el.html(elBriefHtml);
//             $el.next().show();
//             $aObj.on('click',function () {
//                 toggleMore(this,moreId,letterNum,elHtml,elBriefHtml,isTextArea);
//             });
//         }
//         if(isTextArea && mt && mt.length>3){
//             $el.next().show();
//             $aObj.on('click',function () {
//                 toggleMore(this,moreId,letterNum,elHtml,elBriefHtml,isTextArea);
//             });
//         }
//     };
//     $('p.brief-content').each(function(index,el){
//         showMore(el,letterNum);
//     });
//     $('textarea.brief-content').each(function(index,el){
//         showMore(el,letterNum,true);
//     });
//     letterNum = null;
// }
// //显示更多、收起
// var toggleMore = (function () {
//     var isShow = [];//isShow = [{id:'1u',show:true},{id:'2c',show:false}];
//     return function (obj,id,letterNum,elHtml,elBriefHtml,isTextArea) {
//         var isShowLen = isShow.length,
//             moreId = id,
//             isMatch = false,//默认false,没有点击过,isShow数组里没有它的id
//             i=0,
//             obj = $(obj),
//             el = obj.prev(),
//             textArea = el[0];
//
//         for(;i<isShowLen;i++){
//             if(isShow[i].id === moreId){
//                 if(isShow[i].show){
//                     isTextArea?obj.text('收起').prev().addClass('more-show').height(textArea.scrollHeight):obj.text('收起').prev().html(elHtml);
//                     isShow[i].show = false;
//                 }else{
//                     isTextArea?obj.text('更多').prev().removeClass('more-show').css('height','100px'):obj.text('更多').prev().html(elBriefHtml);
//                     isShow[i].show = true;
//                 }
//                 isMatch = true;
//             }
//         }
//         if(!isMatch){
//             isTextArea?obj.text('收起').prev().addClass('more-show').height(textArea.scrollHeight):obj.text('收起').prev().html(elHtml);
//             isShow.push({id:moreId,show:false});
//         }
//         log('isShow:'+obj2str(isShow));
//     };
// })();