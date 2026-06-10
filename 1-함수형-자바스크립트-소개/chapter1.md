# Introduce Funcitonal programming

## 함수형 프로그래밍이란?

> 부수 효과를 멀리하고, 조합성을 강조하는 패러다임(오류를 줄이고, 조합성과 모듈화 수준을 높이기 위해)



이렇게 말로만 하면, 난해하다 생각 될 것이다. 예제를 함께 보자 :)

```javascript
function addMaker(a) {
    return function(b) {
        return a + b;
    }
}
addMaker(10)(5); // 15
// (function(b) { return 10 + b; })(5) 리턴된 함수를 즉시실행 한다고 생각하면된다.

var add5 = addMaker(5);
add5(3); // 8
add5(4); // 9

var add3 = addMaker(3);
add3(3) // 6
add3(4) // 7
```

이 함수를 가만히 살펴 보면,

> - 함수의 리턴 값이 함수이다(위의 코드 에서는 익명함수를 리턴하고 있다)
> -  `addMaker()` 함수의 인자가, 리턴 값의 함수에서 기억 되어지고 있는것 같다.

이것이 함수형 프로그래밍에서 말하는 **'값으로서의 함수'** 와 **'클로저'**를 이용한 스타일의 예시이다.

아직 이러한 방식들이 익숙하지 않을텐데, 몇가지 예시를 통해 좀 더 익숙해져 보도록 하자 ;)









## 함수형 자바스크립트의 실용성

>  절차지향적으로 작성된 코드를 함수형으로 리팩토링 하면서 함수형 프로그래밍에 익숙해지고, 이점들을 알아보자

### 회원 목록 중 여러 명 찾기

```javascript
var users = [
    { id: 1, name: "ID", age: 32 },
    { id: 2, name: "HA", age: 25 },
    { id: 3, name: "BJ", age: 32 },
    { id: 4, name: "PJ", age: 28 },
    { id: 5, name: "JE", age: 27 },
    { id: 6, name: "JM", age: 32 },
    { id: 7, name: "HI", age: 24 },
];

// users 데이터에서 나이가 30 미만인 user만 temp_users에 담는다. (필터링)
var temp_users = [];
for (var i = 0, len = users.length; i < len; i++) {
    if (users[i].age < 30) temp_users.push(users[i]);
}
console.log(temp_users.length); // 4

// temp_users의 user들의 나이만 ages배열에 담는다.
var ages = [];
for (var i = 0, len = temp_users.length; i < len; i++) {
    ages.push(temp_users[i].age);
}
console.log(ages); // [25, 28, 27, 24]
```



**리팩토링을 해보자**

> *리팩토링의 핵심은 <u>중복을 제거</u>하고 <u>의도를 드러내는 것</u>이다.*

1. 중복을 제거하자

```javascript
var newArr = [];
for (var i = 0, len = dataArr.length; i < len; i++) {
    if(somethingBoolean) somethingLogic
}
```

둘다 이런 형식으로 되어 있고, 중복인 코드가 꽤 있는 상황이다. 보통 리팩토링을 할 때 가장 기초적으로 변수를 만들어 중복되는 값을 처리해주는데, `if(somethingBoolean) somethingLogic` 이부분은 어떻게 해야할지 모르는 경우가 있다. 어떻게 리팩토링 하는지 살펴보자.



#### for에서 filter로, if에서 predicate로

```javascript
function filter(list, predicate) {
    var new_list = [];
    for (var i = 0, len = list.length; i < len; i++) {
        if(predicate(list[i])) new_list.push(list[i]);
    }
    return new_list;
}
```

**filter 함수를 살펴보자!**

