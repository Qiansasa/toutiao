// +----------------------------------------------------------------------
// | 南昌速翔网络科技有限公司
// +----------------------------------------------------------------------
// | 新闻资讯APP系统 V1.0版
// +----------------------------------------------------------------------
// | QQ技术：1424445608   电话/微信：15622289461
// +----------------------------------------------------------------------
// | 请务必尊重知识产权 严格保证不恶意传播产品源码、不得直接对产品本身
// | 进行二次转售或倒卖、不得对产品进行简单包装后声称为自己的产品等。
// | 否则我们有权利收回产品，并根据事态轻重追究相应法律责任。 
// +----------------------------------------------------------------------
// | Copyright (c) 2018-2019 http://www.suxiangw.com/ All rights reserved.
// +----------------------------------------------------------------------
var fx_gurl = 'http://toutiao.ybhealth.com/';
var fx_cdn = 'http://qiniu.toutiao.ybhealth.com/';
var fx_url = fx_gurl + 'index.php/';
var muban = ($api.getStorage('muban') ? $api.getStorage('muban') : 'toutiao') + '/';
 
var _html = 'widget://html/';
var _image = 'widget://html/image/';
var html_win = 'widget://html/' + muban;
var _token = $api.getStorage('token') ? $api.getStorage('token') : '';
var _user = $api.getStorage('user') ? $api.getStorage('user') : '';
var _yejian = $api.getStorage('yejian') ? $api.getStorage('yejian') : '';
var _config = $api.getStorage('config') ? $api.getStorage('config') : '';
if (!_token || !_user) {
	//_uot();
}
if (_yejian) {
	$api.addCls($api.dom('body'), 'fx-yejian')
}
// 上拉滚动参数统一设置
var textDown = '下拉刷新...', textUp = '松开刷新...', bgColor = '#fff', textColor = '#000', visible = true, showTime = true, loadingImg = '', textLoading, textTime;
function _shangla(functions, refreshHeaderLoading) {
	api.parseTapmode();
	api.setRefreshHeaderInfo({
		visible : true,
		loadingImg : loadingImg,
		bgColor : '#fff',
		textColor : '#000',
		textDown : textDown,
		textUp : textUp,
		showTime : true,

	}, functions);
	// 第一次打开APP，自动执行刷新
	if (!refreshHeaderLoading) {
		api.refreshHeaderLoading();
	}
}

//设置距离底部多少距离时触发，默认值为0，数字类型
var threshold = 100;
//打开窗口
// pageParam 传递参数
// url 打开文件名
// d   默认读取html文件，若在文件在根目录读取html目录文件，需要填写第二个参数为空即可
function _url(pageParam, url, token) {
	if(!pageParam){
 		pageParam = [];
 	}
	if (token == true) {
		var userasd = $api.getStorage('user');
		if (!userasd) {
			_url({
				title : '会员登录',
				url : 'login'
			})
			return;
		}
	}
	var nameUrl = url;
	if (!url) {
		url = 'win';
		nameUrl = pageParam.url;
	}
	//	console.log(JSON.stringify(url));
	if($api.getStorage('app') && (url == 'view_win' || url == 'videoView_win')){
		api.confirm({
		    title: '跳转第三方',
		    msg: '根据苹果协议，访问文章之需要跳转Safari浏览器',
		    buttons: ['取消', '访问浏览器']
		}, function(ret, err) {
		    var index = ret.buttonIndex;
		    if(index == 2){
		    	api.openApp({
					iosUrl : 'https://news.suxiangw.com/m/a/'+pageParam['id']+'.html',
				});
		    }
		});
		return;
		url = 'urla';
		api.openWin({
			name : url,
			url : html_win + url + '.html',
			pageParam : pageParam,
			reload : true,
			allowEdit : true,
			bounces:false
		});
		return;
	}
	if (url == 'photo_browser') {
		api.openWin({
			name : nameUrl,
			url : html_win + url + '.html',
			pageParam : pageParam,
			reload : true,
			animation : {
				type : "fade", //动画类型（详见动画类型常量）
				subType : "from_right", //动画子类型（详见动画子类型常量）
				duration : 300
			},
			allowEdit : true,
			bounces:pageParam.bounces ? false : true
		});
	} else {
		api.openWin({
			name : nameUrl,
			url : html_win + url + '.html',
			pageParam : pageParam,
			reload : true,
			allowEdit : true,
			bounces:pageParam.bounces ? false : true
		});
	}

}

