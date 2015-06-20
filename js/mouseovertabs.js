
var mouseovertabsmenu={

disappeardelay: 250, //set delay in miliseconds before sub menu disappears onmouseout
ajaxloadingmsg: 'Loading Sub Menu Contents...', //Message to show inside sub menu while fetching contents

///////No need to edit beyond here//////////////////////

tabsmenutree:{},

initializetabs:function(tabsmenuid, submenuid, tabcontentsLength, disappearBool){
	var tabmenu=document.getElementById(tabsmenuid)
	var tablinks=tabmenu.getElementsByTagName("a")
	var submenu=document.getElementById(submenuid)
	var selected=null, tablinks_count=0
	for (var i=0; i<tablinks.length; i++){
		tablinks[i]._parentid=tabsmenuid
		var relattr=tablinks[i].getAttribute("rel")
		if (/^gotsubmenu/i.test(relattr) && tablinks_count<tabcontentsLength){ //if "rel" attribute starts with="gotsubmenu" and a tab content exists for this tab based on its order
			tablinks[i]._pos=tablinks_count //remember position of this tab relative to its active peers
			if (relattr.indexOf("[selected]")!=-1){
				selected=tablinks_count
			}
			this.addEvent(tablinks[i], function(){
				var tabsmenutree=mouseovertabsmenu.tabsmenutree[this._parentid]
				mouseovertabsmenu.clearhidetimer(tabsmenutree.submenu.hidetimer)
				mouseovertabsmenu.showsubmenu(this)
			}, "mouseover")
			tablinks_count++
			this.tabsmenutree[tabsmenuid].tabs.push(tablinks[i]) //add this tab to tab collection
		}
		else{ //else for regular tab links (with no "rel" attribute)
			this.addEvent(tablinks[i], function(){
				mouseovertabsmenu.hidesubmenu(this._parentid)
			}, "mouseover")
		}
	}
	this.addEvent(submenu, function(e){
		mouseovertabsmenu.clearhidetimer(this.hidetimer)
	}, "mouseover")
	if (disappearBool==true){
		this.addEvent(submenu, function(e){ //hide submenu contents when mouse rolls out of submenu DIV
			if (!mouseovertabsmenu.isContained(this, e)){
				var cursubmenuobj=this
				this.hidetimer=setTimeout(function(){mouseovertabsmenu.hidesubmenu(cursubmenuobj._parentid)}, mouseovertabsmenu.disappeardelay)
			}
		}, "mouseout")
	}
	var urlselected=this.urlparamselect(tabsmenuid)
	//return position of selected tab (relative to its peers), or null
	return typeof urlselected=="number"? urlselected : document.getElementById(urlselected)? document.getElementById(urlselected)._pos : selected
},

ajaxload:function(tabsmenuid, submenuid, disappearBool, url){
	var page_request = false
	if (window.ActiveXObject){ //Test for support for ActiveXObject in IE first (as XMLHttpRequest in IE7 is broken)
		try {
		page_request = new ActiveXObject("Msxml2.XMLHTTP")
		} 
		catch (e){
			try{
			page_request = new ActiveXObject("Microsoft.XMLHTTP")
			}
			catch (e){}
		}
	}
	else if (window.XMLHttpRequest) // if Mozilla, Safari etc
		page_request = new XMLHttpRequest()
	else
		return false
	var tabsmenutree=this.tabsmenutree[tabsmenuid]
	tabsmenutree.submenu.innerHTML=this.ajaxloadingmsg
	var ajaxfriendlyurl=url.replace(/^http:\/\/[^\/]+\//i, "http://"+window.location.hostname+"/") 
	page_request.onreadystatechange=function(){
		mouseovertabsmenu.ajaxpopulate(page_request, tabsmenuid, submenuid, disappearBool, ajaxfriendlyurl)
	}
	var bustcache=(ajaxfriendlyurl.indexOf("?")!=-1)? "&"+new Date().getTime() : "?"+new Date().getTime()
	page_request.open('GET', ajaxfriendlyurl+bustcache, true)
	page_request.send(null)
},

ajaxpopulate:function(page_request, tabsmenuid, submenuid, disappearBool, url){
	if (page_request.readyState == 4 && (page_request.status==200 || window.location.href.indexOf("http")==-1)){
		var tabsmenutree=this.tabsmenutree[tabsmenuid]
		tabsmenutree.submenu.innerHTML=page_request.responseText
		var innerdivs=tabsmenutree.submenu.getElementsByTagName("div")
		for (var i=0; i<innerdivs.length; i++){
			if (/tabsmenucontent/i.test(innerdivs[i].className)){
				tabsmenutree.submenu_divs.push(innerdivs[i])
			}
		}
		var selected=this.initializetabs(tabsmenuid, submenuid, tabsmenutree.submenu_divs.length, disappearBool)
		if (selected!=null && selected<tabsmenutree.submenu_divs.length){
			innerdivs[selected].style.display="block"
			this.css(tabsmenutree.tabs[selected], "selected", "add")
			tabsmenutree.submenu._prevselected=selected
		}
	}
},

showsubmenu:function(linkobj){
	var tabsmenutree=this.tabsmenutree[linkobj._parentid]
	this.hidesubmenu(linkobj._parentid)
	var selected=parseInt(linkobj._pos)
	tabsmenutree.submenu_divs[selected].style.display="block"
	this.css(tabsmenutree.tabs[selected], "selected", "add")
	tabsmenutree.submenu._prevselected=selected
},

hidesubmenu:function(tabsmenuid){
	var tabsmenutree=this.tabsmenutree[tabsmenuid]
	var prevselectedindex=tabsmenutree.submenu._prevselected
	if (typeof prevselectedindex!="undefined"){
		tabsmenutree.submenu_divs[prevselectedindex].style.display="none"
		this.css(tabsmenutree.tabs[prevselectedindex], "selected", "remove")
	}
},

clearhidetimer:function(timerid){
	if (timerid)
		clearTimeout(timerid)
},

css:function(el, targetclass, action){
	var needle=new RegExp("(^|\\s+)"+targetclass+"($|\\s+)", "ig")
	if (action=="check")
		return needle.test(el.className)
	else if (action=="remove")
		el.className=el.className.replace(needle, "")
	else if (action=="add" && !needle.test(el.className))
		el.className+=" "+targetclass
},

isContained:function(m, e){
	var e=window.event || e
	var c=e.relatedTarget || ((e.type=="mouseover")? e.fromElement : e.toElement)
	while (c && c!=m)try {c=c.parentNode} catch(e){c=m}
	if (c==m)
		return true
	else
		return false
},

urlparamselect:function(tabsmenuid){
	var result=window.location.search.match(new RegExp(tabsmenuid+"=(\\w+)", "i")) //check for "?tabsmenuid=id_or_pos_of_selected_tab" in URL
	var selectedtabstr=RegExp.$1
	return /^\d+$/.test(selectedtabstr)? parseInt(selectedtabstr) : selectedtabstr //return position or ID of selected tab (or null if niether found)
},


addEvent:function(target, functionref, tasktype){
	if (target.addEventListener)
		target.addEventListener(tasktype, functionref, false);
	else if (target.attachEvent)
		target.attachEvent('on'+tasktype, function(){return functionref.call(target, window.event)});
},

init:function(tabsmenuid, submenuid, disappearBool){
	this.tabsmenutree[tabsmenuid]={} 
	this.tabsmenutree[tabsmenuid].tabs=[] //array referencing the active tab links in this menu (ones with a "rel=gotsubmenu" attr)
	this.tabsmenutree[tabsmenuid].submenu=null //reference submenu DIV for this menu
	this.tabsmenutree[tabsmenuid].submenu_divs=[] //array referencing the submenu contents (external DIVs with class="tabsmenucontent")
	var submenu=document.getElementById(submenuid)
	submenu._parentid=tabsmenuid
	this.tabsmenutree[tabsmenuid].submenu=submenu //remember this DIV as menu's submenu container
	var remoteurl=submenu.getElementsByTagName("a")[0].getAttribute("href")
	this.ajaxload(tabsmenuid, submenuid, disappearBool, remoteurl)
}

}

document.write('<style type="text/css">\n.tabsmenucontent{display:none}\n</style>')
