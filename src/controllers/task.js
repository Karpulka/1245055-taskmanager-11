import {render, RenderPosition, replace} from "../utils/render";
import Task from "../components/task-card";
import TaskEdit from "../components/task-edit";

export default class TaskController {
  constructor(container) {
    this._container = container;
  }

  render(task) {
    const tasksContainerComponent = this._container;
    const tasksContainerElement = tasksContainerComponent.getElement();

    const stopEdit = () => {
      replace(taskComponent, taskEditComponent);
      document.removeEventListener(`keydown`, onEscapeKeyPress);
    };

    const onEditButtonClick = () => {
      replace(taskEditComponent, taskComponent);
      document.addEventListener(`keydown`, onEscapeKeyPress);
    };

    const onEditFormSubmit = (evt) => {
      evt.preventDefault();
      stopEdit();
    };

    const onEscapeKeyPress = (evt) => {
      if (evt.key === `Escape` || evt.key === `Esc`) {
        stopEdit();
      }
    };

    const taskComponent = new Task(task);
    taskComponent.setEditButtonHandler(onEditButtonClick);

    const taskEditComponent = new TaskEdit(task);
    taskEditComponent.setSubmitHandler(onEditFormSubmit);

    render(tasksContainerElement, taskComponent, RenderPosition.BEFOREEND);
  }
}