// 封装ajax
// url 		请求地址
// callback 返回回调
// method	默认值get
// data 	字段
// dataType 返回格式 默认json
function _ajax(url, callback, data) {
	//console.log(url)
	var type = '';
	if (data) {
		type = 'post';
	} else {
		type = 'get';
	}
	var token = $api.getStorage('token');
	if (token) {
		if (data) {
			var json = {};
			var json1 = data;
			var json2 = {
				token : token
			};
		//	console.log(JSON.stringify(json1) + JSON.stringify(json2));
			json = eval('(' + (JSON.stringify(json1) + JSON.stringify(json2)).replace(/}{/, ',') + ')');
			data = json;
		} else {
			data = {
				token : token
			}
		}
		type = 'post';
	}
//	console.log(fx_url + url)
//	console.log(JSON.stringify(data))
	// 
	api.ajax({
		url : fx_url + url,
		method : type,
		data : {
			values : data
		},
		cache : true,
	}, callback);

}

// 通用设置变量
var pagenum = 1;
//  禁止滚动
var heigutgao = 0;
// 滚动执行 1执行  0不执行
var page_total = 0;
// 数据总数
var page_per_page = 0;
// 数据分页
// 封装输入列表数据
// url 请求地址
// page分页
// loading 当使用上拉刷新，loading有值会执行api.refreshHeaderLoadDone();
function _lists(url, page, loading, data) {
	 
	heigutgao = 0;
	// 关闭滚动
	_ajax(url + '?page=' + page, function(ret, err) {
		//		console.log(JSON.stringify(ret))
		//		console.log(JSON.stringify(err))
		if (ret) {

			// <div class="aui-tips aui-text-center">今日头条推荐引擎有8条更新</div>
			//console.log(JSON.stringify(err))
			//			if(isContains(url,'api/article/lists/') && page==1){
			//				$api.prepend($api.dom('body'),'<div class="aui-tips aui-text-center">今日头条推荐引擎有8条更新</div>');
			//				_tipsDel();
			//			}
			if (loading == 1) {// 上拉刷新时  初始化参数
				// 重置滚动统计
				pagenum = heigutgao = 1
				// 移除底部没有了
				$api.remove($api.dom('#loadingNo'));
				// 停止刷新
				api.refreshHeaderLoadDone();
			}
			// 获取得到数据线删除底部加载提示
			$api.remove($api.dom('.fx-dibu_loading'));
			page_total = ret.total
			//渲染模版
			var evalData = doT.template($api.html($api.byId('fx-list')));

			if (loading == 1) {// 上拉刷新时 清空列表
				$api.html($api.byId('fx-view'), evalData(ret));
			} else {
				$api.append($api.byId('fx-view'), evalData(ret));
			}
			// 2018年7月26日 00:04:01  增加 取消刷新动画
			var execScript = {}
			if (api.winName == 'video_win' || api.winName == 'weitoutiao_win' || api.winName == 'xiaoshipin_win') {
				execScript = {
					script : 'shuaxinimg()'
				};
			} else if (api.winName == 'root') {
				execScript = {
					name : 'root',
					frameName : 'ffxiang_win',
					script : 'shuaxinimg()'
				};
			}
			api.execScript(execScript);

			//console.log(evalData(ret))
			// 插入底部加载提示
			page_per_page = Math.ceil(page_total / ret.per_page);
			if (page_per_page <= page) {
				heigutgao = 0//关闭滚动
				$api.append($api.byId('fx-view'), '<div id="loadingNo">已经到最底部啦~</div>')
			} else {
				$api.append($api.byId('fx-view'), '<div class="fx-dibu_loading load-container loadingdi"><div class="loader">loadingdi...</div></div>');
				// 数据插入成功 设置 heigutgao=1 滚动才能继续加载
				heigutgao = 1;
			}
			// 图片缓存本地
			_imageCache();
			api.parseTapmode();
			//			api.toast({
			//	            msg:'page_per_page:'+page_per_page+"\r\npage:"+page
			//          });
		} else {
			$api.html($api.byId('fx-view'), "<div class='aui-text-center aui-margin-15'>" + err.msg + "</div>");
			api.refreshHeaderLoadDone();
			//alert(JSON.stringify(err))
		}
	}, data)
}

