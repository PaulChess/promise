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
  // only when status changed to fulfilled can be executed
  if (this.status === 'fulfilled') {
    onfulfilled(this.value);
  }
  // only when status changed to rejected can be executed
  if (this.status === 'rejected') {
    onrejected(this.reason);
  }
  // save func
  if (this.status === 'pending') {
    this.onfulfilledFuncArray.push(onfulfilled);
    this.onrejectedFuncArray.push(onrejected);
  }
}


// test
// when new Promise, you passed executor
// function then passed is what you want to do when success or failed
const promiseTest = new sPromise((resolve, reject) => {
  setTimeout(() => {
    resolve('data')
  }, 2000)
})
promiseTest.then(data => {
  console.log('1' + data);
})
promiseTest.then(data => {
  console.log('2' + data);
})