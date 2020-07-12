学习笔记
### 这周的学习涉及底层比较多，彻底发现了js中十分薄弱的地方。对于编译部分可以说是一点不懂。
### 1.产生式：我理解的产生式就像是抽离出来的某些规则， 然后js就是按照这种方式进行词法解析， 进而再生成AST树。
#### 不带括号的四则运算
#### <ME> ::= <Number>|<ME>"*"<Number>|<ME>"/"<Number>

#### <AE> ::= <ME>|<AE>"+"<ME>|<AE>"-"<ME>
### 2.现代语言分类
#### 对于语言的分类，之前也是没有考虑过，之前脑子里都是前端和后端语言的分类， 这节课的学习加自己搜索了解到了源于计算机底层的分类方式， 可以更好的了解一种语言，也有助于理解词法分析， 语法分析，运行时等概念。
#### 形式语言按照用途分类：

#### 数据描述语言：JSON, HTML， XAML, XML, SGML, SQL, CSS(less, scss, sass)

#### 编程语言：C, C++, C#, Java，Python, Ruby, go, perl, lisp, T-SQL, Clojure, Haskell, Javascript, ts， VB，VC,delphi, Object-C, swift

#### 形式语言按照表达方式分类

#### 声明式：JSON, HTML, SGML, XML, XAML, SQL, CSS(Less, Scss, Sass), lisp, clojure, haskell

#### 命令型：C, C++, JAVA, C#,Python, Ruby, Perl, Javascript, ts，go, T-SQL, VB,VC,  delphi, Object-C, swift

#### 计算机语言分类：

#### 机器语言-二进制代码

#### 汇编语言-面向机器的程序涉及语言

#### 高级语言-按照转换方式可分为编译型语言和解释型语言；按照客观系统描述分为面向过程语言和面向对象语言；按照变成规范分为：1.命令式语言 2.函数式语言 3 逻辑式语言 4面向对象语言

#### 编译型语言： C, C++, Pasccal, Delphi, Object-C, swift

#### 解释性语言： Java, javascript, perl, python, ruby, matlab

#### 脚本语言： python, javascript, asp, php, perl

#### 动态类型语言：Python、Ruby、Erlang、JavaScript、swift、PHP、Perl

#### 静态类型e语言： C、C++、C#、Java、Object-C，delphi 

#### 强类型语言：Java、C#、Python、Object-C、Ruby，go, ts, delphi

#### 若类型语言： js, php， vb

#### 面向对象的语言： java, c++, C#, python, simula 67, Smalltalk, EIFFEL

#### 面向过程的语言： c,vc, Fortran

### 3.数据类型和js对象部分
#### 这部分中， 我收获比较大的就是编码方式这块，之前对于编码统一直是茫然的追随 ， 现在了解了 ASCII，Unicode， GB 三者出现的场景，应用场景和关系，ASCII 针对的是英文， Unicode 是联合所有的，GB 是国标， 就是根据国家的标准写的， GB和unicode 不兼容， 但是都兼容ASCII,GB 编码比Unicode 省空间。编码规则： UTF-8 默认用8个bit 表示一个字节，UTF-16 默认用16个b表示一个字节

#### 经典题 0.1+ 0.2 不等于 0.3， 因为计算机不是按照10进制计算的 ， 都是转换成二进制，再进行计算 ， 在转换成二进制的过程中， 因都出现循环， 最后精度丢失， 导致和0.3的二进制不相同

#### js 采用的是IEEE 754 双精度浮点表示法， 表示方式为 sign(1)+ Exponent(11) + Fraction(52),即一个符号位， 11个指数位， 52个精度位。
#### 此部分学习中遇到的坎为： 对于转换指数位的时候 ， 一直算不对， 正确算法是： 真是指数 + 2**（n-1）-1 ，最后转换成2进制填充指数位

### 4. 对于js 标准里具有特殊类型的对象-还不是很理解，思考时没方向， 没思路
#### Array：Array 的 length 属性根据最大的下标自动发生变化。
#### Object.prototype：作为所有正常对象的默认原型，不能再给它设置原型了。
#### String：为了支持下标运算，String 的正整数属性访问会去字符串里查找。
#### Arguments：arguments 的非负整数型下标属性跟对应的变量联动。
#### 模块的 namespace 对象：特殊的地方非常多，跟一般对象完全不一样，尽量只用于 import 吧。
#### 类型数组和数组缓冲区：跟内存块相关联，下标运算比较特殊。
#### bind 后的 function：跟原来的函数相关联。