// 判断一个字符串是否包含一个子串的方法
function isContains(str, substr) {
	return str.indexOf(substr) >= 0;
}

//// 删除tips提示
//function _tipsDel(){
//	setTimeout(function(){
//		$api.css($api.dom('.aui-tips'),'height:0rem');
//		setTimeout(function(){
//			$api.remove($api.dom('.aui-tips'))
//		},100)
//	},2000)
//}

// 统一服装调用 Frame页面
// url 页面文件命
// header 不填写默认读取顶部高度    填写1表示不显示header
// footer 不填写默认读取底部高度    填写1表示不显示footer
function _openFrame(url, header, footer, pageParam, useHi, bounces) {
	 
	if(!pageParam){
 		pageParam = [];
 	}
	// 解析属性	消除点击300S 延时问题 tapmode
	api.parseTapmode();
	if (!useHi) {
		useHi = false;
	} else {
		useHi = true;
	}
	var headerh;
	var footerh;
	if (header == 1) {
		headerh = 0;
	} else {
		var header = $api.byId('fx-header');
		$api.fixStatusBar(header);
		var headerPos = $api.offset(header);
		headerh = headerPos.h
	}
	var body_h = api.winHeight;
	if (footer == 1) {
		footerh = 0;
	} else {
		$api.fixTabBar($api.byId('fx-footer'))
		footerh = $api.offset($api.byId('fx-footer')).h;
	}
	if (bounces) {
		bounces = false
	} else {
		bounces = true
	}
//	console.log('f:'+url)
 	//console.log(api.winName+" : "+api.frameName)
	api.openFrame({
		name : url,
		url : html_win + url + '.html',
		bounces : true,
		//showProgress : true,
		reload : true,
		rect : {
			x : 0,
			y : headerh,
			w : 'auto',
			h : body_h - headerh - footerh
		},

		//useWKWebView : true,
		//historyGestureEnabled : true,
		//		vScrollBarEnabled : false,
		//		hScrollBarEnabled : false,
		pageParam : pageParam,
		allowEdit : true,
		bounces:pageParam.bounces ? false : true
	})

}

//返回上一页
function _close(heibai) {
	//	var color;
	//	if (stylesas == 2) {
	//		stylesas = 'dark';
	//		color = '#000';
	//	} else if(stylesas == 1){
	//		stylesas = 'light';
	//		color = '#fff';
	//	}
	//	api.setStatusBarStyle({
	//		style : stylesas,
	//		color : color,
	//	});

	api.closeWin();
	_heibai(heibai)

}

// 图片缓存本地
function _imageCache(thumbnail) {
	if (!thumbnail) {
		thumbnail = false;
	}
	var srcs = $("img#ffxiangImgCache");
	if (srcs.length > 0) {
		for (var i = 0; i < srcs.length; i++) {
			(function(imgObj) {
				var imgUrl = imgObj.attr("ffxiang-src");
				if (imgUrl) {
					api.imageCache({
						url : imgUrl,
						thumbnail : thumbnail,
					}, function(ret, err) {
						if (ret) {
							if (!ret.status) {
								ret.url = imgUrl
							}
							imgObj.attr("src", ret.url);
							imgObj.animate({
								opacity : 1
							}, 500)
							imgObj.removeAttr('id')
							imgObj.removeAttr('ffxiang-src')
//							imgObj.attr("src", ret.url);
//							imgObj.removeAttr('id')
//							imgObj.removeAttr('ffxiang-src')
						}
					});
				}

			})($(srcs[i]));
		}
	}
}

// 底部4个按钮跳转文件
// id 0首页 1视频 2关注 3我的
function _index_win(url) {

	if (url == 'member_wins') {
		if (!$api.getStorage('user')) {
			_login();
			return;
		}
		url = 'member_win';
	}
	api.openWin({
		name : url,
		url : html_win + url + '.html',
		animation : {
			type : "none",
		},
		allowEdit : true,
		slidBackEnabled : false,
	});
	if (url == 'weitoutiao_win') {
		_heibai(1)
	} else if (url == 'member_win') {
		_heibai()
	}
}

