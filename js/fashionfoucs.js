var curIndex = 0;
var time = 800;
var slideTime = 5000;
var adTxt = $("#banner_img>li>div>.ad_txt");
var adImg = $("#banner_img>li>div>.ad_img");
var int = setInterval("autoSlide()", slideTime);
$("#banner_ctr>ul>li[class!='first-item'][class!='last-item']").click(function () {
    show($(this).index("#banner_ctr>ul>li[class!='first-item'][class!='last-item']"));
    window.clearInterval(int);
    int = setInterval("autoSlide()", slideTime);
});
function autoSlide() {
    curIndex + 1 >= $("#banner_img>li").size() ? curIndex = -1 : false;
    show(curIndex + 1);
}
function show(index) {
    $.easing.def = "easeOutQuad";
    $("#drag_ctr,#drag_arrow").stop(false, true).animate({ left: index * 115 + 20 }, 300);
    $("#banner_img>li").eq(curIndex).stop(false, true).fadeOut(time);
    adTxt.eq(curIndex).stop(false, true).animate({ top: "340px" }, time);
    adImg.eq(curIndex).stop(false, true).animate({ right: "120px" }, time);
    setTimeout(function () {
        $("#banner_img>li").eq(index).stop(false, true).fadeIn(time);
        adTxt.eq(index).children("p").css({ paddingTop: "50px", paddingBottom: "50px" }).stop(false, true).animate({ paddingTop: "0", paddingBottom: "0" }, time);
        adTxt.eq(index).css({ top: "0", opacity: "0" }).stop(false, true).animate({ top: "170px", opacity: "1" }, time);
        adImg.eq(index).css({ right: "-50px", opacity: "0" }).stop(false, true).animate({ right: "10px", opacity: "1" }, time);
    }, 200)
    curIndex = index;
}