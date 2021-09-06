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
Vue.prototype.TaskStatus = TaskStatus;

Vue.component('todo-item', {
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
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div class="row mt-2 collapse" :id="'comments' + todo.id.toString()">
                <div class="card card-body">
                    <div class="input-group">
                        <input type="text" class="form-control" v-model="commentText">
                        <button type="button" class="btn btn-primary" @click="addComment">Add Comment</button>
                    </div>
                    <ul v-for='comment in todo.comments' :key='comment.id'>
                        <li>{{comment.content}}</li>
                    </ul>
                </div>
            </div>
        </li>
    `,
    created: function() {
        this.selected = this.taskStatuses.find(x => x.value == this.todo.status).value;
    },
    methods: {
        statusChanged: function (ev) {
            this.updateTodo({ status: ev.target.value });
        },
        updateTodo: function (todo) {
            Object.assign(this.todo, todo);
            this.$emit('update-todo', this.todo);
        },
        deleteTodo: function () {
            this.$emit('delete-todo', this.todo);
        },
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

Vue.component('todo-list', {
    props: {
        todos: Array,
    },
    data: function () {
        return {
            // 標準ではIdの降順ですべて出力
            sortCondition: (a, b) => b.id - a.id,
            filterConditions: [],
            checkedNew: true,
            checkedActive: true,
            checkedClose: true,
            checkedReactive: true,
        };
    },
    computed: {
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
        }
    }
});

Vue.component('todo-creater', {
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
                <input class="form-control" type="text" v-model='text'></input>
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

var app = new Vue({
    el: '#app',
    data: {
        todos: JSON.parse(localStorage.getItem('todos'))
    },
    methods: {
        updateTodos: function (todos) {
            localStorage.todos = JSON.stringify(this.todos);
        },
        deleteTodo: function (todo) {
            if (!confirm(`削除します。\nよろしいですか？\n Todo: ${todo.title}`)) return;
            this.todos = this.todos.filter(x => x.id !== todo.id);
            this.updateTodos(this.todos);
        }
    }
});

function Todo(id, title, content, status) {
    this.id = id;
    this.title = title;
    this.content = content;
    this.comments = [];
    this.status = status;
    this.created = Date.now;
    this.modified = Date.now;
}

function Comment(id, content) {
    this.id = id;
    this.content = content;
}
