/**
 * sPromise constructor
 */
function sPromise (executor) {
  this.status = 'pending'; // pending / fulfilled / rejected
  this.value = null;
  this.reason = null;
  this.onfulfilledFunc = Function.prototype; // used to save async func
  this.onrejectedFunc = Function.prototype;

  const resolve = (value) => {
    /** only when previous status was pending can change status */
    if (this.status === 'pending') {
      this.value = value;
      this.status = 'fulfilled';
      // execute passed onfulfilledFunc
      this.onfulfilledFunc(this.value);
    }
  }

  const reject = (reason) => {
    if (this.status === 'pending') {
      this.reason = reason;
      this.status = 'rejected';
      // execute passed onrejectedFunc
      this.onrejectedFunc(this.reason);
    }
  }

  executor(resolve, reject);
}


sPromise.prototype.then = function (onfulfilled, onrejected) {
  onfulfilled = typeof onfulfilled === 'function' ? onfulfilled : data => data;
  onrejected = typeof onrejected === 'function' ? onrejected : error => { throw error };

  if (this.status === 'fulfilled') {
    onfulfilled(this.value);
  }
  if (this.status === 'rejected') {
    onrejected(this.reason);
  }
  // save func
  if (this.status === 'pending') {
    console.log('executing pending');
    this.onfulfilledFunc = onfulfilled;
    this.onrejectedFunc = onrejected;
  }
}

const promiseTest = new sPromise((resolve, reject) => {
  setTimeout(() => {
    resolve('data');
  }, 2000);
})
promiseTest.then(data => {
  console.log(data);
})