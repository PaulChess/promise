# promise
### 补充知识点：任务队列
1. 宏任务和微任务  
   
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;一般情况下, 宏任务(macroTask)包括以下内容:
* setTimeout
* setInterval
* I/O
* 事件
* postMessage
* setImmediate(Node.js中的特性，浏览器端已放弃此api)
* requestAnimationFrame
* UI渲染  
  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;微任务(microTask)包括以下内容:  
* Promise.then
* mutationObserver
* process.nextTick
<code>每次主线程(同步任务)执行栈为空的时候，引擎都会优先处理微任务队列，处理完微任务队列中的所有任务再处理宏任务。</code>
```javascript
// 🌰 1:
console.log('start here');

setTimeout(() => {
  console.log('setTimeout');
}, 0);

new Promise((resolve, reject) => {
  resolve('promise result');
}).then(value => { console.log(value) });

console.log('end here')

// 输出结果
//start here
//end here
// promise result
// setTimeout
```

```javascript
// 🌰 2:
console.log('start here');

const foo = () => (new Promise((resolve, reject) => {
  console.log('first promise constructor');

  // new Promise的时候就会执行里面的方法
  let promise1 = new Promise((resolve, reject) => {
    console.log('second promise constructor');

    setTimeout(() => {
      console.log('setTimeout here');
    }, 0); // 宏任务
    resolve('promise1');
  })
  
  resolve('promise0');

  promise1.then(arg => {
    console.log(arg);
  }) // 微任务
}))

foo().then(arg => {
  console.log(arg);
}) // 微任务

console.log('end here');

// 输出结果
// start here
// first promise constructor
// second promise constructor
// end here
// promise1
// promise0
// setTimeout here
```

```javascript
// 🌰 3:
console.log('start here');

new Promise((resolve, reject) => {
  console.log('first promise constructor');
  resolve();
})
  .then(() => { // 放入微任务队列
    console.log('first promise then');
    return new Promise((resolve, reject) => {
      console.log('second promise');
      resolve();
    })
      .then(() => { // 放入微任务队列
        console.log('second promise then');
      })
  })
  .then(() => { // 放入微任务队列
    console.log('another first promise then');
  }) // 任务置于返回的新Promise(即第2个Promise)的then方法之后

console.log('end here');

// 输出:
// start here
// first promise constructor
// end here
// first promise then
// second promise
// second promise then
// anther first promise then
```


### 补充知识点: setTimeout相关考察
开胃菜🌰
```javascript
setTimeout(() => {
  console.log('setTimeout block')
}, 100)

while(true) {

}

console.log('end here)

// 结果: 无任何输出
// 因为while循环一直占用主线程
```

```javascript
setTimeout(() => {
  while(true) {

  }
}, 0);
console.log('end here);

// 输出: end here
```
同步任务和异步任务:
* 同步任务: 当前主任务要消化执行的任务，这些任务一起形成执行栈(execution context stack)
* 异步任务: 不进入主线程，而是进入任务队列(task queue), 等待执行: 包括<code>微任务</code>、<code>宏任务</code>

例题1 🌰:
```javascript
const t1 = new Date();
setTimeout(() => {
  const t3 = new Date();
  console.log('setTimeout block');
  console.log('t3 - t1', t3 - t1);
}, 100);

let t2 = new Date();

while(t2 - t1 < 200) {
  t2 = new Date();
} // 执行200ms

console.log('end here')

// 步骤1: 执行t1
// 步骤2: 将setTimeout里面的函数丢到task queue中
// 步骤3: 执行200ms的t2 = new Date
// 输出 end here
// 输出 setTimeout block
// 输出t3 - t1 = 200 !!!
```

例题2 🌰: 最小延迟时间
```javascript
setTimeout(() => {
  console.log('here 100');
}, 1);

setTimeout(() => {
  console.log('here 2');
}, 0);

// 最小延迟时间:
// 这两个setTimeout谁先进入任务队列，谁就会先执行，没有严格1ms和0ms的区分
// 在1ms以内的定时都以最小延迟时间处理。此时，谁在代码顺序上考前，谁就会在主线程空闲时优先执行。
// NDN上给出的最小延迟时间4ms。这些都依赖于规范的制定和浏览器的实现。
// 这个只需了解概念，不用钻牛角尖🐂
```