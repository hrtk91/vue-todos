<script setup>
import Todo from './Todo';
import TodoCreater from './TodoCreater.vue';
import TodoList from './TodoList.vue';
</script>

<template>
    <div>
        <TodoCreater
            class="mb-2"
            :todos="todos"
            @update-todos="updateTodos">
        </TodoCreater>
        <TodoList
            :todos="todos"
            @update-todos="updateTodos"
            @delete-todo="deleteTodo">
        </TodoList>
    </div>
</template>

<script>
export default {
    data: function () {
        return {
            /** @type {Todo[]} */
            todos: [],
        };
    },
    created: function () {
        let todos = localStorage.getItem('todos');
        if (todos == null) {
            localStorage.setItem('todos', JSON.stringify([]));
        }
        this.todos = JSON.parse(localStorage.getItem('todos')) || [];
    },
    methods: {
        /**
         * updateTodos
         */
        updateTodos: function () {
            localStorage.todos = JSON.stringify(this.todos);
        },
        /**
         * deleteTodo
         * @this Vue
         * @param {Todo} todo
         */
        deleteTodo: function (todo) {
            if (!confirm(`削除します。\nよろしいですか？\n Todo: ${todo.title}`)) return;
            this.todos = this.todos.filter(x => x.id !== todo.id);
            this.updateTodos(this.todos);
        }
    }
}
</script>

<style scoped>
</style>
