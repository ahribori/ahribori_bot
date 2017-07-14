## 1. 기술 스택
>- Selenium
>- webdriverio
>- Node.js 6.xx
>- ES7 async/await
>- Socket.io
>- Redis
>- Mongodb 3.4
>- React or Vue
>- Material UI or Ant UI

## 2. 개념

#### 기술적인 개념
>- 웹드라이버(webdriver): 브라우저를 핸들링 할 수 있는 인터페이스.
>- 셀레늄 서버(selenium-standalone): 웹드라이버를 핸들링해주는 프록시.
>- webdriver.io: 셀레늄과 Node.js를 바인딩하는 라이브러리.

####  추상적인 개념
>- 액션(Action): 브라우저에서 수행하게 될 행동 하나하나를 각각 액션(Action)이라고 정의한다. 특정 url로 navigate 하는 행동, 특정 id나 class를 가진 버튼을 클릭하는 행동, 스크린샷을 찍는 행동 모두 액션(Action)이다.
>- 트랜잭션(Transaction): 액션들의 집합을 트랜잭션이라고 정의한다. 트랜잭션은 실행(Run) 할 수 있으며, 실행하게 되면 안에 들어있는 액션들이 순차적으로 수행된다.
>- 스케쥴(Schedule): 원하는 시간에 트랜잭션을 실행하기 위해 필요한 개념이다.

## 3. 기본 기능(개발 예정)
>- 회원가입/로그인
>- 트랜잭션 빌더 (트랜잭션을 직관적인 UI로 빌드할 수 있는 화면)
>- 트랜잭션 등록/수정/삭제
>- 스케쥴 등록/수정/삭제
>- 대시보드
>- 리포트 기능 (트랜잭션 실행 결과 -> Assertion, screenshot, etc...)
>- 에러 모니터링

## 4. 설치

#### 먼저 설치해야 하는 것들
>- Git
>- Node.js 6.10^
>- MongoDB 3.4^
>- Chrome, Firefox, Opera, Safari, PhantomJS 등등 사용할 브라우저(PhantomJS는 /bin경로를 환경변수에 등록해야함)

#### 그 다음,
>1. ``` git clone https://github.com/ahribori/ahribori_bot.git```
>2. ``` cd ahribori_bot```
>3. ```npm install```
>4. ```npm run selenium:install```
>5. 프로젝트 루트에 .env 파일을 생성한 뒤, .env.example 파일의 내용을 복사, 항목들을 작성한다.
>6. 빌드: ```npm run build```
>7. 실행: ```npm run boot```
>8. 셀레늄 서버 시작: (터미널을 새로 띄운 뒤)```selenium-standalone start```

## 5. 샘플 코드
#### ahribori_bot/src/test/index.js
```javascript
import Manager from '../core/manager';
const manager = new Manager();
import {Action, Transaction} from '../core'

/**
* naver, daum, google을 순차적으로 탐색
*/
const TEST_CASE_01 = new Transaction([
    Action.navigate('http://naver.com'),
    Action.navigate('http://daum.net'),
    Action.navigate('https://google.co.kr'),
]);

/**
* naver, daum, google을 순차적으로 탐색하며, 스크린샷을 남김
*/
const TEST_CASE_02 = new Transaction([
    Action.navigate('http://naver.com'),
    Action.screenshot(),
    Action.navigate('http://daum.net'),
    Action.screenshot(),
    Action.navigate('https://google.co.kr'),
    Action.screenshot(),
]);

/**
* naver에 접속하여 검색창에 'ahribori'라는 문자열을 입력한 뒤,
* 검색 버튼을 누르고 3초 기다림
*/
const TEST_CASE_03 = new Transaction([
    Action.navigate('http://naver.com'),
    Action.setValue('#query', 'ahribori'),
    Action.click('#search_btn'),
    Action.wait(3000)
]);

/**
* 트랜잭션 큐에 트랜잭션들을 등록
*/
manager.addTransaction(TEST_CASE_01);
manager.addTransaction(TEST_CASE_02);
manager.addTransaction(TEST_CASE_03);
```

>1. ```npm run test```
>2. ahribori_bot/screenshots 폴더에 스크린샷 확인