> - 인자로 list(array)와 predicate(function)를 받는다.
>
> - predicate (function)  
>   - list의 i번째(index) 값을 인자로 넣어준다.
>   - boolean 값을 return 하는 함수이다. 
>
> - 기존 list 배열의 데이터는 바꾸지 않고, new_list를 만들어 <u>**새로운** 배열을 반환</u>한다.
>
>    > 이전 값의 상태를 바꾸지 않고 새로운 값을 반환하는것. 어디서 많이 보지 않았나? react의 `setState()`, redux의 reducer 에서 이러한 기법을 사용한다. 
>
> - list의 길이만큼 for loop으로 순회 하면서 **predicate 함수의 값이 참일 경우에만** new_list에 push해준다.
>
>    > `new_list.push(list[i])` 코드가 실행될 여부를 <u>predicate 함수에게 완전히 위임</u>했다. filter함수는 predicate 함수 내부에서 어떤 일을 하는지 모른다. **관심사가 분리** 된것이고, 이러한 기법은 filter함수의 <u>재사용성을 높여준다</u>!
>
> **참고**  *predicate: 술부(John went home에서 went home처럼, 문장 속에서 주어에 대해 진술하는 동사 이하 부분)*



**filter를 적용한 코드**

```javascript
function filter(list, predicate) {
    var new_list = [];
    for (var i = 0, len = list.length; i < len; i++) {
        if(predicate(list[i])) new_list.push(list[i]);
    }
    return new_list;
}

var usersUnder30 = filter(users, user => user.age < 30);
console.log(usersUnder30.length); // 4
```

크으으으 아름답지 않은가?  코드가 짧아지고, 읽는 사람 입장에서도 편하고 의미가 잘 전달된다.(arrow함수도 한 몫함)



#### 함수형 프로그래밍 관점으로 filter 보기

filter 함수는 동일한 인자가 들어오면 항상 동일하게 동작한다. => **순수함수**

filter 함수의 로직은 외부나 내부의 어떤 상태 변화에도 의존하지 않는다. => <u>의존성 낮음, 결합도(coupling) 낮음</u>. **유지보수**에 용이 하다

|  방법론  | 특징                                                         |
| :------: | :----------------------------------------------------------- |
| 절차지향 | 위에서 아래로 내려가면서 특정 변수의 값을 변경 하는 식으로 로직을 만든다. |
| 객체지향 | - 객체들을 만들어 놓고 객체들 간의 협업을 통해 로직을 만든다.<br />- 이벤트 등으로 서로를 연결하고 상태변화를 감지하여 스스로 자신의 값을 변경한다 <br />- 상대의 메서드를 직접 실행하여 상태를 변경하는 식으로 프로그래밍한다. |
|  함수형  | - 항상 동일하게 동작하는 함수와 보조함수를 <u>조합</u>하는 식으로 로직을 만든다.<br />- 내부에서 관리하는 상태를 따로 두지 않는다. (넘겨진 인자에만 의존한다) <br />- 동일한 인자가 들어오면 항상 동일한 값을 리턴한다.<br />- 부수효과를 최소화하는 것을 지향한다. |





#### map함수

기존 코드를 리팩토링 해보자.



**기존코드**

```js
console.log(usersUnder30.length) // 4

var ages = [];
for (var i = 0, len = usersUnder30.length; i < len; i++) {
    ages.push(usersUnder30[i].age);
}
console.log(ages); // [25, 28, 27, 24]
```



**map을 사용하여 리팩토링**

```js
function map(list, iteratee) {
    var newList = [];
    for (var i = 0, len = list.length; i < len; i++) {
        newList.push(iteratee(list[i]))
    }
    return newList;
}

var usersUnder30 = filter(users, user => user.age < 30);
var ages = map(usersUnder30, user => user.age);
console.log(ages); // [25, 28, 27, 24]
```

map함수의 입장에서, 무엇을 push할지에 대해 iteratee 함수에게 위임했다.

ages를 얻는 코드를 보면 `for`나 `if`가 없다. 단순해졌다.



**실행 결과로 바로 실행하기**

<u>함수의 리턴값을 바로 다른 함수의 인자로 사용하면</u> 변수 할당을 줄일 수 있다.

*filter 함수의 결과가 배열이므로 map의 첫 번째 인자로 사용 가능하다*

