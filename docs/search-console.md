# Search Console 上线操作

当前状态（2026年11月13日）：用户已验证域名所有权，并已提交站点地图，暂时还没有 GSC 收录数据。提交后的「成功」状态与实际收录数量尚待报告更新确认。代码不会代替用户执行 Google 账号操作，也不会自动请求收录。

## 1. 提交站点地图

在 Google Search Console 选择正确的资源，打开左侧「站点地图」。

- 网域资源（largeprintcrosswords.com）：填写完整地址 `https://largeprintcrosswords.com/sitemap.xml`。
- 如果输入框已经显示 `https://largeprintcrosswords.com/` 前缀，只填写 `sitemap.xml`。

点击提交。本站生成的地图包含 414 个规范网址：400 个可玩的谜题页、8 个主要站点页面及六个兴趣合集（圣诞、体育、音乐、地理/州首府、美国历史、得州）。800 个打印/答案页面、旧版存档和 404 页面不在地图中，并标记为 noindex。

「成功」说明 Google 能读取站点地图，不等于所有页面已被收录。如果显示抓取失败，记录实际错误和时间，再检查正式域名 HTTPS、重定向、响应状态及是否误开访问保护。

## 2. 检查几个代表页面

使用「网址检查」分别检查：

- `https://largeprintcrosswords.com/`
- `https://largeprintcrosswords.com/printable/`
- `https://largeprintcrosswords.com/crosswords/garden-days/`
- `https://largeprintcrosswords.com/music-crosswords/`
- `https://largeprintcrosswords.com/sports-crosswords/`
- `https://largeprintcrosswords.com/geography-crosswords/`
- `https://largeprintcrosswords.com/american-history-crosswords/`
- `https://largeprintcrosswords.com/texas-crosswords/`
- `https://largeprintcrosswords.com/christmas-crosswords/`
- `https://largeprintcrosswords.com/crosswords/winter-holiday-crafts/`

可以先运行「测试实际网址」，查看抓取、渲染和是否允许索引。页面适合索引时可点击「请求编入索引」。不必逐一手动请求全部 400 道题，也不要把打印/答案页作为收录目标。

2026年11月14日新增了圣诞专题，站点地图地址保持不变，不必因内容更新而反复提交。打印大小使用同一打印网址的 `layout` 参数，仍保持 noindex 和不带参数的 canonical。

带 `q`、`theme` 的合集网址用于分享筛选结果，canonical 指向不带参数的合集主页；它们不进入站点地图，也不需要单独请求收录。

## 3. 核对站点地址

规范地址使用 HTTPS、不带 www：`https://largeprintcrosswords.com/`。

如同时启用了 www，需在 Cloudflare 配置到不带 www 地址的永久重定向，并保留路径和查询参数；是否已经配置，需要线上实际检查。pages.dev 临时域名也应与正式域名保持一致的规范链接。代码已使用正式域名 canonical，但 canonical 不等于 HTTP 重定向。

## 4. 有数据后再决定扩充方向

当 Search Console 开始出现数据时，导出「效果 → 搜索结果」：

- 国家：美国；搜索类型：网页。
- 时间：最近 7 天，之后再比较 28 天。
- 查询词和页面：保留点击、曝光、CTR、平均排名。
- 「网页索引编制」中若有未收录页面，附原因及示例网址。

以真实曝光和使用情况决定主题扩充，不根据关键词排列组合批量复制页面。搜索引擎是否收录、何时收录及最终排名由其系统决定。

## 本环境的限制

当前运行环境的出站白名单尚未包含正式域名。此前访问在连接网站之前即被云环境代理拒绝。本次没有 Google Search Console 账号连接或网址检查工具；GSC 内的实际抓取与索引状态尚未实测。局部构建验证不能替代正式站点的 DNS、TLS、HTTP 和 Google 抓取验证。


## 本次优先做的实际网址测试

在 GSC 顶部逐个粘贴以下网址，选择「测试实际网址」：

1. `https://largeprintcrosswords.com/`
2. `https://largeprintcrosswords.com/christmas-crosswords/`
3. `https://largeprintcrosswords.com/crosswords/winter-holiday-crafts/`

记录测试时间、抓取是否成功、是否允许索引、网页截图是否出现实际内容，以及具体失败原因。已索引报告出现后，再比较用户声明与 Google 选择的规范网址。这里列的是待用户在账号内执行的检查，代码与本地测试没有替代这些操作。