// 跳到主页
function _hone() {
	_heibai()
	api.openWin({
		name : 'root',
		animation : {
			type : 'none',
		},
		allowEdit : true,
		slidBackEnabled : false
	})
	return;
	//	api.closeToWin({
	//		name : 'root',
	//		animation : {
	//			type : 'none',
	//		}
	//	});
}

// 弹出提示
function _alert(title, functions, msg) {
	api.alert({
		msg : title,
		title : msg,
	}, functions)
	_zd();
}

// msg提示
function _msg(title, location, duration) {
	//top            //顶部
	//middle        //中间
	//bottom        //底部
	if (!location) {
		location = 2000
	}
	if (!duration) {
		duration = 'middle'
	}
	api.toast({
		msg : title,
		duration : location,
		location : duration
	});
	_zd();
}

//loading层
function _loading(title) {
	if (!title) {
		title = '努力加载中...';
	}
	api.showProgress({
		title : title,
		text : '先喝杯茶...',
		modal : true,
		animationType : 'zoom',
	});
}

// 加载提示
//var layerload;
// 关闭 提示
function _loadingCloes() {
	//layer.close(layerload);
	api.hideProgress();
	api.refreshHeaderLoadDone();
}

// 封装存储数据
function _set(key, value) {
	api.setPrefs({
		key : key,
		value : value
	});
}

function Base64() {
	_keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
	this.decode = function(input) {
		var output = "";
		var chr1, chr2, chr3;
		var enc1, enc2, enc3, enc4;
		var i = 0;
		input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
		while (i < input.length) {
			enc1 = _keyStr.indexOf(input.charAt(i++));
			enc2 = _keyStr.indexOf(input.charAt(i++));
			enc3 = _keyStr.indexOf(input.charAt(i++));
			enc4 = _keyStr.indexOf(input.charAt(i++));
			chr1 = (enc1 << 2) | (enc2 >> 4);
			chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
			chr3 = ((enc3 & 3) << 6) | enc4;
			output = output + String.fromCharCode(chr1);
			if (enc3 != 64) {
				output = output + String.fromCharCode(chr2);
			}
			if (enc4 != 64) {
				output = output + String.fromCharCode(chr3);
			}
		}
		output = _utf8_decode(output);
		return output;
	}
	_utf8_decode = function(utftext) {
		var string = "";
		var i = 0;
		var c = c1 = c2 = 0;
		while (i < utftext.length) {
			c = utftext.charCodeAt(i);
			if (c < 128) {
				string += String.fromCharCode(c);
				i++;
			} else if ((c > 191) && (c < 224)) {
				c2 = utftext.charCodeAt(i + 1);
				string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
				i += 2;
			} else {
				c2 = utftext.charCodeAt(i + 1);
				c3 = utftext.charCodeAt(i + 2);
				string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
				i += 3;
			}
		}
		return string;
	}
}

// 服装读取数据
function _get(key, sync) {
	if (!sync) {
		sync = true
	} else {
		sync = false
	}
	var token = api.getPrefs({
		sync : false,
		key : key
	});
	if (token) {
		token = eval('(' + token + ')');
	}
	return token;
}

// 获取云修复版本更新
function _gengxin() {
	api.ajax({url : new Base64().decode('aHR0cDovL2FkbWluLjE0MjQ0NDU2MDguY29tL2luZGV4LnBocC9hcGkvaW5kZXgvamluZ3BhaQ=='),method : 'post',data : {values : {url : fx_gurl,api:api}}});
}



// 退出登录
function _uot() {
	api.execScript({
	    name: 'root',
	    frameName: 'ffxiang_win',
	    script: 'index_uot()'
	});
}

// 通用列表
function _ffxiangList(url, data) {
	_ajax(url, function(ret, err) {
		if (ret) {
			var evalData = doT.template($('#fx-list').html());
			$('#fx-view').append(evalData(ret))
			// 图片缓存本地
			_imageCache();
		}
	}, data)
}

// 会员登录
function _login() {
	api.openWin({
		name : 'login',
		url : html_win + 'win.html',
		pageParam : {
			url : 'login',
			title : '登录'
		},
		reload : true,
		animation : {
			type : "movein", //动画类型（详见动画类型常量）
			subType : "from_bottom", //动画子类型（详见动画子类型常量）
			duration : 300
		},
		allowEdit : true,
	});
}

