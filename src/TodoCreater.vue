<script setup>
import Todo from './Todo.js';
import TaskStatus from './TaskStatus.js';
</script>

<template>
    <div class="row">
        <div class="col">
            <input class="form-control" type="text" v-model='text'/>
        </div>
        <div class="col-auto">
            <button class="btn btn-primary" @click="addTodo" value="Add">Add</button>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        /** @type {Todo[]} */
        todos: Array,
    },
    data: function () {
        return {
            text: ''
        };
    },
    methods: {
        addTodo: function () {
            var maxid = parseInt(Math.max(...this.todos.map(x => x.id)));
            if (!Number.isInteger(maxid)) {
                maxid = 0;
            }
            this.todos.push(new Todo(maxid + 1, this.text, '', TaskStatus.New));
            this.text = '';
            this.$emit('update-todos', this.todos);
        }
    }
}
</script>