```js
var ages = map(
    filter(users, function(user) { return user.age < 30 }),
    function(user) { return user.age});
```

> 개인적인 생각으로는, 위의 코드는 읽기에 그리 편한거 같지는 않다.
>
> array의 메서드인 filter와 map을 사용하면 체이닝을 통해 의미를 더 잘 전달할 수 있지 않을까?

```js
var ages = users
			.filter(user => user.age < 30)
			.map(user => user.age)
```

> *아래처럼 할 수도 있당*

```js
const isUnderAge30 = user => user.age < 30
const bvalue = key => obj => obj[key] // bvalue의 실행 결과는 key를 기억하는 함수이다.

var ages = users.filter(isUnderAge30).map(bvalue('age'))
```



**pipe**





## 함수형 자바스크립트의 실용성 2

### 회원 목록 중 한 명 찾기

**filter로 한 명 찾기**

```js
var users = [
    { id: 1, name: "ID", age: 32 },
    { id: 2, name: "HA", age: 25 },
    { id: 3, name: "BJ", age: 32 },
    { id: 4, name: "PJ", age: 28 },
    { id: 5, name: "JE", age: 27 },
    { id: 6, name: "JM", age: 32 },
    { id: 7, name: "HI", age: 24 },
];

console.log(
    filter(users, user => user.id === 3)[0]
); // { id: 3, name 'BJ', age: 32}
```

filter는 한 명 찾는거에는 효율적이지 못하다. 전체를 loop돌기 때문에, 그리고 동일 조건의 값이 여러개이면 여러개를 리턴한다.





>  좀 더 효율적이게 만들어 보자!

**break**

```js
var user;
for (var i = 0, len = users.length; i < len; i++) {
    if(users[i].id === 3) {
        user = users[i]
        break
    }
}
console.log(user);
// { id: 3, name: 'BJ', age: 32 }
```

원하는 user를 찾으면 바로 loop를 빠져나온다! 그러나 절차지향적이고, 재사용이 불가능한 상태이다 ㅠ





>  재사용이 가능하게 만들어 보자!

**findById**

```js
function findById(list, id) {
    for(var i = 0, len = list.length; i < len; i++) {
        if(list[i].id == id) return list[i];
    }
}
console.log( findById(users, 3) ); // { id: 3, name: 'BJ', age: 32 }
```

훨씬 나아졌다. id가 동일한 객체를 만나면 그 값을 반환함과 동시에 함수도 종료되고 for도 종료 된다!





> *그런데 만약 findById뿐 아니라 findByName, findByAge 함수도 만든다면 중복이 생길텐데 어떻게 할 수 있을까?*
>
> 인자를 하나 더 늘리면 해결할 수 있다!

**findBy**

```js
function findBy(key, list, val) {
    for (var i = 0, len = list.length; i < len; i++) {
        if(list[i][key] === val) return list[i];
    }
}
console.log( findBy('name', users, 'BJ') ) // { id: 3, name: 'BJ', age: 32 }
console.log( findBy('id', users, 2) ) // { id: 2, name: 'HA', age: 25 }
console.log( findBy('age', users, 28) ) // { id: 4, name: 'PJ', age: 28 }
```

*참고 : `list[i][key]`에서 bracket notation을 통하여 값에 접근하고 있다.*

findBy는 <u>key로 value를 얻을 수 있는 객체</u>들을 가진 배열이라면 무엇이든 받을 수 있다!





> 좋아지긴 했지만 다음과 같은 상황을 지원하지 못하는 아쉬움이 있다.
>
> - key가 아닌 메서드를 통해 값을 얻어야 할 때
> - 두 가지 이상의 조건이 필요 할 때
> - ===이 아닌 다른 조건으로 찾고자 할 때



#### 값에서 함수로

> filter나 map처럼 인자로 키와 값 대신 함수를 사용하면, <u>모든 상황에 대응 가능한</u> find 함수를 만들 수 있다.



**find**

