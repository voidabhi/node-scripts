const _ = require('ramda');

const successResult = {
  score: 1500
}

const failureResult = {
  score: 500
}

const highScore = result => result.score >= 1000;

const doSomethingA = emailData =>
  new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log('Result of doSomethingA');
      resolve(failureResult);
    }, 1000)
  });

const doSomethingB = emailData =>
  new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log('Result of doSomethingB');
      resolve(successResult);
    }, 1000)
  });

const runUntil = R.curry((functionsList, stopPredicate, functionArguments) => {
  if (!Array.isArray(functionArguments)) {
    functionArguments = [functionArguments];
  }
  const nextFunction = _.head(functionsList);
  if (!nextFunction) {
    return false;
  }
  return nextFunction(...functionArguments)
    .then(result => {
      if (stopPredicate(result)) {
        console.log('success');
        return result;
      }
      console.log('skipping as predicate failed')
      return runUntil(functionsList.slice(1), stopPredicate, functionArguments);
    });
});

const myProcedure = runUntil([doSomethingA, doSomethingB], highScore);
myProcedure({});
