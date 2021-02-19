/**
 * sPromise constructor
 */
function sPromise (executor) {
  this.status = 'pending'; // pending / fulfilled / rejected
  this.value = null;
  this.reason = null;
  this.onfulfilledFuncArray = [];
  this.onrejectedFuncArray = [];

  const resolve = (value) => {
    if (value instanceof Promise) {
      return value.then(resolve, reject);
    }
    // in order to ensure task is microtask
    // 加setTimeout的目的是为了让主线程的任务和微任务跑完再执行宏任务
    setTimeout(() => {
      /** only when previous status was pending can change status */
      if (this.status === 'pending') {
        this.value = value;
        this.status = 'fulfilled';
        // execute passed onfulfilledFunc
        this.onfulfilledFuncArray.forEach(func => {
          func(value);
        })
      }
    })
  }

  const reject = (reason) => {
    setTimeout(() => {
      if (this.status === 'pending') {
        this.reason = reason;
        this.status = 'rejected';
        // execute passed onrejectedFunc
        this.onrejectedFuncArray.forEach(func => {
          func(reason);
        })
      }  
    })
  }

  try {
    executor(resolve, reject);
  } catch(e) {
    reject(e);
  }
}


sPromise.prototype.then = function (onfulfilled, onrejected) {
  onfulfilled = typeof onfulfilled === 'function' ? onfulfilled : data => data;
  onrejected = typeof onrejected === 'function' ? onrejected : error => { throw error };
  let promise2 = new sPromise((resolve, reject) => {
    if (this.status === 'fulfilled') {
      console.log('onfulfilled');
    }
    if (this.status === 'rejected') {
      console.log('onrejected');
    }
    if (this.status === 'pending') {
      this.onfulfilledFuncArray.push(onfulfilled);
      this.onrejectedFuncArray.push(onrejected);
    }
  })
  return promise2;
}


// test
// when new Promise, you passed executor
// function then passed is what you want to do when success or failed
const promise = new sPromise((resolve, reject) => {
  setTimeout(() => {
    resolve('lucas');
  }, 2000);
})
promise.then(data => {
  console.log(data);
})