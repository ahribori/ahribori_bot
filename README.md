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

-----

## 2. 개념 정의

>- 액션(Action): 브라우저에서 수행하게 될 행동 하나하나를 각각 액션(Action)이라고 정의한다. 특정 url로 navigate 하는 행동, 특정 id나 class를 가진 버튼을 클릭하는 행동, 스크린샷을 찍는 행동 모두 액션(Action)이다.
>- 트랜잭션(Transaction): 액션들의 집합을 트랜잭션이라고 정의한다. 트랜잭션은 실행(Run) 할 수 있으며, 실행하게 되면 안에 들어있는 액션들이 순차적으로 수행된다.
>- 스케쥴(Schedule): 원하는 시간에 트랜잭션을 실행하기 위해 필요한 개념이다.

-----

## 3. 기본 기능
>- 회원가입/로그인
>- 트랜잭션 빌더 (트랜잭션을 직관적인 UI로 빌드할 수 있는 화면)
>- 트랜잭션 등록/수정/삭제
>- 스케쥴 등록/수정/삭제
>- 대시보드
>- 리포트 기능 (트랜잭션 실행 결과 -> Assertion, screenshot, etc...)
>- 에러 모니터링
