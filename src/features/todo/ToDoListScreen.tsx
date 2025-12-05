import { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Modal, ActivityIndicator, SafeAreaView, RefreshControl } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { api } from '@/lib/api';
import type { TodoItem } from '@/types/api';

export function ToDoListScreen() {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newTodo, setNewTodo] = useState({ title: '', description: '' });
  const [editingTodo, setEditingTodo] = useState<TodoItem | null>(null);
  const [editForm, setEditForm] = useState({ title: '', description: '' });

  const loadTodos = useCallback(async (options?: { silent?: boolean }) => {
    const silent = options?.silent ?? false;
    try {
      console.log('[ToDoList] Loading todos...');
      if (!silent) {
        setLoading(true);
      }
      const response = await api.getTodos();
      console.log('[ToDoList] Todos response:', response);
      setTodos(response.data || []);
    } catch (error: unknown) {
      console.error('[ToDoList] Todos error:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to load todos');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadTodos();
    }, [loadTodos])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadTodos({ silent: true });
  };

  const handleAddTodo = async () => {
    if (!newTodo.title.trim()) {
      Alert.alert('Error', 'Please enter a task title');
      return;
    }

    try {
      console.log('[ToDoList] Creating todo:', { title: newTodo.title, description: newTodo.description });
      const response = await api.createTodo({
        title: newTodo.title.trim(),
        description: newTodo.description.trim() || undefined,
      });
      console.log('[ToDoList] Create todo response:', response);

      if (response.data) {
        const created = response.data;
        setTodos((prev) => [created, ...prev]);
        setNewTodo({ title: '', description: '' });
        setShowAddModal(false);
        Alert.alert('Success', 'Task added successfully');
      }
    } catch (error: unknown) {
      console.error('[ToDoList] Add todo error:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to add task');
    }
  };

  const handleToggleTodo = async (todo: TodoItem) => {
    try {
      const response = await api.toggleTodoCompleted(todo.id);
      const updated = response.data;
      if (updated) {
        setTodos((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
        Alert.alert('Updated', `Marked as ${updated.isCompleted ? 'completed' : 'incomplete'}.`);
      }
    } catch (error: unknown) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to update task status');
    }
  };

  const handleEditTodo = (todo: TodoItem) => {
    setEditingTodo(todo);
    setEditForm({ title: todo.title, description: todo.description || '' });
    setShowEditModal(true);
  };

  const handleUpdateTodo = async () => {
    if (!editingTodo) return;

    if (!editForm.title.trim()) {
      Alert.alert('Error', 'Please enter a task title');
      return;
    }

    try {
      console.log('[ToDoList] Updating todo:', editingTodo.id, editForm);
      const response = await api.updateTodo(editingTodo.id, {
        title: editForm.title.trim(),
        description: editForm.description.trim() || undefined,
      });
      console.log('[ToDoList] Update todo response:', response);

      if (response.data) {
        const updated = response.data;
        setTodos((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
        setShowEditModal(false);
        setEditingTodo(null);
        setEditForm({ title: '', description: '' });
        Alert.alert('Success', 'Task updated successfully');
      }
    } catch (error: unknown) {
      console.error('[ToDoList] Update todo error:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to update task');
    }
  };

  const handleDeleteTodo = (id: number) => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.deleteTodo(id);
              setTodos(todos.filter((t) => t.id !== id));
              Alert.alert('Success', 'Task deleted');
            } catch (error: unknown) {
              Alert.alert('Error', error instanceof Error ? error.message : 'Failed to delete task');
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B2332" />
        <Text style={styles.loadingText}>Loading tasks...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>✓ To-Do List</Text>
          <TouchableOpacity style={styles.addButton} onPress={() => setShowAddModal(true)}>
            <Text style={styles.addButtonText}>+ Add</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.todoList}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#8B2332" />}
        >
          {todos.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No tasks yet. Add your first task!</Text>
            </View>
          ) : (
            todos.map((todo) => (
              <View key={todo.id} style={styles.todoCard}>
                <View style={styles.todoHeader}>
                  <Text style={[styles.todoTitle, todo.isCompleted && styles.completedText]}>{todo.title}</Text>
                  <View style={styles.actionButtons}>
                    <TouchableOpacity onPress={() => handleEditTodo(todo)} style={styles.editButton}>
                      <Text style={styles.editButtonText}>✏️</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDeleteTodo(todo.id)} style={styles.deleteButton}>
                      <Text style={styles.deleteButtonText}>🗑️</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                {todo.description && (
                  <Text style={[styles.todoDescription, todo.isCompleted && styles.completedText]}>
                    {todo.description}
                  </Text>
                )}
                <View style={styles.todoFooter}>
                  <View style={[styles.statusBadge, todo.isCompleted ? styles.statusBadgeCompleted : styles.statusBadgePending]}>
                    <Text style={[styles.statusText, todo.isCompleted && styles.statusTextCompleted]}>
                      {todo.isCompleted ? 'Completed' : 'Pending'}
                    </Text>
                  </View>
                  <Text style={styles.todoDate}>{formatDate(todo.createdAt)}</Text>
                </View>
                <TouchableOpacity
                  style={[styles.toggleButton, todo.isCompleted ? styles.toggleButtonUndo : styles.toggleButtonComplete]}
                  onPress={() => handleToggleTodo(todo)}
                >
                  <Text style={styles.toggleButtonText}>
                    {todo.isCompleted ? 'Mark as Incomplete' : 'Mark as Complete'}
                  </Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </ScrollView>

        <Modal visible={showAddModal} animationType="slide" transparent onRequestClose={() => setShowAddModal(false)}>
          <View style={styles.modalOverlay}>
            <ScrollView contentContainerStyle={styles.modalScrollContent} keyboardShouldPersistTaps="handled">
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Add New Task</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Task Title"
                  value={newTodo.title}
                  onChangeText={(text) => setNewTodo({ ...newTodo, title: text })}
                />
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Task Description (optional)"
                  value={newTodo.description}
                  onChangeText={(text) => setNewTodo({ ...newTodo, description: text })}
                  multiline
                  numberOfLines={3}
                />
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => {
                      setNewTodo({ title: '', description: '' });
                      setShowAddModal(false);
                    }}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.modalButton, styles.saveButton]} onPress={handleAddTodo}>
                    <Text style={styles.saveButtonText}>Save</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </View>
        </Modal>

        <Modal visible={showEditModal} animationType="slide" transparent onRequestClose={() => setShowEditModal(false)}>
          <View style={styles.modalOverlay}>
            <ScrollView contentContainerStyle={styles.modalScrollContent} keyboardShouldPersistTaps="handled">
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Edit Task</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Task Title"
                  value={editForm.title}
                  onChangeText={(text) => setEditForm({ ...editForm, title: text })}
                />
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Task Description (optional)"
                  value={editForm.description}
                  onChangeText={(text) => setEditForm({ ...editForm, description: text })}
                  multiline
                  numberOfLines={3}
                />
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => {
                      setEditForm({ title: '', description: '' });
                      setEditingTodo(null);
                      setShowEditModal(false);
                    }}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.modalButton, styles.saveButton]} onPress={handleUpdateTodo}>
                    <Text style={styles.saveButtonText}>Update</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  backButton: { padding: 8 },
  backButtonText: { fontSize: 16, color: '#8B2332' },
  title: { fontSize: 20, fontWeight: '700' },
  addButton: { paddingVertical: 8, paddingHorizontal: 16, backgroundColor: '#8B2332', borderRadius: 8 },
  addButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 16, color: '#6b7280' },
  todoList: { flex: 1, padding: 16 },
  emptyContainer: { padding: 40, alignItems: 'center' },
  emptyText: { fontSize: 16, color: '#6b7280', textAlign: 'center' },
  todoCard: { marginBottom: 16, padding: 16, backgroundColor: '#f9fafb', borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb' },
  todoHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  todoTitle: { fontSize: 18, fontWeight: '600', flex: 1 },
  completedText: { textDecorationLine: 'line-through', color: '#9ca3af' },
  actionButtons: { flexDirection: 'row', gap: 8 },
  editButton: { padding: 4 },
  editButtonText: { fontSize: 20 },
  deleteButton: { padding: 4 },
  deleteButtonText: { fontSize: 20 },
  todoDescription: { fontSize: 14, color: '#374151', marginBottom: 8, lineHeight: 20 },
  todoFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
  todoDate: { fontSize: 12, color: '#9ca3af' },
  statusBadge: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 999 },
  statusBadgePending: { backgroundColor: '#fef3c7', borderWidth: 1, borderColor: '#fcd34d' },
  statusBadgeCompleted: { backgroundColor: '#dcfce7', borderWidth: 1, borderColor: '#bbf7d0' },
  statusText: { fontSize: 12, fontWeight: '600', color: '#b45309' },
  statusTextCompleted: { color: '#166534' },
  toggleButton: { marginTop: 12, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  toggleButtonComplete: { backgroundColor: '#8B2332' },
  toggleButtonUndo: { backgroundColor: '#6b7280' },
  toggleButtonText: { color: '#fff', fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'flex-end' },
  modalScrollContent: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  modalContent: { width: '100%', backgroundColor: '#fff', borderRadius: 12, padding: 20, marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '700', marginBottom: 16, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, padding: 12, marginBottom: 12, fontSize: 16 },
  textArea: { height: 80, textAlignVertical: 'top' },
  modalButtons: { flexDirection: 'row', gap: 12 },
  modalButton: { flex: 1, padding: 14, borderRadius: 8, alignItems: 'center' },
  cancelButton: { backgroundColor: '#f3f4f6', borderWidth: 1, borderColor: '#e5e7eb' },
  cancelButtonText: { color: '#374151', fontSize: 16, fontWeight: '600' },
  saveButton: { backgroundColor: '#8B2332' },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