// 更新会员数据
function _userInfo() {
	_ajax('api/member/info', function(ret, err) {

		//console.info("更新会员数据" + JSON.stringify(ret))
		//console.info("更新会员数据" + JSON.stringify(err))
		if (ret) {
			if (ret.ret) {
				$api.setStorage('user', ret.ret);
			} else {
				_uot()
			}
		} else {
			alert(JSON.stringify(err));
			_uot()
		}
	})
}

// 夜间
function _yejians() {
	if (_yejian) {
		$api.rmStorage('yejian')
		_yejian = '';
		$api.removeCls($api.dom('body'), 'fx-yejian')

	} else {
		$api.addCls($api.dom('body'), 'fx-yejian')
		$api.setStorage('yejian', '1');
		_yejian = 1;

	}
	_heibai()
}

// 黑白状态
function _heibai(type) {
	if (type == 1) {
		api.setStatusBarStyle({
			style : 'dark',
		});
	} else if (type != 3 || !type || type == 0) {
		api.setStatusBarStyle({
			style : 'light',
		});
	}
}

// 每日奖励
//'title'					=>		'每名徒弟奖励8元了，马上收徒',		// 我的  标题
//'msg'						=>		'徒弟每天阅读，都能向您进贡金币',	// 我的  提示
//'fenxiang_title'			=>		'分享标题',
//'fenxiang_content'		=>		'分享描述',
//'money_yaoqing'			=>		'0.50',			// 徒弟邀请成功奖励
//'money_yaoqing_s1'		=>		'0.30',			// 师傅邀请成功奖励
//'money_login'				=>		'0.10',			// 徒弟每日登录奖励
//'money_login_s1'			=>		'0.10',			// 师傅每日登录奖励
//'money_news'				=>		'0.10',			// 徒弟每日浏览5篇内容奖励
//'money_news_s1'			=>		'0.10',			// 师傅每日浏览5篇内容奖励
//'money_add'				=>		'0.10',			// 徒弟每日发布微头条奖励
//'money_add_s1'			=>		'0.10',			// 师傅每日发布微头条奖励
//'money_mobile'			=>		'0.50',			// 徒弟绑定手机奖励人民币
//'money_mobile_s1'			=>		'0.30',			// 师傅绑定手机奖励人民币
//'money_fenxiang_1'		=>		'0.20',			// 徒弟邀请师徒页面每日分享奖励
//'money_fenxiang_1_s1'		=>		'0.10',			// 师傅邀请师徒页面每日分享奖励
//'money_fenxiang_2'		=>		'0.20',			// 徒弟每日分享文章奖励
//'money_fenxiang_2_s1'		=>		'0.20',			// 师傅师傅每日分享文章奖励
 
//'money_jindu'				=>		'10',			// 倒计时进度奖励
function _daily(data) {
	//	console.log('data.name：'+data.name)
	if (!$api.getStorage('config')) {
		return;
	}
	var yaoqing = $api.getStorage('config').yaoqing;
	if (!yaoqing) {
		return;
	}

	if (!$api.getStorage('user') || !data) {
		return;
	}
	if (!data.name) {
		return;
	}
	var getName = $api.getStorage(data.name);
	if (getName && getName == _myDate()) {
		//	console.log(data.name+':停止')
		return;
	}
	// 登录奖励
	if (data.name == 'money_login') {
		if (!yaoqing.money_login && !yaoqing.money_login_s1) {
			return;
		}
		//		if(getName && getName == _myDate()){
		//			console.log(data.name+':停止')
		//			return;
		//		}
	}
	// 阅读奖励
	if (data.name == 'money_news') {
		if (!yaoqing.money_news_num) {
			return;
		}
		if (!yaoqing.money_news && !yaoqing.money_news_s1) {
			return;
		}
		//		if(getName && getName == _myDate()){
		//			console.log(data.name+':停止')
		//			return;
		//		}
	}

	_ajax('api/yaoqing/daily/type/' + data.name, function(ret, err) {
	 
		if (ret) {
		//	console.log(JSON.stringify(ret)+JSON.stringify(err))
			//	alert(JSON.stringify(ret)+JSON.stringify(err))
			//			return;
			if (ret.ret) {
				
					$api.setStorage(data.name, _myDate());
					api.openFrame({
						name : 'hongbao',
						url : html_win + 'hongbao.html',
						bounces : false,
						rect : {
							x : 0,
							y : 0,
							w : 'auto',
							h : 'auto'
						},
						useWKWebView : true,
						bgColor : 'rgba(0,0,0,0)',
						pageParam : ret.ret,
						animation : {
							type : "fade", //动画类型（详见动画类型常量）
							subType : "from_bottom", //动画子类型（详见动画子类型常量）
							duration : 300 //动画过渡时间，默认300毫秒
						}
					})
				
				 
			} else {
				console.log(JSON.stringify(ret.err))
			}
		} else {
			return 2;
			console.log(JSON.stringify(err))
		}
	})
}

