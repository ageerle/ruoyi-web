import Token from "markdown-it/lib/token";

export default {
  common: {
    add: '添加',
    addSuccess: '添加成功',
    edit: '编辑',
    editSuccess: '编辑成功',
    delete: '删除',
    deleteSuccess: '删除成功',
    save: '保存',
    saveSuccess: '保存成功',
    reset: '重置',
    action: '操作',
    export: '导出',
    exportSuccess: '导出成功',
    import: '导入',
    importSuccess: '导入成功',
    clear: '清空',
    clearSuccess: '清空成功',
    yes: '是',
    no: '否',
    confirm: '确定',
    download: '下载',
    noData: '暂无数据',
    wrong: '好像出错了，请稍后再试。',
    success: '操作成功',
    failed: '操作失败',
    verify: '验证',
    unauthorizedTips: '未经授权，请先进行验证。',
    stopResponding: '停止响应',
    history: '历史记录'
  },

  chat: {
    newChatButton: '新建聊天',
    placeholder: '可输入说点什么，也可贴截图或拖拽文件（Shift + Enter = 换行）',
    placeholderMobile: '来说点什么...',
    copy: '复制',
    copied: '复制成功',
    copyCode: '复制代码',
    clearChat: '清空会话',
    clearChatConfirm: '是否清空会话?',
    exportImage: '保存会话到图片',
    exportImageConfirm: '是否将会话保存为图片?',
    exportSuccess: '保存成功',
    exportFailed: '保存失败',
    usingContext: '上下文模式',
    turnOnContext: '当前模式下, 发送消息会携带之前的聊天记录',
    turnOffContext: '当前模式下, 发送消息不会携带之前的聊天记录',
    deleteMessage: '删除消息',
    deleteMessageConfirm: '是否删除此消息?',
    deleteHistoryConfirm: '确定删除此记录?',
    clearHistoryConfirm: '确定清空记录?',
    preview: '预览',
    showRawText: '显示原文',
    annouce: '公告',
    annouceContent: '本网站为网站所有内容，由用户自行承担。;本网站仅供学习之用。;使用本网站产生的任何问题由用户自行承担。',
		helpTitle: '今天我能为您做些什么呢?作为你的智慧伙伴，我不仅可以写文案、出点子、还可以和你聊天，想知道我还能做些什么吗? 你可以这样问我: ',
		helpcontent: '1. 请给我讲讲量子力学的基本原理;2. 人工智能领域有哪些热门的研究方向;3. 怎样才能提高睡眠质量;',
    used: '使用',
    refresh: '刷新',
    like: '点赞',
    bad: '不喜欢',
  },


  register: {
    create_account: "创建账户",
    invalid_account: "账号格式不正确",
    empty_verification_code: "验证码不能为空",
    registration_success: "注册成功",
    send_success: "发送成功",
    registration_failed: "注册失败",
    get_verification_code: "获取验证码",
    seconds_retry: " 秒后重试",
    register: "注册",
    or: "或者",
    login: "登录",
    go_login: "去登录",
    if_account: " 如果您已经有帐户",
    email: "账号",
    enter_email: "请输入账号名称",
    verification_code: "验证码",
    enter_verification_code: "请输入验证码",
    password: "密码",
    enter_password: "请输入密码",
    confirm_password: "确认密码",
    enter_confirm_password: "请再次输入密码确认",
  },

  login: {
    accountFormatError: "账号格式不正确!",
    loginSuccess: "登录成功!",
    loginFailed: "登录失败!",
    usernameOrPasswordEmpty: "用户名或者密码不能为空!",
    username: "账号登录",
    enterEmailOrPhone: "请输入账号",
    password: "密码",
    enterPassword: "请输入密码",
    forgotPassword: "忘记密码?",
    login: "登录",
    register: "注册",
    andExperience: "并免费体验问答助手",
    scanQrCodeLogin: "请使用手机扫描二维码登录",
    activateSystem: "微信登录",
    activationFailed: "激活失败,请检查授权编码!",
    activationSuccess: "激活成功!",
    enterAuthCode: "请输入授权编号激活系统",
    systemNotActivated: "系统未激活",
    activationCode: "激活码",
    activate: "激活",
    or: '或者'
  },

  reset: {
    reset: "重置密码",
    invalid_account: "账号格式不正确",
    empty_verification_code: "验证码不能为空",
    reset_ok: "重置完成?",
    reset_success: "重置成功",
    get_verification_code: "获取验证码",
    seconds_retry: " 秒后重试",
    register: "注册",
    or: "或者",
    login: "去登录",
    if_account: " 如果您已经有帐户",
    email: "账号",
    enter_email: "请输入账号",
    verification_code: "验证码",
    enter_verification_code: "请输入验证码",
    password: "密码",
    enter_password: "请输入密码",
    new_password: "新密码",
    enter_new_password: "请输入新密码",
    confirm_password: "确认密码",
    enter_confirm_password: "请再次输入密码确认",
  },

  voice: {
    play: '播放',
    generate: '生成语音',
    delete: '删除',
    addRole: '添加角色',
    roleName: '角色名称',
    roleNameDescribe: '请输入角色名称',
    roleDescribe: '角色描述',
    roleExplain: '请输入角色描述',
    avatar: '角色头像',
    upload: '点击上传',
    audioSamples: '音频样本',
    prompt1: '请上传一个5MB以内的音频文件',
    prompt2: '*样本语音需大于2秒,样本质量比长度更重要,过长的样本反而可能导致效果不如预期,通常将样本长度控制在5-8秒的最具代表性片段即可。',
    add: '添加',
    generateInfo: '控制语音生成的多样性，值越大，生成的语音将具备更高的表现力上限与随机性范围；应为0到100的整数,建议不小于95',
    stability: '稳定性过滤 (0-100,默认为100)',
    stabilityInfo: '限制在生成过程中仅选择前n个最佳的路径，值越小，生成的语音通常越平淡与稳定，但同时也可能导致表达某些内容或音色时的效果下降或异常；应为1到100的整数，为0时关闭限制，启用时建议不小于40',
    start: '开始生成',
    diversity: '多样性',
    proposal:'建议填写不超过50个字符的单句以保证最佳效果(消耗1元/1000字符)',
    createRole: '创建角色',
    soundMarket: '声音市场',
    playSound: '播放',
    collection: '收藏',
    return: '返回',
    collectionSuccessful: '收藏成功',
    uploudSuccessful: '上传成功',
    operationSuccessful: '操作成功',

  },

  annex: {
    docId: "文档编号",
    docName: "文档名称",
    docType: "文档类型",
    action: "操作",
    uploadAttachment: "上传附件",
    deleteAttachment: "删除附件",
    knowledgeFragment: "知识片段",
    fileUploadSuccess: "附件上传成功！",
    deletionFailed: "删除失败!",
    attachmentDeletedSuccess: "附件删除成功!",
    pleaseUploadFile: "请上传一个10MB以内的文件",
    supportedFormats: "已支持 md、pdf、docx、txt、csv 等文件格式",
    friendlyReminder: "温馨提醒：",
    largeFileWarning: "1. 如果文件较大，上传时间可能较长，请耐心等待。",
    utf8Warning: "2. 上传txt文本，请使用UTF8格式，以避免乱码。",
    uploadCharacterLimit: "3. 单次上传字数建议5万以下，解析1万字大约需要10秒。"
  },

  knowledge: {
    createKnowledgeBase: "创建知识库",
    createYourKnowledgeBase: "在这里创建你的知识库",
    knowledgeName: "知识名称",
    knowledgeDescription: "知识描述",
    enterKnowledgeName: "输入知识名称",
    enterKnowledgeDescription: "输入知识描述",
    add: "添加",
    delete: "删除",
    attachment: "附件",
    id: "ID",
    number: "编号",
    name: "知识名称",
    description: "知识描述",
    actions: "操作",
    return: "返回",
    no: "片段编号",
    content: "片段内容",
  },


  setting: {
    setting: '设置',
    general: '总览',
    advanced: '高级',
    config: '配置',
    avatarLink: '头像',
    balance: '余额',
    grade: '会员等级',
    senior: '高级会员',
    lowlevel: "低级会员",
    personal: "个人中心",
    model: "模型信息",
    message: "消息记录",
    about: "关于我们",
    plan: "订阅计划",
    charge: "收费标准",
    exchange: "兑换卡密",
    recharge: "立即充值",
    name: '名称',
    description: '描述',
    role: '角色设定',
    temperature: 'Temperature',
    top_p: 'Top_p',
    resetUserInfo: '重置用户信息',
    chatHistory: '聊天记录',
    theme: '主题',
    language: '语言',
    api: 'API',
    reverseProxy: '反向代理',
    timeout: '超时',
    socks: 'Socks',
    httpsProxy: 'HTTPS Proxy',
    monthlyUsage: '本月使用量',
  },

  store: {
    unit: '¥',
    redeemKey: "兑换",
    token: "1000个Token大约相当于750个英文单词或400至500个汉字。在按Token计费的模型中，每使用1000个Token将进行一次扣费。",
    input: "请输入卡密",
    day: '天',
    siderButton: '应用市场',
    local: '本地',
    online: '在线',
    title: '标题',
    description: '描述',
    clearStoreConfirm: '是否清空数据？',
    importPlaceholder: '请粘贴 JSON 数据到此处',
    addRepeatTitleTips: '标题重复，请重新输入',
    addRepeatContentTips: '内容重复：{msg}，请重新输入',
    editRepeatTitleTips: '标题冲突，请重新修改',
    editRepeatContentTips: '内容冲突{msg} ，请重新修改',
    importError: '键值不匹配',
    importRepeatTitle: '标题重复跳过：{msg}',
    importRepeatContent: '内容重复跳过：{msg}',
    onlineImportWarning: '注意：请检查 JSON 文件来源！',
    downloadError: '请检查网络状态与 JSON 文件有效性',
    login: '立即登录'
  },


  mjset:{
    server:'服务端'
    ,about:'关于'
    ,model:'模型'
    ,sysname:'熊猫助手'
    ,logout:'退出'
    ,balance:'余额'
  }

  ,mjtab:{
    chat:'对话'
    ,store: "应用"
    ,voice: "声音"
    ,voiceinfo: "创建属于自己的声音"
    ,knowledge: "知识库"
    ,knowledgeinfo: "创建私有知识库"
    ,bot: "机器人"
    ,botinfo: "扫码登录微信机器人"
    ,draw:'绘画'
    ,drawinfo:'AI绘画 Midjourney引擎'
    ,gallery:'画廊'
    ,galleryInfo:'我的画廊'
  }

  ,mjchat:{
    loading:'正在载入图片'
    ,openurl:'直接打开链接'
    ,failReason:'失败原因：'
    ,reload:'重新获取'
    ,progress:'进度：'
    ,wait:'任务已经提交请等待...'
    ,reroll:'重绘'
    ,wait2:'任务 {id} 已经提交请等待'
    ,redrawEditing:'局部重绘编辑'
    ,face:'换脸'
    ,blend:'混图'
    ,draw:'绘图'
    ,submiting:'提交中'
    ,submit:'提交'
    ,wait3:'请勿关闭! 图片生成中...'
    ,success:'保存成功'
    ,successTitle:'成功'
    ,modlePlaceholder:'自定义模型多个用空格隔开，不是必须'
    ,myModle:'自定义模型'
    ,customer:'联系客服'
    ,knowledgeBase: "切换知识库"
    ,historyCnt:'上下文数量'
    ,historyToken:'更多的上下文会使记忆更精确，但会消耗更多的额度'
    ,historyTCnt:'回复数'
    ,historyTCntInfo:'(max_tokens)回复数越大 ,越有可能消耗更多的额度'
    ,role:'角色设定'
    ,rolePlaceholder:'给你的会话设置一个专属的角色，不是必须'
    ,loading2:'正在加载...'
    ,loadmore:'加载更多'
    ,nofind:'未能找到'
    ,nofind2:'相关内容, 你可尝试以下内容'
    ,success2:'切换成功！'
    ,modelChange:'模型切换'
    ,search:'搜索'
    ,searchPlaceholder:'GPTs名字、介绍'
    ,attr:'附件'
    ,noproduct:'画廊还没有您的作品'
    ,myGallery:'我的画廊'
    ,yourHead:'你的头像'
    ,your2Head:'明星图'
    ,tipInfo:'说明：<li>1 图片都必须包含脸，否则出不来图</li> <li>2 “明星图”可以先用mj绘画制作出来</li> <li>3 “明星图”其实动漫图也行</li> <li>4 “你的头像”建议用一寸个人照</li>'
    ,placeInput: '请填写提示词！'
    ,more5sb: '最多上传5张图片'
    ,exSuccess: '导出成功... 请看下载栏'
    ,downloadSave: "ai绘画.txt"
    ,noproducet: "暂时没成熟作品"
    ,imgBili:'图片比例'
    ,imagEx:'作品图片链接导出'
    ,prompt:'提示词'
    ,imgCYes:'含有垫图'
    ,imgCUpload:'自传垫图'
    ,imgCInfo:'垫图说明：<br/> 1.垫图可使用自己的图片作为基础，让MJ来绘图<br/> 2.可以使用多张垫图 最多5张， 单张图片不超过1M<br/>'
    ,imgCadd:'+添加'
    ,del:'删除'
    ,img2text:'图生文'
    ,img2textinfo:'不知如何写提示词？用图生文试试！<br/>提交图片，出提示词'
    ,traning:'翻译中...'
    ,imgcreate:'生成图片'
    ,imginfo:''
    ,tStyle:'风格'
    ,tView:'视角'
    ,tShot:'人物镜头'
    ,tLight:'灯光'
    ,tQuality:'画质'
    ,tStyles:'艺术程度'
    ,tVersion:'模型版本'
    ,dalleInfo:' 说明：   <li>1 dall-e 是openAi提供的画图模型</li>  <li>2 openAi的图片有时效性，请做好备份</li>   <li>3 注意：1790px的图片价格是双倍</li> '
    ,version:'版本'
    ,size:'尺寸'
    ,blendInfo:'说明： <li>1 合成至少2张图片</li> <li>2 最多可传6张图</li> '
    ,blendStart:'开始合成'
    ,no2add:'请勿重复添加图片'
    ,add2more:'请添加两张以上图片'
    ,no1m:'图片大小不能超过{m}M'
    ,imgExt:'图片仅支持jpg,gif,png,jpeg格式'
  },

  mj:{
    setOpen:'OpenAI 相关',
    setOpenPlaceholder:'必须包含 http(s)://'
    ,setOpenUrl:'OpenAI接口地址'
    ,setOpenKeyPlaceholder:'使用自定义 OpenAI Key 绕过密码访问限制'
    ,setMj:'Midjourney 相关'
    ,setMjUrl:'Midjourney接口地址:'
    ,setMjKeyPlaceholder:'使用自定义 Api Secret 绕过密码访问限制'
    ,setUploader:'上传相关'
    ,setUploaderUrl:'上传地址:'
    ,setBtSave:'保存'
    ,setBtBack:'恢复默认'

    ,
    redraw:'局部重绘'
    ,fail1:'客官不要太急嘛，正在加载呢'
    ,success1:'图片刷新成功！'
    ,high_variation:'强变化'
    ,low_variation:'弱变化'
    ,p15:'变焦1.5倍'
    ,p20:'变焦2倍'
    ,p100:'方正'

    ,retry:'重分析'
    ,pan_left:'向左'
    ,pan_right:'向右'
    ,pan_up:'向上'
    ,pan_down:'向下'
    ,up2:'高清2倍'
    ,up4:'高清4倍',

    thinking:'思考中...'
    ,noReUpload:'不能重复上传'
    ,uploading:'上传中...'
    ,uploadSuccess:'上传成功'
    ,uploadFail:'上传失败:'
    ,upPdf:'<span>上传图片、附件<br/>能上传图片、PDF、EXCEL等文档</span><p>支持拖拽</p>'
    ,upImg:'<span><b>上传图片</b><br/>注意：会有额外的图片费用<br/>格式: jpeg jpg png gif</span><p>支持拖拽</p> <p class="pt-2"><b>上传MP3 MP4</b> <br>会自动直接调用 whisper-1 模型<br>格式有：mp3 mp4 mpeg mpga m4a wav webm</p>'
    ,clearAll:'清参数'
    ,czoom:'自定义'
    ,customTitle:'自定义变焦'
    ,zoominfo:'修改zoom值,范围在 1.0~2.0 默认设置为1.8',

    modleSuccess:'模型加载成功'
    ,setingSuccess:'设置成功'

    ,tokenInfo1:'剩余Tokens = 模型长度 - 角色设定 - 上下文(会话历史) - 回复数 - 当前输入'
    ,tokenInfo2:'角色设定留空，系统会给一个默认的'
    ,noSuppertModel:'刷新，暂不支持此模型！'
    ,failOcr:'识别失败'
    ,remain:'剩:'

    ,totalUsage:'订阅总额'
    ,disableGpt4:'已禁用GPT4'
    ,setTextInfo:'OpenAi Api Key 错误，点击这里重新'

    ,attr1:'附'
    ,ulink:'原图链接'
    ,copyFail:'复制失败'
    ,tts:'TTS 文本转语音'
    ,fail:'发生错误'
    ,noSupperChrom:'浏览器不支持！'
    ,lang:'语音'
    ,ttsLoading:'语音转化...'
    ,ttsSuccess:'转化成功'
    ,micIng:'正在录音，说点什么...'
    ,mStart:'开始'
    ,mPause:'暂停'
    ,mGoon:'继续'
    ,mRecord:'重录'
    ,mPlay:'播放'
    ,mCanel:'取消'
    ,mSent:'发送'

    ,findVersion:'发现更新版本'
    ,yesLastVersion:'已是最新版本'
    ,infoStar:'此项目开源于 <a  class="text-blue-600 dark:text-blue-500" href="https://github.com/Dooy/chatgpt-web-midjourney-proxy" target="_blank"> GitHub </a>，免费且基于 MIT 协议，没有任何形式的付费行为！ </p><p>如果你觉得此项目对你有帮助，请在 GitHub 帮我点个 Star，谢谢！'
    ,setBtSaveChat:'保存至会话'
    ,setBtSaveSys: '保存至系统'

    ,wsrvClose:'关闭 wsrv'
    ,wsrvOpen:'开启 wsrv'

    ,temperature:'随机性'
    ,temperatureInfo:'(temperature)值越大，回复越随机'
    ,top_p:'核采样'
    ,top_pInfo:'(top_p)与随机性类似，但不要和随机性一起更改 '
    ,presence_penalty:'话题新鲜度  '
    ,presence_penaltyInfo:'(presence_penalty)值越大，越有可能扩展到新话题'
    ,frequency_penalty:'频率惩罚度'
    ,frequency_penaltyInfo:' (frequency_penalty)值越大，越有可能降低重复字词'

    ,tts_voice:'TTS 语音人物'
    ,typing:'正在输入'

    ,authErro:'授权失败'
    ,authBt:'请重新输入授权访问密码'

    ,micWhisper:'Whisper语音识别'
    ,micAsr:'即时识别'
    ,micRec:'开始录音,请说话！2秒内无声音将自动关闭'
    ,micRecEnd:'录音已结束'

  },

  model: {
    "name": "模型名称",
    "price": "模型价格",
    "type": "计费方式",
    "remark": "备注",
    "content": "消息内容",
    "modelName": "模型名称",
    "totalTokens": "消耗token",
    "deductCost": "扣除费用",
    "msgtime": "创建时间",
    "msgremark": "备注",
  },

	draw: {
		qualityList: {
			general: "一般",
			clear: "清晰",
			hd: "高清",
			ultraHd: "超高清",
		},
		styleList: {
			cyberpunk: "赛博朋克",
			star: "星际",
			anime: "动漫",
			japaneseComicsManga: "日本漫画",
			inkWashPaintingStyle: "水墨画风格",
			original: "原创",
			landscape: "风景画",
			illustration: "插画",
			manga: "漫画",
			modernOrganic: "现代自然",
			genesis: "创世纪",
			posterstyle: "海报风格",
			surrealism: "超现实主义",
			sketch: "素描",
			realism: "写实",
			watercolorPainting: "水彩画",
			cubism: "立体主义",
			blackAndWhite: "黑白",
			fmPhotography: "胶片摄影风格",
			cinematic: "电影化",
			clearFacialFeatures: "清晰的面部特征",
		},
		viewList: {
			wideView: "宽视角",
			birdView: "鸟瞰视角",
			topView: "顶视角",
			upview: "仰视角",
			frontView: "正面视角",
			headshot: "头部特写",
			ultrawideshot: "超广角视角",
			mediumShot: "中景",
			longShot: "远景",
			depthOfField: "景深",
		},
		shotList: {
			faceShot: "脸部特写",
			bigCloseUp: "大特写",
			closeUp: "特写",
			waistShot: "腰部以上",
			kneeShot: "膝盖以上",
			fullLengthShot: "全身照",
			extraLongShot: "极远景",
		},
		stylesList: {
			styleLow: "低强度风格",
			styleMed: "中等强度风格",
			styleHigh: "高强度风格",
			styleVeryHigh: "非常高强度风格",
		},
		lightList: {
			coldLight: "冷光",
			warmLight: "暖光",
			hardLighting: "硬光",
			dramaticLight: "戏剧性光线",
			reflectionLight: "反射光",
			mistyFoggy: "薄雾",
			naturalLight: "自然光",
			sunLight: "阳光",
			moody: "情绪化",
		},
		versionList: {
      mjV7: "MJ V7",
			mjV6: "MJ V6",
			mjV52: "MJ V5.2",
			mjV51: "MJ V5.1",
			nijiV6: "Niji V6",
			nijiV5: "Niji V5",
			nijiV4: "Niji V4",
			nijiJourney: "Niji Journey",
		},
		botList: {
			midjourneyBot: "Midjourney 机器人",
			nijiJourney: "Niji Journey",
		},
		dimensionsList: {
			square: "正方形 (1:1)",
			portrait: "肖像 (2:3)",
			landscape: "风景 (3:2)",
		},
	}


  ,suno:{
    description:"描述模式"
    ,custom:"定制模式"
    ,style:'歌曲风格'
    ,stylepls:'歌曲名称比如:流行音乐'
    ,emputy:'暂无内容'
    ,noly:'无歌词'
    ,inputly:'请输入歌曲名称或歌词'
    ,doingly:"正在执行请稍后."
    ,doingly2: "正在获取歌词..."
    ,title:'歌曲名称'
    ,titlepls:'歌曲名称比如:假期'
    ,desc:'歌曲描述'
    ,descpls:'歌曲描述 比如:关于假期的原声流行音乐'
    ,noneedly:'无需歌词'
    ,rank:'随机获取'
    ,ly:'歌词'
    ,lypls:'歌词:有一定的格式'
    ,generate:'创作歌曲'
    ,generately:'生成歌词'
    ,nodata:'请先创作才有歌曲列表'

    ,menu:'音乐'
    ,menuinfo:'Suno 音乐创作'
    ,server:'Suno 接口地址'
    ,serverabout:'Suno 相关'
    ,setOpenKeyPlaceholder:'Suno API 的相关KEY；可不填'

    ,upMps:'上传音频'
    ,extend:'延伸'
    ,extendFrom:'延伸于'
    ,extendAt:'延伸开始于'
    ,fail:'失败'
    ,info:'说明:<br>上传音频时长必须在6s-60s内'
  }
  ,video:{
    menu:"视频",
    menuinfo:'Luam等 视频创作',
    descpls:'视频创作描述',
    lumaabout:"Luma 相关",
    lumaserver:"Luma 接口地址",
    setOpenKeyPlaceholder:'Luma API 的key, 可不填',
    generate:'生成视频',
    nodata:'暂无可用视频，请先生成！',
    selectimg:'参考图片',
    clear:'清除',
    plsInput:'请输入内容！',
    submitSuccess:'已提交成功！',
    process:'视频生成中...',
    repeat:'重新获取',
  }

}