```js
function find(list, predicate) {
    for(var i = 0, len = list.length; i < len; i++) {
        if (predicate(list[i])) return list[i];
    }
}

console.log(
	find(users2, u => u.getAge() == 25;).getName()
) // HA
console.log(
	find(users, u => u.name.indexOf('P') != -1;)
) // { id: 4, name: 'PJ', age: 28 }
console.log(
	find(users, u => u.age == 32 && u.name == 'JM')
) // { id: 6, name: 'JM', age: 32 }
console.log(
	find(users2, u => u.getAge() < 30;).getName()
)
```

값 대신 함수를 받음으로써, if 안쪽에서 할 수 있는 일이 정말 많아졌다. if의 조건을 predicate를 통하여 find함수 밖으로 뺏기 때문.

find는 배열에 어떤 값이 들어 있든 사용할 수 있게 되었다!

- 전달 받을 데이터와 데이터의 특성에 맞는 보조 함수(predicate)도 함께 전달 받는다
- 들어온 데이터의 특성은 보조 함수가 대응해 주기 때문에 find 함수는 데이터의 특성에서 완전히 분리될 수 있다.
- 다형성, 안정성을 높인다!



>  **함수형 프로그래밍은, <u>보조 함수를 통해 완전히 위임</u>하는 방식을 취한다. 이는 더 높은 <u>다형성</u>과 <u>안정성</u>을 보장한다**







#### 함수를 만드는 함수와 find, filter 조합하기



#### 고차함수

> **<u>함수를 인자로</u> 받거나 <u>함수를 리턴</u>하는 함수를 말한다.**
>
> 보통 고차 함수는 함수를 인자로 받아 필요한 때에 실행하거나 클로저를 만들어 리턴한다.



#### 함수 합성

> 함수를 쪼갤수록 함수 합성은 쉬워진다. 

함수적 기법을 사용하면 코드도 간결해지고 함수명을 통해 로직을 더 명확히 전달할 수 있어 읽기 좋은 코드가 된다.

- 인자 선언이나 변수 선언이 적어진다
- 상태를 공유하지 않는 작은 단위의 함수들은 테스트하기도 쉽고 테스트 케이스를 작성하기도 쉽다.
- 작성한 지 오래된 코드일지라도 다시 읽고 고치기가 쉬워진다.(인자와 결과 위주로만 생각하면서 읽고 고치면 되기 때문.)
- 최대한 작은 단위로 코드를 쪼개기. 제어문 대신 함수를, 값 대신 함수를, 연산자 대신 함수를 사용하기



### 함수형 자바스크립트를 위한 기초

> - 함수를 다루는 다양한 방법들을 잘 익히는 것이 중요하다. 
> - 함수와 관련된 개념과 기능을 잘 알아야 한다. 일급 함수, 클로저, 고차 함수, 콜백 패턴, 부분 적용, argument객체 다루기, 함수 객체의 메서드(bind, call, apply) 등이 있다. 



#### 일급함수

> **일급** : 값으로 다룰 수 있다는 의미
>
> - 변수에 담을 수 있다.
> - 함수나 메서드의 인자로 넘길 수 있다.
> - 함수나 메서드에서 리턴할 수 있다.

일급 함수는 아래의 추가적인 조건을 더 만족해야한다.

> - 아무 때나(런타임에서도) 선언이 가능하다.
> - 익명으로 선언할 수 있다.
> - 익명으로 선언한 함수도 함수나 메서드의 인자로 넘길 수 있다.



#### 클로저

스코프 : 변수를 어디에서 어떻게 찾을지를 정한 규칙. 함수 단위의 변수 참조

함수는 변수 참조 범위를 결정하는 중요한 기준이다.



> ***클로저는 자신이 생성될 때의 스코프에서 알 수 있었던 변수를 <u>기억</u>하는 <u>함수</u>다.***

- JS의 모든 함수는 상위 스코프를 가지며
- 모든 함수는 자신이 정의되는 순간의(정의되는 곳의) 실행 컨텍스트 안에 있다. 
- 자바스크립트의 모든 함수는 자신이 생성될 때의 환경을 기억할 수 있다.



