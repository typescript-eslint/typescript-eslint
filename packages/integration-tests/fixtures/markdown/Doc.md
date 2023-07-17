Some extra text to verify that the markdown plugin is ignoring anything that is not a code block.

expected no-console error:

```jsx
import { Button } from 'antd';

function MyComp() {
  console.log('test');
  return (
    <div>
      <Button type="primary">Primary</Button>
      <Button>Default</Button>
      <Button type="dashed">Dashed</Button>
      <Button type="danger">Danger</Button>
      <Button type="link">Link</Button>
    </div>
  );
}
```

expected no-explicit-any error:
expected no-console error:

```jsx
import { Button } from 'antd';

function MyComp(): any {
  console.log('test');
  return (
    <div>
      <Button type="primary">Primary</Button>
      <Button>Default</Button>
      <Button type="dashed">Dashed</Button>
      <Button type="danger">Danger</Button>
      <Button type="link">Link</Button>
    </div>
  );
}
```

expected no-console error:

```js
function foo() {
  console.log('test');
}
```

expected no-explicit-any error:
expected no-console error:

```js
function foo(): any {
  console.log('test');
}
```

expected no-explicit-any error:
expected no-console error:

```javascript
function foo(): any {
  console.log('test');
}
```

expected no-explicit-any error:
expected no-console error:

```node
function foo(): any {
  console.log('test');
}
```
