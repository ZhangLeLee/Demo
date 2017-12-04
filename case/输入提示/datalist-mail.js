/* 基于datalist动态匹配邮箱地址的公共方法 fnDatalistMail
 * by zhangxinxu(.com) 2013-03-27
 * v1.0 born
**/

var fnDatalistMail = function(eleMail, options) {
	if (!eleMail || eleMail.nodeType !== 1) return;
	
	// 参数合并start----------↓
	var params = {
		email: ["qq.com", "163.com", "gmail.com", "yahoo.com.cn", "126.com"]
	}, keyOptions;	
	for (keyOptions in (options || {})) {
		params[keyOptions] = options[keyOptions];
	}
	// 参数合并end------------↑
	
	var arrEmailList = params.email;
	if (arrEmailList.length === 0) return;
	
	// datalist元素创建start-----------↓
	// 如果输入框list属性丢失或者对应元素已存在，不作处理
	var idDatalist = eleMail.getAttribute("list");
	if (!idDatalist) return;
	var eleList = document.getElementById("idDatalist");
	if (eleList) return;
	// 创建赋id值
	eleList = document.createElement("datalist");
	eleList.id = idDatalist;
	// 插入
	eleMail.parentNode.insertBefore(eleList, eleMail);
	// datalist元素创建start-----------↑
	
	
	// 不同浏览器的不同处理start------------↓
	if ("placeholder" in document.createElement("input")) {
		// IE10 以及 其他现代浏览器
		(function() {
			eleMail.fnListReplace = function() {
				var arrValue = this.value.trim().split("@")
					, htmlNewOption = '';
					
				arrEmailList.forEach(function(list) {
					htmlNewOption = htmlNewOption + '<option value="'+ arrValue[0] +'@'+ list +'">';	
				});
				// 如果值不完全匹配某option值，执行动态替换 
				if (arrValue.length !== 2 || arrEmailList.indexOf(arrValue[1]) === -1) {
					eleList.innerHTML = htmlNewOption;
				}				
				return this;
			};
			// 绑定输入事件侦听
			eleMail.addEventListener("input", function() {
				this.fnListReplace.call(this);		
			}, false);
			
			//  载入即匹配
			eleMail.fnListReplace.call(eleMail);
		})();
	} else {
		// IE6-IE9浏览器
		(function() {
			var option = null, eleSelect = null, indexOption = -1;			
			eleMail.fnListReplace = function() {
				var htmlNewOption = '', value = this.value, arrValue = value.split("@"), lengthOption = 0;
				for (var index = 0; index<arrEmailList.length; index+=1) {					
					if (arrValue.length !== 2 || arrValue[1] === "" || arrEmailList[index].indexOf(arrValue[1]) === 0) {
						htmlNewOption = htmlNewOption + '<option value="'+ arrValue[0] + '@' + arrEmailList[index] +'">'+
							arrValue[0] + '@' + arrEmailList[index] +
						'</option>';	
						lengthOption++;
					}
				}
				eleList.style.visibility = value && htmlNewOption? "visible": "hidden";
				eleList.innerHTML = (lengthOption == 1?
					'<select size="2" style="height:'+ (window.localStorage? "19": "24") +'px;">' :
					'<select size="'+ lengthOption +'">') +	htmlNewOption + '</select>';
				
				// 三个全局变量重置
				eleSelect = eleList.getElementsByTagName("select")[0];
				option = eleList.getElementsByTagName("option");
				indexOption = -1;
				
				// 宽度
				if (this.offsetWidth > eleSelect.offsetWidth) {
					eleSelect.style.width = this.offsetWidth;
				} else {
					eleSelect.style.width = '';	
				}
			};
			
			// 样式
			var style = {
				position: "absolute",
				marginTop: eleMail.offsetHeight + "px",
				visibility: "hidden"
			}, key;		
			for (key in style) {
				eleList.style[key] = style[key];		
			}
		
			// 事件
			eleMail.attachEvent("onpropertychange", function(e) {
				if (e && e.propertyName == "value") {
					eleMail.fnListReplace.call(eleMail);
				}
			});

			
			// 键盘上下
			eleMail.attachEvent("onkeyup", function(e) {
				switch(e.keyCode) {
					case 38: {
						indexOption--;
						if (indexOption < 0) {
							indexOption = -1 + option.length;
						}
						break;
					}
					case 40: {
						indexOption++;	
						if (indexOption >= option.length) {
							indexOption = 0;
						}
						break;
					}
					case 13: {
						if (indexOption !== -1) {
							eleMail.value = eleSelect.value;	
						}
						eleList.style.visibility = "hidden";
						break;
					}
					case 8: {
						// IE9 delete无法触发onpropertychange以及oninput的问题
						if (typeof window.screenX == "number") {
							eleMail.fnListReplace.call(eleMail);	
						}
						break;
					}
				}		
				option[indexOption] && (option[indexOption].selected = "selected");
			});
			
			document.body.attachEvent("onmouseup", function(event) {
				if (!event) return;
				var target = event.srcElement || event.target;
				if (target && target != eleMail && target.parentNode != eleSelect) {
					eleList.style.visibility = "hidden";
				}
			});
			
			eleMail.fnListReplace.call(eleMail);	
			
			// 选中
			eleList.attachEvent("onclick", function() {
				eleMail.value = eleSelect.value;
				eleList.style.visibility = "hidden";
			});	
		})();
	}	
	
	// 不同浏览器的不同处理end------------↑
};