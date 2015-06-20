/**
 * Created by luhuijian on 14-7-30.
 */
window.onload=function(){
    var scrollTop=document.body.scrollTop||document.documentElement.scrollTop;
    var a=document.getElementById('fix-top-bar');
    console.log(scrollTop);
    if(scrollTop>88){
        a.style.cssText='visibility:visible;';
    }

}