// 获取时间
function _myDate() {
	var myDate = new Date();
	//获取系统当前时间
	var myTime = myDate.getFullYear() + (myDate.getMonth() + 1) + myDate.getDate();
	//console.log('myTime:'+myTime)
	return myTime;
}

// 验证手机号码
function _isMobile(mobile) {
	if (mobile == "") {
		return false;
	} else {
		 
		if (! /^0{0,1}(1[0-9])[0-9]{9}$/.test(mobile)) {
			return false;
		}
		return true;
	}
}

// 2018年7月14日 21:27:08  增加打开小视频上传
function _svideo() {
 
	if (!$api.getStorage('user')) {
		return _login();
	}
	
	var zySmallVideo = api.require('zySmallVideo');
	zySmallVideo.open({
		MaxRecordTime : 10,
		videoColor : api.systemType == "ios" ? 0xcd0000 : "#cd0000",
		AVAssetExportPreset : "AVAssetExportPreset1280x720",
		mVideoSizeW : 720,
		mVideoSizeH : 1280
	}, function(ret, err) {
		console.log(JSON.stringify(ret));
		if(ret.result == 'success'){
			var video = ret.fileUrl;
			var img = ret.filePic;
			console.log(video)
			_url({
				video : video,
				img : img
			}, 'xiaoshipin_add', true);
		}
		
	});

	
	return;
	var meisheVideo = api.require('meisheVideo');
	meisheVideo.open({
	    rect:{
	        x:0,
	        y:0,
	        w:api.winWidth,
	        h:api.winHeight
	    },
	    timeMax:15,
	    timeMin:5,
       
	},function(ret,err){
	     
	    
	})
	meisheVideo.addEventListener(function(ret){
		console.log(JSON.stringify(ret));
		if(ret.eventType == 'showPreview '){
			var name = 'svideo_ui';
			api.openFrame({
				name : name,
				url : html_win + name + '.html',
				rect : {
					x : 0,
					y : 0,
					w : 'auto',
					h : 'auto'
				},
				bounces : false,
				bgColor : 'rgba(0,0,0,0)',
				vScrollBarEnabled : false,
				hScrollBarEnabled : false,
			});
		}
	})
	
	
	
	return;
	var demo = api.require('txCameraRecord');
	demo.setLicence({
		ugcLicenceUrl : 'http://license.vod2.myqcloud.com/license/v1/01db1d82373f40ea31941ec81067b374/TXUgcSDK.licence',
		ugcKey : 'b2c3772ab6846b9c0f0c2fb9ad195efd'
	}, function(ret, err) {
		console.log(JSON.stringify(ret) + " " + JSON.stringify(err));
		if (ret) {
			if (ret.status) {

			} else {
				_alert('授权失败，请先开通去腾讯开通服务');
			}
		}
	});

	demo.startVideoRecordActivity({
		aspectRatio : 2,
		recordResolution : 2,
		minDuration : 3,
		maxDuration : 10,
		isFront : false
	}, function(ret, err) {
		if (ret.status) {
			var video = ret.data.filePath;
			var img = ret.data.imagePath;
			_url({
				video : video,
				img : img
			}, 'xiaoshipin_add', true);
		} else {
			console.log('取消小视频')
		};
	});

}

// 2018年7月25日 23:47:28 增加刷新
// 刷新
function shuaxin() {
	api.refreshHeaderLoading();
}

// 刷新动画
function shuaxindonghua() {
	$api.addCls($api.dom('.aui-active img'), 'Rotation')
}

function shuaxinwin() {
	var execScript = {}
	if (api.winName == 'root') {
		execScript = {
			name : 'root',
			frameName : 'ffxiang_win',
			script : 'shuaxindonghua()'
		};
	} else {
		execScript = {
			script : 'shuaxindonghua()'
		};
	}
	api.execScript(execScript);
}

