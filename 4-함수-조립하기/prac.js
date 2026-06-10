

// let once = function(func) {
//   // 함수를 전해 받는다, flag, result 클로저 생성.
//   var flag, result
//   return function() {
//     if (flag) return result
//     // 처음 
//     flag = true
//     return (result = func.apply(this, arguments))
//   }
// }

// var a = once(function() {
//   console.log('A')
//   return 'B'
// })

// console.log(a())
// console.log(a())
// // a함수가 두번째 실행 되었을 때, once의 인자로 전해진 함수가 실행되지 않았다.
// // once의 리턴값을 기억하고 반환해 주는것 같다.

let myOnce = function (func) {
  let flag, result;
  return function() {
    if(flag) return result
    flag = true
    // return (result = func.apply(this, arguments))
    return (result = func())
  }
}

let myA = myOnce(function () {
  console.log('hi')
  return 'hey'
})

console.log(myA("abel", 'ko'))
console.log(myA())