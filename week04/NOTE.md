学习笔记

### 状态机
#### 状态机， 可以使用一个函数返回一个状态， 进而根据状态再去做下一步的判断
### HTTP 协议解析
#### ISO-OSI 七层网络模型
##### 物理层-数据链路层-网络-传输-会话-表示-应用
##### 4g/5g/wifi(物理层、数据链路层)-internet(网络)-TCP(传输)-HTTP
#### TCP、IP基础知识： 流(没有明显的分割单位， 只保证传输顺序是正确的)，端口， require('net'), 包， IP地址， libnet/libcap
#### HTTP: request， require
#### HTTP 的 Content-type 决定了dody的格式
#### HTTP请求总结
##### 1.设计一个HTTP请求的类
##### 2.Content type 是必要字段， 要有默认值
##### 3.body 是key ，value 格式
##### 4.不同的content-type 影响body 的格式
#### send 函数总结
##### 1. 在Requset 的构造器中收集必要的信息
##### 2. 设计一个send 函数 ， 把请求真实发送到服务器
##### 3. send 函数是异步的， 应该返回promise
#### 第三步发送请求
##### 1. 设计支持已有的connection或者自己新建connection
##### 2. 收到数据传给parser
##### 3. 根据parser的状态resolve Promise
#### 第四步 ResponseParse 总结
##### 1. Response必须分段构造 ， 所以我们用一个ResponseParser 来'装配'
##### 2. ResponseParser 分段处理ResponseText，我们用状态机来分析文本结构
#### HTML 解析
##### parser 接受 HTML 文本作为参数， 返回一棵dom树
##### 用FSM 实现HTML 的解析； 在HTML 的标准中已经规定了HTML的状态
##### 主要标签有： 开始标签， 结束标签，自封闭标签
##### 在标签结束状态提交标签token
##### 属性值分为单引号，双引号， 无引号三种， 处理属性的方式和标签类似； 属性结束时， 我们把属性加到标签的token上
