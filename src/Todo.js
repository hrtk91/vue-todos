export default class Todo {
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