함수가 의미적으로나 실제적으로나 진짜 클로저가 되기 위한 가장 중요한 조건은 다음과 같다.

> 클로저로 만들 함수가 myfn이라면, myfn 내부에서 사용하고 있는 변수 중에 myfn 내부에서 선언되지 않은 변수가 있어야 한다. 그 변수를 a라고 한다면, a라는 이름의 변수가 myfn을 생성하는 스코프에서 선언되었거나 알 수 있어야 한다.

```js
// myfn을 생성하는 스코프에서 변수 a가 선언됨.
function parent() {
    var a = 5;
    function myfn() {
        console.log(a);
    }
    // ... 생략
}

// myfn을 생성하는 스코프에서 변수 a를 알 수 있음.
function parents2() {
    var a = 5;
    function parents1() {
        function myfn() {
            console.log(a);
        }
        // ...생략
    }
    // ...생략
}
```

클로저가 기억할 환경은 외부의 변수(또는 외부의 함수)들 밖에 없다. => 자신의 상위 스코프에서 알 수 있는 변수를 자신이 사용하고 있지 않다면 그 환경을 기억해야 할 필요가 없다.

글로벌 스코프를 제외한 외부 스코프에 있던 변수 중, 클로저 혹은 다른 누군가가 참조하고 있지 않는 모든 변수는 실행 컨텍스트가 끝난 후 가비지 컬렉션 대상이 된다.



클로저를 다시 한번 정의 한다면,

> **클로저는 자신이 생성될 때의 스코프에서 알 수 있었던 변수 중 언젠가 자신이 실행될 때 사용할 변수들만 기억하여 유지시키는 함수다.**



메모리가 해제되지 않는 것과 메모리 누수는 다르다. 메모리 누수는 메모리가 해제되지 않을 때 일어나는 것은 맞지만, 클로저 상황을 메모리 누수라고 할 수 없다. 개발자가 의도한 것이기 때문이다.

**메모리 누수란,** 개발자가 의도하지 않았는데 메모리가 해제되지 않고 계속 남는 것을 말한다.



클로저는 자신이 생성될 '때'의 스코프에서 알 수 있었던 변수를 기억하는 함수라고 했는데, '때'는 생각보다 길다. 클로저는 자신이 생성되는 스코프의 모든 라인, 어느 곳에서 선언된 변수든지 참조하고 기억할 수 있다.  그리고 그것은 <u>**변수**이기에 클로저가 생성된 이후 언제라도 그 값은 **변경**될 수 있다.</u>



#### 클로저의 실용 사례

>- 이전 상황을 나중에 일어날 상황과 이어 나갈 때
>
>- 함수로 함수를 만들거나 부분 적용을 할 때



**이전 상황을 나중에 일어날 상황과 이어 나갈 때** 

> ex) 이벤트 리스너로 함수를 넘기기 이전에 알 수 있었던 상황들을 변수에 담아 클로저로 만들어 기억해 두면, 이벤트가 발생되어 클로저가 실행되었을 때 기억해 두었던 변수들로 이전 상황들을 이어갈 수 있다.
>
> -> 굉장히 일반적인 사례이며, 이러한 사례를 지탱하고 있는 기술이 **클로저** 였다는 점을 강조하고 싶다.



#### 클로저를 많이 사용하라!

클로저는 자바스크립트에서 절차지향, 객체지향, 함수형 프로그래밍 **모두를 지탱하는 매우 중요한 기능이자 개념이다.** 정확하게 사용하는 법을 배워야 하고, 자꾸 사용하다보면 메모리 누수가 일어나지 않는 로직 설계법을 더욱 알게 될 것이다.



#### 고차함수

> - 함수를 인자로 받아 대신 실행하는 함수
> - 함수를 리턴하는 함수
> - 함수를 인자로 받아 또 다른 함수를 리턴하는 함수

함수형 프로그래밍의 절반은 '고차 함수를 적극적으로 활용하는 프로그래밍'이다.









