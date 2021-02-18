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
    return new sPromise((resolve, reject) => {
      setTimeout(() => {
        try {
          const result = onfulfilled(this.value);
          resolve(result);
        } catch (e) {
          reject(e);
        }
      })
    }) 
  }
  // only when status changed to rejected can be executed
  if (this.status === 'rejected') {
    return new sPromise((resolve, reject) => {
      setTimeout(() => {
        try {
          const result = onrejected(this.reason);
          resolve(result);
        } catch (e) {
          reject(e);
        }
      })
    })
  }
  // save func
  if (this.status === 'pending') {
    return new sPromise((resolve, reject) => {
      this.onfulfilledFuncArray.push(() => {
        try {
          let result = onfulfilled(this.value);
          resolve(result);
        } catch (e) {
          reject(e);
        }
      })
      this.onrejectedFuncArray.push(() => {
        try {
          let result = onrejected(this.reason);
          resolve(result);
        } catch (e) {
          reject(e);
        }
      })
    })
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
// promiseTest.then(data => {
//   console.log('1' + data);
// })
// promiseTest.then(data => {
//   console.log('2' + data);
// })

promiseTest.then(data => {
  console.log(data);
  return new sPromise((resolve, reject) => {
    setTimeout(() => {
      resolve('hhh');
    }, 4000);
  })
})
.then(data => {
  console.log(data);
})