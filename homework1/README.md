# a. Homework 1: To-Do App Code Elements Listing

Here are some examples from the `todo-app` subdirectory demonstrating key JavaScript/TypeScript/HTML/CSS elements:

---

**Object**

The `TodoItem` interface defines the shape of a to-do item object:

```typescript
export interface TodoItem {
  id: number;
  text: string;
  completed: boolean;
  editing: boolean;
}
```

Or like this:

A to-do item is created as an object in the `handleAdd` function:

```typescript
{ id: Date.now(), text: newTodo, completed: false, editing: false }
```

---

**Anonymous function using arrow notation**

Arrow functions are used throughout, for example in the `handleAdd` function:
```typescript
const handleAdd = () => {
  if (newTodo.trim() === '') return;
  setTodos([
    ...todos,
    { id: Date.now(), text: newTodo, completed: false, editing: false },
  ]);
  setNewTodo('');
};
```

Arrow functions are also used in event handlers, such as:

```typescript
onChangeText={text => handleSave(item.id, text)}
```

---

**Asynchronous programming**

This app does not use asynchronous programming, because currently it does not really interact with the external environment (reading files, asking permissions, etc), so there is not really a need for asynchornous programming.

---

**Modules**

Each file in the app is a module. For example, `todo-list.tsx` exports the `TodoList` component:

```typescript
export default function TodoList() { ... }
```

And imports from other modules:

```typescript
import React, { useState } from 'react';
```

The `index.tsx` file imports the `TodoList` module:

```typescript
import TodoList from '@/components/todo-list';
```

---

**TypeScript-specific code element**

Type annotations and interfaces are used that do are not in JavaScript, like these:

```typescript
const [todos, setTodos] = useState<TodoItem[]>([]);
```

Function parameters are explicitly typed:

```typescript
const handleSave = (id: number, newText: string) => { ... }
```

---

**CSS-like specification**

Styling is done using React Native's StyleSheet, like this:

```typescript
const styles = StyleSheet.create({
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 8,
    paddingVertical: 10,
    backgroundColor: '#f7f8fa',
    borderRadius: 8,
    // ...
  },
});
```

Another style object for a button:

```typescript
checkButton: {
  width: 32,
  height: 32,
  borderRadius: 16,
  borderWidth: 2,
  borderColor: '#bbb',
  backgroundColor: '#fff',
  alignItems: 'center',
  justifyContent: 'center',
  marginRight: 12,
}
```

# b. How GitHub Copilot Worked for Me

I think that Copilot worked really well for me. At first, some of the colors were incredible similar, whcih made the readability of the application a little difficult. But, after asking it to make the app more "modern", the colors were a lot better, and I had to fix a few formatting things.

Functionality wise, Copilot did a great job in including what I asked it to have/do.
