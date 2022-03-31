'use strict'

document.addEventListener('DOMContentLoaded', function() {
    var todos = localStorage.getItem('todos');
    if (todos == null) {
        localStorage.setItem('todos', JSON.stringify([]));
    }
});

const TaskStatus = {
    New: 'New',
    Active: 'Active',
    Close: 'Close',
    Reactive: 'Reactive'
};

class Todo {
    constructor(id, title, content, status) {
        this.id = id;
        this.title = title;
        this.content = content;
        this.comments = [];
        this.status = status;
        this.created = Date.now;
        this.modified = Date.now;
    }
}

class TodoComment {
    constructor(id, content) {
        this.id = id;
        this.content = content;
    }
}

const app = Vue.createApp({
    data: function () {
        return {
            /** @type {Todo[]} */
            todos: JSON.parse(localStorage.getItem('todos')) || {},
        };
    },
    methods: {
        /**
         * updateTodos
         * @param {Todo[]} todos 
         */
        updateTodos: function (todos) {
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
});

app.component('todo-item', {
    props: {
        todo:  {
            id: Number,
            title: String,
            content: String,
            status: String
        }
    },
    data: function () {
        return {
            doneLabel: 'Done',
            selected: -1,
            taskStatuses: [
                { id: 1, value: TaskStatus.New },
                { id: 2, value: TaskStatus.Active },
                { id: 3, value: TaskStatus.Close },
                { id: 4, value: TaskStatus.Reactive },
            ],
            hideComment: true,
            commentText: '',
        }
    },
    template: `
        <li class="list-group-item">
            <div class="row">
                <div class="col-8">
                    <div class="input-group">
                        <div class="input-group-prepend">
                            <span class="input-group-text">{{ todo.id }}.</span>
                        </div>
                        <input type="text" class="form-control" :value="todo.title" @input="todo.title = $event.target.value; updateTodo(todo)">
                    </div>
                </div>
                <div class="col-4">
                    <div class="row">
                        <div class="col">
                            <select class="form-select" :selected="selected" :value="selected" @change="statusChanged">
                                <option v-for='item in taskStatuses' :value='item.value'>{{ item.value }}</option>
                            </select>
                        </div>
                        <div class="col">
                            <button class="btn btn-sm btn-danger" @click="deleteTodo">Delete</button>
                        </div>
                        <div class="col">
                            <button
                                type="button"
                                style="background-color: transparent; border: 0px;"
                                tabindex="-1"
                                data-bs-toggle="collapse"
                                :data-bs-target="'#comments' + todo.id.toString()"
                                aria-expanded="false">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chevron-down" viewBox="0 0 16 16">
                                    <path fill-rule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"/>
                                </svg>
                                <span class="badge bg-light text-dark">{{todo.comments?.length}}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div class="row mt-2 collapse" :id="'comments' + todo.id.toString()">
                <div class="card card-body">
                    <div class="input-group mb-2">
                        <input type="text" class="form-control" v-model="commentText">
                        <button type="button" class="btn btn-primary" @click="addComment">Add Comment</button>
                    </div>
                    <div v-for='comment in todo.comments' :key='comment.id'>
                        <div class="input-group mb-2">
                            <div class="input-group-prepend">
                                <span class="input-group-text">{{ comment.id }}.</span>
                            </div>
                            <input type="text" class="form-control" :value="comment.content" @input="comment.content = $event.target.value; updateTodo(todo)">
                        </div>
                    </div>
                </div>
            </div>
        </li>
    `,
    created: function() {
        this.selected = this.taskStatuses.find(x => x.value == this.todo.status).value;
    },
    methods: {
        /**
         * statuschanged
         * @param {Event} ev 
         */
        statusChanged: function (ev) {
            this.updateTodo({ status: ev.target.value });
        },
        /**
         * updateTodo
         * @param {Todo} todo 
         */
        updateTodo: function (todo) {
            Object.assign(this.todo, todo);
            this.$emit('update-todo', this.todo);
        },
        /**
         * deleteTodo
         */
        deleteTodo: function () {
            this.$emit('delete-todo', this.todo);
        },
        /**
         * addComment
         */
        addComment: function () {
            if (this.todo.comments == undefined) this.todo.comments = [];
            if (this.todo.comments.length == 0) {
                this.todo.comments.push(new Comment(1, this.commentText));
            } else {
                var maxid = parseInt(Math.max(...this.todo.comments.map(x => x.id)));
                if (!Number.isInteger(maxid)) {
                    maxid = 0;
                }
                this.todo.comments.push(new Comment(maxid + 1, this.commentText));
            }
            this.commentText = '';
            this.updateTodo(this.todo);
        },
    }
});

app.component('todo-list', {
    props: {
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
    template: `
    <div>
        <div class="row mb-2">
            <div class="col-4">
                <select class="form-select" selected="desc by id" @change="sortChange">
                    <option value="asc by id">asc by id</option>
                    <option value="desc by id">desc by id</option>
                </select>
            </div>
            <div class="col-4">
                <span class="dropdown">
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
                </span>
                <span class="dropdown">
                    <button class="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-expanded="false">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-gear" viewBox="0 0 16 16">
                            <path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z"/>
                            <path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115l.094-.319z"/>
                        </svg>
                    </button>
                    <ul class="dropdown-menu" aria-labeledby="dropdownMenuButton">
                        <li>
                            <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#ExportModal">Export</button>
                        </li>
                        <li>
                            <button type="button" class="btn btn-danger">All Clear</button>
                        </li>
                    </ul>
                </span>
            </div>
        </div>
        <div class="row">
            <div class="col">
                <ul class="list-group" style="position: relative">
                    <transition-group name="todo-group" tag="p">
                        <todo-item
                            class="todo-group-item"
                            v-for='todo in orderedTodos'
                            :todo='todo'
                            :key='todo.id'
                            @update-todo="updateTodos"
                            @delete-todo="deleteTodo">
                        </todo-item>
                    </transition-group>
                </ul>
            </div>
        </div>
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
    `,
    created: function () {
        // filterConditions初期化でTodo全表示させる
        this.filterChange();
    },
    methods: {
        updateTodos: function (todo) {
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
        allCrear: function (ev) {
            if (confirm('登録データをすべて削除します。\nよろしいですか？')) {
                localStorage.setItem('todos', JSON.stringify([]));
                this.todos = [];
                this.updateTodos();
                alert('データを削除しました。');
            }
        },
        /**
         * @param {Event} ev 
         */
        copyExportJson: function (ev) {
            navigator.clipboard.writeText(JSON.stringify(this.todos));
        }
    }
});

app.component('todo-creater', {
    props: {
        todos: Array,
    },
    data: function () {
        return {
            text: ''
        };
    },
    template: `
        <div class="row">
            <div class="col">
                <input class="form-control" type="text" v-model='text'/>
            </div>
            <div class="col-auto">
                <button class="btn btn-primary" @click="addTodo" value="Add">Add</button>
            </div>
        </div>
    `,
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
});

app.config.globalProperties.TaskStatus = TaskStatus;
app.mount('#app');
