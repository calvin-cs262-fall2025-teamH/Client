import React, { useState } from 'react';
import { View, Text, TextInput, Button, TouchableOpacity, StyleSheet, FlatList } from 'react-native';

export interface TodoItem {
  id: number;
  text: string;
  completed: boolean;
  editing: boolean;
}

export default function TodoList() {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [newTodo, setNewTodo] = useState('');

  const handleAdd = () => {
    if (newTodo.trim() === '') return;
    setTodos([
      ...todos,
      { id: Date.now(), text: newTodo, completed: false, editing: false },
    ]);
    setNewTodo('');
  };

  const handleToggle = (id: number) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const handleDelete = (id: number) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const handleEdit = (id: number) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, editing: true } : todo
    ));
  };

  const handleSave = (id: number, newText: string) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, text: newText, editing: false } : todo
    ));
  };

  const renderItem = ({ item }: { item: TodoItem }) => (
    <View style={styles.itemContainer}>
      <TouchableOpacity
        onPress={() => handleToggle(item.id)}
        style={[styles.checkButton, item.completed && styles.checkButtonChecked]}
        accessibilityLabel={item.completed ? 'Uncheck item' : 'Check item'}
      >
        <Text style={[styles.checkMark, item.completed && styles.checkMarkChecked]}>
          {item.completed ? '✓' : ''}
        </Text>
      </TouchableOpacity>
      <View style={styles.taskRow}>
        {item.editing ? (
          <TextInput
            style={[styles.input, styles.editInput]}
            value={item.text}
            onChangeText={text => handleSave(item.id, text)}
            autoFocus
            keyboardType="default"
            returnKeyType="done"
          />
        ) : (
          <TouchableOpacity onLongPress={() => handleEdit(item.id)} style={{flex: 1}}>
            <Text style={[styles.text, item.completed && styles.completed]}>{item.text}</Text>
          </TouchableOpacity>
        )}
        <View style={styles.buttonGroup}>
          <Button title="Edit" onPress={() => handleEdit(item.id)} />
          <Button title="Delete" color="red" onPress={() => handleDelete(item.id)} />
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>To-Do List</Text>
      <View style={styles.addContainer}>
        <TextInput
          style={styles.input}
          value={newTodo}
          onChangeText={setNewTodo}
          placeholder="Add a new task"
        />
        <Button title="Add" onPress={handleAdd} />
      </View>
      <FlatList
        data={todos}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  editInput: {
    fontSize: 16,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  taskRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  buttonGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginLeft: 8,
  },
  container: {
    padding: 0,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#222',
    textAlign: 'center',
  },
  addContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#222',
    backgroundColor: '#f7f8fa',
    padding: 12,
    flex: 1,
    marginRight: 8,
    borderRadius: 8,
    fontSize: 18,
    color: '#222',
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 8,
    paddingVertical: 10,
    backgroundColor: '#f7f8fa',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  checkButtonChecked: {
    borderColor: '#4caf50',
    backgroundColor: '#e8f5e9',
  },
  checkMark: {
    fontSize: 20,
    color: '#bbb',
    fontWeight: 'bold',
  },
  checkMarkChecked: {
    color: '#4caf50',
  },
  text: {
    fontSize: 20,
    flex: 1,
    color: '#222',
    paddingVertical: 2,
  },
  completed: {
    textDecorationLine: 'line-through',
    color: '#aaa',
  },
});