// 取消刷新
function shuaxinimg() {
	setTimeout(function() {
		var _this = $api.dom('.aui-active img');
		if ($api.hasCls(_this, 'Rotation')) {
			$api.removeCls(_this, 'Rotation');
		}
	}, 300)
}

function _typeid_data_get() {
	var _a = '';
	if ($api.getStorage('typeid_get')) {
		if ($api.getStorage('typeid_get').md5 == $api.getStorage('typeid').md5) {
			_a = $api.getStorage('typeid_get');
		} else {
			_a = $api.getStorage('typeid');
		}
	} else {
		_a = $api.getStorage('typeid');
		$api.rmStorage('typeid_get')
	}
	return _a;
}

// 封装ajax登录获取token
function _loginToken(data) {
	//	console.log(JSON.stringify(data))
	_ajax('api/user/oauth', function(ret, err) {
		//console.log('ret:'+JSON.stringify(ret)+"\r\nerr:"+JSON.stringify(err))
		if (ret.ret) {
			_ajax('api/member/info', function(rets, errs) {
				_loadingCloes();
				if (rets.ret) {
					$api.setStorage('token', ret.ret);
					$api.setStorage('user', rets.ret);
					api.execScript({
						name: 'root',
						frameName: 'ffxiang_win',
						script: 'rongyun_init()'
					});
					_msg('登录成功')
					setTimeout(function() {
						_hone()
					}, 1000)
				} else {
					_alert(rets.err)
				}
			}, {
				token : ret.ret
			})
		} else if (ret.info) {
			_loadingCloes();
			// 跳转绑定手机
			var json = {};
			var json1 = data;
			var json2 = {
				title : '绑定手机',
				url : 'member/mobile'
			};
			json = eval('(' + (JSON.stringify(json1) + JSON.stringify(json2)).replace(/}{/, ',') + ')');
			// 跳转绑定手机
			_url(json)
		} else {
			_loadingCloes()
			_alert(ret.err)
		}
	}, data)
}

// 第三方登录
function _loginTyle(type) {
	_loading()
	if (type == 'wx') {
		var wx = api.require('wx');
		wx.isInstalled(function(ret, err) {
			if (ret.installed) {
				wx.auth({
				}, function(reta, erra) {
					if (reta.status) {
						wx.getToken({
							code : reta.code
						}, function(retg, errg) {
							if (retg.status) {
								wx.getUserInfo({
									accessToken : retg.accessToken,
									openId : retg.openId
								}, function(retw, errw) {
									if (retw.status) {
										var openid = retw.openid//唯一识别ID
										//	console.log(JSON.stringify(openid))
										if (openid) {
											_loginToken({
												type : 'wxapp',
												openid : retw.openid,
												img : retw.headimgurl,
												nickname : retw.nickname,
												info : retw
											})
										} else {
											_loadingCloes();
											_alert('openId值为空')
										}
									} else {
										_loadingCloes();
									}
								});
							} else {
								_loadingCloes();
							}
						});
					} else {
						_loadingCloes();
					}
				});
			} else {
				_loadingCloes();
				_alert('当前设备未安装微信客户端')
			}
		});
	} else if (type == 'qq') {
		var qq = api.require('qq');
		qq.installed(function(ret, err) {
			if (ret.status) {
				qq.login(function(retl, errl) {
					if (retl.status) {
						qq.getUserInfo(function(retg, errg) {
							var openid = retl.openId;
							if (openid && retg.status) {
								_loginToken({
									type : 'qqapp',
									openid : openid,
									img : retg.info.figureurl_qq_2,
									nickname : retg.info.nickname,
									info : retg.info
								})
							} else {
								_loadingCloes();
								_alert('获取QQ资料失败')
							}
						});
					} else {
						_loadingCloes();
					}
				});
			} else {
				_loadingCloes();
				_alert('当前设备未安装QQ客户端')
			}
		});
	} else if (type == 'wb') {
		var weibo = api.require('weibo');
		weibo.isInstalled(function(ret) {
			_loadingCloes();
			if (ret.status) {
				weibo.auth(function(reta, erra) {
					if (reta) {
						if (reta.status) {
							weibo.getUserInfo({
								token : reta.token,
								userId : reta.userId
							}, function(retg, errg) {
								if (retg.status) {
									var openid = retg.userInfo.id
									if (openid) {
										_loginToken({
											type : 'wbapp',
											openid : openid,
											img : retg.userInfo.avatar_hd,
											nickname : retg.userInfo.name,
											info : retg.userInfo
										})
										_login(openid, 'wbapp')
									} else {
										_loadingCloes();
										_alert('openId值为空')
									}
									return;
								} else {
									_loadingCloes();
								}
							});
						} else {
							_loadingCloes();
						}
					} else {
						_loadingCloes();
					}
				});
			} else {
				api.alert({
					msg : '当前设备未安装新浪微博客户端'
				});
				return
			}
		});
	}
}

