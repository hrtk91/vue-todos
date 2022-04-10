<script setup>
import Todo from './Todo.js';
import TodoItem from './TodoItem.vue';
import TaskStatus from './TaskStatus.js';
</script>

<template>
<div>
    <div class="row mb-2">
        <div class="col">
            <div class="d-inline-block">
                <select class="form-select" selected="desc by id" value="desc by id" @change="sortChange">
                    <option value="asc by id">asc by id</option>
                    <option value="desc by id">desc by id</option>
                </select>
            </div>
            <!-- ステータスフィルターボタン -->
            <div class="dropdown d-inline-block ms-2">
                <button class="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-expanded="false">
                    Status
                </button>
                <ul class="dropdown-menu" aria-labeledby="dropdownMenuButton">
                    <li>
                        <span class="form-check">
                            <input class="form-check-input" type="checkbox" :value="TaskStatus.New" :id="TaskStatus.New"
                                :checked="checkedNew" @change="checkedNew = $event.target.checked; filterChange($event);"/>
                            <label class="form-check-label d-block" :for="TaskStatus.New">{{ TaskStatus.New }}</label>
                        </span>
                    </li>
                    <li>
                        <span class="form-check">
                            <input class="form-check-input" type="checkbox" :value="TaskStatus.Active" :id="TaskStatus.Active"
                                :checked="checkedActive" @change="checkedActive = $event.target.checked; filterChange($event);"/>
                            <label class="form-check-label" :for="TaskStatus.Active">{{ TaskStatus.Active }}</label>
                        </span>
                    </li>
                    <li>
                        <span class="form-check">
                            <input class="form-check-input" type="checkbox" :value="TaskStatus.Close" :id="TaskStatus.Close"
                                :checked="checkedClose" @change="checkedClose = $event.target.checked; filterChange($event);"/>
                            <label class="form-check-label" :for="TaskStatus.Close">{{ TaskStatus.Close }}</label>
                        </span>
                    </li>
                    <li>
                        <span class="form-check">
                            <input class="form-check-input" type="checkbox" :value="TaskStatus.Reactive" :id="TaskStatus.Reactive"
                                :checked="checkedReactive" @change="checkedReactive = $event.target.checked; filterChange($event);"/>
                            <label class="form-check-label" :for="TaskStatus.Reactive">{{ TaskStatus.Reactive }}</label>
                        </span>
                    </li>
                </ul>
            </div>
            <!-- 設定ボタン -->
            <div class="dropdown d-inline-block ms-2">
                <button class="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-expanded="false">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-gear" viewBox="0 0 16 16">
                        <path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z"/>
                        <path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115l.094-.319z"/>
                    </svg>
                </button>
                <ul class="dropdown-menu" aria-labeledby="dropdownMenuButton">
                    <li>
                        <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#ImportModal">Import</button>
                    </li>
                    <li class="mt-2">
                        <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#ExportModal">Export</button>
                    </li>
                    <li class="mt-2">
                        <button type="button" class="btn btn-danger" @click="allClear">All Clear</button>
                    </li>
                </ul>
            </div>
        </div>
    </div>
    <div class="row">
        <div class="col">
            <ul class="list-group" style="position: relative">
                <transition-group name="todo-group" tag="p">
                    <TodoItem
                        class="todo-group-item"
                        v-for='todo in orderedTodos'
                        :key='todo.id'
                        :todo='todo'
                        @update-todo="updateTodos"
                        @delete-todo="deleteTodo">
                    </TodoItem>
                </transition-group>
            </ul>
        </div>
    </div>
    <!-- ImportModal -->
    <div class="modal fade" id="ImportModal" tabindex="-1" role="dialog" aria-labelledby="ImportModalLabel" aria-hidden="true">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="ImportModalLabel">Import Todos</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <p>TodoのJSONを入力してください</p>
                    <div class="input-group">
                        <textarea class="input-text" v-model="importText"></textarea>
                        <button type="button" class="btn btn-primary" @click="importTodos">Import</button>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                </div>
            </div>
        </div>
    </div>
    <!-- ExportModal -->
    <div class="modal fade" id="ExportModal" tabindex="-1" role="dialog" aria-labelledby="ExportModalLabel" aria-hidden="true">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="ExportModalLabel">Todo JSON</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <button type="button" class="btn btn-primary"
                        @click="copyExportJson">Copy</button>
                    <pre>{{ JSON.stringify(todos) }}</pre>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                </div>
            </div>
        </div>
    </div>
</div>
</template>

<script>
'use strict'
export default {
    props: {
        /** @type {Todo[]} */
        todos: Array,
    },
    data: function () {
        return {
            /** 標準ではIdの降順ですべて出力 */
            sortCondition: (a, b) => b.id - a.id,
            /** @type {boolean[]} */
            filterConditions: [],
            checkedNew: true,
            checkedActive: true,
            checkedClose: true,
            checkedReactive: true,
            importText: '',
        };
    },
    computed: {
        /**
         * orderedTodos
         * @returns {Todo[]}
         */
        orderedTodos: function () {
            var res = [...this.todos].filter(todo => this.filterConditions.some(fn => fn(todo)));
            return res.sort(this.sortCondition);
        }
    },
    created: function () {
        // filterConditions初期化でTodo全表示させる
        this.filterChange();
    },
    methods: {
        updateTodos: function () {
            this.$emit('update-todos', this.todos);
        },
        deleteTodo: function (todo) {
            this.$emit('delete-todo', todo);
        },
        sortChange: function (e) {
            switch (e.target.value) {
                case 'asc by id': return this.sortCondition = (a, b) => a.id - b.id;
                case 'desc by id': return this.sortCondition = (a, b) => b.id - a.id;
            }
        },
        filterChange: function (e) {
            this.filterConditions = [];
            if (this.checkedNew) {
                this.filterConditions.push((x) => x.status == this.TaskStatus.New);
            }
            if (this.checkedActive) {
                this.filterConditions.push((x) => x.status == this.TaskStatus.Active);
            }
            if (this.checkedClose) {
                this.filterConditions.push((x) => x.status == this.TaskStatus.Close);
            }
            if (this.checkedReactive) {
                this.filterConditions.push((x) => x.status == this.TaskStatus.Reactive);
            }
        },
        /**
         * @param {Event} ev 
         */
        allClear: function (ev) {
            if (confirm('登録データをすべて削除します。\nよろしいですか？')) {
                // localStorage.setItem('todos', JSON.stringify([]));
                this.todos.splice(0);
                this.updateTodos();
                alert('データを削除しました。');
            }
        },
        /**
         * @param {Event} ev 
         */
        copyExportJson: function (ev) {
            navigator.clipboard.writeText(JSON.stringify(this.todos));
        },
        /**
         * @param {Event} ev 
         */
        importTodos: function (ev) {
            try {
                let todos = JSON.parse(this.importText);
                // localStorage.setItem('todos', JSON.stringify(todos));
                this.todos.splice(0);
                this.todos.push(...todos);
                this.importText = '';
                this.updateTodos();
                alert('インポートに成功しました。');
            }
            catch (e) {
                alert('インポートに失敗しました。');
            }
        }
    }
};
</script>
