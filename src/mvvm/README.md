# MVVM

> 此项目为仿 Vue 的 MVVM的MVVM框架

### Balabala

常见的数据绑定实现：

* 数据劫持(vue)：利用 ES5 的 Object.defineProperty 劫持数据属性的 setter 和 getter
* 脏值检测(angular)：通过特定事件比如 `input`、`change`、`xhr请求` 等进行脏值检测
* 虚拟 DOM 树(react)：更新虚拟 DOM 重新渲染

本项目为仿 Vue 的 MVVM，下图为双向数据绑定的流程图

![示意图](https://i.loli.net/2018/08/11/5b6ecb5c0a6ae.png)

大致实现如下：

* 实现 Observer 对数据进行劫持，通知数据的变化
* 实现 Compile 对指令(如: v-指令、{{}} 等)进行解析、初始化视图
* Compile 在初始化视图时，创建 Watcher 订阅当前的渲染数据，绑定更新函数
* 实现 Watcher ，创建初始化时，调用数据属性的 get ，让 Dep 添加 Watcher，令其在调用 set 的时候通知 Watch 更新视图
* MVVM 创建 Observer 劫持数据，创建 Compile 解析绑定的 DOM 元素，联系三者

### 代码解析

![](https://i.loli.net/2018/08/11/5b6ed6fc26b4d.jpeg)

### 已实现内容

* 指令：v-on、v-html、v-model
* 数据：{{ data }}、{{ Object.key }}、{{ Array[index] }}
* 函数：(无参数) function、(有参数) function(arg1, arg2, ...)

* defineProperty 监听数据的 set 和 get
* 重写“被监听数据”的数组操作(不重写原生)
* 重写MVVM实例的 set 和 get，使得 this 可直接获取或设置 data 属性

* 用文档碎片 fragment，优化对 dom 的操作

### 待实现内容

* 指令：v-for、v-if、v-class
* 数据：{{ Array[index]\[index]\[...] }}
