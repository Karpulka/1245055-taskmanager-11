import AbstractComponent from "./abstract-component";

const createTasksListTemplate = () => {
  return `<div class="board__tasks"></div>`;
};

export default class TaskList extends AbstractComponent {
  getTemplate() {
    return createTasksListTemplate();
  }
}
