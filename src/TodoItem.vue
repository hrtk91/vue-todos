<script setup>
import TaskStatus from "./TaskStatus.js";
import TodoComment from "./TodoComment.js";
</script>

<template>
  <li class="list-group-item">
    <div class="row">
      <div class="col-md p-1">
        <div class="input-group">
          <div class="input-group-prepend">
            <span class="input-group-text">{{ todo.id }}.</span>
          </div>
          <input
            type="text"
            class="form-control"
            :value="todo.title"
            @input="
              todo.title = $event.target.value;
              updateTodo(todo);
            "
          />
        </div>
      </div>
      <div class="col-auto p-1">
        <select
          class="form-select w-auto d-inline-block"
          v-model="selected"
          @change="statusChanged"
        >
          <option
            v-for="item in taskStatuses"
            :key="item.id"
            :value="item.value"
          >
            {{ item.value }}
          </option>
        </select>
      </div>
      <div class="col-auto p-1">
        <button class="btn btn-sm btn-danger ms-2" @click="deleteTodo">
          Delete
        </button>
        <button
          type="button"
          class="ms-2"
          style="background-color: transparent; border: 0px"
          tabindex="-1"
          data-bs-toggle="collapse"
          :data-bs-target="'#comments' + todo.id.toString()"
          aria-expanded="false"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            class="bi bi-chevron-down"
            viewBox="0 0 16 16"
          >
            <path
              fill-rule="evenodd"
              d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"
            />
          </svg>
          <span class="badge bg-light text-dark">{{
            todo.comments?.length
          }}</span>
        </button>
      </div>
    </div>
    <div class="row mt-2 collapse" :id="'comments' + todo.id.toString()">
      <div class="card card-body">
        <div class="input-group mb-2">
          <input type="text" class="form-control" v-model="commentText" />
          <button type="button" class="btn btn-primary" @click="addComment">
            Add Comment
          </button>
        </div>
        <div v-for="comment in todo.comments" :key="comment.id">
          <div class="input-group mb-2">
            <div class="input-group-prepend">
              <span class="input-group-text">{{ comment.id }}.</span>
            </div>
            <input
              type="text"
              class="form-control"
              :value="comment.content"
              @input="
                comment.content = $event.target.value;
                updateTodo(todo);
              "
            />
          </div>
        </div>
      </div>
    </div>
  </li>
</template>

<script>
export default {
  props: {
    todo: {
      id: Number,
      title: String,
      content: String,
      status: String,
    },
  },
  data: function () {
    return {
      doneLabel: "Done",
      selected: -1,
      taskStatuses: [
        { id: 1, value: TaskStatus.New },
        { id: 2, value: TaskStatus.Active },
        { id: 3, value: TaskStatus.Close },
        { id: 4, value: TaskStatus.Reactive },
      ],
      hideComment: true,
      commentText: "",
    };
  },
  created: function () {
    this.selected = this.taskStatuses.find(
      (x) => x.value == this.todo.status
    ).value;
  },
  methods: {
    /**
     * statuschanged
     * @param {Event} ev
     */
    statusChanged: function (ev) {
      let value = ev.target.value;
      this.updateTodo({ status: value });
    },
    /**
     * updateTodo
     * @param {Todo} todo
     */
    updateTodo: function (todo) {
      Object.assign(this.todo, todo);
      this.$emit("update-todo", this.todo);
    },
    /**
     * deleteTodo
     */
    deleteTodo: function () {
      this.$emit("delete-todo", this.todo);
    },
    /**
     * addComment
     */
    addComment: function () {
      if (this.todo.comments == undefined) this.todo.comments = [];
      if (this.todo.comments.length == 0) {
        this.todo.comments.push(new TodoComment(1, this.commentText));
      } else {
        var maxid = parseInt(Math.max(...this.todo.comments.map((x) => x.id)));
        if (!Number.isInteger(maxid)) {
          maxid = 0;
        }
        this.todo.comments.push(new TodoComment(maxid + 1, this.commentText));
      }
      this.commentText = "";
      this.updateTodo(this.todo);
    },
  },
};
</script>
