# promise
### 补充知识点：任务队列
1. 宏任务和微任务
一般情况下, 宏任务(macroTask)包括以下内容:
* setTimeout
* setInterval
* I/O
* 事件
* postMessage
* setImmediate(Node.js中的特性，浏览器端已放弃此api)
* requestAnimationFrame
* UI渲染
微任务(microTask)包括以下内容:
* Promise.then
* mutationObserver
* process.nextTick
<code>每次主线程执行栈为空的时候，引擎都会优先处理微任务队列，处理完微任务队列中的所有任务再处理宏任务。</code>
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