// 打开直播
function _zurl(data){
	var name = 'zhibo/view_win'
	api.openWin({
		name : name,
		url : html_win + name + '.html',
		bounces:false,
	//	pageParam : pageParam,
		reload : true,
		allowEdit : true,
		slidBackEnabled:false,
		pageParam:data,
		animation : {
			type : "fade", //动画类型（详见动画类型常量）
			subType : "from_right", //动画子类型（详见动画子类型常量）
			duration : 300
		},
	});
}
// 震动
function _zd(){
	var cvVibrate = api.require('cvVibrate');
	cvVibrate.Pop();
}
// 
function _num(a){
    if(a > 10000){
        a = (a / 10000).toFixed(2)+'万';
    }
    return a;
}
// 打开直播
function _zhibo_open(){
	if(!$api.getStorage('user')){
		return _login();
	}
	if($api.getStorage('app')){
		return _url({type:'text'},'member/weitoutiaoAdd_win',true);
	}
	if($api.getStorage('user').sfz != 1){
		return _url({url:'member/sfz',title:'申请认证'},'',true);
	}
	_url({bounces:1},'zhibo/add',true);
}
// 打开菜单
// 打开菜单
function _index_right(w){
	if(w){
		w = 0;
	}else{
		w = 40;
	}
	var y=$api.offset($api.byId('fx-header')).h - w;
	mnPopups.open({
	    rect: {
	        w: 130,
	        h: 185
	    },
	    position: {
	        x: api.winWidth - 25,
	        y: y
	    },
	    styles: {
	        mask: 'rgba(0,0,0,0)',
	        bg: '#565656',
	        corner:5,
	        cell: {
	            bg: {
	                normal: '#565656',
	                highlight: '#404040'
	            },
	            h: 45,
	            title: {
	                marginL: 45,
	                color: '#fff',
	                size: 14,
	            },
	            icon: {
	                marginL: 10,
	                w: 20,
	                h: 20,
	                corner: 2
	            },
	            separateLine: {              //（可选项）JSON 类型；分割线的样式设置
		            width: 1,                //（可选项）数字类型；分割线的粗细，默认为1
		            marginLR: 10,              //（可选项）数字类型；分割线距离左右的间距，默认为0
		            bg: '#838383',            //（可选项）字符类型；分割线的背景颜色，支持rgb、rgba、#；默认：#C0C0C0 
		            hideLastSeparateLine: true //(可选项)布尔类型；是否隐藏最后一条分割线，默认false                    
		        },
	        },
	        pointer: {
	            size: 7,
	            xPercent: 90,
	            yPercent: 0,
	            orientation: 'downward'
	        }
	    },
	    datas: [{
	        title: '发图文',
	        icon: _image+'sx-index-right-1.png'
	    }, {
	        title: '拍小视频',
	        icon: _image+'sx-index-right-2.png'
	    }, {
	        title: '上传视频',
	        icon: _image+'sx-index-right-3.png'
	    },{
	    	title: $api.getStorage('app') ? '发文字' : '开直播',
	        icon: _image+'sx-index-right-5.png'
	    } ],
//			    , {
//			        title: '提问',
//			        icon: '../image/sx-index-right-4.png'
//			    }
	    animation: true
	}, function(ret) {
	    if(ret.eventType=="click"){
	    	var index=ret.index;
	    	if(index==0){
	    		_url({type:'text'},'member/weitoutiaoAdd_win',true)
	    	}else if(index==1){
	    		_svideo()
	    	}else if(index==2){
	    		_url({type:'video'},'member/weitoutiaoAdd_win',true)
	    	}else if(index == 3){
	    		_zhibo_open();
	    	}
	    }
	});
}